"use client";

import { memo, useState } from "react";
import { Handle, Position } from "reactflow";
import {
  ChevronDown,
  ChevronRight,
  Expand,
  Pencil,
  // Check,
  // X,
  Trash2,
} from "lucide-react";
import { PromptNode as PromptNodeType } from "../types/types";
import { NodeSheet } from "./NodeSheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Playground } from "./playground/Playground";

interface PromptNodeProps {
  data: PromptNodeType & {
    isLoading?: boolean;
    onImprove?: () => void;
    onAddFeedback?: () => void;
    onUpdateFeedback?: (feedbackId: string, text: string) => void;
    onRemoveFeedback?: (feedbackId: string) => void;
    onDeleteNode?: () => void;
    inheritedFeedback?: { id: string; text: string }[];
    onUpdatePrompt?: (text: string) => void;
  };
  selected?: boolean;
}

function PromptNode({ data, selected }: PromptNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFullPrompt, setShowFullPrompt] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(data.text);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const {
    isLoading,
    onImprove,
    onAddFeedback,
    onUpdateFeedback,
    onRemoveFeedback,
    onDeleteNode,
    inheritedFeedback = [],
    onUpdatePrompt,
    ...nodeData
  } = data;

  // const handleSaveEdit = () => {
  //   if (onUpdatePrompt) {
  //     onUpdatePrompt(editedText);
  //   }
  //   setIsEditing(false);
  // };

  // const handleCancelEdit = () => {
  //   setEditedText(nodeData.text);
  //   setIsEditing(false);
  // };

  const handleNodeClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    setIsExpanded(true);
  };

  return (
    <>
      <Card
        className={`w-[600px] ${
          selected ? "ring-2 ring-primary" : ""
        } cursor-pointer`}
        onClick={handleNodeClick}
      >
        <Handle type="target" position={Position.Left} />
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CardContent className="p-6">
            {isExpanded && (
              <div className="flex items-center justify-between mb-4 border-b pb-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFullPrompt(!showFullPrompt)}
                    className="h-8"
                  >
                    {showFullPrompt ? "Show Less" : "Show More"}
                  </Button>
                  {onUpdatePrompt && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsEditing(true)}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSheetOpen(true)}
                    className="h-8 w-8"
                  >
                    <Expand className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  {onDeleteNode && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Node</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this node? This will
                            also delete all child nodes and cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={onDeleteNode}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </div>
            )}

            <div className={`${showFullPrompt ? "" : "line-clamp-3"}`}>
              {isEditing ? (
                <Textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="min-h-[120px] text-base"
                  autoFocus
                />
              ) : (
                <p className="whitespace-pre-wrap text-base leading-relaxed">
                  {nodeData.text}
                </p>
              )}
            </div>

            <CollapsibleContent>
              <div className="mt-4 space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">Feedback</h4>
                    {onAddFeedback && (
                      <Button
                        onClick={onAddFeedback}
                        disabled={isLoading}
                        size="sm"
                      >
                        Add Feedback
                      </Button>
                    )}
                  </div>

                  {inheritedFeedback.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <h5 className="text-sm text-muted-foreground font-medium">
                        Inherited Feedback
                      </h5>
                      {inheritedFeedback.map((feedback) => (
                        <div
                          key={feedback.id}
                          className="p-2 border rounded bg-muted"
                        >
                          <p className="text-muted-foreground">
                            {feedback.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {nodeData.feedback && nodeData.feedback.length > 0 && (
                    <div className="space-y-2">
                      {nodeData.feedback.map((feedback) => (
                        <div key={feedback.id} className="p-2 border rounded">
                          {onUpdateFeedback ? (
                            <div className="flex gap-2">
                              <Textarea
                                placeholder="Enter your feedback"
                                value={feedback.text}
                                onChange={(e) =>
                                  onUpdateFeedback(feedback.id, e.target.value)
                                }
                                rows={2}
                                disabled={isLoading}
                                className="flex-1"
                              />
                              {onRemoveFeedback && (
                                <Button
                                  onClick={() => onRemoveFeedback(feedback.id)}
                                  disabled={isLoading}
                                  variant="destructive"
                                  size="sm"
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                          ) : (
                            <p className="text-muted-foreground">
                              {feedback.text}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <Playground prompt={nodeData.text} />
                </div>

                {nodeData.analysis && (
                  <Collapsible
                    open={expandedSections.includes("analysis")}
                    onOpenChange={() => {
                      setExpandedSections((prev) =>
                        prev.includes("analysis")
                          ? prev.filter((s) => s !== "analysis")
                          : [...prev, "analysis"]
                      );
                    }}
                  >
                    <div className="border-t pt-4">
                      <CollapsibleTrigger className="flex items-center justify-between w-full">
                        <h4 className="font-semibold">Analysis</h4>
                        {expandedSections.includes("analysis") ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <p className="mt-2 text-muted-foreground whitespace-pre-wrap">
                          {nodeData.analysis}
                        </p>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                )}

                {nodeData.changes.length > 0 && (
                  <Collapsible
                    open={expandedSections.includes("changes")}
                    onOpenChange={() => {
                      setExpandedSections((prev) =>
                        prev.includes("changes")
                          ? prev.filter((s) => s !== "changes")
                          : [...prev, "changes"]
                      );
                    }}
                  >
                    <div className="border-t pt-4">
                      <CollapsibleTrigger className="flex items-center justify-between w-full">
                        <h4 className="font-semibold">Changes</h4>
                        {expandedSections.includes("changes") ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <ul className="mt-2 list-disc pl-4 space-y-1">
                          {nodeData.changes.map((change, index) => (
                            <li key={index} className="text-muted-foreground">
                              {change.description}
                              {change.rationale && (
                                <span className="text-muted-foreground/70">
                                  {" "}
                                  - {change.rationale}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                )}

                {onImprove && (
                  <Button
                    onClick={onImprove}
                    disabled={isLoading || !nodeData.feedback?.length}
                    className="w-full"
                  >
                    {isLoading ? "Improving..." : "Improve This Prompt"}
                  </Button>
                )}
              </div>
            </CollapsibleContent>
          </CardContent>
        </Collapsible>
        <Handle type="source" position={Position.Right} />
      </Card>

      <NodeSheet
        node={{
          id: nodeData.id,
          data: nodeData,
          position: { x: 0, y: 0 },
          type: "promptNode",
        }}
        onClose={() => setIsSheetOpen(false)}
        onAddFeedback={onAddFeedback}
        onUpdateFeedback={onUpdateFeedback}
        onRemoveFeedback={onRemoveFeedback}
        inheritedFeedback={inheritedFeedback}
        isLoading={isLoading}
        isOpen={isSheetOpen}
      />
    </>
  );
}

export default memo(PromptNode);
