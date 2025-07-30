import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

const forceConfig = {
    charge: -1000,
    linkDistance: 150,
    centerAttraction: 0.05,
    damping: 0.9,
};

const Node = ({ position, label, onPointerDown, onPointerOver, onPointerOut }) => {
    return (
        <group 
            position={position}
            onPointerDown={onPointerDown}
            onPointerOver={onPointerOver}
            onPointerOut={onPointerOut}
        >
            <mesh>
                <circleGeometry args={[25, 32]} />
                <meshBasicMaterial color="#333333" />
            </mesh>
            <mesh>
                <ringGeometry args={[28, 30, 32]} />
                <meshBasicMaterial color="#666666" />
            </mesh>
        </group>
    );
};

const Tooltip = ({ content, position }) => {
    if (!content) return null;
    return (
        <Text
            position={[position.x, position.y + 45, position.z]}
            fontSize={12}
            color="white"
            anchorX="center"
            anchorY="middle"
            font="/RobotoMono-Regular.ttf"
        >
            {content.label}
            <Text fontSize={8} color="gray" anchorX="center" anchorY="middle" position-y={-12}>
                {content.type}
            </Text>
        </Text>
    );
};


export default function NodeMap({ nodes: nodeLabels }) {
    const nodes = useMemo(() => 
        nodeLabels.map(label => ({
            id: label,
            label: label,
            position: new THREE.Vector3((Math.random() - 0.5) * 500, (Math.random() - 0.5) * 500, 0),
            velocity: new THREE.Vector3(),
        })), [nodeLabels]);

    const [draggingNode, setDraggingNode] = useState(null);
    const [hoveredNode, setHoveredNode] = useState(null);
    const groupRef = useRef();

    useEffect(() => {
        // Simple physics simulation loop
        let animationFrameId;
        const simulate = () => {
            if (nodes.length === 0) return;

            // Apply forces
            for (let i = 0; i < nodes.length; i++) {
                const nodeA = nodes[i];

                // Center attraction
                nodeA.velocity.add(nodeA.position.clone().multiplyScalar(-forceConfig.centerAttraction));

                for (let j = i + 1; j < nodes.length; j++) {
                    const nodeB = nodes[j];
                    const delta = nodeB.position.clone().sub(nodeA.position);
                    const distance = delta.length();
                    const direction = delta.normalize();

                    // Repulsion (charge)
                    const repulsion = direction.clone().multiplyScalar(forceConfig.charge / (distance * distance));
                    nodeA.velocity.add(repulsion);
                    nodeB.velocity.sub(repulsion);
                }
            }

            // Update positions
            nodes.forEach(node => {
                if (draggingNode !== node.id) {
                    node.velocity.multiplyScalar(forceConfig.damping);
                    node.position.add(node.velocity);
                }
            });
            
            // Force a re-render
            if (groupRef.current) {
                groupRef.current.children.forEach((child, i) => {
                    if (nodes[i]) child.position.copy(nodes[i].position);
                });
            }

            animationFrameId = requestAnimationFrame(simulate);
        };
        simulate();
        return () => cancelAnimationFrame(animationFrameId);
    }, [nodes, draggingNode]);
    
    const onPointerDown = (e, node) => {
        e.stopPropagation();
        setDraggingNode(node.id);
        e.target.setPointerCapture(e.pointerId);
    };

    const onPointerUp = (e) => {
        setDraggingNode(null);
        e.target.releasePointerCapture(e.pointerId);
    };

    const onPointerMove = (e) => {
        if (draggingNode) {
            const node = nodes.find(n => n.id === draggingNode);
            if (node) {
                const p = e.unprojectedPoint;
                node.position.set(p.x, p.y, 0);
                node.velocity.set(0, 0, 0);
            }
        }
    };
    
    return (
        <group
          onPointerUp={onPointerUp}
          onPointerMove={onPointerMove}
        >
            <group ref={groupRef}>
                {nodes.map(node => (
                    <Node
                        key={node.id}
                        position={node.position}
                        label={node.label}
                        onPointerDown={(e) => onPointerDown(e, node)}
                        onPointerOver={() => setHoveredNode(node)}
                        onPointerOut={() => setHoveredNode(null)}
                    />
                ))}
            </group>
            
            <Tooltip
                content={hoveredNode ? { label: hoveredNode.label, type: 'Seed' } : null}
                position={hoveredNode ? hoveredNode.position : new THREE.Vector3()}
            />
        </group>
    );
}