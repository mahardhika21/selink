
import type { BlockItem } from '@/types';
import LinkBlock from './Blocks/LinkBlock';
import ImageBlock from './Blocks/ImageBlock';
import VideoBlock from './Blocks/VideoBlock';
import TextBlock from './Blocks/TextBlock';
import { cn } from '@/lib/utils';

interface ContentGridProps {
  blocks: BlockItem[];
  onDeleteBlock?: (id: string) => void; // Added onDeleteBlock prop
}

export default function ContentGrid({ blocks, onDeleteBlock }: ContentGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-fr">
      {blocks.map((block, index) => {
        // Explicitly check if block itself is null or undefined first
        if (block == null) { 
          console.warn(`Skipping rendering of null or undefined block at index ${index}.`);
          return null; // React handles null children gracefully
        }

        // Then, check if block.type is a valid, non-empty string
        if (typeof block.type !== 'string' || !block.type.trim()) {
          console.warn(`Skipping rendering of block with invalid or missing type at index ${index}:`, block);
          return null;
        }

        // Use block.id for the key if available, otherwise fallback to a unique key with index
        const key = block.id || `block-item-${index}`;

        const blockClassName = cn(
          block.colSpan && `sm:col-span-${Math.min(block.colSpan, 2)} lg:col-span-${block.colSpan}`,
          block.rowSpan && `sm:row-span-${block.rowSpan} lg:row-span-${block.rowSpan}`,
          block.className
        );

        switch (block.type) {
          case 'link':
            return <LinkBlock key={key} {...block} className={blockClassName} onDelete={onDeleteBlock} />;
          case 'image':
            // Assuming ImageBlock might also need onDelete in the future. For now, it doesn't.
            return <ImageBlock key={key} {...block} className={blockClassName} />;
          case 'video':
            return <VideoBlock key={key} {...block} className={blockClassName} />;
          case 'text':
            return <TextBlock key={key} {...block} className={blockClassName} />;
          default:
            console.warn(`Encountered unknown block type: '${block.type}' for block at index ${index}. Block data:`, block);
            return null;
        }
      })}
    </div>
  );
}
