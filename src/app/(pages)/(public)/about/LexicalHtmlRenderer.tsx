"use client";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { SerializedEditorState } from "lexical";
import { nodes } from "@/components/blocks/editor-00/nodes";
import { editorTheme } from "@/components/editor/themes/editor-theme";

interface Props {
  aboutUs?: SerializedEditorState | null;
}

function isSerializedEditorState(value: unknown): value is SerializedEditorState {
  return !!value && typeof value === "object" && "root" in (value as any);
}

function getSafeState(input?: SerializedEditorState | null): SerializedEditorState {
  const fallback: SerializedEditorState = {
    root: {
      type: "root",
      version: 1,
      indent: 0,
      format: "",
      direction: "ltr",
      children: [
        {
          type: "paragraph",
          version: 1,
          indent: 0,
          format: "",
          direction: "ltr",
        } as any,
      ],
    } as any,
  } as any;

  if (!isSerializedEditorState(input)) return fallback;
  const root: any = (input as any).root;
  if (!root || !Array.isArray(root.children) || root.children.length === 0) {
    return fallback;
  }
  return input;
}

export default function LexicalHtmlRenderer({ aboutUs }: Props) {
  const safeState = getSafeState(aboutUs);
  const initialConfig = {
    namespace: "about-us-renderer",
    theme: editorTheme,
    nodes,
    editorState: (editor: any) => {
      try {
        const incoming = JSON.stringify(safeState);
        const parsed = editor.parseEditorState(incoming);
        editor.setEditorState(parsed); // ✅ Load serialized state into editor
      } catch (e) {
        console.error("Lexical parse/set error:", e);
      }
    },
    editable: false,
    onError(error: Error) {
      console.error("Lexical error:", error);
    },
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <RichTextPlugin
        contentEditable={<ContentEditable className="prose" />}
        placeholder={null}
        ErrorBoundary={({ children }) => children}
      />
    </LexicalComposer>
  );
}
