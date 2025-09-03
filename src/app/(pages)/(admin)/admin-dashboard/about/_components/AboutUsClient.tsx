"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { SerializedEditorState } from "lexical";

import { fetchAboutUs, updateAboutUs } from "@/lib/query/about";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Editor } from "@/components/blocks/editor-00/editor";

export default function AboutUsClient() {
  const { data: initialState, isLoading } = useQuery({
    queryKey: ["aboutUs", "admin"],
    queryFn: fetchAboutUs,
  });
  const [editorState, setEditorState] = useState<SerializedEditorState | null>(
    null
  );
  const { toast } = useToast();

  useEffect(() => {
    if (initialState && Object.keys(initialState).length > 0) {
      setEditorState(initialState);
    } else {
      // Set a valid empty Lexical state if none exists (root with one empty paragraph)
      setEditorState({
        root: {
          children: [
            {
              direction: "ltr",
              format: "",
              indent: 0,
              type: "paragraph",
              version: 1,
            },
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "root",
          version: 1,
        },
      } as any);
    }
  }, [initialState]);

  const mutation = useMutation({
    mutationFn: updateAboutUs,
    onSuccess: () => toast({ title: "Saved", description: "About Us updated" }),
    onError: () =>
      toast({
        title: "Error",
        description: "Failed to update",
        variant: "destructive",
      }),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <Editor
        editorSerializedState={editorState ?? undefined}
        onSerializedChange={(value) => setEditorState(value)}
      />
      <Button
        className="mt-4"
        onClick={() => mutation.mutate(editorState)}
        disabled={mutation.isPending || !editorState}
      >
        Save
      </Button>
    </div>
  );
}
