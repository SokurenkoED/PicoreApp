import type { BlogArticleContent } from '@/types/api';

function resolveImageSrc(src: string): string {
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
    return src;
  }
  return src.startsWith('/') ? src : `/${src}`;
}

export function BlogArticleContentView({ content }: { content: BlogArticleContent }) {
  if (content.format === 'html') {
    return (
      <div
        className="blog-richtext"
        dangerouslySetInnerHTML={{ __html: content.html }}
      />
    );
  }

  return (
    <div className="blog-richtext">
      {content.blocks.map((block, index) => {
        if (block.type === 'h2') {
          return (
            <h2 key={`${block.type}-${index}`} className="display text-3xl font-bold leading-tight sm:text-4xl">
              {block.text}
            </h2>
          );
        }

        if (block.type === 'h3') {
          return (
            <h3 key={`${block.type}-${index}`} className="display text-2xl font-bold leading-tight sm:text-3xl">
              {block.text}
            </h3>
          );
        }

        if (block.type === 'p') {
          return (
            <p key={`${block.type}-${index}`} className="text-base leading-relaxed text-[#1d2835] sm:text-lg">
              {block.text}
            </p>
          );
        }

        if (block.type === 'quote') {
          return (
            <figure key={`${block.type}-${index}`} className="blog-quote">
              <blockquote className="display text-2xl leading-tight text-[#131b25] sm:text-3xl">
                {block.text}
              </blockquote>
              {block.cite ? <figcaption className="mt-2 text-sm text-black/60">{block.cite}</figcaption> : null}
            </figure>
          );
        }

        if (block.type === 'ul') {
          return (
            <ul key={`${block.type}-${index}`} className="blog-list">
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }

        if (block.type === 'image') {
          return (
            <figure key={`${block.type}-${index}`} className="blog-image-block">
              <img src={resolveImageSrc(block.src)} alt={block.alt} className="h-full w-full object-cover" />
              {block.caption ? <figcaption>{block.caption}</figcaption> : null}
            </figure>
          );
        }

        return null;
      })}
    </div>
  );
}
