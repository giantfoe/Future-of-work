/**
 * Utility functions for working with Markdown content
 */

/**
 * Sanitize and prepare Markdown content
 * @param content The content to sanitize
 * @returns Sanitized Markdown content
 */
export function sanitizeMarkdownContent(content: string | undefined): string {
  if (!content) return ""

  // If content is already in Markdown format, return it as is
  if (typeof content === "string" && !content.startsWith("<")) {
    return content
  }

  // If content is in HTML format (from Airtable rich text), return it as is
  // Our Markdown renderer can handle HTML with rehype-raw
  return content
}

/**
 * Convert plain text to Markdown
 * This is useful for converting plain text to Markdown format
 * @param text The plain text to convert
 * @returns Markdown formatted text
 */
export function textToMarkdown(text: string | undefined): string {
  if (!text) return ""

  // Replace line breaks with Markdown line breaks
  return text.replace(/\n/g, "  \n")
}

/**
 * Extract a plain text summary from Markdown content
 * @param markdown The Markdown content
 * @param maxLength Maximum length of the summary
 * @returns Plain text summary
 */
export function extractSummaryFromMarkdown(markdown: string | undefined, maxLength = 150): string {
  if (!markdown) return ""

  // Remove Markdown formatting
  const plainText = markdown
    .replace(/#+\s+/g, "") // Remove headings
    .replace(/\*\*|\*|~~|__|\[|\]|$$|$$|`/g, "") // Remove formatting characters
    .replace(/\n/g, " ") // Replace line breaks with spaces
    .replace(/\s+/g, " ") // Replace multiple spaces with a single space
    .trim()

  // Truncate to maxLength
  if (plainText.length <= maxLength) return plainText

  return plainText.substring(0, maxLength) + "..."
}
