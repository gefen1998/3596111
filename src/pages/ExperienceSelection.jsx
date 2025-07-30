
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { pathwaysData } from '../components/map/pathwaysData';
import { ArrowLeft, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPathway } from '@/api/entities';

const categoryIcons = {
  "Turning Points": "https://raw.githubusercontent.com/gefen1998/Svgs/refs/heads/main/1.svg",
  "Transitions": "https://raw.githubusercontent.com/gefen1998/Svgs/refs/heads/main/Transitions.svg",
  "Body & Mind": "https://raw.githubusercontent.com/gefen1998/Svgs/refs/heads/main/body.svg",
  "First Times": "https://raw.githubusercontent.com/gefen1998/Svgs/refs/heads/main/first%20times.svg",
  "Interactions": "https://raw.githubusercontent.com/gefen1998/Svgs/refs/heads/main/interactions.svg",
  "Milestones": "https://raw.githubusercontent.com/gefen1998/Svgs/refs/heads/main/milestones.svg",
  "Absence & Loss": "https://raw.githubusercontent.com/gefen1998/Svgs/refs/heads/main/absence.svg",
};

export default function ExperienceSelection() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const selectedCategory = searchParams.get('category');
  
  const [selectedExperience, setSelectedExperience] = useState('');

  const categoryData = pathwaysData.find(cat => cat.category === selectedCategory);
  
  useEffect(() => {
    if (!categoryData) {
      navigate(createPageUrl('CategorySelection'));
    }
  }, [categoryData, navigate]);

  if (!categoryData) {
    return null; // Render nothing while redirecting
  }

  const handleExperienceSelect = (experience) => {
    setSelectedExperience(experience);
  };

  const handleContinue = async () => {
    if (!selectedExperience) return;

    try {
      const sessionId = Date.now().toString(); // Create a new session ID for this specific selection
      await UserPathway.create({
        pathway_name: selectedExperience,
        category: categoryData.category,
        session_id: sessionId
      });
      console.log('Successfully saved new pathway to DB');
    } catch (error) {
      console.error('Error saving pathway:', error);
    }
    
    // Add to a persistent list in localStorage for the "living map"
    const existingPathways = JSON.parse(localStorage.getItem('userPathways') || '[]');
    if (!existingPathways.includes(selectedExperience)) {
        existingPathways.push(selectedExperience);
    }
    localStorage.setItem('userPathways', JSON.stringify(existingPathways));
    
    // Use client-side navigation to prevent white flash
    navigate(createPageUrl('Map'));
  };

  return (
    <div 
      className="min-h-screen w-full px-6 py-16 flex flex-col"
      style={{ 
        backgroundColor: '#1F1F1E'
      }}
    >
      <div className="max-w-4xl mx-auto w-full flex-1">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link to={createPageUrl('CategorySelection')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-12">
            <ArrowLeft size={16} />
            <span>Back to Categories</span>
          </Link>
          <div className="flex items-center gap-4 mb-8">
            {categoryIcons[categoryData.category] && (
              <img src={categoryIcons[categoryData.category]} alt={`${categoryData.category} icon`} className="w-8 h-8" />
            )}
            <h1 className="text-3xl font-semibold text-white">{categoryData.category}</h1>
          </div>
          <p className="text-lg text-secondary mb-12">Which of these resonates the most with what you had in mind?</p>
        </motion.div>

        <div className="flex flex-wrap gap-3">
          {categoryData.items.map(item => {
            const isSelected = selectedExperience === item;
            const displayText = item.startsWith("Other - ") ? "Other" : item;

            return (
              <motion.button
                key={item}
                onClick={() => handleExperienceSelect(item)}
                className={`btn-base !text-base !font-medium ${
                  isSelected ? 'btn-selected' : 'btn-secondary'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {displayText}
              </motion.button>
            );
          })}
        </div>
      </div>
      
      <AnimatePresence>
        {selectedExperience && (
          <motion.div 
            className="flex items-end justify-center py-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <motion.button 
              className="btn-base btn-primary min-w-[400px]"
              onClick={handleContinue}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Choose this experience &gt;&gt;
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
