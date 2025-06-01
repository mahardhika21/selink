
"use client";

import { Trash2, MoreVertical } from 'lucide-react';
import BaseBlock from './BaseBlock';
import type { BlockItem, Category } from '@/types';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import IconRenderer from '@/components/IconRenderer';
import { useToast } from "@/hooks/use-toast";
import type React from 'react';

interface LinkBlockProps extends BlockItem {
  onDelete?: (id: string) => void;
  innerRef?: React.Ref<HTMLDivElement>;
  draggableProps?: Record<string, any>;
  dragHandleProps?: Record<string, any>;
  categories: Category[];
  onAssignCategoryToBlock: (blockId: string, categoryId: string | null) => void;
  selectedBlockIds: string[];
  onToggleBlockSelection: (blockId: string) => void;
  isSelectionModeActive: boolean;
}

export default function LinkBlock({
  id,
  title,
  content,
  linkUrl,
  iconName,
  pastelColor,
  className,
  thumbnailUrl,
  faviconUrl,
  onDelete,
  categories,
  onAssignCategoryToBlock,
  selectedBlockIds,
  onToggleBlockSelection,
  isSelectionModeActive,
  innerRef,
  draggableProps,
  dragHandleProps,
}: LinkBlockProps) {
  const { toast } = useToast();

  if (!linkUrl && !isSelectionModeActive) return null; // Allow rendering if in selection mode even if linkUrl is somehow null

  const isSelected = selectedBlockIds.includes(id);

  const handleCardClick = () => {
    if (isSelectionModeActive) {
      onToggleBlockSelection(id);
    } else if (linkUrl) {
      window.open(linkUrl, '_blank');
    }
  };

  const handleDeleteClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (onDelete && id) {
      onDelete(id);
      toast({
        title: "Link Removed",
        description: `"${title || 'Link'}" has been removed.`,
      });
    }
  };

  const handleCategorySelect = (categoryId: string | null) => {
    if (id) {
      onAssignCategoryToBlock(id, categoryId);
    }
  };
  
  const handleCheckboxWrapperClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // Important: Prevents card click (navigation or selection toggle)
    onToggleBlockSelection(id);
  };


  const proxiedThumbnailUrl = thumbnailUrl ? `/api/image-proxy?url=${encodeURIComponent(thumbnailUrl)}` : null;

  return (
    <BaseBlock
      pastelColor={pastelColor}
      className={cn(
        "flex flex-col",
        className,
        isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
      )}
      onClick={handleCardClick} // Updated to handle selection mode
      innerRef={innerRef}
      draggableProps={draggableProps}
      dragHandleProps={dragHandleProps}
    >
      <div
        className={cn(
          "absolute top-2 left-2 z-20 h-7 w-7 flex items-center justify-center rounded-full bg-card/60 backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100",
          { "opacity-100": isSelected } // Show if selected
        )}
        onClick={handleCheckboxWrapperClick} // Handles click on checkbox area
      >
        <Checkbox
          checked={isSelected}
          aria-label={`Select link ${title || 'Untitled'}`}
          className="h-4 w-4 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
        />
      </div>

      {proxiedThumbnailUrl && (
        <div className="relative w-full aspect-[2/1] border-b border-card-foreground/10 overflow-hidden">
          <img
            src={proxiedThumbnailUrl}
            alt={title ? `Thumbnail for ${title}` : 'Link thumbnail'}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
      <CardHeader
        className={cn(
          "flex flex-row items-start justify-between space-y-0 pb-2 pt-4 z-10", 
          thumbnailUrl ? "px-4" : "px-6" 
        )}
      >
        <div className="flex-shrink-0 mt-0.5">
          {faviconUrl ? (
            <img
              src={faviconUrl}
              alt=""
              width={16}
              height={16}
              className="rounded"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : iconName ? (
            <IconRenderer iconName={iconName} className="h-5 w-5 text-muted-foreground" />
          ) : (
            <div className="w-4 h-4" /> 
          )}
        </div>

        <div className="flex-shrink-0 flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={(e) => e.stopPropagation()}>
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuLabel>Move to Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {categories.map((category) => (
                <DropdownMenuItem key={category.id} onSelect={() => handleCategorySelect(category.id)}>
                  {category.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => handleCategorySelect(null)}>
                Remove from Category
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {onDelete && id && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDeleteClick}
              aria-label="Delete link"
              title="Delete link"
              className="h-7 w-7 p-1 rounded-md hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <Trash2 className="h-5 w-5 text-muted-foreground hover:text-destructive" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent
        className={cn(
          "flex-grow flex flex-col justify-end",
          thumbnailUrl ? "px-4 pb-4" : "px-6 pb-6"
        )}
      >
        {title && <CardTitle className="text-xl font-semibold mb-1 text-card-foreground line-clamp-2">{title}</CardTitle>}
        {content && <p className="text-xs text-card-foreground/80 line-clamp-1 break-all">{content}</p>}
      </CardContent>
    </BaseBlock>
  );
}

