import { Handle, Position } from '@xyflow/react';
import { Bot, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { NodeCard, NodeHeader } from './NodeCard';

interface ResultNodeProps {
  data: {
    label: string;
    result: string;
    isLoading: boolean;
    model?: string;
  };
}

export function ResultNode({ data }: ResultNodeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(data.result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getModelName = (modelId?: string) => {
    if (!modelId) return 'Gemini 2.0 Flash';
    if (modelId.includes('gemini')) return 'Gemini 2.0 Flash';
    if (modelId.includes('mistral')) return 'Mistral 7B';
    if (modelId.includes('llama')) return 'Llama 3 8B';
    return 'AI Model';
  };

  return (
    <NodeCard id="result-node" className="w-[300px] md:w-[500px]">
      <NodeHeader
        icon={<Bot className="w-4 h-4" />}
        title="AI Response"
        subtitle={getModelName(data.model)}
        className="bg-gradient-to-r from-indigo-50/50 to-white border-indigo-50"
        iconClassName="bg-indigo-600 text-white shadow-indigo-200"
        action={
          data.result && !data.isLoading && (
            <button 
              onClick={handleCopy}
              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          )
        }
      />

      {/* Body */}
      <div className="p-6 min-h-[200px] max-h-[600px] overflow-y-auto custom-scrollbar bg-white">
        {data.isLoading && !data.result ? (
          <div className="space-y-4 animate-pulse py-2">
            <div className="h-4 bg-gray-100 rounded-md w-3/4"></div>
            <div className="h-4 bg-gray-100 rounded-md w-1/2"></div>
            <div className="h-4 bg-gray-100 rounded-md w-5/6"></div>
            <div className="h-4 bg-gray-100 rounded-md w-2/3"></div>
          </div>
        ) : !data.result ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-300 py-10 gap-3">
            <Bot className="w-12 h-12 opacity-20" />
            <span className="text-sm font-medium">Waiting for input...</span>
          </div>
        ) : (
          <div className="prose prose-sm prose-slate max-w-none prose-headings:font-bold prose-h1:text-xl prose-h2:text-lg prose-p:text-gray-600 prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:shadow-sm">
            <ReactMarkdown>{data.result}</ReactMarkdown>
            {data.isLoading && (
              <span className="inline-block w-1.5 h-4 ml-1 bg-indigo-500 animate-pulse align-middle rounded-full"></span>
            )}
          </div>
        )}
      </div>
      
      <Handle 
        type="target" 
        position={Position.Left} 
        className="!w-3.5 !h-3.5 !bg-indigo-600 !border-[3px] !border-white shadow-md transition-transform hover:scale-110" 
      />
    </NodeCard>
  );
}
