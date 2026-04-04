import { Component, createSignal, onMount, Show } from "solid-js";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { nqlExecute } from "../../lib/api";
import { activeDb } from "../../stores/app";
import type { NqlResult } from "../../types";
import "./NqlEditor.css";

const NqlEditor: Component = () => {
  let editorRef: HTMLDivElement | undefined;
  const [query, setQuery] = createSignal("");
  const [result, setResult] = createSignal<NqlResult | null>(null);
  const [isRunning, setIsRunning] = createSignal(false);
  let editor: EditorView | undefined;

  onMount(() => {
    if (!editorRef) return;
    editor = new EditorView({
      state: EditorState.create({
        doc: "",
        extensions: [
          basicSetup,
          EditorView.theme({
            "&": { fontSize: "14px" },
            ".cm-editor": { background: "#1e293b" },
            ".cm-gutters": { background: "#0f172a", border: "none" },
          }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              setQuery(update.state.doc.toString());
            }
          }),
        ],
      }),
      parent: editorRef,
    });
  });

  const handleRun = async () => {
    if (!activeDb() || !query()) return;
    setIsRunning(true);
    try {
      const res = await nqlExecute(activeDb()!, query());
      setResult(res);
    } catch (e: any) {
      setResult({ success: false, message: String(e), data: null });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div class="nql-editor">
      <div class="editor-header">
        <h2>NQL Query Editor</h2>
        <button onClick={handleRun} disabled={isRunning()}>
          {isRunning() ? "Running..." : "Run Query"}
        </button>
      </div>
      <div ref={editorRef!} class="editor-container" />
      <Show when={result()}>
        {(r) => (
          <div classList={{ "result-panel": true, error: !r().success }}>
            <pre>{JSON.stringify(r(), null, 2)}</pre>
          </div>
        )}
      </Show>
    </div>
  );
};

export default NqlEditor;
