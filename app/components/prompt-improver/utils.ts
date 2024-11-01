import { Node, Edge } from "reactflow";
import dagre from "dagre";
import { PromptNode } from "@/app/types/types";

// Adjusted dimensions and spacing
export const NODE_WIDTH = 600; // Much wider for better text display
export const NODE_HEIGHT = 200; // Slightly shorter but wider ratio
export const HORIZONTAL_SPACING = 300; // Space between ranks
export const VERTICAL_SPACING = 250; // Space between nodes in same rank
export const PADDING = 20; // Reduced padding since we have better spacing

export function getLayoutedElements(nodes: Node<PromptNode>[], edges: Edge[]) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    rankdir: "LR",
    nodesep: VERTICAL_SPACING,
    ranksep: HORIZONTAL_SPACING,
    marginx: 100,
    marginy: 100,
    align: "DL", // Changed to DL (Down-Left) for better vertical alignment
    ranker: "network-simplex", // Changed back to network-simplex for better overall layout
  });

  // Add nodes to dagre
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: NODE_WIDTH + PADDING,
      height: NODE_HEIGHT + PADDING,
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  // Get positioned nodes with adjusted center point
  let layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    };
  });

  // Adjust vertical positions to prevent overlap
  const rankGroups: { [key: number]: Node<PromptNode>[] } = {};
  layoutedNodes.forEach((node) => {
    const rankX = Math.round(node.position.x);
    if (!rankGroups[rankX]) {
      rankGroups[rankX] = [];
    }
    rankGroups[rankX].push(node);
  });

  // Ensure minimum vertical spacing within each rank
  Object.values(rankGroups).forEach((rankNodes) => {
    if (rankNodes.length > 1) {
      rankNodes.sort((a, b) => a.position.y - b.position.y);
      let currentY = rankNodes[0].position.y;
      rankNodes.forEach((node, index) => {
        if (index > 0) {
          const minY = currentY + NODE_HEIGHT + VERTICAL_SPACING;
          if (node.position.y < minY) {
            node.position.y = minY;
          }
          currentY = node.position.y;
        }
      });
    }
  });

  return {
    nodes: layoutedNodes,
    edges,
  };
}
