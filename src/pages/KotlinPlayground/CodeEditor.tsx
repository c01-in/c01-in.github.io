import { useEffect, useRef } from "react";
import { EditorView, keymap } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { indentWithTab, indentMore, indentLess, history, defaultKeymap } from "@codemirror/commands";
import { java } from "@codemirror/lang-java";
import { autocompletion, closeBrackets } from "@codemirror/autocomplete";
import { oneDark } from "@codemirror/theme-one-dark";
import { 
  lineNumbers, 
  highlightActiveLineGutter, 
  highlightSpecialChars, 
  drawSelection, 
  dropCursor, 
  rectangularSelection, 
  crosshairCursor, 
  highlightActiveLine 
} from "@codemirror/view";
import { bracketMatching } from "@codemirror/language";
import { searchKeymap } from "@codemirror/search";
import { lintKeymap } from "@codemirror/lint";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  useSystemFont?: boolean;
  isDarkMode?: boolean;
}

// Enhanced Kotlin-specific completions with more context
const kotlinCompletions = [
  // Keywords
  "fun", "val", "var", "class", "object", "interface", "enum", "sealed",
  "data", "inline", "suspend", "expect", "actual", "external", "annotation",
  "if", "else", "when", "for", "while", "do", "try", "catch", "finally",
  "return", "break", "continue", "throw", "import", "package", "as", "is",
  "in", "!in", "is", "!is", "as?", "by", "constructor", "delegate", "dynamic",
  "field", "file", "get", "init", "param", "property", "receiver", "set",
  "setparam", "value", "where",
  
  // Common functions
  "println", "print", "readLine", "readln", "readlnOrNull", "readLineOrNull",
  "listOf", "mutableListOf", "setOf", "mutableSetOf", "mapOf", "mutableMapOf",
  "arrayOf", "intArrayOf", "longArrayOf", "doubleArrayOf", "floatArrayOf",
  "charArrayOf", "booleanArrayOf", "shortArrayOf", "byteArrayOf", "uintArrayOf",
  "ulongArrayOf", "ushortArrayOf", "ubyteArrayOf",
  
  // Types
  "String", "Int", "Long", "Double", "Float", "Char", "Boolean", "Short", "Byte",
  "UInt", "ULong", "UShort", "UByte", "Array", "List", "Set", "Map",
  "MutableList", "MutableSet", "MutableMap", "Sequence", "Iterator",
  "Comparable", "Comparator", "Enum", "Annotation",
  
  // Reflection
  "KClass", "KCallable", "KProperty", "KFunction", "KParameter", "KType",
  "KTypeParameter", "KVisibility", "KModifier", "KAnnotation",
  
  // Common extensions
  "let", "run", "with", "apply", "also", "takeIf", "takeUnless",
  "repeat", "forEach", "filter", "map", "flatMap", "reduce", "fold",
  "any", "all", "none", "count", "find", "first", "last", "max", "min",
  "sum", "average", "distinct", "sorted", "reversed", "shuffled",
  
  // String functions
  "substring", "split", "trim", "trimStart", "trimEnd", "uppercase", "lowercase",
  "startsWith", "endsWith", "contains", "replace", "replaceFirst",
  
  // Math functions
  "abs", "max", "min", "sqrt", "pow", "round", "ceil", "floor",
  "sin", "cos", "tan", "log", "exp"
];

// Custom autocompletion function with better context awareness
function kotlinCompletionsFn(context: { matchBefore: (regex: RegExp) => { from: number; text: string } | null }) {
  const word = context.matchBefore(/\w*/);
  if (!word) return null;
  
  const query = word.text.toLowerCase();
  const filteredCompletions = kotlinCompletions.filter(completion => 
    completion.toLowerCase().includes(query)
  );
  
  return {
    from: word.from,
    options: filteredCompletions.map(completion => ({
      label: completion,
      type: "keyword"
    }))
  };
}

