"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import Editor, { type Monaco, type OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useThemeStore } from "@/hooks/use-theme";
import { fetchAllSchemas } from "@/services/api";

interface MonacoSqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  onExecute?: () => void;
  height?: string | number;
  readOnly?: boolean;
}

// SQL keywords for autocomplete
const SQL_KEYWORDS = [
  "SELECT", "FROM", "WHERE", "AND", "OR", "NOT", "IN", "IS", "NULL",
  "AS", "ON", "JOIN", "LEFT", "RIGHT", "INNER", "OUTER", "CROSS", "FULL",
  "GROUP", "BY", "ORDER", "ASC", "DESC", "HAVING", "LIMIT", "OFFSET",
  "INSERT", "INTO", "VALUES", "UPDATE", "SET", "DELETE",
  "CREATE", "TABLE", "ALTER", "DROP", "INDEX", "VIEW",
  "UNION", "ALL", "DISTINCT", "COUNT", "SUM", "AVG", "MIN", "MAX",
  "CASE", "WHEN", "THEN", "ELSE", "END",
  "BETWEEN", "LIKE", "EXISTS", "ANY", "SOME",
  "CAST", "CONVERT", "COALESCE", "IFNULL", "NULLIF",
  "WITH", "RECURSIVE", "CTE",
  "OVER", "PARTITION", "ROW_NUMBER", "RANK", "DENSE_RANK",
  "LAG", "LEAD", "FIRST_VALUE", "LAST_VALUE",
  "EXPLAIN", "ANALYZE", "DESCRIBE", "SHOW", "TABLES",
  "TRUE", "FALSE", "BOOLEAN", "INTEGER", "VARCHAR", "TEXT", "DATE", "TIMESTAMP",
  "FLOAT", "DOUBLE", "DECIMAL", "BIGINT", "SMALLINT",
  "PRIMARY", "KEY", "FOREIGN", "REFERENCES", "CONSTRAINT", "DEFAULT", "CHECK",
  "UNIQUE", "NOT", "AUTO_INCREMENT", "IF",
  "SUBSTR", "SUBSTRING", "LENGTH", "TRIM", "UPPER", "LOWER", "REPLACE",
  "ROUND", "CEIL", "FLOOR", "ABS", "POWER", "SQRT",
  "CURRENT_DATE", "CURRENT_TIME", "CURRENT_TIMESTAMP", "NOW",
  "DATE_TRUNC", "EXTRACT", "YEAR", "MONTH", "DAY", "HOUR", "MINUTE", "SECOND",
  "INTERVAL", "EPOCH",
  "STRFTIME", "STRPTIME",
  "PIVOT", "UNPIVOT", "LATERAL", "UNNEST",
  "QUALIFY", "SAMPLE", "TABLESAMPLE",
  "STRUCT", "LIST", "MAP", "ARRAY",
  "NATURAL", "USING",
];

// DuckDB functions
const DUCKDB_FUNCTIONS = [
  "read_csv_auto", "read_parquet", "read_json_auto", "read_excel",
  "write_csv", "write_parquet",
  "approx_quantile", "median", "mode", "stddev", "variance",
  "string_agg", "array_agg", "json_group_array",
  "json_extract", "json_extract_string",
  "regexp_extract", "regexp_matches", "regexp_replace",
  "date_diff", "date_add", "date_sub", "make_date",
  "list_aggr", "list_filter", "list_transform",
  "unnest", "generate_series",
];

// Schema cache
let schemaCache: Record<string, string[]> = {};
let schemaLoaded = false;

async function loadSchema(): Promise<Record<string, string[]>> {
  if (schemaLoaded) return schemaCache;
  try {
    schemaCache = await fetchAllSchemas();
    schemaLoaded = true;
  } catch {
    // Silently fail — autocomplete will still work with keywords
  }
  return schemaCache;
}

