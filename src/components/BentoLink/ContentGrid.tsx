
"use client";

import type { BlockItem } from '@/types';
import LinkBlock from './Blocks/LinkBlock';
import ImageBlock from './Blocks/ImageBlock';
import VideoBlock from './Blocks/VideoBlock';
import TextBlock from './Blocks/TextBlock';
import { cn } from '@/lib/utils';
import { Droppable, Draggable }  from 'react-beautiful-dnd';
import type React from 'react';

interface ContentGridProps {
  blocks: BlockItem[];
  onDeleteBlock?: (id: string) => void;
  isDndEnabled: boolean;
}

// Internal helper component to render individual blocks
const BlockRenderer = ({
  block,
  index,
  onDeleteBlock,
  innerRef,
  draggableProps,
  dragHandleProps,
}: {
  block: BlockItem; // Assumed to be non-null by the time it reaches here due to filtering in ContentGrid
  index: number;
  onDeleteBlock?: (id: string) => void;
  innerRef?: React.Ref<HTMLDivElement>;
  draggableProps?: Record<string, any>;
  dragHandleProps?: Record<string, any>;
}) => {
  // This first guard for block == null is now more of a safeguard,
  // as ContentGrid filters out nulls.
  if (block == null) { 
    console.warn(`ContentGrid (BlockRenderer): Encountered null/undefined block at index ${index} despite filtering. This should not happen.`);
    if (innerRef) {
      return <div ref={innerRef} {...draggableProps} {...dragHandleProps} className="hidden">Invalid block data (null/undefined)</div>;
    }
    return null;
  }

  // Guard for block.type
  if (typeof block.type !== 'string' || !block.type.trim()) {
    console.warn(`ContentGrid (BlockRenderer): Skipping rendering of block with invalid or missing type at index ${index}:`, block);
    if (innerRef) {
      return <div ref={innerRef} {...draggableProps} {...dragHandleProps} className="hidden">Invalid block data (type)</div>;
    }
    return <div className={cn(block.className, "hidden")}>Invalid block data (type)</div>;
  }

  const blockClassName = cn(
    block.colSpan && `sm:col-span-${Math.min(block.colSpan, 2)} lg:col-span-${block.colSpan}`,
    block.rowSpan && `sm:row-span-${block.rowSpan} lg:row-span-${block.rowSpan}`,
    block.className
  );

  const commonProps = {
    ...block,
    className: blockClassName,
    innerRef,
    draggableProps,
    dragHandleProps,
  };

  switch (block.type) {
    case 'link':
      return <LinkBlock {...commonProps} onDelete={onDeleteBlock} />;
    case 'image':
      return <ImageBlock {...commonProps} />;
    case 'video':
      return <VideoBlock {...commonProps} />;
    case 'text':
      return <TextBlock {...commonProps} />;
    default:
      const typeDisplay = block.type;
      console.warn(`ContentGrid (BlockRenderer): Encountered unknown block type: '${typeDisplay}' for block at index ${index}. Block data:`, block);
      if (innerRef) {
        return <div ref={innerRef} {...draggableProps} {...dragHandleProps} className={blockClassName}>Unsupported block type: {typeDisplay}</div>;
      }
      return <div className={blockClassName}>Unsupported block type: {typeDisplay}</div>;
  }
};

export default function ContentGrid({ blocks: initialBlocks, onDeleteBlock, isDndEnabled }: ContentGridProps) {
  if (!Array.isArray(initialBlocks)) {
    console.error("ContentGrid: `blocks` prop is not an array. Rendering nothing.", initialBlocks);
    return null;
  }

  // Filter out null or undefined blocks right at the beginning
  const validBlocks = initialBlocks.filter(block => {
    if (block == null) {
      // This warning helps identify if null/undefined items are even being passed
      console.warn("ContentGrid: Filtering out a null or undefined block item from the blocks prop.");
      return false;
    }
    if (typeof block.id !== 'string' || !block.id.trim()) {
      console.warn("ContentGrid: Filtering out a block item with missing or invalid 'id'. Block data:", block);
      return false;
    }
    return true;
  });

  if (initialBlocks.length > 0 && validBlocks.length !== initialBlocks.length) {
    console.warn(`ContentGrid: Some items were filtered from blocks prop. Original length: ${initialBlocks.length}, New length: ${validBlocks.length}`);
  }


  if (!isDndEnabled) {
    // Render a static grid if DND is not enabled
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-fr">
        {validBlocks.map((block, index) => ( // Use validBlocks
          <BlockRenderer
            key={block.id} // block.id is guaranteed by the filter
            block={block}  // block is guaranteed to be non-null
            index={index}  // index here is for the filtered array
            onDeleteBlock={onDeleteBlock}
          />
        ))}
      </div>
    );
  }

  // Render DND-enabled grid
  return (
    <Droppable
      droppableId="contentGridBlocks"
      isDropDisabled={false}
      isCombineEnabled={false}
      ignoreContainerClipping={false}
    >
      {(provided) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-fr"
        >
          {validBlocks.map((block, index) => ( // Use validBlocks
            <Draggable key={block.id} draggableId={block.id} index={index}>
              {(providedDraggable) => (
                <BlockRenderer
                  block={block} // block is guaranteed to be non-null and have a valid id
                  index={index}
                  onDeleteBlock={onDeleteBlock}
                  innerRef={providedDraggable.innerRef}
                  draggableProps={providedDraggable.draggableProps}
                  dragHandleProps={providedDraggable.dragHandleProps}
                />
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}
