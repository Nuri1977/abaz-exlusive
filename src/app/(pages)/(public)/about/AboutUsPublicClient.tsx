"use client";

import dynamic from "next/dynamic";
import type { SerializedEditorState } from "lexical";

const Renderer = dynamic(() => import("./LexicalHtmlRenderer"), { ssr: false });

interface Props {
  aboutUs: SerializedEditorState | null;
}

export default function AboutUsPublicClient({ aboutUs }: Props) {
  if (!aboutUs?.root?.children?.length) {
    return (
      <p className="text-muted-foreground">No About Us content available.</p>
    );
  }
  return <Renderer aboutUs={aboutUs} />;
}