// Enhanced custom keymap for IDE-like shortcuts
const customKeymap = [
  { key: "Tab", run: indentMore },
  { key: "Shift-Tab", run: indentLess },
  { key: "Ctrl-/", run: (view: EditorView) => {
    // Toggle comment (simplified)
    const { state } = view;
    const { selection } = state;
    if (selection.ranges.length === 0) return false;
    
    const changes: Array<{ from: number; insert: string }> = [];
    for (const range of selection.ranges) {
      const line = state.doc.lineAt(range.from);
      const comment = line.text.trimStart().startsWith("//") ? "" : "// ";
      changes.push({
        from: line.from,
        insert: comment
      });
    }
    
    view.dispatch({
      changes,
      selection: state.selection
    });
    return true;
  }},
  { key: "Ctrl-D", run: (view: EditorView) => {
    // Duplicate line
    const { state } = view;
    const { selection } = state;
    if (selection.ranges.length === 0) return false;
    
    const line = state.doc.lineAt(selection.main.from);
    const lineText = state.doc.sliceString(line.from, line.to) + "\n";
    
    view.dispatch({
      changes: { from: line.to, insert: lineText },
      selection: { anchor: line.to + 1, head: line.to + 1 }
    });
    return true;
  }},
  { key: "Ctrl-L", run: (view: EditorView) => {
    // Select line
    const { state } = view;
    const line = state.doc.lineAt(state.selection.main.from);
    view.dispatch({
      selection: { anchor: line.from, head: line.to }
    });
    return true;
  }},
  { key: "Ctrl-K", run: (view: EditorView) => {
    // Delete line
    const { state } = view;
    const line = state.doc.lineAt(state.selection.main.from);
    view.dispatch({
      changes: { from: line.from, to: line.to + 1 }
    });
    return true;
  }},
  { key: "Ctrl-J", run: (view: EditorView) => {
    // Join lines
    const { state } = view;
    const line = state.doc.lineAt(state.selection.main.from);
    if (line.number < state.doc.lines) {
      const nextLine = state.doc.line(line.number + 1);
      const currentText = state.doc.sliceString(line.from, line.to);
      const nextText = state.doc.sliceString(nextLine.from, nextLine.to);
      view.dispatch({
        changes: { 
          from: line.from, 
          to: nextLine.to,
          insert: currentText + " " + nextText
        }
      });
    }
    return true;
  }}
];

// Create basic setup extensions for CodeMirror 6
const basicSetup = [
  lineNumbers(),
  highlightActiveLineGutter(),
  highlightSpecialChars(),
  history(),
  drawSelection(),
  dropCursor(),
  rectangularSelection(),
  crosshairCursor(),
  highlightActiveLine(),
  bracketMatching(),
  closeBrackets(),
  keymap.of([
    ...defaultKeymap,
    ...searchKeymap,
    ...lintKeymap,
    indentWithTab
  ])
];

export default function CodeEditor({ value, onChange, className, useSystemFont = true, isDarkMode = false }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    // Create editor state with Java language support (closest to Kotlin)
    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        java(),
        oneDark,
        autocompletion({ override: [kotlinCompletionsFn] }),
        keymap.of(customKeymap),
        EditorView.updateListener.of((update: { docChanged: boolean; state: EditorState }) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString());
          }
        }),
        EditorView.theme({
          "&": {
            fontSize: "14px",
            fontFamily: useSystemFont 
              ? 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Courier New", monospace'
              : 'inherit'
          },
          ".cm-content": {
            fontFamily: useSystemFont 
              ? 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Courier New", monospace'
              : 'inherit',
            padding: "16px"
          },
          ".cm-line": {
            lineHeight: "1.6"
          },
          ".cm-tooltip": {
            backgroundColor: isDarkMode ? "#2d3748" : "#ffffff",
            border: `1px solid ${isDarkMode ? "#4a5568" : "#e2e8f0"}`,
            borderRadius: "6px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
          },
          ".cm-tooltip.cm-tooltip-autocomplete": {
            backgroundColor: isDarkMode ? "#2d3748" : "#ffffff"
          },
          ".cm-tooltip.cm-tooltip-autocomplete > ul": {
            backgroundColor: isDarkMode ? "#2d3748" : "#ffffff"
          },
          ".cm-tooltip.cm-tooltip-autocomplete > ul > li": {
            color: isDarkMode ? "#e2e8f0" : "#1a202c",
            padding: "4px 8px"
          },
          ".cm-tooltip.cm-tooltip-autocomplete > ul > li[aria-selected]": {
            backgroundColor: isDarkMode ? "#4a5568" : "#f7fafc"
          }
        })
      ]
    });

    // Create editor view
    const view = new EditorView({
      state,
      parent: editorRef.current
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [useSystemFont, isDarkMode, onChange]);

  // Update editor content when value prop changes
  useEffect(() => {
    if (viewRef.current && viewRef.current.state.doc.toString() !== value) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: value
        }
      });
    }
  }, [value, onChange]);

  return (
    <div 
      ref={editorRef} 
      className={`w-full h-full ${className || ""}`}
    />
  );
}
