
"use client";

import type { BlockItem, Category } from '@/types';
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
  categories: Category[];
  onAssignCategoryToBlock: (blockId: string, categoryId: string | null) => void;
  selectedBlockIds: string[];
  onToggleBlockSelection: (blockId: string) => void;
}

const BlockRenderer = ({
  block,
  index,
  onDeleteBlock,
  categories,
  onAssignCategoryToBlock,
  selectedBlockIds,
  onToggleBlockSelection,
  innerRef,
  draggableProps,
  dragHandleProps,
}: {
  block: BlockItem; 
  index: number;
  onDeleteBlock?: (id: string) => void;
  categories: Category[];
  onAssignCategoryToBlock: (blockId: string, categoryId: string | null) => void;
  selectedBlockIds: string[];
  onToggleBlockSelection: (blockId: string) => void;
  innerRef?: React.Ref<HTMLDivElement>;
  draggableProps?: Record<string, any>;
  dragHandleProps?: Record<string, any>;
}) => {
  if (block == null) { 
    console.warn(`ContentGrid (BlockRenderer): Encountered null/undefined block at index ${index} despite filtering. This should not happen.`);
    if (innerRef) {
      return <div ref={innerRef} {...draggableProps} {...dragHandleProps} className="hidden">Invalid block data (null/undefined)</div>;
    }
    return null; 
  }

  if (typeof block.type !== 'string' || !block.type.trim()) {
    console.warn(`ContentGrid (BlockRenderer): Skipping rendering of block with invalid or missing type at index ${index}:`, block);
    const typeDisplay = typeof block.type === 'string' ? `'${block.type}'` : String(block.type);
    if (innerRef) {
      return <div ref={innerRef} {...draggableProps} {...dragHandleProps} className={cn(block.className, "p-4 border border-dashed border-destructive/50 text-destructive text-xs")}>Invalid block type: {typeDisplay}</div>;
    }
    return <div className={cn(block.className, "p-4 border border-dashed border-destructive/50 text-destructive text-xs")}>Invalid block type: {typeDisplay}</div>;
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
    selectedBlockIds, // Pass down for LinkBlock
    onToggleBlockSelection, // Pass down for LinkBlock
  };

  switch (block.type) {
    case 'link':
      return <LinkBlock 
                {...commonProps} 
                onDelete={onDeleteBlock} 
                categories={categories}
                onAssignCategoryToBlock={onAssignCategoryToBlock}
              />;
    case 'image':
      // For now, selection is only on LinkBlock. If needed for other types, pass props here too.
      return <ImageBlock {...commonProps} />;
    case 'video':
      return <VideoBlock {...commonProps} />;
    case 'text':
      return <TextBlock {...commonProps} />;
    default:
      const unknownTypeDisplay = block.type;
      console.warn(`ContentGrid (BlockRenderer): Encountered unknown block type: '${unknownTypeDisplay}' for block at index ${index}. Block data:`, block);
      if (innerRef) {
        return <div ref={innerRef} {...draggableProps} {...dragHandleProps} className={cn(blockClassName, "p-4 border border-dashed border-amber-500/50 text-amber-600 text-xs")}>Unsupported block type: {unknownTypeDisplay}</div>;
      }
      return <div className={cn(blockClassName, "p-4 border border-dashed border-amber-500/50 text-amber-600 text-xs")}>Unsupported block type: {unknownTypeDisplay}</div>;
  }
};

export default function ContentGrid({ 
  blocks: initialBlocks, 
  onDeleteBlock, 
  isDndEnabled,
  categories,
  onAssignCategoryToBlock,
  selectedBlockIds,
  onToggleBlockSelection,
}: ContentGridProps) {
  if (!Array.isArray(initialBlocks)) {
    console.error("ContentGrid: `blocks` prop is not an array. Rendering nothing.", initialBlocks);
    return null;
  }

  const validBlocks = initialBlocks.filter(block => {
    if (block == null) {
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
    console.warn(`ContentGrid: Some items were filtered from blocks prop. Original length: ${initialBlocks.length}, Filtered length: ${validBlocks.length}`);
  }


  if (!isDndEnabled) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-fr">
        {validBlocks.map((block, index) => ( 
          <BlockRenderer
            key={block.id} 
            block={block} 
            index={index} 
            onDeleteBlock={onDeleteBlock}
            categories={categories}
            onAssignCategoryToBlock={onAssignCategoryToBlock}
            selectedBlockIds={selectedBlockIds}
            onToggleBlockSelection={onToggleBlockSelection}
          />
        ))}
      </div>
    );
  }

  return (
    <Droppable
      droppableId="contentGridBlocks"
      isDropDisabled={!isDndEnabled} // Use the prop here
      isCombineEnabled={false}
      ignoreContainerClipping={false}
    >
      {(provided) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-fr"
        >
          {validBlocks.map((block, index) => ( 
            <Draggable key={block.id} draggableId={block.id} index={index} isDragDisabled={!isDndEnabled || selectedBlockIds.includes(block.id)}>
              {(providedDraggable) => (
                <BlockRenderer
                  block={block} 
                  index={index}
                  onDeleteBlock={onDeleteBlock}
                  categories={categories}
                  onAssignCategoryToBlock={onAssignCategoryToBlock}
                  selectedBlockIds={selectedBlockIds}
                  onToggleBlockSelection={onToggleBlockSelection}
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

