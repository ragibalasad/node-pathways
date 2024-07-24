// Function to calculate Euclidean distance
function getDistance(nodeA, nodeB) {
  return Math.sqrt((nodeA.x - nodeB.x) ** 2 + (nodeA.y - nodeB.y) ** 2);
}

// Function to find neighbors within a proximity of 5 nodes
function findNeighbors(nodes, currentNode, proximity) {
  return nodes.filter(
    (node) =>
      node !== currentNode && getDistance(node, currentNode) <= proximity
  );
}

// A* Pathfinding Algorithm
function astar(nodes, startNode, endNode) {
  const openSet = [startNode];
  const cameFrom = new Map();
  const gScore = new Map();
  const fScore = new Map();

  nodes.forEach((node) => {
    gScore.set(node, Infinity);
    fScore.set(node, Infinity);
  });

  gScore.set(startNode, 0);
  fScore.set(startNode, getDistance(startNode, endNode));

  while (openSet.length > 0) {
    const currentNode = openSet.reduce((lowest, node) =>
      fScore.get(node) < fScore.get(lowest) ? node : lowest
    );

    if (currentNode === endNode) {
      const path = [];
      let tempNode = endNode;

      while (cameFrom.has(tempNode)) {
        path.push(tempNode);
        tempNode = cameFrom.get(tempNode);
      }

      path.push(startNode);
      return path.reverse();
    }

    openSet.splice(openSet.indexOf(currentNode), 1);

    const neighbors = findNeighbors(nodes, currentNode, 5);

    neighbors.forEach((neighbor) => {
      const tentativeGScore =
        gScore.get(currentNode) + getDistance(currentNode, neighbor);

      if (tentativeGScore < gScore.get(neighbor)) {
        cameFrom.set(neighbor, currentNode);
        gScore.set(neighbor, tentativeGScore);
        fScore.set(
          neighbor,
          gScore.get(neighbor) + getDistance(neighbor, endNode)
        );

        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    });
  }

  return []; // No path found
}

export { astar };
