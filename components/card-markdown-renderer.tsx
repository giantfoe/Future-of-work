"use client"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeSanitize from "rehype-sanitize"
import { cn } from "@/lib/utils"

interface CardMarkdownRendererProps {
  content: string
  className?: string
  truncate?: boolean
  maxLines?: number
}

export default function CardMarkdownRenderer({
  content,
  className,
  truncate = true,
  maxLines = 3,
}: CardMarkdownRendererProps) {
  if (!content) return null

  // Create class for truncation if needed
  const truncateClass = truncate
    ? `overflow-hidden ${maxLines === 1 ? "text-ellipsis whitespace-nowrap" : `line-clamp-${maxLines}`}`
    : ""

  return (
    <div className={cn("card-markdown-content prose-sm max-w-none", truncateClass, className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]} // Supports GitHub Flavored Markdown
        rehypePlugins={[rehypeSanitize]} // Sanitizes HTML for security
        components={{
          // Simplified components for card display
          h1: ({ node, ...props }) => <p className="font-bold text-base" {...props} />,
          h2: ({ node, ...props }) => <p className="font-bold text-base" {...props} />,
          h3: ({ node, ...props }) => <p className="font-bold text-base" {...props} />,
          h4: ({ node, ...props }) => <p className="font-bold text-base" {...props} />,
          h5: ({ node, ...props }) => <p className="font-bold text-base" {...props} />,
          h6: ({ node, ...props }) => <p className="font-bold text-base" {...props} />,
          p: ({ node, ...props }) => <p className="text-sm" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-4 text-sm" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-4 text-sm" {...props} />,
          li: ({ node, ...props }) => <li className="text-sm" {...props} />,
          a: ({ node, ...props }) => (
            <a
              className="text-primary underline hover:text-primary/80"
              onClick={(e) => e.stopPropagation()} // Prevent card click when clicking links
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          // Simplify or remove complex elements that don't work well in cards
          blockquote: ({ node, ...props }) => <p className="text-sm italic" {...props} />,
          code: ({ node, inline, ...props }) =>
            inline ? <code className="text-xs bg-gray-100 px-1 rounded" {...props} /> : null,
          pre: () => null, // Remove code blocks entirely from cards
          img: () => null, // Remove images from cards to save space
          table: () => null, // Remove tables from cards
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
