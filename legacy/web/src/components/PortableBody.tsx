import { PortableText, type PortableTextComponents } from "@portabletext/react";
import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null;
      const url = urlFor(value).width(1200).auto("format").url();
      return (
        <figure className="my-6">
          <Image
            src={url}
            alt={value.alt || ""}
            width={1200}
            height={800}
            className="h-auto w-full rounded"
          />
          {value.alt && (
            <figcaption className="mt-2 text-center text-xs text-ink-500">{value.alt}</figcaption>
          )}
        </figure>
      );
    },
  },
  marks: {
    link: ({ value, children }) => (
      <a href={value?.href} target="_blank" rel="noreferrer">
        {children}
      </a>
    ),
  },
};

export function PortableBody({ value }: { value: unknown }) {
  if (!value) return null;
  return (
    <div className="prose prose-pt max-w-none prose-headings:font-serif">
      <PortableText value={value as never} components={components} />
    </div>
  );
}
