import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const chain = await prisma.promptChain.findUnique({
      where: { id: params.id, orgId },
      include: {
        nodes: true,
        edges: true,
      },
    });

    if (!chain) {
      return NextResponse.json({ error: "Chain not found" }, { status: 404 });
    }

    return NextResponse.json(chain);
  } catch (error) {
    console.error("Error loading chain:", error);
    return NextResponse.json(
      { error: "Failed to load chain" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.promptChain.delete({
      where: { id: params.id, orgId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting chain:", error);
    return NextResponse.json(
      { error: "Failed to delete chain" },
      { status: 500 }
    );
  }
}
