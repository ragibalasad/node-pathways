"use client";

import React, { useState, useMemo } from "react";
import { astar } from "../lib/pathfinding"; // Adjust the path as necessary

const Tilemap = () => {
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [startCoords, setStartCoords] = useState({ x: 0, y: 0 });
  const [scrollPos, setScrollPos] = useState({ x: 0, y: 0 });
  const [activeTiles, setActiveTiles] = useState(new Set());
  const [startNode, setStartNode] = useState(null);
  const [endNode, setEndNode] = useState(null);
  const [path, setPath] = useState([]);
  const [pathfindingMode, setPathfindingMode] = useState(false);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartCoords({ x: e.clientX - scrollPos.x, y: e.clientY - scrollPos.y });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setScrollPos({
        x: e.clientX - startCoords.x,
        y: e.clientY - startCoords.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const zoomIn = () => setScale((prev) => prev * 1.1);
  const zoomOut = () => setScale((prev) => prev / 1.1);

  const tileSize = 48; // Size of each tile when active
  const inactiveScale = 0.25; // Scale of inactive tiles
  const margin = 32; // Margin between tiles
  const gridSize = 20; // Number of tiles in each row/column
  const maxDistance = 5 * (tileSize + margin); // Maximum distance between tiles to draw a line

  const toggleTile = (index) => {
    setActiveTiles((prev) => {
      const newActiveTiles = new Set(prev);
      if (newActiveTiles.has(index)) {
        newActiveTiles.delete(index);
      } else {
        newActiveTiles.add(index);
      }
      return newActiveTiles;
    });
  };

  const tilePositions = useMemo(() => {
    const positions = {};
    for (let i = 0; i < gridSize * gridSize; i++) {
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      const x = col * (tileSize + margin) + tileSize / 2;
      const y = row * (tileSize + margin) + tileSize / 2;
      positions[i] = { x, y };
    }
    return positions;
  }, [gridSize, tileSize, margin]);

  const connections = useMemo(() => {
    const connections = [];
    const activeTileIndices = Array.from(activeTiles);
    for (let i = 0; i < activeTileIndices.length; i++) {
      for (let j = i + 1; j < activeTileIndices.length; j++) {
        const index1 = activeTileIndices[i];
        const index2 = activeTileIndices[j];
        const pos1 = tilePositions[index1];
        const pos2 = tilePositions[index2];
        const distance = Math.sqrt(
          Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2)
        );
        if (distance <= maxDistance) {
          connections.push({
            x1: pos1.x,
            y1: pos1.y,
            x2: pos2.x,
            y2: pos2.y,
          });
        }
      }
    }
    return connections;
  }, [activeTiles, tilePositions, maxDistance]);

  const handleTileClick = (index) => {
    if (pathfindingMode) {
      if (startNode === null) {
        setStartNode(index);
      } else if (endNode === null) {
        setEndNode(index);
      }
    } else {
      toggleTile(index);
    }
  };

  const findPath = () => {
    if (startNode !== null && endNode !== null) {
      const foundPath = astar(Array.from(activeTiles), startNode, endNode);
      setPath(foundPath);
      setPathfindingMode(false); // Exit pathfinding mode after finding the path
    } else {
      alert("Please select both start and end nodes.");
    }
  };

  const activatePathfinding = () => {
    if (activeTiles.size < 2) {
      alert("Please activate at least 2 nodes to find a path.");
      return;
    }
    setPathfindingMode(true);
    setStartNode(null);
    setEndNode(null);
    setPath([]);
    alert("Click on the start node, then the end node.");
  };

  const hugeWidth = gridSize * (tileSize + margin) - margin;
  const hugeHeight = gridSize * (tileSize + margin) - margin;

  return (
    <div
      className="relative w-screen h-screen bg-gray-200 overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseDown={handleMouseDown}
    >
      <div
        className="huge"
        style={{
          width: `${hugeWidth}px`,
          height: `${hugeHeight}px`,
          transform: `translate(${scrollPos.x}px, ${scrollPos.y}px) scale(${scale})`,
          transformOrigin: "0 0",
          cursor: isDragging ? "grabbing" : "grab",
        }}
      >
        {connections.length > 0 && (
          <svg
            className="absolute w-full h-full"
            style={{
              left: 0,
              top: 0,
              pointerEvents: "none",
            }}
          >
            {connections.map((line, index) => (
              <line
                key={index}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke="lightgreen"
                strokeWidth="5"
                strokeLinecap="round"
              />
            ))}
          </svg>
        )}

        <svg
          className="absolute w-full h-full"
          style={{
            left: 0,
            top: 0,
            pointerEvents: "none",
          }}
        >
          {path.map((node, index) => (
            <circle
              key={index}
              cx={tilePositions[node].x}
              cy={tilePositions[node].y}
              r="10"
              fill="red"
            />
          ))}
          {path.length > 0 && (
            <path
              d={path
                .map((node, index) => {
                  const { x, y } = tilePositions[node];
                  return index === 0 ? `M${x},${y}` : `L${x},${y}`;
                })
                .join(" ")}
              stroke="blue"
              strokeWidth="4"
              fill="none"
            />
          )}
        </svg>

        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, ${tileSize + margin}px)`,
            gridTemplateRows: `repeat(${gridSize}, ${tileSize + margin}px)`,
          }}
        >
          {Array.from({ length: gridSize * gridSize }).map((_, index) => (
            <div
              key={index}
              onClick={() => handleTileClick(index)}
              className="flex items-center justify-center cursor-pointer m-0 overflow-hidden"
              style={{
                width: `${tileSize}px`,
                height: `${tileSize}px`,
              }}
            >
              <div
                className={`rounded-full cursor-pointer box-border ${
                  activeTiles.has(index) ? "bg-green-500" : "bg-gray-300"
                } ${startNode === index ? "border-2 border-blue-500" : ""} ${
                  endNode === index ? "border-2 border-red-500" : ""
                }`}
                style={{
                  width: `${tileSize}px`,
                  height: `${tileSize}px`,
                  transform: `scale(${
                    activeTiles.has(index) ? 1 : inactiveScale
                  })`,
                  transformOrigin: "center",
                  transition: "background-color 0.3s ease, transform 0.3s ease",
                }}
              ></div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        <button className="p-2 bg-blue-500 text-white rounded" onClick={zoomIn}>
          Zoom In
        </button>
        <button className="p-2 bg-red-500 text-white rounded" onClick={zoomOut}>
          Zoom Out
        </button>
        <button
          className="p-2 bg-green-500 text-white rounded"
          onClick={activatePathfinding}
        >
          Find Path
        </button>
        <button
          className="p-2 bg-yellow-500 text-white rounded"
          onClick={findPath}
        >
          Confirm Path
        </button>
      </div>
    </div>
  );
};

export default Tilemap;