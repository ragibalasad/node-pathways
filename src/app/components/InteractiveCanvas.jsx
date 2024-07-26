"use client";

import { useState, useRef, useEffect } from "react";

const InteractiveCanvas = () => {
  const [nodes, setNodes] = useState([]);
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [isClick, setIsClick] = useState(false);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });
  const [pulseEnabled, setPulseEnabled] = useState(true);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const nodeSize = 20;
  const bufferZone = 40;

  useEffect(() => {
    const container = containerRef.current;
    setCanvasPosition({
      x: container.clientWidth / 2 - 1500,
      y: container.clientHeight / 2 - 1500,
    });
  }, []);

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
      setIsClick(true);
      setDragging(true);
      setOrigin({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = (e) => {
    if (e.button === 0) {
      setDragging(false);
      if (isClick) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;
        if (isAreaAvailable(x, y)) {
          setNodes((prevNodes) => [...prevNodes, { x, y }]);
        }
      }
      setIsClick(false);
    }
  };

  const handleMouseLeave = () => {
    setDragging(false);
    setIsClick(false);
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
      setCanvasPosition((prevPos) => ({
        x: prevPos.x + deltaX,
        y: prevPos.y + deltaY,
      }));
      setOrigin({ x: e.clientX, y: e.clientY });
      setIsClick(false);
    }
  };

  const togglePulse = () => {
    setPulseEnabled((prev) => !prev);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      className="w-screen h-screen overflow-hidden relative"
    >
      <div
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onContextMenu={handleContextMenu}
        className="absolute bg-slate-50"
        style={{
          width: "3000px",
          height: "3000px",
          transform: `scale(${scale})`,
          transformOrigin: "0 0",
          cursor: dragging ? "grabbing" : "grab",
          left: `${canvasPosition.x}px`,
          top: `${canvasPosition.y}px`,
        }}
      >
        <svg
          width="100%"
          height="100%"
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
          }}
        >
          <defs>
            {pulseEnabled &&
              nodes.map((node, index) => (
                <style key={index}>
                  {`
                  @keyframes pulse-${index} {
                    0% {
                      r: ${nodeSize / 2}px;
                      opacity: 1;
                    }
                    50% {
                      r: ${nodeSize * 15}px;
                      opacity: 0.5;
                    }
                    100% {
                      r: ${nodeSize * 15}px;
                      opacity: 0;
                    }
                  }
                  .pulse-${index} {
                    animation: pulse-${index} 2s infinite;
                  }
                `}
                </style>
              ))}
            {nodes.map((_, index) => (
              <radialGradient
                key={index}
                id={`gradient-${index}`}
                cx="50%"
                cy="50%"
                r="50%"
                fx="50%"
                fy="50%"
              >
                <stop
                  offset="0%"
                  style={{
                    stopColor: "rgba(94, 234, 212, 1)",
                    stopOpacity: 0.5,
                  }}
                />
                <stop
                  offset="100%"
                  style={{
                    stopColor: "rgba(94, 234, 212, 0.5)",
                    stopOpacity: 0.1,
                  }}
                />
              </radialGradient>
            ))}
          </defs>
          <g>
            {nodes.map((node, index) => (
              <circle
                key={`gradient-${index}`}
                cx={node.x}
                cy={node.y}
                r={nodeSize * 15}
                fill={`url(#gradient-${index})`}
                className={pulseEnabled ? `pulse-${index}` : ""}
                style={{ pointerEvents: "none" }}
                opacity={0.5}
              />
            ))}
          </g>
          <g>
            {nodes.map((node, index) => (
              <circle
                key={index}
                cx={node.x}
                cy={node.y}
                r={nodeSize / 2}
                fill="#2DD4BF"
                stroke="#F0FDFA"
                strokeWidth="2"
              />
            ))}
          </g>
        </svg>
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
        <button
          onClick={togglePulse}
          className={`bg-green-500 text-white px-4 py-2 rounded ${
            pulseEnabled ? "bg-green-600" : "bg-gray-400"
          }`}
        >
          {pulseEnabled ? "Disable Pulse" : "Enable Pulse"}
        </button>
      </div>
    </div>
  );
};

export default InteractiveCanvas;
