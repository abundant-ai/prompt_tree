"use client";

import { deleteChain, saveChain } from "@/lib/db";
import debounce from "lodash/debounce";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Edge, Node, useEdgesState, useNodesState } from "reactflow";
import "reactflow/dist/style.css";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { PromptNode as PromptNodeType } from "../types/types";
// import { NavBar } from "./NavBar";
import { FlowCanvas } from "./prompt-improver/FlowCanvas";
import { HeaderActions } from "./prompt-improver/HeaderActions";
import InitialPromptForm from "./prompt-improver/InitialPromptForm";
import { nodeTypes } from "./prompt-improver/nodeTypes";
import { getLayoutedElements } from "./prompt-improver/utils";

interface PromptImproverProps {
  metaprompt: string;
  initialChain?: {
    id: string;
    name: string;
    nodes: Node<PromptNodeType>[];
    edges: Edge[];
  };
  onSave?: () => void;
}

export default function PromptImprover({
  metaprompt,
  initialChain,
}: PromptImproverProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chainId, setChainId] = useState<string | null>(null);
  const router = useRouter();
  const [chainName, setChainName] = useState<string>("");

  const getAllNodes = useCallback((): Node<PromptNodeType>[] => {
    // Find the root node
    const rootNode = nodes.find((n) => !n.data.parentId);
    if (!rootNode) {
      console.error("No root node found", {
        allNodes: nodes.map((n) => ({
          id: n.id,
          parentId: n.data.parentId,
        })),
      });
      throw new Error("No root node found");
    }

    console.debug("Starting tree traversal", {
      rootNodeId: rootNode.id,
      totalNodes: nodes.length,
    });

    // Use a queue for breadth-first traversal
    const queue: Node<PromptNodeType>[] = [rootNode];
    const visited = new Set<string>([rootNode.id]);
    const result: Node<PromptNodeType>[] = [rootNode];

    while (queue.length > 0) {
      const currentNode = queue.shift()!;
      // Find all children of the current node
      const children = nodes.filter((n) => n.data.parentId === currentNode.id);

      console.debug("Processing node", {
        nodeId: currentNode.id,
        childCount: children.length,
        childIds: children.map((c) => c.id),
      });

      for (const child of children) {
        if (!visited.has(child.id)) {
          visited.add(child.id);
          result.push(child);
          queue.push(child);
        }
      }
    }

    const orphanedNodes = nodes.filter(
      (n) =>
        !visited.has(n.id) &&
        n.data.parentId &&
        !nodes.some((pn) => pn.id === n.data.parentId)
    );

    console.debug("Tree traversal complete", {
      totalNodes: nodes.length,
      visitedNodes: result.length,
      missingNodes: nodes.length - result.length,
      orphanedNodes: orphanedNodes.map((n) => ({
        id: n.id,
        parentId: n.data.parentId,
      })),
    });

    return result;
  }, [nodes]);

  const saveChainToDb = useCallback(
    async (customName?: string) => {
      try {
        console.info("Starting chain save process", {
          totalNodesBeforeTraversal: nodes.length,
          totalEdgesBeforeFiltering: edges.length,
        });

        // Validate that we have nodes to save
        if (nodes.length === 0) {
          toast.error("Cannot save empty chain");
          return;
        }

        const allNodes = getAllNodes();

        // Validate that all required data is present
        const invalidNodes = allNodes.filter(
          (node) => !node.data.text || node.data.text.trim() === ""
        );
        if (invalidNodes.length > 0) {
          toast.error("Some nodes have empty prompts");
          console.error("Invalid nodes found:", {
            invalidNodes: invalidNodes.map((n) => ({
              id: n.id,
              parentId: n.data.parentId,
            })),
          });
          return;
        }

        // Get all edges connecting these nodes
        const relevantEdges = edges.filter(
          (edge) =>
            allNodes.some((n) => n.id === edge.source) &&
            allNodes.some((n) => n.id === edge.target)
        );

        // Use customName if provided, otherwise use existing name or generate for new chain
        let name = customName;
        if (!name) {
          if (!chainId) {
            // Only generate name for new chains
            const nameResponse = await fetch("/api/generate-chain-name", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                initialPrompt: allNodes[0].data.text,
                improvements: allNodes
                  .filter((n) => n.id !== allNodes[0].id)
                  .map((n) => ({
                    text: n.data.text,
                    reasoning: n.data.reasoning || "",
                  })),
              }),
            });

            if (!nameResponse.ok) {
              throw new Error("Failed to generate chain name");
            }

            const data = await nameResponse.json();
            name = data.name;
          } else {
            // Use existing name for updates
            name =
              chainName ||
              allNodes[0].data.text.slice(0, 50) ||
              "Untitled Chain";
          }
        }

        if (!name) {
          toast.error("Failed to generate chain name");
          return;
        }

        setChainName(name);

        // Save the chain with the name
        const savedChain = await saveChain({
          id: chainId || undefined,
          name,
          nodes: allNodes,
          edges: relevantEdges,
        });

        if (!chainId) {
          setChainId(savedChain.id);
        }

        return savedChain;
      } catch (error) {
        console.error("Error saving chain:", error);
        toast.error("Failed to save chain");
        throw error;
      }
    },
    [nodes, edges, chainId, chainName, getAllNodes]
  );

  const addFeedback = useCallback(
    (nodeId: string) => {
      setNodes((nds) => {
        const newNodes = nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                feedback: [
                  ...(node.data.feedback || []),
                  {
                    id: uuidv4(),
                    text: "",
                  },
                ],
              },
            };
          }
          return node;
        });

        // Trigger autosave after state update
        setTimeout(() => saveChainToDb(), 2000);
        return newNodes;
      });
    },
    [setNodes, saveChainToDb]
  );

  const updateFeedback = useCallback(
    (nodeId: string, feedbackId: string, text: string) => {
      setNodes((nds) => {
        const newNodes = nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                feedback: node.data.feedback.map(
                  (f: { id: string; text: string }) =>
                    f.id === feedbackId ? { ...f, text } : f
                ),
              },
            };
          }
          return node;
        });

        // Trigger autosave after state update
        setTimeout(() => saveChainToDb(), 2000); // Debounce feedback updates
        return newNodes;
      });
    },
    [setNodes, saveChainToDb]
  );

  const removeFeedback = useCallback(
    (nodeId: string, feedbackId: string) => {
      setNodes((nds) => {
        const newNodes = nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                feedback: node.data.feedback.filter(
                  (f: { id: string }) => f.id !== feedbackId
                ),
              },
            };
          }
          return node;
        });

        // Trigger autosave after state update
        setTimeout(() => saveChainToDb(), 2000);
        return newNodes;
      });
    },
    [setNodes, saveChainToDb]
  );

  const handleImprovePrompt = useCallback(
    async (nodeId: string) => {
      console.info("Starting prompt improvement", {
        nodeId,
        currentNodes: nodes.length,
        currentEdges: edges.length,
      });

      setIsLoading(true);
      try {
        const node = nodes.find((n) => n.id === nodeId);
        if (!node) {
          throw new Error("Node not found: " + nodeId);
        }

        const response = await fetch("/api/improve-prompt", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: node.data.text,
            feedback: node.data.feedback,
            metaprompt,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to improve prompt: ${response.statusText}`);
        }

        const improvements: PromptNodeType[] = await response.json();

        // Create new nodes and edges
        const newNodes: Node[] = improvements.map((improvement) => ({
          id: improvement.id,
          type: "promptNode",
          // Position will be set by layout algorithm
          position: { x: 0, y: 0 },
          data: {
            ...improvement,
            parentId: nodeId,
            feedback: [],
          },
        }));

        const newEdges: Edge[] = improvements.map((improvement) => ({
          id: `${nodeId}-${improvement.id}`,
          source: nodeId,
          target: improvement.id,
        }));

        // Apply layout to all nodes
        const { nodes: layoutedNodes, edges: layoutedEdges } =
          getLayoutedElements([...nodes, ...newNodes], [...edges, ...newEdges]);

        // Update state with layouted elements
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

        // Save to database
        const savedChain = await saveChain({
          id: chainId || undefined,
          name: layoutedNodes[0].data.text.slice(0, 50) || "Untitled Chain",
          nodes: layoutedNodes,
          edges: layoutedEdges,
        });

        if (!chainId) {
          setChainId(savedChain.id);
        }

        console.info("Chain updated with new improvements", {
          totalNodes: layoutedNodes.length,
          totalEdges: layoutedEdges.length,
        });
      } catch (error) {
        console.error("Error improving prompt:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [nodes, edges, chainId, metaprompt, setNodes, setEdges, setChainId]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id);
  }, []);

  const debouncedSave = useMemo(
    () =>
      debounce(() => {
        saveChainToDb();
      }, 500),
    [saveChainToDb]
  );

  const deleteNodeAndChildren = useCallback(
    (nodeId: string) => {
      // Get all descendant nodes recursively
      const getDescendants = (id: string): string[] => {
        const children = nodes.filter((n) => n.data.parentId === id);
        return [
          ...children.map((child) => child.id),
          ...children.flatMap((child) => getDescendants(child.id)),
        ];
      };

      const nodesToDelete = [nodeId, ...getDescendants(nodeId)];

      // Remove all edges connected to these nodes
      setEdges((eds) =>
        eds.filter(
          (edge) =>
            !nodesToDelete.includes(edge.source) &&
            !nodesToDelete.includes(edge.target)
        )
      );

      // Remove the nodes
      setNodes((nds) => nds.filter((node) => !nodesToDelete.includes(node.id)));

      // Trigger autosave
      setTimeout(() => saveChainToDb(), 0);
    },
    [nodes, setNodes, setEdges, saveChainToDb]
  );

  const getNodeData = useCallback(
    (node: Node<PromptNodeType>) => {
      const isSelected = node.id === selectedNode;

      // Don't allow deleting the root node
      const canDelete = node.data.parentId !== null;

      // Get parent node's feedback if it exists
      const parentNode = node.data.parentId
        ? nodes.find((n) => n.id === node.data.parentId)
        : null;

      const inheritedFeedback = parentNode
        ? [
            ...parentNode.data.feedback,
            ...(parentNode.data.inheritedFeedback || []),
          ]
        : [];

      return {
        ...node,
        data: {
          ...node.data,
          isLoading,
          onImprove: isSelected
            ? () => handleImprovePrompt(node.id)
            : undefined,
          onUpdatePrompt: isSelected
            ? (text: string) => {
                setNodes((nds) =>
                  nds.map((n) =>
                    n.id === node.id ? { ...n, data: { ...n.data, text } } : n
                  )
                );
                debouncedSave();
              }
            : undefined,
          onDeleteNode:
            isSelected && canDelete
              ? () => deleteNodeAndChildren(node.id)
              : undefined,
        },
      };
    },
    [
      selectedNode,
      isLoading,
      nodes,
      handleImprovePrompt,
      addFeedback,
      updateFeedback,
      removeFeedback,
      debouncedSave,
      setNodes,
      deleteNodeAndChildren,
    ]
  );

  // Apply layout on initial load and when initialChain changes
  useEffect(() => {
    if (initialChain) {
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(initialChain.nodes, initialChain.edges);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      setChainId(initialChain.id);
    }
  }, [initialChain, setNodes, setEdges]);

  const createInitialNode = useCallback(
    (prompt: string) => {
      const newNode: Node<PromptNodeType> = {
        id: uuidv4(),
        type: "promptNode",
        position: { x: 0, y: 0 },
        data: {
          id: uuidv4(),
          text: prompt,
          feedback: "",
          reasoning: "",
          parentId: null,
          createdAt: new Date(),
          changes: [],
          analysis: "",
        },
      };
      setNodes([newNode]);
    },
    [setNodes]
  );

  const handleDeleteChain = async () => {
    if (!chainId) return;

    try {
      await deleteChain(chainId);
      toast.success("Chain deleted successfully");
      router.push("/");
    } catch (error) {
      console.error("Error deleting chain:", error);
      toast.error("Failed to delete chain");
    }
  };

  // const handleUpdateChainName = useCallback(
  //   async (newName: string) => {
  //     if (!chainId) return;

  //     try {
  //       await saveChainToDb(newName);
  //       setChainName(newName);
  //       toast.success("Chain name updated");
  //     } catch (error) {
  //       toast.error("Failed to update chain name");
  //       console.error("Error updating chain name:", error);
  //     }
  //   },
  //   [chainId, saveChainToDb]
  // );

  // Add effect to set initial chain name
  useEffect(() => {
    if (initialChain) {
      setChainName(initialChain.name);
    }
  }, [initialChain]);

  return (
    <div className="h-screen w-full flex flex-col">
      {/* <NavBar
        chainName={chainName}
        onUpdateChainName={handleUpdateChainName}
        isEditing={nodes.length > 0}
      /> */}
      {nodes.length === 0 ? (
        <InitialPromptForm onSubmit={createInitialNode} />
      ) : (
        <div className="flex-1 relative">
          <HeaderActions chainId={chainId} onDeleteChain={handleDeleteChain} />
          <FlowCanvas
            nodes={nodes.map(getNodeData)}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
          />
        </div>
      )}
    </div>
  );
}
