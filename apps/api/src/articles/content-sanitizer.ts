type BlogImageBlock = {
  type: 'image';
  src: string;
  alt: string;
  caption?: string;
};

type BlogHeadingBlock = {
  type: 'h2' | 'h3';
  text: string;
};

type BlogParagraphBlock = {
  type: 'p';
  text: string;
};

type BlogQuoteBlock = {
  type: 'quote';
  text: string;
  cite?: string;
};

type BlogListBlock = {
  type: 'ul';
  items: string[];
};

type BlogBlock = BlogImageBlock | BlogHeadingBlock | BlogParagraphBlock | BlogQuoteBlock | BlogListBlock;

type BlogContent =
  | {
      format: 'html';
      html: string;
    }
  | {
      format: 'blocks';
      blocks: BlogBlock[];
    };

function collapseWhitespace(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}

function cleanText(input: string): string {
  return collapseWhitespace(input).replace(/[\u0000-\u001F\u007F]/g, '');
}

function sanitizeHtml(input: string): string {
  return input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '')
    .trim();
}

function sanitizeBlock(block: BlogBlock): BlogBlock {
  if (block.type === 'image') {
    return {
      type: 'image',
      src: block.src.trim(),
      alt: cleanText(block.alt),
      caption: block.caption ? cleanText(block.caption) : undefined
    };
  }

  if (block.type === 'ul') {
    return {
      type: 'ul',
      items: block.items.map((item) => cleanText(item)).filter((item) => item.length > 0)
    };
  }

  if (block.type === 'quote') {
    return {
      type: 'quote',
      text: cleanText(block.text),
      cite: block.cite ? cleanText(block.cite) : undefined
    };
  }

  if (block.type === 'p') {
    return {
      type: 'p',
      text: cleanText(block.text)
    };
  }

  return {
    type: block.type,
    text: cleanText(block.text)
  };
}

export function sanitizeContent(content: BlogContent): BlogContent {
  if (content.format === 'html') {
    return {
      format: 'html',
      html: sanitizeHtml(content.html)
    };
  }

  return {
    format: 'blocks',
    blocks: content.blocks.map((block) => sanitizeBlock(block))
  };
}
