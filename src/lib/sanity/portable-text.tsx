import { PortableText, toPlainText } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';

import { urlForImage } from './image';

function slugifyHeading(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

type PortableBlock = PortableTextBlock & {
  style?: string;
};

export function getPortableTextToc(blocks: PortableBlock[] = []) {
  return blocks
    .filter((block) =>
      ['h2', 'h3', 'h4'].includes(block.style || '')
    )
    .map((block) => {
      const title = toPlainText([block]).trim();
      const depthMap: Record<string, number> = {
        h2: 2,
        h3: 3,
        h4: 4,
      };

      return {
        depth: depthMap[block.style || 'h2'] || 2,
        title,
        url: `#${slugifyHeading(title)}`,
      };
    })
    .filter((item) => item.title);
}

export function SanityPortableText({
  value,
}: {
  value: PortableBlock[] | undefined;
}) {
  if (!value?.length) {
    return null;
  }

  return (
    <PortableText
      value={value}
      components={{
        block: {
          h2: ({ children, value }) => {
            const title = toPlainText([value]).trim();
            return <h2 id={slugifyHeading(title)}>{children}</h2>;
          },
          h3: ({ children, value }) => {
            const title = toPlainText([value]).trim();
            return <h3 id={slugifyHeading(title)}>{children}</h3>;
          },
          h4: ({ children, value }) => {
            const title = toPlainText([value]).trim();
            return <h4 id={slugifyHeading(title)}>{children}</h4>;
          },
        },
        marks: {
          link: ({ children, value }) => {
            const href = value?.href || '#';
            const isExternal =
              href.startsWith('http://') || href.startsWith('https://');

            return (
              <a
                href={href}
                rel={isExternal ? 'nofollow noopener noreferrer' : undefined}
                target={isExternal ? '_blank' : undefined}
              >
                {children}
              </a>
            );
          },
        },
        types: {
          image: ({ value }) => {
            const imageUrl = value?.asset
              ? urlForImage(value)
                  .width(1600)
                  .fit('max')
                  .auto('format')
                  .url()
              : null;

            if (!imageUrl) {
              return null;
            }

            return (
              <figure className="my-8">
                <img
                  src={imageUrl}
                  alt={value?.alt || ''}
                  className="w-full rounded-2xl object-cover"
                />
                {value?.caption ? (
                  <figcaption className="text-muted-foreground mt-3 text-sm">
                    {value.caption}
                  </figcaption>
                ) : null}
              </figure>
            );
          },
        },
      }}
    />
  );
}
