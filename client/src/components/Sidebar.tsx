import { MessageSquare, ArrowRight, History, Sparkles, Zap, Brain, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Button } from './Button';
import { CustomSelect } from './CustomSelect';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

interface Flow {
  _id: string;
  prompt: string;
  response: string;
  createdAt: string;
  userId?: { username: string };
}

interface SidebarProps {
  onLoadFlow: (prompt: string, response: string) => void;
  model: string;
  setModel: (model: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ onLoadFlow, model, setModel, isOpen, onClose }: SidebarProps) {
  const { token, user, openLoginModal } = useAuth();
  const queryClient = useQueryClient();

  const { data: flows, isLoading } = useQuery({
    queryKey: ['flows'],
    queryFn: async () => {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/flows`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data.data as Flow[];
    },
    refetchInterval: 5000,
    enabled: !!token,
  });

  const deleteFlowMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/flows/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      toast.success('Flow deleted');
      queryClient.invalidateQueries({ queryKey: ['flows'] });
    },
    onError: () => {
      toast.error('Failed to delete flow');
    }
  });

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this flow?')) {
      deleteFlowMutation.mutate(id);
    }
  };

  return (
    <motion.div
      initial={{ width: 320 }}
      animate={{ width: isOpen ? 320 : 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-white border-r border-gray-200 h-full flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 overflow-hidden absolute md:relative"
    >
      <div className="w-80 max-w-[100vw] flex flex-col h-full">
        <div className="p-6 border-b border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 uppercase tracking-wider">
              <History className="w-4 h-4 text-indigo-600" />
              History
              {user?.role === 'admin' && (
                <span className="bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded-full border border-indigo-200 normal-case tracking-normal">
                  Admin
                </span>
              )}
            </h2>
            <Button onClick={onClose} variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
              <ArrowRight className="w-4 h-4 rotate-180" />
            </Button>
          </div>

          <div className="space-y-1.5">
            <CustomSelect
              id="model-select"
              label="AI Model"
              value={model}
              onChange={setModel}
              options={[
                { label: 'Gemini 3 Flash', value: 'google/gemini-3-flash', icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" /> },
                { label: 'Gemini 3 Pro', value: 'google/gemini-3-pro', icon: <Brain className="w-3.5 h-3.5 text-indigo-500" /> },
                { label: 'Gemini 2.5 Flash', value: 'google/gemini-2.5-flash', icon: <Zap className="w-3.5 h-3.5 text-yellow-500" /> },
                { label: 'Mistral 7B', value: 'mistralai/mistral-7b-instruct:free', icon: <Zap className="w-3.5 h-3.5 text-purple-500" /> },
                { label: 'Llama 3 8B', value: 'meta-llama/llama-3-8b-instruct:free', icon: <Brain className="w-3.5 h-3.5 text-blue-500" /> },
              ]}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {!token ? (
            <div className="text-center text-gray-400 text-xs mt-10 px-6 leading-relaxed">
              <p>Sign in to view your history.</p>
              <button onClick={openLoginModal} className="text-indigo-600 hover:underline mt-2 block w-full">Login</button>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center p-8 text-gray-400 gap-2">
              <div className="w-6 h-6 border-2 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
              <span className="text-xs font-medium">Loading history...</span>
            </div>
          ) : flows?.length === 0 ? (
            <div className="text-center text-gray-400 text-xs mt-10 px-6 leading-relaxed">
              No saved flows yet.<br/>Run a prompt and click save!
            </div>
          ) : (
            flows?.map((flow, i) => (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                key={flow._id}
                onClick={() => onLoadFlow(flow.prompt, flow.response)}
                className="group p-3.5 rounded-xl border border-transparent hover:border-indigo-100 hover:bg-indigo-50/50 transition-all cursor-pointer relative"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 bg-gray-100 rounded-lg text-gray-500 group-hover:bg-white group-hover:text-indigo-600 group-hover:shadow-sm transition-all">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-700 text-xs truncate group-hover:text-indigo-900 transition-colors">{flow.prompt}</h3>
                    <p className="text-[10px] text-gray-400 mt-1 line-clamp-2 leading-relaxed group-hover:text-gray-500">{flow.response}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-300 font-medium">{new Date(flow.createdAt).toLocaleDateString()}</span>
                        {flow.userId && (
                          <span className="text-[9px] text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-full font-medium border border-indigo-100">
                            {flow.userId.username}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleDelete(e, flow._id)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50 opacity-0 group-hover:opacity-100"
                          title="Delete Flow"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <span className="flex items-center gap-1 text-[10px] text-indigo-600 font-bold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                          Load <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
