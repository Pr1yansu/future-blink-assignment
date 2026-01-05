import { useState, useCallback } from 'react';
import { ReactFlow, Background, Controls, useNodesState, useEdgesState, addEdge, type Connection, type Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { InputNode } from '../components/InputNode';
import { ResultNode } from '../components/ResultNode';
import { Sidebar } from '../components/Sidebar';
import { Play, Save, Trash2, Download, Menu, ChevronRight, Home, HelpCircle, LogIn, LogOut } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { toPng } from 'html-to-image';
import { Button } from '../components/Button';
import { driver } from 'driver.js';
import { useAuth } from '../context/AuthContext';

const nodeTypes = {
  inputNode: InputNode,
  resultNode: ResultNode,
};

const initialNodes = [
  {
    id: '1',
    type: 'inputNode',
    position: { x: 100, y: 200 },
    data: { label: 'Input', value: '' },
  },
  {
    id: '2',
    type: 'resultNode',
    position: { x: 600, y: 150 },
    data: { label: 'Result', result: '', isLoading: false },
  },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
];

export function FlowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('google/gemini-2.0-flash-exp:free');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { token, logout, openLoginModal } = useAuth();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } }, eds)),
    [setEdges],
  );

  // Update prompt state when input node changes
  const onInputChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = evt.target.value;
    setPrompt(newValue);
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === '1') {
          return {
            ...node,
            data: { ...node.data, value: newValue, onChange: onInputChange },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  // Ensure the initial node has the onChange handler
  useState(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === '1') {
          return {
            ...node,
            data: { ...node.data, onChange: onInputChange },
          };
        }
        return node;
      })
    );
  });

  const askAiMutation = useMutation({
    mutationFn: async (promptText: string) => {
      // Reset result node
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === '2') {
            return { ...node, data: { ...node.data, result: '', isLoading: true, model } };
          }
          return node;
        })
      );

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ask-ai`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ prompt: promptText, model }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch');
      }
      if (!response.body) throw new Error('No body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        const lines = buffer.split('\n');
        
        // Keep the last line in the buffer as it might be incomplete
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.trim() === '') continue;
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullResponse += parsed.content;
                // Update node with streaming content
                setNodes((nds) =>
                  nds.map((node) => {
                    if (node.id === '2') {
                      return { ...node, data: { ...node.data, result: fullResponse, isLoading: true, model } };
                    }
                    return node;
                  })
                );
              }
            } catch (e) {
              console.error('Error parsing chunk', e);
            }
          }
        }
      }
      return fullResponse;
    },
    onSuccess: (data) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === '2') {
            return { ...node, data: { ...node.data, result: data, isLoading: false, model } };
          }
          return node;
        })
      );
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Error fetching response';
      toast.error(errorMessage);
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === '2') {
            return { ...node, data: { ...node.data, result: errorMessage, isLoading: false } };
          }
          return node;
        })
      );
    },
  });

  const saveFlowMutation = useMutation({
    mutationFn: async () => {
      if (!token) {
        toast.error('Please login to save your flows');
        openLoginModal();
        throw new Error('Not authenticated');
      }

      const resultNode = nodes.find(n => n.id === '2');
      const response = resultNode?.data.result as string;
      if (!prompt || !response) {
        toast.error('Nothing to save! Run the flow first.');
        return;
      }
      await axios.post(`${import.meta.env.VITE_API_URL}/api/save-flow`, 
        { prompt, response },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: () => {
      toast.success('Flow saved to database!');
    },
    onError: () => {
      toast.error('Failed to save flow.');
    },
  });

  const downloadImage = () => {
    const flowElement = document.querySelector('.react-flow__viewport');
    if (flowElement instanceof HTMLElement) {
      toPng(document.querySelector('.react-flow') as HTMLElement, {
        backgroundColor: '#f9fafb',
        filter: (node) => !(node?.classList?.contains('react-flow__controls') || node?.classList?.contains('react-flow__panel')),
      }).then((dataUrl) => {
        const a = document.createElement('a');
        a.setAttribute('download', 'ai-flow.png');
        a.setAttribute('href', dataUrl);
        a.click();
        toast.success('Flow downloaded as image!');
      });
    }
  };

  const handleRun = () => {
    if (!prompt) return;
    askAiMutation.mutate(prompt);
  };

  const handleSave = () => {
    saveFlowMutation.mutate();
  };

  const handleClear = () => {
    setPrompt('');
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === '1') {
          return { ...node, data: { ...node.data, value: '' } };
        }
        if (node.id === '2') {
          return { ...node, data: { ...node.data, result: '', isLoading: false } };
        }
        return node;
      })
    );
  };

  const handleLoadFlow = (loadedPrompt: string, loadedResponse: string) => {
    setPrompt(loadedPrompt);
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === '1') {
          return {
            ...node,
            data: { ...node.data, value: loadedPrompt, onChange: onInputChange },
          };
        }
        if (node.id === '2') {
          return {
            ...node,
            data: { ...node.data, result: loadedResponse, isLoading: false },
          };
        }
        return node;
      })
    );
  };

  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      steps: [
        { element: '#sidebar-toggle', popover: { title: 'Sidebar', description: 'Toggle the history sidebar to see your past flows.' } },
        { element: '#model-select', popover: { title: 'AI Model', description: 'Choose between Gemini, Mistral, or Llama for your generation.' } },
        { element: '#input-node', popover: { title: 'Input Node', description: 'Type your prompt here or use voice input.' } },
        { element: '#run-button', popover: { title: 'Run Flow', description: 'Click here to generate the AI response.' } },
        { element: '#result-node', popover: { title: 'Result Node', description: 'The AI response will appear here. You can copy it or save the flow.' } },
        { element: '#save-button', popover: { title: 'Save Flow', description: 'Save your current flow to the history.' } },
        { element: '#download-button', popover: { title: 'Download', description: 'Download the entire flow as an image.' } },
      ]
    });
    driverObj.drive();
  };

  return (
    <div className="w-screen h-screen bg-gray-50 flex flex-col overflow-hidden font-sans text-gray-900">
      <Toaster position="top-center" richColors />
      {/* Header */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm z-30 relative">
        <div className="flex items-center gap-4">
          <Button 
            id="sidebar-toggle"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            variant="ghost"
            size="icon"
            className="text-gray-500"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <div className="flex items-center gap-1.5 hover:text-gray-900 transition-colors cursor-pointer">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md hidden md:block">Flow Builder</span>
          </div>
        </div>

        <div className="flex gap-2">
          {token ? (
            <Button
              onClick={logout}
              variant="ghost"
              size="icon"
              title="Logout"
              className="text-gray-500 hover:text-red-600"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              onClick={openLoginModal}
              variant="ghost"
              size="icon"
              title="Login"
              className="text-gray-500 hover:text-indigo-600"
            >
              <LogIn className="w-5 h-5" />
            </Button>
          )}

          <Button
            onClick={startTour}
            variant="ghost"
            size="icon"
            title="Start Tour"
            className="text-gray-500 hover:text-indigo-600"
          >
            <HelpCircle className="w-5 h-5" />
          </Button>

          <div className="w-px h-6 bg-gray-200 mx-1 self-center" />

          <Button
            id="clear-button"
            onClick={handleClear}
            variant="outline"
            size="icon"
            title="Clear Flow"
            className="text-gray-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          
          <Button
            id="download-button"
            onClick={downloadImage}
            variant="outline"
            size="icon"
            title="Download as Image"
            className="text-gray-600"
          >
            <Download className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-gray-200 mx-1 self-center" />

          <Button
            id="save-button"
            onClick={handleSave}
            disabled={saveFlowMutation.isPending}
            isLoading={saveFlowMutation.isPending}
            leftIcon={<Save className="w-4 h-4" />}
            variant="outline"
          >
            <span className="hidden md:inline">Save</span>
          </Button>

          <Button
            id="run-button"
            onClick={handleRun}
            disabled={askAiMutation.isPending || !prompt}
            isLoading={askAiMutation.isPending}
            leftIcon={<Play className="w-4 h-4 fill-current" />}
            variant="outline-primary"
          >
            <span className="hidden md:inline">Run Flow</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Backdrop */}
        {isSidebarOpen && (
          <div 
            className="absolute inset-0 bg-black/20 z-10 md:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        {/* Sidebar */}
        <Sidebar 
          onLoadFlow={handleLoadFlow} 
          model={model} 
          setModel={setModel} 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />

        {/* Flow Area */}
        <div className="flex-1 relative bg-gray-50/50">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            className="bg-transparent"
          >
            <Background color="#94a3b8" gap={20} size={1} className="opacity-20" />
            <Controls className="!bg-white !border-gray-200 !shadow-xl !rounded-xl !m-4 overflow-hidden [&>button]:!border-b-gray-100 [&>button]:!text-gray-600 hover:[&>button]:!bg-gray-50" />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
