import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SaveChainParams, ChainNode, DBEdge as Edge } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {
    const chainData: SaveChainParams = await request.json();
    console.info("Saving chain with data:", {
      nodeCount: chainData.nodes.length,
      edgeCount: chainData.edges.length,
    });

    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create a map of old IDs to new IDs
    const idMapping: { [key: string]: string } = {};

    // First pass: Generate new IDs for all nodes
    chainData.nodes.forEach((node) => {
      idMapping[node.id] = uuidv4();
    });

    // Second pass: Create nodes with updated parent references
    const nodesWithNewIds = chainData.nodes.map((node) => ({
      id: idMapping[node.id],
      type: node.type || "promptNode",
      parentId: node.data.parentId ? idMapping[node.data.parentId] : null,
      position: JSON.stringify(node.position),
      text: node.data.text,
      analysis: node.data.analysis,
      changes: JSON.stringify(node.data.changes),
      feedback: JSON.stringify(node.data.feedback),
      createdAt: node.data.createdAt,
      userId,
      orgId,
    }));

    // Update edges with new IDs
    const edgesWithNewIds = chainData.edges.map((edge) => ({
      id: uuidv4(),
      source: idMapping[edge.source],
      target: idMapping[edge.target],
      userId,
      orgId,
    }));

    console.info("Creating chain with processed data:", {
      processedNodeCount: nodesWithNewIds.length,
      processedEdgeCount: edgesWithNewIds.length,
    });

    const result = await prisma.promptChain.create({
      data: {
        name: chainData.name,
        nodes: {
          create: nodesWithNewIds,
        },
        edges: {
          create: edgesWithNewIds,
        },
        userId,
        orgId,
      },
      include: {
        nodes: true,
        edges: true,
      },
    });

    console.info("Chain created successfully:", {
      chainId: result.id,
      savedNodeCount: result.nodes.length,
      savedEdgeCount: result.edges.length,
    });

    // Map the response back to the original structure with new IDs
    return NextResponse.json({
      ...result,
      nodes: result.nodes.map((node) => ({
        ...node,
        position: JSON.parse(node.position as string),
        changes: JSON.parse(node.changes as string),
        feedback: JSON.parse(node.feedback as string),
      })),
    });
  } catch (error) {
    console.error("Error saving chain:", error);
    return NextResponse.json(
      { error: "Failed to save chain" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, nodes, edges } = await request.json();
    console.info("Updating chain:", { id, nodeCount: nodes.length });

    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Check if any nodes belong to a different org
    const existingNodes = await prisma.node.findMany({
      where: { id: { in: nodes.map((n: ChainNode) => n.id) } },
    });

    if (existingNodes.some((node) => node.orgId !== orgId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create a map of old IDs to new IDs
    const idMapping: { [key: string]: string } = {};

    // First pass: Generate new IDs for all nodes
    nodes.forEach((node: ChainNode) => {
      idMapping[node.id] = uuidv4();
    });

    // Second pass: Create nodes with updated parent references
    const nodesWithNewIds = nodes.map((node: ChainNode) => ({
      id: idMapping[node.id],
      type: node.type || "promptNode",
      parentId: node.data.parentId ? idMapping[node.data.parentId] : null,
      position: JSON.stringify(node.position),
      text: node.data.text,
      analysis: node.data.analysis,
      changes: JSON.stringify(node.data.changes),
      feedback: JSON.stringify(node.data.feedback),
      createdAt: node.data.createdAt,
      userId,
      orgId,
    }));

    // Update edges with new IDs
    const edgesWithNewIds = edges.map((edge: Edge) => ({
      id: uuidv4(),
      source: idMapping[edge.source],
      target: idMapping[edge.target],
      userId,
      orgId,
    }));

    const result = await prisma.promptChain.update({
      where: { id },
      data: {
        name,
        nodes: {
          deleteMany: {},
          create: nodesWithNewIds,
        },
        edges: {
          deleteMany: {},
          create: edgesWithNewIds,
        },
        userId,
        orgId,
      },
      include: {
        nodes: true,
        edges: true,
      },
    });

    console.info("Chain updated successfully:", {
      chainId: id,
      updatedNodeCount: result.nodes.length,
      updatedEdgeCount: result.edges.length,
    });

    return NextResponse.json({
      ...result,
      nodes: result.nodes.map((node) => ({
        ...node,
        position: JSON.parse(node.position as string),
        changes: JSON.parse(node.changes as string),
        feedback: JSON.parse(node.feedback as string),
      })),
    });
  } catch (error) {
    console.error("Error updating chain:", error);
    return NextResponse.json(
      { error: "Failed to update chain" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chains = await prisma.promptChain.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });
    return NextResponse.json(chains);
  } catch (error) {
    console.error("Error listing chains:", error);
    return NextResponse.json(
      { error: "Failed to list chains" },
      { status: 500 }
    );
  }
}
