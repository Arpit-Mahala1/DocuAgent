import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css"; // optional theme

/**
 * Simple Markdown viewer component used in DocsViewer.
 * Renders markdown content with syntax highlighting for code blocks.
 */
const MarkdownViewer = ({ markdown }) => {
  return (
    <ReactMarkdown
      className="prose prose-sm prose-invert max-w-none"
      rehypePlugins={[rehypeHighlight]}
    >
      {markdown}
    </ReactMarkdown>
  );
};

export default MarkdownViewer;
