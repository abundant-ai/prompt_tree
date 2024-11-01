export interface Feedback {
  id: string;
  text: string;
}

export interface Change {
  description: string;
  rationale: string;
}

export interface PromptNode {
  id: string;
  parentId: string | null;
  text: string;
  analysis: string;
  changes: Change[];
  createdAt: Date;
  feedback: Feedback[];
}

export interface PromptFlowNode {
  id: string;
  type: "promptNode";
  position: { x: number; y: number };
  data: PromptNode;
}

export interface PromptFlowEdge {
  id: string;
  source: string;
  target: string;
}

export interface GPTOption {
  id: string;
  text?: string;
  analysis?: string;
  changes?: {
    change: Change[] | Change;
  };
}

export interface LogEntry {
  timestamp: string;
  level: "debug" | "info" | "warn" | "error";
  source: "client" | "server";
  message: string;
  data?: unknown;
}
