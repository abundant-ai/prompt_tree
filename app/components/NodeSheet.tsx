"use client";

import { Card, CardContent } from "@/components/ui/card";
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
import { PlusCircle, Trash2 } from "lucide-react";
import { Playground } from "./playground/Playground";

interface NodeSheetProps {
  node: Node<PromptNodeType> | null;
  onClose: () => void;
  isOpen?: boolean;
}

export function NodeSheet({
  node,
  onClose,
  isOpen = false,
}: NodeSheetProps) {
  if (!node) return null;

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
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-sm mr-2">1</span>
                  Prompt
                </h2>
                <p className="whitespace-pre-wrap text-base leading-relaxed">
                  {node.data.text}
                </p>
              </CardContent>
            </Card>

            {/* Test Section */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-sm mr-2">2</span>
                  Run
                </h2>
                <div className="border-t pt-4">
                  <Playground prompt={node.data.text} />
                </div>
              </CardContent>
            </Card>

            {/* Feedback Section */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-sm mr-2">3</span>
                  Improve
                </h2>
                {node.data.feedback && (
                  <>
                    <h4 className="font-semibold">Feedback</h4>
                    <p className="whitespace-pre-wrap text-base leading-relaxed mt-2">
                      {node.data.feedback}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            {/* Reasoning Section */}
            {node.data.reasoning && (
              <Collapsible
                open={expandedSections.includes("reasoning")}
                onOpenChange={() => {
                  setExpandedSections((prev) =>
                    prev.includes("reasoning")
                      ? prev.filter((s) => s !== "reasoning")
                      : [...prev, "reasoning"]
                  );
                }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="border-t pt-4">
                      <CollapsibleTrigger className="flex items-center justify-between w-full">
                        <h2 className="font-semibold">Reasoning</h2>
                        {expandedSections.includes("reasoning") ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <p className="text-muted-foreground whitespace-pre-wrap mt-4">
                          {node.data.reasoning}
                        </p>
                      </CollapsibleContent>
                    </div>
                  </CardContent>
                </Card>
              </Collapsible>
            {/* Analysis Section - Collapsible */}
            {node.data.analysis && (
              <Collapsible>
                <Card>
                  <CardHeader className="cursor-pointer">
                    <CollapsibleTrigger className="flex items-center justify-between w-full">
                      <CardTitle>Analysis</CardTitle>
                    </CollapsibleTrigger>
                  </CardHeader>
                  <CollapsibleContent>
                    <CardContent>
                      <p className="whitespace-pre-wrap text-sm">
                        {node.data.analysis}
                      </p>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            )}
            {/* Changes Section - Collapsible */}
            {node.data.changes.length > 0 && (
              <Collapsible>
                <Card>
                  <CardHeader className="cursor-pointer">
                    <CollapsibleTrigger className="flex items-center justify-between w-full">
                      <CardTitle>Changes</CardTitle>
                    </CollapsibleTrigger>
                  </CardHeader>
                  <CollapsibleContent>
                    <CardContent>
                      <ul className="space-y-3">
                        {node.data.changes.map((change, index) => (
                          <li key={index} className="text-sm">
                            <span className="font-medium">
                              {change.description}
                            </span>
                            {change.rationale && (
                              <p className="text-muted-foreground mt-1">
                                {change.rationale}
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
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
