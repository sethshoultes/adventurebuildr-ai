"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CharacterCount from "@tiptap/extension-character-count";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, List, ListOrdered, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStory } from "@/components/providers/StoryProvider";

interface EpisodeEditorProps {
  episodeId: string;
  storyId: string;
  onClose: () => void;
}

export function EpisodeEditor({
  episodeId,
  storyId,
  onClose,
}: EpisodeEditorProps) {
  const { episodes, updateEpisode } = useStory();
  const episode = episodes.find((ep) => ep.id === episodeId);
  const [title, setTitle] = useState(episode?.title || "");
  const [rewriteOpen, setRewriteOpen] = useState(false);
  const [rewritePrompt, setRewritePrompt] = useState("");
  const [isRewriting, setIsRewriting] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      CharacterCount,
      Placeholder.configure({
        placeholder: "Write this episode, or let AI continue the story...",
      }),
    ],
    content: episode?.content || "",
    editorProps: {
      attributes: {
        class: "tiptap-editor",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      debouncedSave(episodeId, html);
    },
  });

  const saveTimeoutRef = React.useRef<ReturnType<typeof setTimeout>>();

  const debouncedSave = useCallback(
    (id: string, content: string) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        updateEpisode(id, { content });
        fetch(`/api/stories/${storyId}/episodes/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });
      }, 1500);
    },
    [storyId, updateEpisode]
  );

  const handleTitleSave = useCallback(() => {
    updateEpisode(episodeId, { title });
    fetch(`/api/stories/${storyId}/episodes/${episodeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
  }, [episodeId, storyId, title, updateEpisode]);

  const handleRewrite = useCallback(async () => {
    if (!rewritePrompt.trim() || !editor) return;

    setIsRewriting(true);
    try {
      const response = await fetch(
        `/api/stories/${storyId}/generate/episode/${episodeId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instruction: rewritePrompt,
            currentContent: editor.getHTML(),
          }),
        }
      );

      if (!response.ok) throw new Error("Rewrite failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let content = "";

      if (reader) {
        editor.commands.setContent("");
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          content += decoder.decode(value, { stream: true });
          editor.commands.setContent(content);
        }
      }

      setRewriteOpen(false);
      setRewritePrompt("");
    } catch {
      // Error handling would go here
    } finally {
      setIsRewriting(false);
    }
  }, [rewritePrompt, editor, storyId, episodeId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!episode) return null;

  const wordCount = editor?.storage.characterCount.words() || 0;

  return (
    <div className="h-full bg-white border-l border-warm-400/10 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-warm-400/10">
        <div className="flex items-center gap-3">
          <span className="text-xs text-amber-story font-medium">
            S{episode.season}E{episode.episodeNumber}
          </span>
          <span className="text-xs text-warm-200">
            {wordCount} words
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRewriteOpen(!rewriteOpen)}
            className="text-amber-story"
          >
            <Sparkles className="w-4 h-4 mr-1" />
            Rewrite with AI
          </Button>
          <button
            onClick={onClose}
            className="p-1 rounded-tight hover:bg-black/[0.04] text-warm-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* AI Rewrite input */}
      {rewriteOpen && (
        <div className="px-6 py-3 border-b border-warm-400/10 bg-warm-50/50 flex gap-2">
          <Input
            value={rewritePrompt}
            onChange={(e) => setRewritePrompt(e.target.value)}
            placeholder="Make it darker / Add a plot twist / Cut to half length..."
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRewrite();
            }}
            className="text-sm"
          />
          <Button
            size="sm"
            onClick={handleRewrite}
            disabled={isRewriting || !rewritePrompt.trim()}
          >
            {isRewriting ? "Writing..." : "Generate"}
          </Button>
        </div>
      )}

      {/* Title */}
      <div className="px-6 pt-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleTitleSave();
          }}
          className="w-full text-2xl font-display font-semibold text-warm-500 outline-none placeholder:text-warm-200"
          placeholder="Episode title"
        />
      </div>

      {/* Tiptap Editor */}
      <div className="flex-1 px-6 py-4">
        <div className="border border-warm-400/10 rounded-standard overflow-hidden">
          {editor && (
            <BubbleMenu
              editor={editor}
              tippyOptions={{ duration: 100 }}
              className="bg-white border border-warm-400/10 rounded-tight shadow-elevated flex items-center gap-0.5 p-1"
            >
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-1.5 rounded-tight transition-colors ${
                  editor.isActive("bold")
                    ? "bg-amber-story/10 text-amber-story"
                    : "hover:bg-black/[0.04] text-warm-300"
                }`}
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-1.5 rounded-tight transition-colors ${
                  editor.isActive("italic")
                    ? "bg-amber-story/10 text-amber-story"
                    : "hover:bg-black/[0.04] text-warm-300"
                }`}
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-1.5 rounded-tight transition-colors ${
                  editor.isActive("bulletList")
                    ? "bg-amber-story/10 text-amber-story"
                    : "hover:bg-black/[0.04] text-warm-300"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-1.5 rounded-tight transition-colors ${
                  editor.isActive("orderedList")
                    ? "bg-amber-story/10 text-amber-story"
                    : "hover:bg-black/[0.04] text-warm-300"
                }`}
              >
                <ListOrdered className="w-4 h-4" />
              </button>
            </BubbleMenu>
          )}
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
