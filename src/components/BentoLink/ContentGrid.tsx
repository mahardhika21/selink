
import type { BlockItem } from '@/types';
import LinkBlock from './Blocks/LinkBlock';
import ImageBlock from './Blocks/ImageBlock';
import VideoBlock from './Blocks/VideoBlock';
import TextBlock from './Blocks/TextBlock';
import { cn } from '@/lib/utils';

interface ContentGridProps {
  blocks: BlockItem[];
}

export default function ContentGrid({ blocks }: ContentGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-fr">
      {blocks.map((block) => {
        // Add a check for block and block.type
        if (!block || typeof block.type === 'undefined') {
          console.warn('Skipping rendering of invalid block:', block);
          return null;
        }

        const blockClassName = cn(
          block.colSpan && `sm:col-span-${Math.min(block.colSpan, 2)} lg:col-span-${block.colSpan}`,
          block.rowSpan && `sm:row-span-${block.rowSpan} lg:row-span-${block.rowSpan}`,
          block.className
        );

        switch (block.type) {
          case 'link':
            return <LinkBlock key={block.id} {...block} className={blockClassName} />;
          case 'image':
            return <ImageBlock key={block.id} {...block} className={blockClassName} />;
          case 'video':
            return <VideoBlock key={block.id} {...block} className={blockClassName} />;
          case 'text':
            return <TextBlock key={block.id} {...block} className={blockClassName} />;
          default:
            // It's good practice to handle unknown types, though our check above should catch missing types.
            console.warn('Encountered unknown block type:', block.type);
            return null;
        }
      })}
    </div>
  );
}
