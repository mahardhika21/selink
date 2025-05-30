
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
  block: BlockItem;
  index: number;
  onDeleteBlock?: (id: string) => void;
  innerRef?: React.Ref<HTMLDivElement>;
  draggableProps?: Record<string, any>;
  dragHandleProps?: Record<string, any>;
}) => {
  // Guards
  if (block == null) { // Checks for both null and undefined
    console.warn(`ContentGrid (BlockRenderer): Skipping rendering of null or undefined block at index ${index}.`);
    // Provide a valid DOM element for react-beautiful-dnd if innerRef is expected
    if (innerRef) {
      return <div ref={innerRef} {...draggableProps} {...dragHandleProps} className="hidden">Invalid block data (null/undefined)</div>;
    }
    return null;
  }
  if (typeof block.type !== 'string' || !block.type.trim()) {
    console.warn(`ContentGrid (BlockRenderer): Skipping rendering of block with invalid or missing type at index ${index}:`, block);
    if (innerRef) {
      // Provide a valid DOM element for react-beautiful-dnd even if the block is invalid
      return <div ref={innerRef} {...draggableProps} {...dragHandleProps} className="hidden">Invalid block data (type)</div>;
    }
    // For static grid or if no innerRef needed for an invalid block
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
      // This const should be safe due to the guards above.
      // If block were null, first guard would hit. If block.type invalid, second guard would hit.
      const typeDisplay = block.type;
      console.warn(`ContentGrid (BlockRenderer): Encountered unknown block type: '${typeDisplay}' for block at index ${index}. Block data:`, block);
      if (innerRef) {
        return <div ref={innerRef} {...draggableProps} {...dragHandleProps} className={blockClassName}>Unsupported block type: {typeDisplay}</div>;
      }
      return <div className={blockClassName}>Unsupported block type: {typeDisplay}</div>;
  }
};

export default function ContentGrid({ blocks, onDeleteBlock, isDndEnabled }: ContentGridProps) {
  if (!Array.isArray(blocks)) {
    console.error("ContentGrid: `blocks` prop is not an array. Rendering nothing.", blocks);
    return null;
  }

  if (!isDndEnabled) {
    // Render a static grid if DND is not enabled
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-fr">
        {blocks.map((block, index) => {
          if (block == null) { // Check for null or undefined
            console.warn(`ContentGrid (static): Skipping rendering of null/undefined block at index ${index}.`);
            return null; // Important to return null to avoid issues with map
          }
          // Ensure key is unique and valid even if id is missing, though id should be present for valid blocks.
          const key = (block && typeof block.id === 'string' && block.id.trim()) ? block.id : `static-block-${index}`;

          return (
            <BlockRenderer
              key={key}
              block={block}
              index={index}
              onDeleteBlock={onDeleteBlock}
            />
          );
        })}
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
          {blocks.map((block, index) => {
            // Ensure block and block.id are valid before rendering Draggable
            if (block == null || typeof block.id !== 'string' || !block.id.trim()) {
                console.warn(`ContentGrid (DND): Skipping draggable block due to null or invalid id at index ${index}:`, block);
                // It's crucial to return something that doesn't break the map,
                // or to filter out such items before mapping if DND library is sensitive.
                // Returning null here is standard for React conditional rendering.
                return null;
            }
            return (
              <Draggable key={block.id} draggableId={block.id} index={index}>
                {(providedDraggable) => (
                  <BlockRenderer
                    block={block} // block is guaranteed to be non-null here due to the check above
                    index={index}
                    onDeleteBlock={onDeleteBlock}
                    innerRef={providedDraggable.innerRef}
                    draggableProps={providedDraggable.draggableProps}
                    dragHandleProps={providedDraggable.dragHandleProps}
                  />
                )}
              </Draggable>
            );
          })}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}

    
