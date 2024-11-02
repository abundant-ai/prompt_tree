"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Node } from "reactflow";
import { PromptNode as PromptNodeType } from "../types/types";
import { Playground } from "./playground/Playground";

interface NodeSheetProps {
  node: Node<PromptNodeType> | null;
  onClose: () => void;
  isLoading?: boolean;
  isOpen?: boolean;
}

export function NodeSheet({
  node,
  onClose,
  isLoading,
  isOpen = false,
}: NodeSheetProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  if (!node) return null;

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl p-0"
      >
        <SheetHeader className="sticky top-0 bg-background z-10 px-6 py-4 border-b">
          <SheetTitle>Prompt Details</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-5rem)]">
          <div className="space-y-6 p-6">
            {/* Prompt Section */}
            <Card>
              <CardHeader>
                <CardTitle>Prompt</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{node.data.text}</p>
              </CardContent>
            </Card>

            {/* Feedback Section */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Feedback</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {node.data.feedback && (
                  <p className="whitespace-pre-wrap text-sm">
                    {node.data.feedback}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Playground Section */}
            <Card>
              <CardHeader>
                <CardTitle>Test Prompt</CardTitle>
              </CardHeader>
              <CardContent>
                <Playground prompt={node.data.text} />
              </CardContent>
            </Card>

            {/* Analysis Section - Collapsible */}
            {node.data.reasoning && (
              <Collapsible>
                <Card>
                  <CardHeader className="cursor-pointer">
                    <CollapsibleTrigger className="flex items-center justify-between w-full">
                      <CardTitle>Reasoning</CardTitle>
                      {expandedSections.includes("reasoning") ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </CollapsibleTrigger>
                  </CardHeader>
                  <CollapsibleContent>
                    <CardContent>
                      <p className="whitespace-pre-wrap text-sm">
                        {node.data.reasoning}
                      </p>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
