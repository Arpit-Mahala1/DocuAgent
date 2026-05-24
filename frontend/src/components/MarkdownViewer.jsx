import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";
import "highlight.js/styles/github.css"; // optional theme

const CodeBlock = ({ inline, className, children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const code = String(children).replace(/\n$/, "");
  const language = /language-(\w+)/.exec(className || "")?.[1] || "text";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error(error);
    }
  };

  if (inline) {
    return (
      <code className="bg-[#1a1a1a] text-[#14b8a6] px-1.5 py-0.5 rounded text-sm font-mono border border-[#222222]">
        {code}
      </code>
    );
  }

  return (
    <div className="relative rounded-lg border border-[#222222] bg-[#0d0d0d] p-4 mb-6 overflow-x-auto text-sm font-mono">
      <div className="absolute right-3 top-3 flex items-center gap-2">
        <span className="rounded-full bg-[#0b3d36] px-2 py-[3px] text-[11px] font-semibold uppercase tracking-[0.18em] text-[#14b8a6]">
          {language}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded border border-[#222222] bg-[#111111] px-2 py-1 text-[#14b8a6] transition hover:bg-[#1a1a1a]"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
      <pre className="overflow-x-auto">
        <code className={className} {...props}>
          {code}
        </code>
      </pre>
    </div>
  );
};

const MarkdownViewer = ({ markdown }) => {
  return (
    <div className="bg-[#111111] rounded-xl border border-[#222222] p-8 max-w-none scroll-smooth">
      <ReactMarkdown
        className="max-w-none"
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { ignoreMissing: true }], rehypeSlug]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-2xl font-bold text-white border-b border-[#222222] pb-3 mb-6 mt-8" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xl font-semibold text-white border-b border-[#222222] pb-2 mb-4 mt-6" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-lg font-medium text-[#14b8a6] mb-3 mt-5" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="text-[#cccccc] leading-7 mb-4" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a className="text-[#14b8a6] hover:underline" {...props} />
          ),
          code: CodeBlock,
          pre: ({ node, ...props }) => <div {...props} />,
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse text-sm" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-[#111111]" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="text-left text-[#14b8a6] font-semibold px-4 py-3 border border-[#222222]" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-3 border border-[#222222] text-[#cccccc]" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="even:bg-[#0d0d0d] hover:bg-[#1a1a1a]" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside text-[#cccccc] mb-4 space-y-1 pl-4" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside text-[#cccccc] mb-4 space-y-1 pl-4" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-7" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-[#14b8a6] pl-4 italic text-[#888888] my-4 bg-[#111111] py-2 rounded-r" {...props} />
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownViewer;
