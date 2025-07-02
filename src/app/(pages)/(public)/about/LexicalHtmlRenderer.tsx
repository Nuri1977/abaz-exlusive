"use client";

import { useEffect, useRef } from "react";
import { $generateHtmlFromNodes } from "@lexical/html";
import { createEditor, SerializedEditorState } from "lexical";

import { nodes } from "@/components/blocks/editor-00/nodes";
import { editorTheme } from "@/components/editor/themes/editor-theme";

interface Props {
  aboutUs: SerializedEditorState | null;
}

export default function LexicalHtmlRenderer({ aboutUs }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aboutUs || !ref.current) return;
    const editor = createEditor({
      nodes,
      theme: editorTheme,
      namespace: "Editor",
      onError: (e) => console.error(e),
    });
    editor.update(() => {
      const state = editor.parseEditorState(JSON.stringify(aboutUs));
      editor.setEditorState(state);
      const html = $generateHtmlFromNodes(editor, null);
      ref.current!.innerHTML = html;
    });
  }, [aboutUs]);

  if (!aboutUs) {
    return (
      <p className="text-muted-foreground">No About Us content available.</p>
    );
  }

  return <div ref={ref} className="prose w-full max-w-none" />;
}
