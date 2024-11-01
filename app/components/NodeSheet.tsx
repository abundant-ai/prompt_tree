"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PromptNode as PromptNodeType } from "../types/types";
import { Node } from "reactflow";
import { PlusCircle, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { Playground } from "./playground/Playground";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";

interface NodeSheetProps {
  node: Node<PromptNodeType> | null;
  onClose: () => void;
  onAddFeedback?: () => void;
  onUpdateFeedback?: (feedbackId: string, text: string) => void;
  onRemoveFeedback?: (feedbackId: string) => void;
  onUpdatePrompt?: (text: string) => void;
  inheritedFeedback?: { id: string; text: string }[];
  isLoading?: boolean;
  isOpen?: boolean;
}

export function NodeSheet({
  node,
  onClose,
  onAddFeedback,
  onUpdateFeedback,
  onRemoveFeedback,
  inheritedFeedback = [],
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
                  {onAddFeedback && (
                    <Button
                      onClick={onAddFeedback}
                      disabled={isLoading}
                      size="sm"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Feedback
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {inheritedFeedback.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Inherited Feedback
                    </h4>
                    {inheritedFeedback.map((feedback) => (
                      <Card key={feedback.id}>
                        <CardContent className="p-3">
                          <p className="text-sm text-muted-foreground">
                            {feedback.text}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                {node.data.feedback && node.data.feedback.length > 0 && (
                  <div className="space-y-2">
                    {node.data.feedback.map((feedback) => (
                      <Card key={feedback.id}>
                        <CardContent className="p-3">
                          {onUpdateFeedback ? (
                            <div className="flex gap-3">
                              <Textarea
                                className="flex-1 min-h-[5rem]"
                                placeholder="Enter your feedback"
                                value={feedback.text}
                                onChange={(e) =>
                                  onUpdateFeedback(feedback.id, e.target.value)
                                }
                                disabled={isLoading}
                              />
                              {onRemoveFeedback && (
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => onRemoveFeedback(feedback.id)}
                                  disabled={isLoading}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">
                                    Remove feedback
                                  </span>
                                </Button>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm">{feedback.text}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
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
            {node.data.analysis && (
              <Collapsible>
                <Card>
                  <CardHeader className="cursor-pointer">
                    <CollapsibleTrigger className="flex items-center justify-between w-full">
                      <CardTitle>Analysis</CardTitle>
                      {expandedSections.includes("analysis") ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
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
                      {expandedSections.includes("changes") ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
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
