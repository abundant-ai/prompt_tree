import { Node, Edge } from "reactflow";
import { PromptNode, Change, Feedback } from "../app/types/types";
import { JsonValue } from "@prisma/client/runtime/library";

interface DBNode {
  id: string;
  chainId: string;
  parentId: string | null;
  type: string;
  position: JsonValue;
  text: string;
  analysis: string | null;
  changes: JsonValue;
  feedback: JsonValue;
  createdAt: Date;
}

export interface DBEdge {
  id: string;
  chainId: string;
  source: string;
  target: string;
}

export interface SaveChainParams {
  id?: string;
  name: string;
  nodes: Node<PromptNode>[];
  edges: Edge[];
}

export async function saveChain(params: SaveChainParams) {
  const response = await fetch("/api/chains", {
    method: params.id ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error("Failed to save chain");
  }

  return response.json();
}

export async function loadChain(chainId: string) {
  const response = await fetch(`/api/chains/${chainId}`);

  if (!response.ok) {
    throw new Error("Failed to load chain");
  }

  const chain = await response.json();
  if (!chain) return null;

  const nodes: Node[] = chain.nodes.map((node: DBNode) => ({
    id: node.id,
    type: node.type,
    position:
      typeof node.position === "string"
        ? JSON.parse(node.position)
        : { x: 0, y: 0 },
    data: {
      id: node.id,
      parentId: node.parentId,
      text: node.text,
      analysis: node.analysis || "",
      changes:
        typeof node.changes === "string"
          ? (JSON.parse(node.changes) as Change[])
          : [],
      feedback:
        typeof node.feedback === "string"
          ? (JSON.parse(node.feedback) as Feedback[])
          : [],
      createdAt: node.createdAt,
    },
  }));

  const edges: Edge[] = chain.edges.map((edge: DBEdge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
  }));

  return {
    id: chain.id,
    name: chain.name,
    nodes,
    edges,
  };
}

export interface ChainNode {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: {
    parentId: string | null;
    text: string;
    analysis?: string;
    changes?: Change[];
    feedback?: Feedback[];
    createdAt: Date;
  };
}

export async function listChains() {
  const response = await fetch("/api/chains");

  if (!response.ok) {
    throw new Error("Failed to list chains");
  }

  return response.json();
}

export async function deleteChain(chainId: string) {
  const response = await fetch(`/api/chains/${chainId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete chain");
  }

  return response.json();
}
