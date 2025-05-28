"use client"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import rehypeSanitize from "rehype-sanitize"
import { cn } from "@/lib/utils"

interface MarkdownRendererProps {
  content: string
  className?: string
}

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  if (!content) return null

  return (
    <div className={cn("markdown-content prose max-w-none dark:prose-invert", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]} // Supports GitHub Flavored Markdown
        rehypePlugins={[rehypeRaw, rehypeSanitize]} // Allows HTML but sanitizes it
        components={{
          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-5 mb-3" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-4 mb-2" {...props} />,
          h4: ({ node, ...props }) => <h4 className="text-base font-bold mt-3 mb-2" {...props} />,
          p: ({ node, ...props }) => <p className="my-3" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-6 my-3" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-6 my-3" {...props} />,
          li: ({ node, ...props }) => <li className="my-1" {...props} />,
          a: ({ node, ...props }) => (
            <a
              className="text-primary underline hover:text-primary/80"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-gray-200 pl-4 italic my-4" {...props} />
          ),
          code: ({ node, inline, ...props }) =>
            inline ? (
              <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm" {...props} />
            ) : (
              <code
                className="block bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-x-auto text-sm my-4"
                {...props}
              />
            ),
          pre: ({ node, ...props }) => <pre className="bg-transparent p-0 overflow-x-auto my-4" {...props} />,
          img: ({ node, ...props }) => (
            <img className="max-w-full h-auto rounded-md my-4" loading="lazy" {...props} alt={props.alt || "Image"} />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full divide-y divide-gray-200 border" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th className="px-4 py-2 bg-gray-100 dark:bg-gray-800 font-medium text-left" {...props} />
          ),
          td: ({ node, ...props }) => <td className="px-4 py-2 border-t" {...props} />,
          hr: ({ node, ...props }) => <hr className="my-6 border-gray-200 dark:border-gray-700" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
