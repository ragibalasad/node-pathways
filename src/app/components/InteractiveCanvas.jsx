"use client";

import { useState, useRef } from "react";

const InteractiveCanvas = () => {
  const [nodes, setNodes] = useState([]);
  const [scale, setScale] = useState(1);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const nodeSize = 20;
  const bufferZone = 40;

  const isAreaAvailable = (x, y) => {
    return nodes.every((node) => {
      const distance = Math.sqrt(
        Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2)
      );
      return distance > bufferZone;
    });
  };

  const handleMouseDown = (e) => {
    if (e.button === 0) {
      // Left click
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / scale;
      const y = (e.clientY - rect.top) / scale;
      if (isAreaAvailable(x, y)) {
        setNodes((prevNodes) => [...prevNodes, { x, y }]);
      }
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    setNodes((prevNodes) =>
      prevNodes.filter(
        (node) =>
          !(Math.abs(node.x - x) < nodeSize && Math.abs(node.y - y) < nodeSize)
      )
    );
  };

  const handleZoomIn = () => {
    setScale((prevScale) => prevScale * 1.2);
  };

  const handleZoomOut = () => {
    setScale((prevScale) => prevScale / 1.2);
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      const deltaX = e.clientX - origin.x;
      const deltaY = e.clientY - origin.y;
      containerRef.current.scrollLeft -= deltaX;
      containerRef.current.scrollTop -= deltaY;
      setOrigin({ x: e.clientX, y: e.clientY });
    }
  };

  const handleDragStart = (e) => {
    setDragging(true);
    setOrigin({ x: e.clientX, y: e.clientY });
  };

  const handleDragEnd = () => {
    setDragging(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      className="w-screen h-screen overflow-hidden relative"
    >
      <div
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onContextMenu={handleContextMenu}
        onMouseDownCapture={handleDragStart}
        className="absolute bg-gray-200"
        style={{
          width: "3000px",
          height: "3000px",
          transform: `scale(${scale})`,
          transformOrigin: "0 0",
          cursor: "grab",
        }}
      >
        {nodes.map((node, index) => (
          <div
            key={index}
            className="absolute bg-green-500 rounded-full"
            style={{
              width: `${nodeSize}px`,
              height: `${nodeSize}px`,
              left: `${node.x - nodeSize / 2}px`,
              top: `${node.y - nodeSize / 2}px`,
            }}
          />
        ))}
      </div>
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 space-x-2">
        <button
          onClick={handleZoomIn}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Zoom In
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Zoom Out
        </button>
      </div>
    </div>
  );
};

export default InteractiveCanvas;
