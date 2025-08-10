import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Play,
  Download,
  Upload,
  Save,
  FileText,
  Sun,
  Moon,
  Copy,
  TypeOutline,
  BookOpen,
  Zap,
  Share2,
  House
} from "lucide-react";
import { useTheme } from "@/lib/hooks";
import CodeEditor from "./CodeEditor";
import OutputDisplay from "./OutputDisplay";
import { useLocalStorage } from "@/lib/hooks";
import { useNavigate } from "react-router-dom";

const CODE_TEMPLATES: Record<string, string> = {
  "Hello World": `fun main() {
    println("Hello, Kotlin!")
}`,
  "Basic Functions": `fun main() {
    val result = add(5, 3)
    println("5 + 3 = $result")
    
    val factorial = calculateFactorial(5)
    println("5! = $factorial")
}

fun add(a: Int, b: Int): Int {
    return a + b
}

fun calculateFactorial(n: Int): Int {
    return if (n <= 1) 1 else n * calculateFactorial(n - 1)
}`,
  "Collections": `fun main() {
    val numbers = listOf(1, 2, 3, 4, 5)
    val doubled = numbers.map { it * 2 }
    val evenNumbers = numbers.filter { it % 2 == 0 }
    val sum = numbers.sum()
    
    println("Original: $numbers")
    println("Doubled: $doubled")
    println("Even numbers: $evenNumbers")
    println("Sum: $sum")
}`,
  "Data Classes": `fun main() {
    val person = Person("Alice", 30)
    val person2 = person.copy(age = 31)
    
    println("Person: $person")
    println("Person2: $person2")
    println("Are they equal? \${person == person2}")
}

data class Person(
    val name: String,
    val age: Int
)`,
  "Coroutines": `import kotlinx.coroutines.*

fun main() = runBlocking {
    println("Starting coroutines...")
    
    val job1 = launch {
        delay(1000)
        println("Coroutine 1 completed")
    }
    
    val job2 = async {
        delay(500)
        "Coroutine 2 result"
    }
    
    job1.join()
    val result = job2.await()
    println("$result")
    
    println("All coroutines completed!")
}`,
  "Android UI": `fun main() {
    // Simulate Android UI components
    val button = Button("Click me!")
    val textView = TextView("Hello Android!")
    
    button.setOnClickListener {
        textView.text = "Button clicked!"
        println("Button was clicked!")
    }
    
    println("UI components created")
    println("Button: $button")
    println("TextView: $textView")
}

data class Button(val text: String) {
    fun setOnClickListener(action: () -> Unit) {
        action()
    }
}

data class TextView(var text: String)
`,
  "Print Test": `fun main() {
    print("Hello")
    print(" ")
    print("World")
    println("!")
    
    val name = "Kotlin"
    val version = 1.8
    println("Welcome to $name $version")
    
    print("This is a test")
    println(" of print and println functions")
}`
};

const DEFAULT_KOTLIN_CODE = CODE_TEMPLATES["Basic Functions"];

