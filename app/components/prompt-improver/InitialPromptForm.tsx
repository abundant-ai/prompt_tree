"use client";

import React from "react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PenLine } from "lucide-react";

interface InitialPromptFormProps {
  onSubmit: (prompt: string) => void;
}

export default function InitialPromptForm(
  { onSubmit }: InitialPromptFormProps = { onSubmit: () => {} }
) {
  const [initialPrompt, setInitialPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(initialPrompt);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenLine className="w-5 h-5" />
            Initial Prompt
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <Textarea
              className="min-h-[120px]"
              placeholder="Enter your initial prompt here..."
              value={initialPrompt}
              onChange={(e) => setInitialPrompt(e.target.value)}
              aria-label="Initial prompt"
            />
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={!initialPrompt.trim()}
            >
              Start Improving
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
