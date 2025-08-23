"use client";

import { useEffect, useRef } from "react";
import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { EditorState, SerializedEditorState } from "lexical";

import { TooltipProvider } from "@/components/ui/tooltip";
import { FloatingLinkContext } from "@/components/editor/context/floating-link-context";
import { editorTheme } from "@/components/editor/themes/editor-theme";

import { nodes } from "./nodes";
import { Plugins } from "./plugins";

const editorConfig: InitialConfigType = {
  namespace: "Editor",
  theme: editorTheme,
  nodes,
  onError: (error: Error) => {
    console.error(error);
  },
};

function SerializedStateLoader({
  state,
  onHydrated,
}: {
  state?: SerializedEditorState;
  onHydrated?: () => void;
}) {
  const [editor] = useLexicalComposerContext();
  const lastAppliedRef = useRef<string | null>(null);
  useEffect(() => {
    // If no incoming state, consider hydrated (use default/empty)
    if (!state) {
      onHydrated?.();
      return;
    }
    try {
      const incoming = JSON.stringify(state);
      // Avoid re-applying if identical to last applied
      if (lastAppliedRef.current === incoming) {
        onHydrated?.();
        return;
      }
      // Avoid re-applying if identical to current editor content
      const current = JSON.stringify(editor.getEditorState().toJSON());
      if (current === incoming) {
        lastAppliedRef.current = incoming;
        onHydrated?.();
        return;
      }
      const parsed = editor.parseEditorState(incoming);
      lastAppliedRef.current = incoming;
      editor.setEditorState(parsed);
      onHydrated?.();
    } catch (e) {
      console.error("Failed to load serialized editor state", e);
      onHydrated?.();
    }
  }, [editor, state, onHydrated]);
  return null;
}

export function Editor({
  editorState,
  editorSerializedState,
  onChange,
  onSerializedChange,
}: {
  editorState?: EditorState;
  editorSerializedState?: SerializedEditorState;
  onChange?: (editorState: EditorState) => void;
  onSerializedChange?: (editorSerializedState: SerializedEditorState) => void;
}) {
  const hydratedRef = useRef(false);
  return (
    <div className="overflow-hidden rounded-lg border bg-background shadow">
      <LexicalComposer
        initialConfig={{
          ...editorConfig,
          ...(editorState ? { editorState } : {}),
          ...(editorSerializedState
            ? { editorState: JSON.stringify(editorSerializedState) }
            : {}),
        }}
      >
        <TooltipProvider>
          <FloatingLinkContext>
            <Plugins />
          </FloatingLinkContext>
          {/* Ensure serialized state arriving after mount is applied */}
          <SerializedStateLoader
            state={editorSerializedState}
            onHydrated={() => {
              hydratedRef.current = true;
            }}
          />

          <OnChangePlugin
            ignoreSelectionChange={true}
            onChange={(editorState) => {
              // Avoid emitting changes until hydrated to prevent overwriting
              if (!hydratedRef.current && editorSerializedState) return;
              onChange?.(editorState);
              onSerializedChange?.(editorState.toJSON());
            }}
          />
        </TooltipProvider>
      </LexicalComposer>
    </div>
  );
}

