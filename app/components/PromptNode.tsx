"use client";

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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronDown,
  ChevronRight,
  Expand,
  // Check,
  // X,
  Trash2
} from "lucide-react";
import { memo, useState } from "react";
import { Handle, Position } from "reactflow";
import { PromptNode as PromptNodeType } from "../types/types";
import { NodeSheet } from "./NodeSheet";
import { Playground } from "./playground/Playground";

interface PromptNodeProps {
  data: PromptNodeType & {
    onImprove?: () => void;
  };
  isLoading?: boolean;
  onDeleteNode?: () => void;
  selected?: boolean;
}

function PromptNode(props: PromptNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [isImproving, setIsImproving] = useState(false);
  const [feedback, setFeedback] = useState(props.data.feedback);
  const {
    isLoading,
    onDeleteNode,
    selected,
    data,
  } = props;
  
  const handleNodeClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    setIsExpanded(true);
  };

  const handleImprove = () => {
    setIsImproving(true);
    data.onImprove?.();
    setIsImproving(false);
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
          <div className="flex justify-end p-2 -mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSheetOpen(true)}
              className="h-8 w-8"
            >
              <Expand className="h-4 w-4" />
            </Button>
          </div>
          <CardContent className="p-6">
          {(data.reasoning && data.reasoning.length > 0) && (
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
                  {data.reasoning && (
                    <div className="mb-4">
                      <h5 className="font-medium mb-2">Reasoning</h5>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {data.reasoning}
                      </p>
                    </div>
                  )}
                </CollapsibleContent>
              </div>
            </Collapsible>
          )}
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-sm mr-2">1</span>
              Prompt
            </h2>
            <div>
              <p className="whitespace-pre-wrap text-base leading-relaxed">
                {data.text}
              </p>
            </div>
            <div className="mt-4 space-y-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-sm mr-2">2</span>
                Run
              </h2>
              <div className="border-t pt-4">
                <Playground prompt={data.text} />
              </div>
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-sm mr-2">3</span>
                Improve
              </h2>
              <h4 className="font-semibold">Feedback</h4>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Enter your feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={2}
                    disabled={isLoading}
                    className="flex-1"
                  />
                </div>
              </div>

              <Button
                onClick={handleImprove}
                disabled={isLoading || !feedback?.length || isImproving}
                className="w-full"
              >
                {isImproving ? "Improving..." : "Improve →"}
              </Button>
            </div>
          </CardContent>
        </Collapsible>
        <Handle type="source" position={Position.Right} />
      </Card>

      <NodeSheet
        node={{
          id: data.id,
          data,
          position: { x: 0, y: 0 },
          type: "promptNode",
        }}
        onClose={() => setIsSheetOpen(false)}
        isOpen={isSheetOpen}
      />

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
      </div>
    </>
  );
}

export default memo(PromptNode);
