import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Store, ShieldCheck, CreditCard, Sparkles, Send, Bot } from 'lucide-react';
import axios from 'axios';
import { useOnboardingCopilotMutation } from '../../redux/api/aiApiSlice';

const Onboarding = () => {
  const [storeName, setStoreName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Copilot State
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', content: 'Hi! I am your Onboarding Assistant. Have any questions about KYC or bank details?' }
  ]);
  const [copilotTrigger, { isLoading: isChatLoading }] = useOnboardingCopilotMutation();
  const navigate = useNavigate();

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    const msg = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { role: 'user', content: msg }]);

    try {
      const res = await copilotTrigger({ message: msg }).unwrap();
      setChatHistory(prev => [...prev, { role: 'ai', content: res.reply }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'ai', content: 'Oops, I encountered an error.' }]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post('http://localhost:5000/api/sellers/onboard', {
        storeName,
        bankDetails: { accountNumber, ifscCode, bankName: 'Demo Bank' }
      }, { withCredentials: true });
      navigate('/seller/dashboard');
    } catch (error) {
      console.error(error);
      alert('Failed to onboard. Make sure you are logged in.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden max-w-7xl mx-auto gap-8">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-accent-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>

      {/* Main Form */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1 max-w-md space-y-8 glass p-8 rounded-3xl relative z-10 mx-auto lg:mx-0"
      >
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gradient">
            Become a Seller
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Join the fastest growing futuristic marketplace.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md space-y-4">
            <div>
              <label className="sr-only">Store Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Store className="h-5 w-5 text-primary-500" />
                </div>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="appearance-none rounded-xl relative block w-full pl-10 px-3 py-3 border border-gray-300 dark:border-gray-700 dark:bg-dark-bg placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Your Unique Store Name"
                />
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                <CreditCard className="mr-2 h-4 w-4" /> Payout Details
              </h3>
              
              <div className="space-y-4">
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-700 dark:bg-dark-bg placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  placeholder="Bank Account Number"
                />
                <input
                  type="text"
                  required
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value)}
                  className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-700 dark:bg-dark-bg placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  placeholder="IFSC / Routing Code"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 neon-glow transition-all"
            >
              {isLoading ? (
                'Processing...'
              ) : (
                <span className="flex items-center">
                  <ShieldCheck className="mr-2 h-5 w-5" />
                  Verify & Create Store
                </span>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Onboarding Copilot Chat */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:flex flex-col flex-1 max-w-md h-[550px] bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden z-10"
      >
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-primary-600 to-purple-600 flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl">
            <Bot className="text-white w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white">Setup Copilot</h3>
            <p className="text-xs text-white/80">I can help you with KYC & Docs!</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950">
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary-600 text-white rounded-br-sm' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-sm shadow-sm'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isChatLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleChatSubmit} className="p-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="relative">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Ask about IFSC codes..."
              className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-xl py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
            />
            <button 
              type="submit"
              disabled={isChatLoading || !chatMessage.trim()}
              className="absolute right-1 top-1 p-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Onboarding;
