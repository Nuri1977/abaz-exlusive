"use client";

import dynamic from "next/dynamic";
import { SerializedEditorState } from "lexical";

const LexicalHtmlRenderer = dynamic(() => import("./LexicalHtmlRenderer"), {
  ssr: false,
});

interface AboutUsPublicClientProps {
  aboutUs: SerializedEditorState | null;
}

function isValidLexicalState(state: any): state is SerializedEditorState {
  return !!state?.root && Array.isArray(state?.root?.children);
}

export default function AboutUsPublicClient({ aboutUs }: AboutUsPublicClientProps) {
  if (!isValidLexicalState(aboutUs)) {
    return <p className="text-muted-foreground">No About Us content available.</p>;
  }
  return <LexicalHtmlRenderer aboutUs={aboutUs} />;
}
