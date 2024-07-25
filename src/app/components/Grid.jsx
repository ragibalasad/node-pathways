"use client";

import React, { useState, useMemo, useCallback } from "react";
import { FaPlus, FaMinus, FaSearchLocation } from "react-icons/fa";

const Tilemap = () => {
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [startCoords, setStartCoords] = useState({ x: 0, y: 0 });
  const [scrollPos, setScrollPos] = useState({ x: 0, y: 0 });
  const [activeTiles, setActiveTiles] = useState([]);
  const [startNode, setStartNode] = useState(null);
  const [endNode, setEndNode] = useState(null);
  const [path, setPath] = useState([]);
  const [pathfindingMode, setPathfindingMode] = useState(false);
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    text: "",
  });

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
  const inactiveScale = 0.2; // Scale of inactive tiles
  const margin = 32; // Margin between tiles
  const gridSize = 20; // Number of tiles in each row/column
  const maxDistance = 4 * (tileSize + margin); // Maximum distance between tiles to draw a line

  const toggleTile = (coords) => {
    setActiveTiles((prev) => {
      const newActiveTiles = prev.map((tile) => ({ ...tile }));
      const index = newActiveTiles.findIndex(
        (tile) => tile.x === coords.x && tile.y === coords.y
      );
      if (index !== -1) {
        newActiveTiles.splice(index, 1);
      } else {
        newActiveTiles.push(coords);
      }
      return newActiveTiles;
    });
  };

  const tilePositions = useMemo(() => {
    const positions = {};
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const x = col * (tileSize + margin) + tileSize / 2;
        const y = row * (tileSize + margin) + tileSize / 2;
        positions[`${row},${col}`] = { x, y };
      }
    }
    return positions;
  }, [gridSize, tileSize, margin]);

  const connections = useMemo(() => {
    const connections = activeTiles.reduce((acc, tile) => {
      const connectedTiles = activeTiles.filter((otherTile) => {
        if (tile.x === otherTile.x && tile.y === otherTile.y) return false;
        const pos1 = tilePositions[`${tile.x},${tile.y}`];
        const pos2 = tilePositions[`${otherTile.x},${otherTile.y}`];
        const distance = Math.sqrt(
          Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2)
        );
        return distance <= maxDistance;
      });
      acc.push({
        tile,
        connectedTiles,
      });
      return acc;
    }, []);
    return connections;
  }, [activeTiles, tilePositions, maxDistance]);

  const handleTileClick = (coords) => {
    if (pathfindingMode) {
      const index = activeTiles.findIndex(
        (tile) => tile.x === coords.x && tile.y === coords.y
      );
      if (index === -1) return;
      if (startNode === null) {
        setStartNode(coords);
      } else if (endNode === null) {
        setEndNode(coords);
      }
    } else {
      toggleTile(coords);
    }
  };

  const handleTileMouseEnter = (coords) => {
    const position = tilePositions[`${coords.x},${coords.y}`];
    setTooltip({
      visible: true,
      x: position.x,
      y: position.y,
      text: `(${coords.x}, ${coords.y})`,
    });
  };

  const handleTileMouseLeave = () => {
    setTooltip({ visible: false, x: 0, y: 0, text: "" });
  };

  const hugeWidth = gridSize * (tileSize + margin) - margin;
  const hugeHeight = gridSize * (tileSize + margin) - margin;

  const getTooltipPosition = useCallback(() => {
    if (tooltip.visible) {
      const scaledX = tooltip.x * scale + scrollPos.x;
      const scaledY = tooltip.y * scale + scrollPos.y;
      return {
        top: scaledY - 20,
        left: scaledX + 10,
      };
    }
    return { top: 0, left: 0 };
  }, [tooltip, scale, scrollPos]);

  const tooltipPosition = getTooltipPosition();

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
          position: "relative", // Ensure relative positioning for child elements
        }}
      >
        {connections.length > 0 && (
          <svg
            className="absolute w-full h-full z-10"
            style={{
              left: 0,
              top: 0,
              pointerEvents: "none",
            }}
          >
            {connections.map(({ tile, connectedTiles }, index) =>
              connectedTiles.map((connectedTile, subIndex) => {
                const pos1 = tilePositions[`${tile.x},${tile.y}`];
                const pos2 =
                  tilePositions[`${connectedTile.x},${connectedTile.y}`];
                return (
                  <line
                    key={`${index}-${subIndex}`}
                    x1={pos1.x}
                    y1={pos1.y}
                    x2={pos2.x}
                    y2={pos2.y}
                    stroke="lightgreen"
                    strokeWidth="10"
                    strokeLinecap="round"
                    stroke-opacity="0.4"
                  />
                );
              })
            )}
          </svg>
        )}

        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, ${tileSize + margin}px)`,
            gridTemplateRows: `repeat(${gridSize}, ${tileSize + margin}px)`,
          }}
        >
          {Array.from({ length: gridSize * gridSize }).map((_, index) => {
            const row = Math.floor(index / gridSize);
            const col = index % gridSize;
            const coords = { x: row, y: col };
            return (
              <div
                key={index}
                onClick={() => handleTileClick(coords)}
                onMouseEnter={() => handleTileMouseEnter(coords)}
                onMouseLeave={handleTileMouseLeave}
                className="flex items-center justify-center cursor-pointer m-0 overflow-hidden"
                style={{
                  width: `${tileSize}px`,
                  height: `${tileSize}px`,
                }}
              >
                <div
                  className={`rounded-full cursor-pointer box-border ${
                    activeTiles.some((tile) => tile.x === row && tile.y === col)
                      ? "bg-green-500 z-20"
                      : "bg-gray-300"
                  } ${
                    startNode && startNode.x === row && startNode.y === col
                      ? "border-2 border-blue-500"
                      : ""
                  } ${
                    endNode && endNode.x === row && endNode.y === col
                      ? "border-2 border-red-500"
                      : ""
                  }`}
                  style={{
                    width: `${tileSize}px`,
                    height: `${tileSize}px`,
                    transform: `scale(${
                      activeTiles.some(
                        (tile) => tile.x === row && tile.y === col
                      )
                        ? 1
                        : inactiveScale
                    })`,
                    transformOrigin: "center",
                    transition:
                      "background-color 0.3s ease, transform 0.3s ease",
                  }}
                ></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="absolute bg-black text-white text-xs px-2 py-1 m-1 rounded"
          style={{
            top: `${tooltipPosition.top}px`, // Adjust top position
            left: `${tooltipPosition.left}px`, // Adjust left position
            pointerEvents: "none", // Ensure tooltip doesn't capture mouse events
            transform: `scale(${1})`, // Reverse scale for tooltip
            transformOrigin: "0 0", // Ensure tooltip scales correctly
          }}
        >
          {tooltip.text}
        </div>
      )}

      <div className="absolute bottom-4 z-30 left-1/2 transform -translate-x-1/2 flex space-x-2">
        <button
          className="flex my-auto p-2 bg-red-500 text-white rounded"
          onClick={zoomOut}
        >
          <FaMinus />
        </button>
        <button
          className="flex my-auto p-2 bg-blue-500 text-white rounded"
          onClick={zoomIn}
        >
          <FaPlus />
        </button>
        <button className="p-2 bg-green-500 text-white rounded">
          <FaSearchLocation />
        </button>
      </div>
    </div>
  );
};

export default Tilemap;
