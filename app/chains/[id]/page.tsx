"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Node, Edge } from "reactflow";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import PromptImprover from "@/app/components/PromptImprover";
import { loadChain } from "@/app/services/db";
import { PromptNode } from "@/app/types/types";

interface Chain {
  id: string;
  name: string;
  nodes: Node<PromptNode>[];
  edges: Edge[];
}

const metaprompt = `You are a prompt improvement expert. Your task is to analyze and enhance prompts based on feedback to make the assistant more effective at achieving the user's intended goal.

When improving a prompt:
1. Consider the provided feedback carefully
2. Maintain the core purpose of the original prompt
3. Make specific, targeted improvements
4. Explain your reasoning
5. Do not refuse the direction of the feedback. If you don't agree with the feedback, explain why.

Provide exactly 3 different improved versions of the prompt, each taking a different approach to addressing the feedback while staying true to the original prompt's intent.
Format your response as XML with the following structure:
<result>
  <options>
    <option>
      <analysis>[Analysis of changes and improvements]</analysis>
      <changes>
        <change>
          <description>[What was changed]</description>
          <rationale>[Why this improves the prompt]</rationale>
        </change>
      </changes>
      <text>[Improved prompt text]</text>
    </option>
  </options>
</result>
`;

const TreeNodeSkeleton = () => {
  return (
    <Card className="w-32 h-24 flex-shrink-0 animate-pulse">
      <CardContent className="p-2">
        <Skeleton className="h-3 w-full mb-2" />
        <Skeleton className="h-3 w-3/4" />
      </CardContent>
    </Card>
  );
};

const TreeSkeleton = () => {
  return (
    <div className="relative w-full h-[300px] bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
      <div className="flex items-center">
        <div className="relative">
          <TreeNodeSkeleton />
          <div className="absolute left-full top-1/2 -translate-y-1/2">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="absolute left-0 w-24 h-px bg-gray-300"
              >
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gray-300" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gray-300" />
              </div>
            ))}
          </div>
        </div>
        <div className="ml-24 flex flex-col justify-between h-full">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="mb-4 last:mb-0">
              <TreeNodeSkeleton />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function ChainPage() {
  const params = useParams();
  const router = useRouter();
  const [chain, setChain] = useState<Chain | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChain = async () => {
      if (params.id === "new") {
        setIsLoading(false);
        return;
      }

      try {
        const loadedChain = await loadChain(params.id as string);
        setChain(loadedChain);
      } catch (error) {
        console.error("Error loading chain:", error);
        // TODO: Add error handling UI
      } finally {
        setIsLoading(false);
      }
    };

    fetchChain();
  }, [params.id]);

  const handleSave = () => {
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 flex flex-col items-center justify-center space-y-4">
        <Skeleton className="h-8 w-64" />
        <TreeSkeleton />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <PromptImprover
        metaprompt={metaprompt}
        initialChain={chain || undefined}
        onSave={handleSave}
      />
    </div>
  );
}
