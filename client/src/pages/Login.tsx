import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Button } from '../components/Button';
import { Lock, User, ArrowRight, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export function LoginModal() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isLoginModalOpen, closeLoginModal } = useAuth();

  // Reset form when modal opens
  useEffect(() => {
    if (isLoginModalOpen) {
      setUsername('');
      setPassword('');
    }
  }, [isLoginModalOpen]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        username,
        password,
      });
      login(res.data.data.token, res.data.data.user);
      toast.success('Welcome back!');
      closeLoginModal();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isLoginModalOpen && (
        <>
          {/* Backdrop with light bending blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLoginModal}
            className="fixed inset-0 bg-black/20 backdrop-blur-md z-[100]"
          />
          
          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-[101] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md pointer-events-auto p-4"
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/50 relative">
                <Button 
                  onClick={closeLoginModal}
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </Button>

                <div className="p-8">
                  <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-indigo-100/50 rounded-xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
                      <Lock className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
                    <p className="text-gray-500 mt-2">Sign in to access your flows</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-white/50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                          placeholder="Enter username"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-white/50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                          placeholder="Enter password"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full justify-center"
                      isLoading={isLoading}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Sign In
                    </Button>
                  </form>

                  <div className="mt-8 pt-6 border-t border-gray-100/50">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 text-center">Demo Accounts</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50/50 rounded-lg border border-gray-200/50 relative group hover:border-indigo-200 transition-colors">
                        <div className="text-xs font-medium text-gray-500 mb-1">Admin</div>
                        <div className="font-mono text-sm text-gray-900">admin / admin123</div>
                        <button 
                          onClick={() => { setUsername('admin'); setPassword('admin123'); }}
                          className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 bg-white/50 flex items-center justify-center transition-opacity"
                        >
                          <span className="text-xs font-medium text-indigo-600">Click to fill</span>
                        </button>
                      </div>
                      <div className="p-3 bg-gray-50/50 rounded-lg border border-gray-200/50 relative group hover:border-indigo-200 transition-colors">
                        <div className="text-xs font-medium text-gray-500 mb-1">User</div>
                        <div className="font-mono text-sm text-gray-900">user / user123</div>
                        <button 
                          onClick={() => { setUsername('user'); setPassword('user123'); }}
                          className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 bg-white/50 flex items-center justify-center transition-opacity"
                        >
                          <span className="text-xs font-medium text-indigo-600">Click to fill</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
