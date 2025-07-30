import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WelcomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-6 py-8 overflow-hidden" style={{ backgroundColor: '#1F1F1E' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-3xl font-semibold text-white mb-6 leading-tight">
          Which moments have stayed with you the most?
        </h1>
      </motion.div>

      <motion.p 
        className="text-base font-normal text-secondary max-w-2xl mb-16 leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        Choose the moments that came to mind. They don't need to be beautiful. Only real.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="flex flex-col items-center gap-6"
      >
        <Link to={createPageUrl('CategorySelection')}>
          <motion.button 
            className="btn-base btn-primary min-w-[300px]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Initialize</span>
            <ArrowRight size={20} className="ml-2" />
          </motion.button>
        </Link>
        
        <Link to={createPageUrl('CollectiveMap')}>
          <motion.button 
            className="btn-base btn-secondary min-w-[300px]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>View Collective Data</span>
            <Eye size={20} className="ml-2" />
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}