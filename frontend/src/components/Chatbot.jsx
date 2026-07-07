import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi. I can help with ShopSphere products, orders, returns, payments, and account access.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const { darkMode } = useSelector((state) => state.theme || { darkMode: false });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/chat', { message: userMessage });
      setMessages((prev) => [...prev, { role: 'ai', text: response.data.reply }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [...prev, { role: 'ai', text: "I'm having trouble connecting to the server. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute bottom-20 right-0 flex h-[500px] w-80 overflow-hidden rounded-2xl border shadow-2xl md:w-96 ${
              darkMode ? 'border-stone-800 bg-stone-900' : 'border-stone-200 bg-white'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 p-4 text-stone-900 dark:border-stone-800 dark:bg-stone-950 dark:text-white">
              <div className="flex items-center space-x-2">
                <Bot size={24} />
                <div>
                  <h3 className="font-semibold">Store Assistant</h3>
                  <p className="flex items-center text-xs text-stone-500 dark:text-stone-400">
                    <span className="mr-1 h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Online
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 transition-colors hover:bg-stone-200 dark:hover:bg-stone-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${darkMode ? 'bg-stone-900' : 'bg-stone-50'}`}>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      msg.role === 'user'
                        ? 'bg-stone-900 text-white rounded-tr-sm dark:bg-white dark:text-stone-950'
                        : darkMode
                        ? 'bg-stone-800 text-stone-200 rounded-tl-sm border border-stone-700'
                        : 'bg-white text-stone-800 rounded-tl-sm shadow-sm border border-stone-100'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 rounded-tl-sm ${
                    darkMode ? 'bg-stone-800 border border-stone-700' : 'bg-white shadow-sm border border-stone-100'
                  }`}>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={`border-t p-3 ${darkMode ? 'border-stone-800 bg-stone-950' : 'border-stone-200 bg-white'}`}>
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask something..."
                  className={`flex-1 py-2 px-4 rounded-full border focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
                    darkMode
                      ? 'bg-stone-900 border-stone-700 text-white placeholder-stone-500'
                      : 'bg-stone-100 border-transparent text-stone-900 placeholder-stone-500'
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="rounded-full bg-stone-900 p-2 text-white transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50 flex-shrink-0 dark:bg-white dark:text-stone-950 dark:hover:bg-stone-200"
                >
                  {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-colors ${
          isOpen ? 'bg-stone-800 hover:bg-stone-900' : 'bg-stone-900 hover:bg-stone-800 dark:bg-white dark:text-stone-950'
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>
    </div>
  );
};

export default Chatbot;
