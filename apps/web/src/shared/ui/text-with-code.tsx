import type { ReactNode } from "react";

interface TextWithCodeProps {
  text: string;
}

const inlineCodePattern = /`([^`]*)`/g;

/** Renders single-backtick spans as inline code without enabling full Markdown. */
export function TextWithCode({ text }: Readonly<TextWithCodeProps>) {
  const content: ReactNode[] = [];
  let cursor = 0;

  for (const match of text.matchAll(inlineCodePattern)) {
    const [source, code] = match;
    const start = match.index;

    if (start > cursor) {
      content.push(text.slice(cursor, start));
    }

    content.push(
      <code
        className="rounded bg-ctp-mantle box-decoration-clone px-1 py-px font-mono text-ctp-text text-mono not-italic ring-1 ring-ctp-surface1/80 ring-inset"
        key={`${start}:${source}`}
      >
        {code}
      </code>,
    );
    cursor = start + source.length;
  }

  if (cursor < text.length) {
    content.push(text.slice(cursor));
  }

  return content;
}