export default function KotlinPlayground() {
  const [code, setCode] = useLocalStorage("kotlin-playground-code", DEFAULT_KOTLIN_CODE);
  const [output, setOutput] = useLocalStorage("kotlin-playground-output", "");
  const [filename, setFilename] = useLocalStorage("kotlin-playground-filename", "main.kt");
  const [isRunning, setIsRunning] = useState(false);
  const [useSystemFont, setUseSystemFont] = useLocalStorage("kotlin-playground-system-font", true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showWelcome, setShowWelcome] = useLocalStorage("kotlin-playground-welcome", true);
  const [error, setError] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Calculate code statistics
  const codeStats = useMemo(() => {
    const lines = code.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    const words = code.trim().split(/\s+/).filter(word => word.length > 0);
    const functions = (code.match(/fun\s+\w+/g) || []).length;
    const classes = (code.match(/class\s+\w+/g) || []).length;
    const variables = (code.match(/val\s+\w+/g) || []).length + (code.match(/var\s+\w+/g) || []).length;
    
    return {
      lines: lines.length,
      nonEmptyLines: nonEmptyLines.length,
      words: words.length,
      characters: code.length,
      functions,
      classes,
      variables
    };
  }, [code]);

  // Toggle font between system and custom
  const toggleFont = useCallback(() => {
    setUseSystemFont(prev => !prev);
  }, [setUseSystemFont]);

  // Load template code
  const loadTemplate = useCallback((templateName: string) => {
    const templateCode = CODE_TEMPLATES[templateName as keyof typeof CODE_TEMPLATES];
    if (templateCode) {
      setCode(templateCode);
      setFilename(`${templateName.toLowerCase().replace(/\s+/g, '_')}.kt`);
      setShowTemplates(false);
    }
  }, [setCode, setFilename]);

  // Simulate code execution
  const runCode = useCallback(async () => {
    setIsRunning(true);
    setError(null);
    setOutput("Running Kotlin code...\n");
    
    try {
      // Simulate execution delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Basic syntax validation
      if (!code.trim()) {
        throw new Error("Code cannot be empty");
      }
      
      if (!code.includes("fun main(") && !code.includes("fun main()")) {
        throw new Error("Missing main function, please ensure your code contains a fun main() function");
      }
      
      // Advanced Kotlin code execution simulation
      let simulatedOutput = "";
      
      try {
        // Create a simple execution context
        const context: any = {
          variables: new Map<string, any>(),
          output: [],
          print: (text: string) => {
            context.output.push(text);
          },
          println: (text: string) => {
            context.output.push(text + '\n');
          }
        };
        
        // Parse and execute the code line by line
        const lines = code.split('\n');
        let inMainFunction = false;
        let mainFunctionLines: string[] = [];
        
        // Extract main function
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          if (line.startsWith('fun main(')) {
            inMainFunction = true;
            continue;
          }
          
          if (inMainFunction) {
            if (line === '}' && !line.includes('{')) {
              inMainFunction = false;
              break;
            }
            if (line !== '') {
              mainFunctionLines.push(line);
            }
          }
        }
        
        // Execute main function lines
        for (const line of mainFunctionLines) {
          const trimmedLine = line.trim();
          
          // Handle print statements
          if (trimmedLine.startsWith('print(') || trimmedLine.startsWith('println(')) {
            const isPrintln = trimmedLine.startsWith('println(');
            const content = trimmedLine.substring(trimmedLine.indexOf('(') + 1, trimmedLine.lastIndexOf(')'));
            
            if (content.startsWith('"') && content.endsWith('"')) {
              // String literal
              const text = content.substring(1, content.length - 1);
              if (isPrintln) {
                context.println(text);
              } else {
                context.print(text);
              }
            } else {
              // Variable or expression
              let value = content;
              
              // Handle string interpolation
              if (content.includes('$')) {
                value = content.replace(/\$(\w+)/g, (match, varName) => {
                  const varValue = context.variables.get(varName);
                  return varValue !== undefined ? varValue : match;
                });
              }
              
              if (isPrintln) {
                context.println(`[${value}]`);
              } else {
                context.print(`[${value}]`);
              }
            }
          }
          
          // Handle variable declarations
          else if (trimmedLine.startsWith('val ') || trimmedLine.startsWith('var ')) {
            const match = trimmedLine.match(/(?:val|var)\s+(\w+)\s*=\s*(.+)/);
            if (match) {
              const varName = match[1];
              let varValue = match[2];
              
              // Handle string literals
              if (varValue.startsWith('"') && varValue.endsWith('"')) {
                varValue = varValue.substring(1, varValue.length - 1);
              }
              else if (!isNaN(Number(varValue))) {
                varValue = String(Number(varValue));
              }
              
              context.variables.set(varName, varValue);
            }
          }
          
          // Handle function calls and other operations
          else if (trimmedLine.includes('(') && !trimmedLine.includes('=')) {
            // This is a function call or operation, we'll simulate some basic ones
            if (trimmedLine.includes('add(')) {
              context.println("8"); // Simulate add(5, 3) = 8
            } else if (trimmedLine.includes('calculateFactorial(')) {
              context.println("120"); // Simulate 5! = 120
            }
          }
        }
        
        // Combine output
        simulatedOutput = context.output.join('') + "\n\nCode executed successfully!";
        
      } catch (execError) {
        // Fallback to template matching if execution fails
        if (code.includes("Hello, Kotlin!")) {
          simulatedOutput = "Hello, Kotlin!\n\nCode executed successfully!";
        } else if (code.includes("add(5, 3)")) {
          simulatedOutput = "5 + 3 = 8\n5! = 120\n\nCode executed successfully!";
        } else if (code.includes("listOf(1, 2, 3, 4, 5)")) {
          simulatedOutput = "Original: [1, 2, 3, 4, 5]\nDoubled: [2, 4, 6, 8, 10]\nEven numbers: [2, 4]\nSum: 15\n\nCode executed successfully!";
        } else if (code.includes("Person(")) {
          simulatedOutput = "Person: Person(name=Alice, age=30)\nPerson2: Person(name=Alice, age=31)\nAre they equal? false\n\nCode executed successfully!";
        } else if (code.includes("coroutines")) {
          simulatedOutput = "Starting coroutines...\nCoroutine 2 result\nCoroutine 1 completed\nAll coroutines completed!\n\nCode executed successfully!";
        } else if (code.includes("Button(")) {
          simulatedOutput = "UI components created\nButton: Button(text=Click me!)\nTextView: TextView(text=Hello Android!)\nButton was clicked!\n\nCode executed successfully!";
        } else {
          simulatedOutput = "Code executed successfully!\n\nOutput: [Simulated execution - this is a playground environment]";
        }
      }
      
      setOutput(simulatedOutput);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Code execution failed";
      setError(errorMessage);
              setOutput(`❌ Error: ${errorMessage}\n\nPlease check your code syntax and try again.`);
    } finally {
      setIsRunning(false);
    }
  }, [code, setOutput]);

  // Save code to local storage
  const saveCode = useCallback(() => {
    localStorage.setItem("kotlin-playground-code", code);
    localStorage.setItem("kotlin-playground-filename", filename);
  }, [code, filename]);

  // Load code from local storage
  const loadCode = useCallback(() => {
    const savedCode = localStorage.getItem("kotlin-playground-code");
    const savedFilename = localStorage.getItem("kotlin-playground-filename");
    if (savedCode) setCode(savedCode);
    if (savedFilename) setFilename(savedFilename);
  }, [setCode, setFilename]);

  // Export code as .kt file
  const exportCode = useCallback(() => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [code, filename]);

  // Import code from .kt file
  const importCode = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCode(content);
        setFilename(file.name);
      };
      reader.readAsText(file);
    }
  }, [setCode, setFilename]);

  // Copy code to clipboard
  const copyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  }, [code]);

  // Share code via URL
  const shareCode = useCallback(() => {
    try {
      const shareData = {
        title: `Kotlin Code: ${filename}`,
        text: code.substring(0, 100) + (code.length > 100 ? "..." : ""),
        url: `${window.location.origin}${window.location.pathname}?code=${encodeURIComponent(code)}&filename=${encodeURIComponent(filename)}`
      };
      
      if (navigator.share) {
        navigator.share(shareData);
      } else {
        // Fallback: copy shareable URL to clipboard
        navigator.clipboard.writeText(shareData.url);
        alert("Share link copied to clipboard!");
      }
    } catch (err) {
      console.error("Failed to share code:", err);
    }
  }, [code, filename]);

  // Reset code to default
  const resetCode = useCallback(() => {
    setCode(DEFAULT_KOTLIN_CODE);
    setFilename("main.kt");
    setOutput("");
  }, [setCode, setFilename, setOutput]);

  // Auto-save code
  useEffect(() => {
    saveCode();
  }, [code, saveCode]);

  // Load saved code on mount
  useEffect(() => {
    loadCode();
  }, [loadCode]);

  return (
    <div 
      className="min-h-screen bg-background text-foreground p-4"
      style={{
        fontFamily: useSystemFont ? 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : 'inherit'
      }}
    >
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Kotlin Playground</h1>
            <p className="text-muted-foreground mt-2">
              Write, run, and test Kotlin code in your browser
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              colorTheme="primary"
              onClick={() => navigate("/")}
            >
              <House />
            </Button>
            <Button
              variant="outline"
              colorTheme="primary"
              size="icon"
              onClick={toggleFont}
              className="h-10 w-10"
              title={useSystemFont ? "Use custom font" : "Use system font"}
            >
              <TypeOutline className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              colorTheme="primary"
              size="icon"
              onClick={toggleTheme}
              className="h-10 w-10"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="max-w-7xl mx-auto mb-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Code Editor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-0">
                <Label htmlFor="filename">Filename</Label>
                <Input
                  id="filename"
                  value={filename}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilename(e.target.value)}
                  placeholder="Enter filename..."
                  className="mt-1 bg-card text-card-foreground border-border placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowTemplates(!showTemplates)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Templates
                </Button>
                <Button 
                  onClick={runCode} 
                  disabled={isRunning} 
                  className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  <Play className="h-4 w-4" />
                  {isRunning ? "Running..." : "Run"}
                </Button>
                <Button variant="outline" onClick={saveCode} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save
                </Button>
                <Button variant="outline" onClick={loadCode} className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Load
                </Button>
                <Button variant="outline" onClick={exportCode} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button variant="outline" asChild className="flex items-center gap-2">
                  <Label htmlFor="import-file" className="cursor-pointer">
                    <Upload className="h-4 w-4" />
                    Import
                  </Label>
                </Button>
                <input
                  id="import-file"
                  type="file"
                  accept=".kt,.txt"
                  onChange={importCode}
                  className="hidden"
                />
                <Button variant="outline" onClick={copyCode} className="flex items-center gap-2">
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
                <Button variant="outline" onClick={shareCode} className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                <Button variant="outline" onClick={resetCode} className="flex items-center gap-2">
                  Reset
                </Button>
                {error && (
                  <Button 
                    variant="outline" 
                    onClick={() => setError(null)}
                    className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/30"
                  >
                    Clear Error
                  </Button>
                )}
              </div>
            </div>
            
            {/* Code Templates */}
            {showTemplates && (
              <div className="border-t pt-4">
                <Label className="text-sm font-medium mb-2 block">Code Templates</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.keys(CODE_TEMPLATES).map((templateName) => (
                    <Button
                      key={templateName}
                      variant="outline"
                      size="sm"
                      onClick={() => loadTemplate(templateName)}
                      className="justify-start text-left h-auto py-2 px-3"
                    >
                      <Zap className="h-3 w-3 mr-2 flex-shrink-0" />
                      <span className="truncate">{templateName}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Keyboard Shortcuts */}
            <div className="border-t pt-4">
              <Label className="text-sm font-medium mb-2 block">Keyboard Shortcuts</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
                <div><kbd className="px-1 py-0.5 bg-muted rounded">Ctrl+/</kbd> Toggle comment</div>
                <div><kbd className="px-1 py-0.5 bg-muted rounded">Ctrl+D</kbd> Duplicate line</div>
                <div><kbd className="px-1 py-0.5 bg-muted rounded">Ctrl+L</kbd> Select line</div>
                <div><kbd className="px-1 py-0.5 bg-muted rounded">Ctrl+K</kbd> Delete line</div>
                <div><kbd className="px-1 py-0.5 bg-muted rounded">Ctrl+J</kbd> Join lines</div>
                <div><kbd className="px-1 py-0.5 bg-muted rounded">Tab</kbd> Indent</div>
                <div><kbd className="px-1 py-0.5 bg-muted rounded">Shift+Tab</kbd> Unindent</div>
                <div><kbd className="px-1 py-0.5 bg-muted rounded">Ctrl+S</kbd> Save</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Welcome Message */}
      {showWelcome && (
        <div className="max-w-7xl mx-auto mb-4">
          <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    🎉 Welcome to Kotlin Playground!
                  </h3>
                  <p className="text-blue-800 dark:text-blue-200 text-sm mb-3">
                    This is a browser-based Kotlin code editing environment. You can:
                  </p>
                  <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1 mb-4">
                                          <li>• Use predefined code templates to get started quickly</li>
                      <li>• Write and edit Kotlin code in the editor</li>
                      <li>• Simulate code execution and view results</li>
                                          <li>• Save and export your code</li>
                  </ul>
                  <p className="text-blue-600 dark:text-blue-400 text-xs">
                                          Note: This is a simulated execution environment for learning and testing purposes.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowWelcome(false)}
                  className="text-blue-600 border-blue-300 hover:bg-blue-100 dark:text-blue-400 dark:border-blue-600 dark:hover:bg-blue-900/30"
                >
                                      Got it
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
          {/* Code Editor */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Kotlin Code</CardTitle>
            </CardHeader>
            <CardContent className="h-full p-0">
              <CodeEditor
                value={code}
                onChange={setCode}
                className="h-full"
                useSystemFont={useSystemFont}
                isDarkMode={theme === "dark"}
              />
              {/* Status Bar */}
              <div className="border-t bg-muted/30 px-3 py-2 text-xs text-muted-foreground flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span>Lines: {codeStats.lines}</span>
                  <span>Characters: {codeStats.characters}</span>
                  <span>Words: {codeStats.words}</span>
                  <span>Functions: {codeStats.functions}</span>
                  <span>Classes: {codeStats.classes}</span>
                  <span>Variables: {codeStats.variables}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Kotlin Playground</span>
                  <span>•</span>
                  <span>Ready</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Output Display */}
          <Card className="h-full">
            <OutputDisplay
              output={output}
              isRunning={isRunning}
              className="h-full"
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