export function MonacoSqlEditor({
  value,
  onChange,
  onExecute,
  height = "100%",
  readOnly = false,
}: MonacoSqlEditorProps) {
  const theme = useThemeStore((s) => s.theme);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const completionDisposableRef = useRef<{ dispose: () => void } | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Register SQL autocomplete provider
  const registerCompletionProvider = useCallback(
    (monaco: Monaco) => {
      if (completionDisposableRef.current) {
        completionDisposableRef.current.dispose();
      }

      completionDisposableRef.current = monaco.languages.registerCompletionItemProvider("sql", {
        triggerCharacters: [".", " ", "("],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        provideCompletionItems: (model: any, position: any) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };

          const textBeforeCursor = model.getValueInRange({
            startLineNumber: position.lineNumber,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          });

          // Check if we're after a dot (table.column completion)
          const dotMatch = textBeforeCursor.match(/(\w+)\.\w*$/);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const suggestions: any[] = [];

          if (dotMatch) {
            const tableName = dotMatch[1].toLowerCase();
            const columns = schemaCache[tableName] || [];
            for (const col of columns) {
              suggestions.push({
                label: col,
                kind: monaco.languages.CompletionItemKind.Field,
                insertText: col,
                range,
                detail: `column of ${tableName}`,
              });
            }
            return { suggestions };
          }

          // Table name completions
          for (const tableName of Object.keys(schemaCache)) {
            suggestions.push({
              label: tableName,
              kind: monaco.languages.CompletionItemKind.Class,
              insertText: tableName,
              range,
              detail: "table",
              documentation: `Columns: ${(schemaCache[tableName] || []).join(", ")}`,
            });
          }

          // SQL keyword completions
          for (const kw of SQL_KEYWORDS) {
            suggestions.push({
              label: kw,
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: kw,
              range,
              sortText: "1" + kw, // Sort keywords first
            });
          }

          // DuckDB function completions
          for (const fn of DUCKDB_FUNCTIONS) {
            suggestions.push({
              label: fn,
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: `${fn}($0)`,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
              detail: "DuckDB function",
            });
          }

          return { suggestions };
        },
      });
    },
    []
  );

  const handleMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      // Define dark and light SQL themes
      monaco.editor.defineTheme("sql-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "keyword", foreground: "569CD6", fontStyle: "bold" },
          { token: "string", foreground: "CE9178" },
          { token: "number", foreground: "B5CEA8" },
          { token: "comment", foreground: "6A9955", fontStyle: "italic" },
          { token: "identifier", foreground: "9CDCFE" },
          { token: "operator", foreground: "D4D4D4" },
          { token: "type", foreground: "4EC9B0" },
          { token: "function", foreground: "DCDCAA" },
        ],
        colors: {
          "editor.background": "#1e1e1e",
          "editor.foreground": "#d4d4d4",
          "editor.lineHighlightBackground": "#2a2d2e",
          "editorLineNumber.foreground": "#858585",
          "editor.selectionBackground": "#264f78",
        },
      });

      monaco.editor.defineTheme("sql-light", {
        base: "vs",
        inherit: true,
        rules: [
          { token: "keyword", foreground: "0000FF", fontStyle: "bold" },
          { token: "string", foreground: "A31515" },
          { token: "number", foreground: "098658" },
          { token: "comment", foreground: "008000", fontStyle: "italic" },
          { token: "function", foreground: "795E26" },
        ],
        colors: {
          "editor.background": "#ffffff",
          "editor.lineHighlightBackground": "#f5f5f5",
        },
      });

      // Set initial theme
      monaco.editor.setTheme(theme === "dark" ? "sql-dark" : "sql-light");

      // Register completion provider
      registerCompletionProvider(monaco);

      // Load schema for autocomplete
      loadSchema().then(() => {
        // Re-register provider with schema data
        registerCompletionProvider(monaco);
      });

      // Keyboard shortcuts
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
        onExecute?.();
      });

      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash, () => {
        editor.trigger("keyboard", "editor.action.commentLine", undefined);
      });

      setIsReady(true);
    },
    [theme, registerCompletionProvider, onExecute]
  );

  // Update theme when it changes
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(theme === "dark" ? "sql-dark" : "sql-light");
    }
  }, [theme]);

  return (
    <div className="w-full h-full rounded-md overflow-hidden border border-[var(--border-default)]">
      <Editor
        height={height}
        language="sql"
        value={value}
        onChange={(val) => onChange(val || "")}
        onMount={handleMount}
        theme={theme === "dark" ? "sql-dark" : "sql-light"}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
          lineNumbers: "on",
          roundedSelection: true,
          scrollBeyondLastLine: false,
          wordWrap: "on",
          tabSize: 2,
          automaticLayout: true,
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          contextmenu: true,
          readOnly,
          padding: { top: 8, bottom: 8 },
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
          suggest: {
            showKeywords: true,
            showFunctions: true,
            showSnippets: false,
          },
        }}
      />
    </div>
  );
}
