"use client";

import type { BlockItem } from '@/types';
import LinkBlock from './Blocks/LinkBlock';
import ImageBlock from './Blocks/ImageBlock';
import VideoBlock from './Blocks/VideoBlock';
import TextBlock from './Blocks/TextBlock';
import { cn } from '@/lib/utils';
import { Droppable, Draggable } from 'react-beautiful-dnd';

interface ContentGridProps {
  blocks: BlockItem[];
  onDeleteBlock?: (id: string) => void;
}

export default function ContentGrid({ blocks, onDeleteBlock }: ContentGridProps) {
  return (
    <Droppable droppableId="contentGridBlocks">
      {(provided) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-fr"
        >
          {blocks.map((block, index) => {
            if (block == null) { 
              console.warn(`Skipping rendering of null or undefined block at index ${index}.`);
              return null;
            }
            if (typeof block.type !== 'string' || !block.type.trim()) {
              console.warn(`Skipping rendering of block with invalid or missing type at index ${index}:`, block);
              return null;
            }

            const key = block.id || `block-item-${index}`;
            const blockClassName = cn(
              block.colSpan && `sm:col-span-${Math.min(block.colSpan, 2)} lg:col-span-${block.colSpan}`,
              block.rowSpan && `sm:row-span-${block.rowSpan} lg:row-span-${block.rowSpan}`,
              block.className
            );

            return (
              <Draggable key={key} draggableId={block.id} index={index}>
                {(providedDraggable) => {
                  const commonProps = {
                    ...block,
                    className: blockClassName,
                    innerRef: providedDraggable.innerRef,
                    draggableProps: providedDraggable.draggableProps,
                    dragHandleProps: providedDraggable.dragHandleProps,
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
                      return <div ref={providedDraggable.innerRef} {...providedDraggable.draggableProps} {...providedDraggable.dragHandleProps} className={blockClassName}>Unsupported block type</div>;
                  }
                }}
              </Draggable>
            );
          })}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}
