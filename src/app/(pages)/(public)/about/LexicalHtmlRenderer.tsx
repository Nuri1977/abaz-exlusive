"use client";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { SerializedEditorState } from "lexical";

interface Props {
  aboutUs: SerializedEditorState;
}

export default function LexicalHtmlRenderer({ aboutUs }: Props) {
  const initialConfig = {
    namespace: "about-us-renderer",
    editorState: (editor: any) => {
      const parsed = editor.parseEditorState(aboutUs);
      editor.setEditorState(parsed); // ✅ Load serialized state into editor
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
