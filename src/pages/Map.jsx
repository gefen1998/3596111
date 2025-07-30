import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Info, X } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { getCategoryForItem } from '../components/map/pathwaysData';

export default function MapPage() {
  console.log('=== MAP PAGE LOADED ===');
  
  // The map now gets its data from the persistent list in localStorage
  const [finalPathways, setFinalPathways] = useState([]);
  
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const nodesRef = useRef([]);
  
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, text: '' });
  const [canvasReady, setCanvasReady] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);
  const lastInteractionPos = useRef({ x: 0, y: 0 });
  const initialPinchDistance = useRef(0);
  const [nodeImages, setNodeImages] = useState({ img1: null, img2: null });

  // Load pathways from localStorage on component mount
  useEffect(() => {
    const storedPathways = JSON.parse(localStorage.getItem('userPathways') || '[]');
    console.log('Loaded pathways from localStorage:', storedPathways);
    setFinalPathways(storedPathways);
  }, []);

  // Load node images
  useEffect(() => {
    const img1 = new Image();
    img1.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6bc139e0a_sug1png72.png";
    const img2 = new Image();
    img2.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/8433e1aac_72ppi.png";

    Promise.all([
      new Promise(resolve => { img1.onload = () => resolve(true); img1.onerror = () => resolve(false); }),
      new Promise(resolve => { img2.onload = () => resolve(true); img2.onerror = () => resolve(false); })
    ]).then(([img1Success, img2Success]) => {
      if (img1Success && img2Success) {
        setNodeImages({ img1, img2 });
        console.log('Node images loaded successfully');
      }
    });
  }, []);

  // Setup canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      setCanvasReady(true);
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      document.body.style.overflow = 'auto';
    };
  }, []);
  
  // Create nodes from ALL pathways in the list
  useEffect(() => {
    if (!canvasReady || finalPathways.length === 0 || nodesRef.current.length > 0 || !nodeImages.img1) return;
    
    console.log('Creating nodes for pathways:', finalPathways);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    nodesRef.current = finalPathways.map((pathway, index) => {
      const nodeType = ['Seed', 'Disruptor', 'Reinforcer', 'Context'][index % 4];
      return {
        id: index,
        label: pathway,
        x: centerX + (Math.random() - 0.5) * 500,
        y: centerY + (Math.random() - 0.5) * 300,
        vx: 0,
        vy: 0,
        radius: 50,
        isDragging: false,
        type: nodeType,
        image: nodeType === 'Seed' || nodeType === 'Reinforcer' ? nodeImages.img1 : nodeImages.img2,
        category: getCategoryForItem(pathway) || 'Unknown'
      };
    });
    
    console.log('Nodes created:', nodesRef.current);
  }, [finalPathways, canvasReady, nodeImages]);
  
  // Physics simulation
  const simulate = useCallback(() => {
    const nodes = nodesRef.current;
    if (nodes.length === 0) return;
    
    const centerForce = 0.0001;
    const repulsionStrength = 400;
    const damping = 0.95;

    nodes.forEach((node) => {
      if (node.isDragging) return;

      // Center attraction
      const canvas = canvasRef.current;
      if (canvas) {
        node.vx += (canvas.width / 2 - node.x) * centerForce;
        node.vy += (canvas.height / 2 - node.y) * centerForce;
      }

      // Node repulsion
      nodes.forEach((otherNode) => {
        if (node.id === otherNode.id) return;
        const dx = otherNode.x - node.x;
        const dy = otherNode.y - node.y;
        const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        const minDistance = (node.radius + otherNode.radius) * 1.3;
        
        if (dist < minDistance) {
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
  
  // Render function
  const render = useCallback((time) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);
    
    const nodes = nodesRef.current;
    if (nodes.length === 0) return;
    
    // Draw connections
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.6;
    
    nodes.forEach(nodeA => {
      nodes.forEach(nodeB => {
        if (nodeA.id >= nodeB.id) return;
        const dx = nodeB.x - nodeA.x;
        const dy = nodeB.y - nodeA.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 300) {
          ctx.beginPath();
          ctx.moveTo(nodeA.x, nodeA.y);
          ctx.lineTo(nodeB.x, nodeB.y);
          ctx.stroke();
        }
      });
    });
    
    ctx.globalAlpha = 1;
    
    // Draw nodes
    nodes.forEach(node => {
      const isSelected = selectedNode && selectedNode.id === node.id;
      const isHovered = hoveredNodeId === node.id;
      
      // Selection ring
      if (isSelected || isHovered) {
        ctx.strokeStyle = isSelected ? '#ffffff' : '#cccccc';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      
      // Draw node image or fallback circle
      if (node.image) {
        ctx.save();
        ctx.globalAlpha = 0.9;
        ctx.drawImage(
          node.image,
          node.x - node.radius,
          node.y - node.radius,
          node.radius * 2,
          node.radius * 2
        );
        ctx.restore();
      } else {
        // Fallback circle
        ctx.fillStyle = '#444444';
        ctx.strokeStyle = '#888888';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      
      // Label
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(node.label, node.x, node.y + node.radius + 20);
      
      // Type label
      ctx.fillStyle = '#aaaaaa';
      ctx.font = '12px Arial';
      ctx.fillText(node.type, node.x, node.y + node.radius + 35);
    });
    
    ctx.restore();
  }, [selectedNode, hoveredNodeId, zoom, pan]);
  
  // Animation loop
  useEffect(() => {
    if (!canvasReady) return;
    
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
  }, [simulate, render, canvasReady]);
  
  const getInteractionPoint = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left - pan.x) / zoom,
      y: (clientY - rect.top - pan.y) / zoom,
    };
  };

  // Combined event handlers for mouse and touch
  const handleInteractionStart = useCallback((e) => {
    if (e.touches && e.touches.length > 2) return;
    e.preventDefault();
    setIsInteracting(true);

    if (e.touches && e.touches.length === 2) {
      // Start pinch
      initialPinchDistance.current = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      return;
    }

    const point = getInteractionPoint(e);
    if (!point) return;
    lastInteractionPos.current = { x: e.touches ? e.touches[0].clientX : e.clientX, y: e.touches ? e.touches[0].clientY : e.clientY };

    const clickedNode = [...nodesRef.current].reverse().find(node => 
      Math.hypot(point.x - node.x, point.y - node.y) < node.radius + 5
    );
    
    if (clickedNode) {
      clickedNode.isDragging = true;
      setSelectedNode(clickedNode);
    } else {
      setSelectedNode(null);
    }
  }, [zoom, pan]);

  const handleInteractionMove = useCallback((e) => {
    if (!isInteracting) return;
    if (e.touches && e.touches.length > 2) return;
    e.preventDefault();

    if (e.touches && e.touches.length === 2) {
      // Pinch move
      const newPinchDistance = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      const scaleFactor = newPinchDistance / initialPinchDistance.current;
      setZoom(prev => Math.min(Math.max(prev * scaleFactor, 0.5), 3));
      initialPinchDistance.current = newPinchDistance; // update for continuous zoom
      return;
    }

    const draggingNode = nodesRef.current.find(node => node.isDragging);
    if (draggingNode) {
      const point = getInteractionPoint(e);
      if (point) {
        draggingNode.x = point.x;
        draggingNode.y = point.y;
        draggingNode.vx = 0;
        draggingNode.vy = 0;
      }
    } else { // Pan
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const deltaX = clientX - lastInteractionPos.current.x;
      const deltaY = clientY - lastInteractionPos.current.y;
      setPan(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      lastInteractionPos.current = { x: clientX, y: clientY };
    }
  }, [zoom, pan, isInteracting]);

  const handleInteractionEnd = useCallback((e) => {
    setIsInteracting(false);
    nodesRef.current.forEach(node => { node.isDragging = false; });
    if (e.touches && e.touches.length < 2) {
      initialPinchDistance.current = 0;
    }
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.min(Math.max(prev * scaleFactor, 0.5), 3));
  }, []);

  // Show loading state if no pathways yet
  if (finalPathways.length === 0) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#1F1F1E] text-white">
        <h1 className="text-2xl mb-4">No experiences selected yet</h1>
        <p className="text-sm text-gray-400 mb-4">Start by choosing an experience to build your neural map</p>
        <Link to={createPageUrl('CategorySelection')} className="flex items-center gap-2 text-gray-400 hover:text-white">
          <ArrowLeft size={16} />
          <span>Choose an Experience</span>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="w-screen h-screen relative overflow-hidden select-none bg-[#1F1F1E]">
      <div className="absolute top-4 left-4 z-10">
        <Link to={createPageUrl('CategorySelection')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-black bg-opacity-30 px-3 py-1 rounded">
          <ArrowLeft size={16} />
          <span>Choose Another</span>
        </Link>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <div className="bg-black bg-opacity-30 px-3 py-1 rounded text-sm text-gray-400">
          Pathways: {finalPathways.length} | Zoom: {Math.round(zoom * 100)}%
        </div>
      </div>

      <AnimatePresence>
        {selectedNode && (
          <motion.div
            key={selectedNode.id}
            className="absolute top-20 left-4 bg-black bg-opacity-80 border border-gray-700 p-4 text-sm w-64 z-20 rounded-lg shadow-2xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <button onClick={() => setSelectedNode(null)} className="absolute top-2 right-2 text-gray-500 hover:text-white">
              <X size={16} />
            </button>
            <h3 className="font-semibold text-white text-lg mb-1">{selectedNode.label}</h3>
            <p className="text-yellow-400 text-xs mb-3">{selectedNode.type}</p>
            <div className="space-y-2 text-gray-300">
              <div>Category: <span className="text-white">{selectedNode.category}</span></div>
              <div>This experience represents a key moment in your neural pathway formation.</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        onMouseDown={handleInteractionStart}
        onMouseMove={handleInteractionMove}
        onMouseUp={handleInteractionEnd}
        onMouseLeave={handleInteractionEnd}
        onTouchStart={handleInteractionStart}
        onTouchMove={handleInteractionMove}
        onTouchEnd={handleInteractionEnd}
        onWheel={handleWheel}
        style={{ cursor: 'grab' }}
      />

      <AnimatePresence>
        {tooltip.show && !selectedNode && (
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
    </div>
  );
}