"use client";

import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  PlayCircle,
  Settings,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Zap,
  ThermometerSun,
  Hash,
  StopCircle,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

interface PlaygroundProps {
  prompt: string;
}

interface ModelParams {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

const models = [
  { id: "gpt-4", name: "GPT-4" },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
  { id: "gpt-4-1106-preview", name: "GPT-4 Turbo" },
];

export function Playground({ prompt }: PlaygroundProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedModel, setSelectedModel] = useState(models[0].id);
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [modelParams, setModelParams] = useState<ModelParams>({
    temperature: 0.7,
    maxTokens: 1000,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  });

  const handleRun = async () => {
    setIsLoading(true);
    setResponse("");

    try {
      const response = await fetch("/api/playground", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          model: selectedModel,
          ...modelParams,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to run prompt");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let accumulatedResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedResponse += chunk;
        setResponse(accumulatedResponse);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to run prompt");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResponse("");
    setModelParams({
      temperature: 0.7,
      maxTokens: 1000,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
    });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 hover:bg-accent rounded-lg">
        <PlayCircle className="h-4 w-4" />
        <span className="font-medium">Playground</span>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 ml-auto" />
        ) : (
          <ChevronRight className="h-4 w-4 ml-auto" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 mt-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Model Settings
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        {model.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {showSettings && (
                <div className="space-y-6 pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <ThermometerSun className="h-4 w-4" />
                        Temperature: {modelParams.temperature}
                      </label>
                    </div>
                    <Slider
                      value={[modelParams.temperature]}
                      max={2}
                      step={0.1}
                      onValueChange={([value]) =>
                        setModelParams({ ...modelParams, temperature: value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        Max Tokens: {modelParams.maxTokens}
                      </label>
                    </div>
                    <Slider
                      value={[modelParams.maxTokens]}
                      max={4000}
                      step={100}
                      onValueChange={([value]) =>
                        setModelParams({ ...modelParams, maxTokens: value })
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button onClick={handleRun} disabled={isLoading} className="flex-1">
            {isLoading ? (
              <>
                <StopCircle className="mr-2 h-4 w-4 animate-pulse" />
                Running...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Run
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {response && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-sm font-mono">
                {response}
              </div>
            </CardContent>
          </Card>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
