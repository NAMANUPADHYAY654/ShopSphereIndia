import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Package, DollarSign, Activity, AlertTriangle, Tag } from 'lucide-react';
import { useAutoCategorizeMutation } from '../../redux/api/aiApiSlice';

const SellerDashboard = () => {
  const [bulletPoints, setBulletPoints] = useState('');
  const [generatedListing, setGeneratedListing] = useState(null);
  
  const [autoCategorizeTrigger, { isLoading: isGenerating }] = useAutoCategorizeMutation();

  const handleGenerateListing = async () => {
    if (!bulletPoints) return;

    try {
      const res = await autoCategorizeTrigger({ description: bulletPoints }).unwrap();
      setGeneratedListing(res);
    } catch (error) {
      console.error(error);
      alert('Failed to generate listing. Make sure backend is running and you are logged in as a seller.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gradient mb-8">Seller Command Center</h1>
      
      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <motion.div whileHover={{ y: -5 }} className="glass p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold">Total GMV</p>
            <h3 className="text-2xl font-black dark:text-white">$12,450</h3>
          </div>
          <div className="p-3 bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-xl"><DollarSign size={24} /></div>
        </motion.div>
        
        <motion.div whileHover={{ y: -5 }} className="glass p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold">Active Listings</p>
            <h3 className="text-2xl font-black dark:text-white">34</h3>
          </div>
          <div className="p-3 bg-accent-500/10 text-accent-600 dark:text-accent-400 rounded-xl"><Package size={24} /></div>
        </motion.div>
        
        <motion.div whileHover={{ y: -5 }} className="glass p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold">Conversion Rate</p>
            <h3 className="text-2xl font-black dark:text-white">4.2%</h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl"><Activity size={24} /></div>
        </motion.div>
      </div>

      {/* AI Tool Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-3xl relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 p-6 opacity-5 dark:opacity-10 pointer-events-none">
            <Sparkles size={120} className="text-primary-500" />
          </div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-bold rounded-full mb-4">
            <Sparkles size={14} /> AI Copilot
          </div>
          <h2 className="text-2xl font-black dark:text-white mb-2">Auto-Categorization</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Describe your product. The AI will automatically assign the correct category, generate SEO tags, and write a high-converting title.
          </p>

          <div className="space-y-6 relative z-10">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Product Description</label>
              <textarea 
                rows="5"
                value={bulletPoints}
                onChange={(e) => setBulletPoints(e.target.value)}
                placeholder="e.g. Wireless noise-canceling headphones with 40-hour battery life and Bluetooth 5.3..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-shadow"
              ></textarea>
            </div>
            <button 
              onClick={handleGenerateListing}
              disabled={isGenerating || !bulletPoints}
              className="w-full py-4 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white font-bold rounded-xl transition-all flex justify-center items-center gap-2 disabled:opacity-50 shadow-lg"
            >
              {isGenerating ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Sparkles size={18} />}
              {isGenerating ? 'Analyzing Product...' : 'Auto-Categorize & Tag'}
            </button>
          </div>
        </div>

        {/* AI Output Result */}
        <div className={`p-8 rounded-3xl border ${generatedListing ? 'border-primary-200 dark:border-primary-900/50 bg-primary-50/50 dark:bg-primary-900/10' : 'border-gray-200 dark:border-gray-800 border-dashed bg-gray-50/50 dark:bg-gray-900/20'}`}>
          {generatedListing ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 h-full flex flex-col">
              <div>
                <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400 text-xs font-bold rounded-md mb-3 uppercase tracking-wider">
                  AI Result
                </span>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">{generatedListing.title}</h3>
              </div>
              
              <div className="flex-1 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-4 shadow-sm">
                
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Detected Category</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Package size={16} className="text-primary-500" />
                    {generatedListing.category}
                  </p>
                </div>

                {generatedListing.flags && generatedListing.flags !== "None" && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1 flex items-center gap-1"><AlertTriangle size={12} /> AI Warning</p>
                    <p className="text-xs text-amber-800 dark:text-amber-400 font-medium">{generatedListing.flags}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Tag size={12} /> SEO Tags Generated</p>
                  <div className="flex flex-wrap gap-2">
                    {generatedListing.tags?.map((tag, i) => (
                      <span key={i} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg">#{tag}</span>
                    ))}
                  </div>
                </div>

              </div>

              <button className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition-colors shadow-lg">
                Publish Listing
              </button>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                <Package size={32} className="text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-sm font-medium">Your generated category and tags will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
