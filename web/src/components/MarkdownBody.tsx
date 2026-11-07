import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownBody({ value }: { value?: string }) {
  if (!value) return null;
  return (
    <div className="prose prose-pt reading-body max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={{
          img: ({ src, alt }) =>
            typeof src === "string" ? (
              <figure>
                <img
                  src={src}
                  alt={alt || ""}
                  loading="lazy"
                  className="h-auto max-w-full rounded-lg"
                />
                {alt && <figcaption>{alt}</figcaption>}
              </figure>
            ) : null,
          a: ({ href, children }) => (
            <a
              href={href}
              rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {value}
      </ReactMarkdown>
    </div>
  );
}
