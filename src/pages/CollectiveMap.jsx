
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, Eye } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPathway } from '@/api/entities';

const CollectiveMapLegend = ({ stats }) => (
  <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 border border-gray-700 p-4 text-sm w-64 z-20 rounded-md">
    <h3 className="font-semibold mb-3 text-white flex items-center gap-2">
      <Users size={16} />
      COLLECTIVE DATA
    </h3>
    <div className="space-y-2 text-gray-300">
      <div>Total Selections: <span className="text-white">{stats.totalSelections}</span></div>
      <div>Unique Pathways: <span className="text-white">{stats.uniquePathways}</span></div>
      <div>Active Sessions: <span className="text-white">{stats.sessions}</span></div>
    </div>
    <div className="mt-4 space-y-2">
      <h4 className="font-semibold text-gray-300">Node Size = Popularity</h4>
      <div className="text-xs text-gray-500">Larger nodes represent more commonly selected experiences</div>
    </div>
  </div>
);

const NodeInfo = ({ node, onClose }) => (
  <AnimatePresence>
    {node && (
      <motion.div
        className="absolute top-20 left-4 bg-black bg-opacity-80 border border-gray-700 p-4 text-sm w-72 z-20 rounded-lg shadow-2xl"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
      >
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-white">
          ✕
        </button>
        <h3 className="font-semibold text-white text-lg mb-1">{node.label}</h3>
        <p className="text-yellow-400 text-xs mb-3">{node.category}</p>
        <div className="space-y-2 text-gray-300">
          <div>Selected by <span className="text-white font-bold">{node.count}</span> users</div>
          <div>Popularity: <span className="text-white">{((node.count / node.maxCount) * 100).toFixed(1)}%</span></div>
        </div>
        <div className="mt-3 text-sm text-gray-500 leading-relaxed">
          This experience resonates across {node.count} individual neural architectures
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default function CollectiveMapPage() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const nodesRef = useRef([]);
  
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, text: '' });
  const [canvasReady, setCanvasReady] = useState(false);
  const [stats, setStats] = useState({ totalSelections: 0, uniquePathways: 0, sessions: 0 });
  const [showIntro, setShowIntro] = useState(true); // New state for intro sequence

  // Effect to hide intro after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000); // Hide intro after 4 seconds
    return () => clearTimeout(timer);
  }, []); // Run once on component mount

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeCanvas = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      setCanvasReady(true);
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    if (!canvasReady) return;
    
    const loadData = async () => {
      try {
        const pathways = await UserPathway.list();
        
        // Aggregate data
        const pathwayCount = {};
        const sessions = new Set();
        
        pathways.forEach(pathway => {
          pathwayCount[pathway.pathway_name] = (pathwayCount[pathway.pathway_name] || 0) + 1;
          if (pathway.session_id) sessions.add(pathway.session_id);
        });
        
        const maxCount = Math.max(...Object.values(pathwayCount), 1);
        
        // Create nodes
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        nodesRef.current = Object.entries(pathwayCount).map(([pathway, count], index) => {
          const angle = (index / Object.keys(pathwayCount).length) * Math.PI * 2;
          const radius = 200 + (count / maxCount) * 150;
          
          return {
            id: index,
            label: pathway,
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius,
            vx: 0,
            vy: 0,
            radius: Math.max(15, Math.min(50, 15 + (count / maxCount) * 35)),
            count,
            maxCount,
            category: pathway.includes(' - ') ? pathway.split(' - ')[1] : 'General',
            isDragging: false
          };
        });
        
        setStats({
          totalSelections: pathways.length,
          uniquePathways: Object.keys(pathwayCount).length,
          sessions: sessions.size
        });
        
      } catch (error) {
        console.error('Error loading pathway data:', error);
      }
    };
    
    loadData();
  }, [canvasReady]);
  
  const simulate = useCallback(() => {
    const nodes = nodesRef.current;
    if (nodes.length === 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const centerForce = 0.0002;
    const repulsionStrength = 300;
    const damping = 0.98;

    nodes.forEach((node) => {
      if (node.isDragging) return;

      // Center attraction
      node.vx += (canvas.width / 2 - node.x) * centerForce;
      node.vy += (canvas.height / 2 - node.y) * centerForce;

      // Node repulsion
      nodes.forEach((otherNode) => {
        if (node.id === otherNode.id) return;
        const dx = otherNode.x - node.x;
        const dy = otherNode.y - node.y;
        const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        const minDist = node.radius + otherNode.radius + 20;
        
        if (dist < minDist) {
          const force = (repulsionStrength / (dist * dist)) * -1;
          node.vx += (dx / dist) * force;
          node.vy += (dy / dist) * force;
        }
      });
      
      node.vx *= damping;
      node.vy *= damping;
      node.x += node.vx;
      node.y += node.vy;
    });
  }, []);
  
  const render = useCallback((time) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    
    // The canvas itself will now always draw a black background.
    // The main container div's background color is handled by global CSS variables.
    ctx.fillStyle = '#000000'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const nodes = nodesRef.current;
    if (nodes.length === 0) return;
    
    // Draw connections between related nodes
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 1;
    nodes.forEach(nodeA => {
      nodes.forEach(nodeB => {
        if (nodeA.id >= nodeB.id) return;
        if (nodeA.category === nodeB.category) {
          const dx = nodeB.x - nodeA.x;
          const dy = nodeB.y - nodeA.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 400) {
            ctx.globalAlpha = Math.max(0, 1 - dist / 400) * 0.2;
            ctx.beginPath();
            ctx.moveTo(nodeA.x, nodeA.y);
            ctx.lineTo(nodeB.x, nodeB.y);
            ctx.stroke();
          }
        }
      });
    });
    ctx.globalAlpha = 1;

    // Draw nodes
    nodes.forEach(node => {
      const isSelected = selectedNodeId === node.id;
      const isHovered = hoveredNodeId === node.id;
      
      // Popularity-based glow
      const glowIntensity = node.count / node.maxCount;
      if (glowIntensity > 0.3) {
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = glowIntensity * 20;
      }
      
      // Outer ring for selection/hover
      if (isSelected || isHovered) {
        const ringPulse = Math.sin(time / 300 + node.id) * 3;
        ctx.strokeStyle = isSelected ? '#ffffff' : '#cccccc';
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.globalAlpha = isSelected ? 1 : 0.7;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 8 + ringPulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      
      // Main node
      const brightness = 0.3 + (glowIntensity * 0.4);
      ctx.fillStyle = `hsl(0, 0%, ${brightness * 100}%)`;
      ctx.strokeStyle = '#888888';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      ctx.shadowBlur = 0;
    });
  }, [selectedNodeId, hoveredNodeId]);
  
  useEffect(() => {
    // Only run animation if intro is hidden
    if (!canvasReady || showIntro) return;
    
    const animate = (time) => {
      simulate();
      render(time);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [simulate, render, canvasReady, showIntro]);
  
  const handleMouseDown = useCallback((e) => {
    // Prevent interaction if intro is showing
    if (showIntro) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const clickedNode = [...nodesRef.current].reverse().find(node => 
      Math.sqrt((mouseX - node.x)**2 + (mouseY - node.y)**2) < node.radius + 5
    );
    
    if (clickedNode) {
      clickedNode.isDragging = true;
      setSelectedNodeId(clickedNode.id);
    } else {
      setSelectedNodeId(null);
    }
  }, [showIntro]);
  
  const handleMouseMove = useCallback((e) => {
    // Prevent interaction if intro is showing
    if (showIntro) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const draggingNode = nodesRef.current.find(node => node.isDragging);
    if (draggingNode) {
      draggingNode.x = mouseX;
      draggingNode.y = mouseY;
      draggingNode.vx = 0; 
      draggingNode.vy = 0;
    }

    const currentlyHoveredNode = [...nodesRef.current].reverse().find(node => 
      !draggingNode && Math.sqrt((mouseX - node.x)**2 + (mouseY - node.y)**2) < node.radius + 5
    );

    setHoveredNodeId(currentlyHoveredNode ? currentlyHoveredNode.id : null);
    
    if (currentlyHoveredNode) {
      setTooltip({ 
        show: true, 
        x: mouseX, 
        y: mouseY, 
        text: `${currentlyHoveredNode.label} (${currentlyHoveredNode.count} selections)` 
      });
      canvas.style.cursor = 'pointer';
    } else if (!draggingNode) {
      setTooltip(prev => ({ ...prev, show: false }));
      canvas.style.cursor = 'grab';
    }
  }, [showIntro]);
  
  const handleMouseUp = useCallback(() => {
    // Prevent interaction if intro is showing
    if (showIntro) return;

    nodesRef.current.forEach(node => { 
      node.isDragging = false; 
    });
  }, [showIntro]);

  const handleMouseLeave = useCallback(() => {
    // Prevent interaction if intro is showing
    if (showIntro) return;

    handleMouseUp();
    setHoveredNodeId(null);
    setTooltip(prev => ({...prev, show: false}));
  }, [handleMouseUp, showIntro]);
  
  const selectedNode = selectedNodeId !== null ? nodesRef.current.find(n => n.id === selectedNodeId) : null;
  
  return (
    <div className="w-screen h-screen relative overflow-hidden select-none" style={{ backgroundColor: '#1F1F1E' }}>
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="intro-overlay"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, delay: 3 }} // Fade out over 1s after 3s delay
            className="absolute inset-0 flex flex-col items-center justify-center z-50 text-white text-3xl font-light space-y-4"
            style={{ backgroundColor: 'var(--background)' }}
          >
            <Eye size={48} className="text-yellow-400 animate-pulse" />
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600">
              NEURAL COLLECTIVE
            </h1>
            <p className="text-gray-400 text-xl mt-4 animate-fade-in-up">
              Aggregating countless pathways...
            </p>
            <p className="text-gray-500 text-sm mt-2">
              (Loading Map Data)
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-4 left-4 z-10">
        <Link to={createPageUrl('Welcome')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-black bg-opacity-30 px-3 py-1 rounded">
          <ArrowLeft size={16} />
          <span>Back</span>
        </Link>
      </div>

      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <h1 className="text-2xl text-white font-semibold flex items-center gap-2">
          <Eye size={20} />
          Collective Neural Map
        </h1>
        <p className="text-sm text-gray-400 text-center mt-1">Aggregated experiences from all users</p>
      </div>

      <NodeInfo node={selectedNode} onClose={() => setSelectedNodeId(null)} />

      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: showIntro ? 'default' : 'grab' }} // Cursor changes based on intro state
      />

      <AnimatePresence>
        {tooltip.show && !selectedNode && !showIntro && ( // Don't show tooltip during intro
          <motion.div
            className="absolute pointer-events-none bg-black bg-opacity-75 text-white text-sm px-3 py-2 rounded z-30 shadow-lg border border-gray-600"
            style={{
              left: tooltip.x + 15,
              top: tooltip.y + 15,
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            {tooltip.text}
          </motion.div>
        )}
      </AnimatePresence>
      
      <CollectiveMapLegend stats={stats} />
    </div>
  );
}
