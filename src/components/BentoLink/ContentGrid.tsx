
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
  if (block == null) { 
    console.warn(`Skipping rendering of null or undefined block at index ${index}.`);
    return null;
  }
  if (typeof block.type !== 'string' || !block.type.trim()) {
    console.warn(`Skipping rendering of block with invalid or missing type at index ${index}:`, block);
    return null;
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
      const typeDisplay = block && typeof block.type === 'string' ? block.type : 'unknown';
      console.warn(`Encountered unknown block type: '${typeDisplay}' for block at index ${index}. Block data:`, block);
      if (innerRef) {
        return <div ref={innerRef} {...draggableProps} {...dragHandleProps} className={blockClassName}>Unsupported block type</div>;
      }
      return <div className={blockClassName}>Unsupported block type</div>;
  }
};

export default function ContentGrid({ blocks, onDeleteBlock, isDndEnabled }: ContentGridProps) {
  if (!isDndEnabled) {
    // Render a static grid if DND is not enabled
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-fr">
        {blocks.map((block, index) => {
          // Robust check for static grid items
          if (!block) {
            console.warn(`ContentGrid (static): Skipping rendering of null/undefined block at index ${index}.`);
            return null;
          }
          const key = (typeof block.id === 'string' && block.id.trim()) ? block.id : `static-block-${index}`;
          
          return (
            <BlockRenderer
              key={key}
              block={block} // block is confirmed non-null here
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
    <Droppable droppableId="contentGridBlocks" isDropDisabled={false}>
      {(provided) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-fr"
        >
          {blocks.map((block, index) => {
            if (block == null || typeof block.id !== 'string' || !block.id.trim()) {
                console.warn(`ContentGrid (DND): Skipping draggable block due to null or invalid id at index ${index}:`, block);
                return null;
            }
            return (
              <Draggable key={block.id} draggableId={block.id} index={index}>
                {(providedDraggable) => (
                  <BlockRenderer
                    block={block}
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
