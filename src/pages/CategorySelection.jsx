import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { pathwaysData } from '../components/map/pathwaysData';
import { motion } from 'framer-motion';

const categoryIcons = {
  "Turning Points": "https://raw.githubusercontent.com/gefen1998/Svgs/refs/heads/main/1.svg",
  "Transitions": "https://raw.githubusercontent.com/gefen1998/Svgs/refs/heads/main/Transitions.svg",
  "Body & Mind": "https://raw.githubusercontent.com/gefen1998/Svgs/refs/heads/main/body.svg",
  "First Times": "https://raw.githubusercontent.com/gefen1998/Svgs/refs/heads/main/first%20times.svg",
  "Interactions": "https://raw.githubusercontent.com/gefen1998/Svgs/refs/heads/main/interactions.svg",
  "Milestones": "https://raw.githubusercontent.com/gefen1998/Svgs/refs/heads/main/milestones.svg",
  "Absence & Loss": "https://raw.githubusercontent.com/gefen1998/Svgs/refs/heads/main/absence.svg",
};

export default function CategorySelection() {
  return (
    <div 
      className="min-h-screen w-full px-6 py-16 flex flex-col items-center justify-center"
      style={{ 
        backgroundColor: '#1F1F1E'
      }}
    >
      <div className="max-w-4xl mx-auto w-full text-center">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
          <h1 className="text-3xl font-semibold text-white mb-6">What kind of experience was the one you thought about?</h1>
          <p className="text-lg text-secondary max-w-2xl mx-auto">By choosing it, you'll begin to see what it left behind.</p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.05 }}
        >
          {pathwaysData.map((category, index) => (
            <motion.div
              key={category.category}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.05 }}
            >
              <Link to={createPageUrl(`ExperienceSelection?category=${encodeURIComponent(category.category)}`)}>
                <div className="btn-base btn-secondary w-full justify-start !py-4 !px-6 !rounded-xl">
                  {categoryIcons[category.category] && (
                    <img src={categoryIcons[category.category]} alt="" className="w-6 h-6 mr-4" />
                  )}
                  <span>{category.category}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}