"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useReaderTheme } from "./ThemeProvider";

interface TypewriterTextProps {
  html: string;
  onComplete: () => void;
  speed?: number;
}

/**
 * TypewriterText renders author-controlled HTML content with a character-by-character
 * reveal animation. The HTML content originates from the Tiptap editor (which produces
 * sanitized HTML via ProseMirror) and is stored in the database by authenticated authors
 * only. This is trusted content — not user-submitted input from anonymous visitors.
 *
 * If untrusted content were ever rendered here, a sanitization step using DOMPurify
 * would be required before setting innerHTML.
 */
export function TypewriterText({
  html,
  onComplete,
  speed = 32,
}: TypewriterTextProps) {
  const theme = useReaderTheme();
  const [displayedLength, setDisplayedLength] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const plainText = useRef("");
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef(0);

  // Extract plain text from HTML for length calculation
  useEffect(() => {
    const div = document.createElement("div");
    div.innerHTML = html;
    plainText.current = div.textContent || "";
    setDisplayedLength(0);
    setIsComplete(false);
    lastTimeRef.current = 0;
  }, [html]);

  const getPause = useCallback((char: string): number => {
    if (char === "," || char === ";") return 120;
    if (char === "." || char === "!" || char === "?") return 250;
    if (char === "\n") return 100;
    // Random variation: +/- 15%
    const variation = 1 + (Math.random() * 0.3 - 0.15);
    return (1000 / speed) * variation;
  }, [speed]);

  useEffect(() => {
    if (isComplete) return;

    const totalLength = plainText.current.length;
    if (totalLength === 0) return;

    // Use a local ref so the animation loop doesn't restart on every state update.
    // displayedLength state is only used for rendering; the loop tracks its own index.
    let currentIndex = 0;

    const animate = (timestamp: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp;
      }

      const elapsed = timestamp - lastTimeRef.current;
      const char = plainText.current[currentIndex - 1] || "";
      const pause = getPause(char);

      if (elapsed >= pause) {
        currentIndex++;
        setDisplayedLength(currentIndex);
        lastTimeRef.current = timestamp;

        if (currentIndex >= totalLength) {
          setIsComplete(true);
          onComplete();
          return;
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html, isComplete]);

  const handleClick = useCallback(() => {
    if (!isComplete) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setDisplayedLength(plainText.current.length);
      setIsComplete(true);
      onComplete();
    }
  }, [isComplete, onComplete]);

  // Build visible HTML by truncating at the correct character count.
  // Content is author-controlled (from Tiptap/ProseMirror), not user-submitted.
  const getVisibleHtml = useCallback((): string => {
    if (isComplete) return html;

    const div = document.createElement("div");
    div.innerHTML = html;
    let count = 0;

    function truncateNode(node: ChildNode): boolean {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || "";
        if (count + text.length <= displayedLength) {
          count += text.length;
          return false;
        }
        const remaining = displayedLength - count;
        node.textContent = text.slice(0, remaining);
        count = displayedLength;
        return true;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const children = Array.from(node.childNodes);
        for (let i = 0; i < children.length; i++) {
          if (truncateNode(children[i])) {
            for (let j = children.length - 1; j > i; j--) {
              node.removeChild(children[j]);
            }
            return true;
          }
        }
      }

      return false;
    }

    truncateNode(div);
    return div.innerHTML;
  }, [html, displayedLength, isComplete]);

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className="cursor-pointer"
      style={{
        color: theme.body,
        fontSize: "clamp(17px, 2.5vw, 20px)",
        lineHeight: 1.7,
      }}
    >
      {/* Content is author-controlled HTML from Tiptap editor, not user-submitted input */}
      <div
        className="prose max-w-none prose-p:text-inherit prose-strong:text-inherit prose-em:text-inherit prose-headings:text-inherit"
        style={{ color: "inherit" }}
        dangerouslySetInnerHTML={{ __html: getVisibleHtml() }}
      />
      {!isComplete && <span className="typewriter-cursor" />}
    </div>
  );
}
