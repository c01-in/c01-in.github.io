import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Copy, Check, Download } from "lucide-react";

interface OutputDisplayProps {
  output: string;
  isRunning: boolean;
  className?: string;
}

export default function OutputDisplay({ output, isRunning, className }: OutputDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [showFullOutput, setShowFullOutput] = useState(false);

  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy output:", err);
    }
  };

  const downloadOutput = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kotlin-output.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleFullOutput = () => {
    setShowFullOutput(!showFullOutput);
  };

  // Format output with syntax highlighting
  const formatOutput = (text: string) => {
    if (!text) return "";
    
    return text
      .split('\n')
      .map((line) => {
        // Highlight different types of output
        if (line.includes("Code executed successfully!")) {
          return `<span class="text-green-600 font-semibold">${line}</span>`;
        }
        if (line.includes("Running Kotlin code...")) {
          return `<span class="text-blue-600 font-semibold">${line}</span>`;
        }
        if (line.includes("=") && line.includes(":")) {
          return `<span class="text-purple-600">${line}</span>`;
        }
        if (line.includes("Person(") || line.includes("Button(") || line.includes("TextView(")) {
          return `<span class="text-orange-600 font-mono text-sm">${line}</span>`;
        }
        if (line.includes("[") && line.includes("]")) {
          return `<span class="text-indigo-600 font-mono">${line}</span>`;
        }
        if (line.includes("Hello, Kotlin!")) {
          return `<span class="text-green-700 font-bold text-lg">${line}</span>`;
        }
        return line;
      })
      .join('\n');
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <span className="text-sm font-medium">Execution Results</span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={copyOutput}
            className="h-8 px-2"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadOutput}
            className="h-8 px-2"
          >
            <Download className="h-3 w-3 mr-1" />
            Download
          </Button>
        </div>
      </div>

      {/* Output content */}
      <div className="flex-1 overflow-auto p-3">
        {isRunning ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="text-muted-foreground">Running code...</span>
            </div>
          </div>
        ) : output ? (
          <div className="space-y-2">
            {/* Mobile display summary, PC display full */}
            <div className="lg:hidden">
              {!showFullOutput ? (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Output preview (click to expand):
                  </div>
                  <div 
                    className="bg-muted/30 p-3 rounded text-sm font-mono"
                    dangerouslySetInnerHTML={{ 
                      __html: formatOutput(output.length > 200 ? `${output.substring(0, 200)}...` : output) 
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleFullOutput}
                    className="w-full"
                  >
                    Show Full Output
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Full output:
                  </div>
                  <div 
                    className="text-sm font-mono whitespace-pre-wrap break-words bg-muted/30 p-3 rounded"
                    dangerouslySetInnerHTML={{ __html: formatOutput(output) }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleFullOutput}
                    className="w-full"
                  >
                    Show Preview
                  </Button>
                </div>
              )}
            </div>
            {/* PC display full */}
            <div className="hidden lg:block">
              <div 
                className="text-sm font-mono whitespace-pre-wrap break-words bg-muted/30 p-3 rounded"
                dangerouslySetInnerHTML={{ __html: formatOutput(output) }}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <div className="text-4xl mb-2">🚀</div>
              <p className="text-sm">Run your Kotlin code to see the output here</p>
              <p className="text-xs mt-1">Try one of the code templates to get started!</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Status Bar */}
      <div className="border-t bg-muted/30 px-3 py-2 text-xs text-muted-foreground flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span>Output Lines: {output ? output.split('\n').length : 0}</span>
          <span>Characters: {output ? output.length : 0}</span>
          {isRunning && <span className="text-blue-600">Running...</span>}
        </div>
        <div className="flex items-center gap-2">
          <span>Execution Results</span>
          <span>•</span>
          <span>{isRunning ? "Processing" : output ? "Completed" : "Ready"}</span>
        </div>
      </div>
    </div>
  );
}
