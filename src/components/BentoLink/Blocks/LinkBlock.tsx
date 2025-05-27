
"use client";

import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import BaseBlock from './BaseBlock';
import type { BlockItem } from '@/types';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import IconRenderer from '@/components/IconRenderer';
import { useToast } from "@/hooks/use-toast";
import type React from 'react';

interface LinkBlockProps extends BlockItem {
  onDelete?: (id: string) => void;
  innerRef?: React.Ref<HTMLDivElement>;
  draggableProps?: Record<string, any>;
  dragHandleProps?: Record<string, any>;
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
  thumbnailDataAiHint,
  faviconUrl,
  onDelete,
  innerRef,
  draggableProps,
  dragHandleProps,
}: LinkBlockProps) {
  const { toast } = useToast();

  if (!linkUrl) return null;

  const handleCardClick = () => {
    if (linkUrl) {
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

  return (
    <BaseBlock 
      pastelColor={pastelColor} 
      className={cn("flex flex-col", className)} 
      onClick={handleCardClick}
      innerRef={innerRef}
      draggableProps={draggableProps}
      dragHandleProps={dragHandleProps}
    >
      {thumbnailUrl && (
        <div className="relative w-full aspect-[2/1] border-b border-card-foreground/10">
          <Image
            src={thumbnailUrl}
            alt={title ? `Thumbnail for ${title}` : 'Link thumbnail'}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            data-ai-hint={thumbnailDataAiHint || "website thumbnail"}
          />
        </div>
      )}
      <CardHeader
        className={cn(
          "flex flex-row items-center justify-between space-y-0 pb-2",
          thumbnailUrl ? "px-4 pt-4" : "px-6 pt-6"
        )}
      >
        {/* Left Icon: Favicon or fallback iconName */}
        <div className="flex-shrink-0">
          {faviconUrl ? (
            <img
              src={faviconUrl}
              alt="" // Decorative, alt text provided by link title
              width={16}
              height={16}
              className="rounded"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : iconName ? (
            <IconRenderer iconName={iconName} className="h-6 w-6 text-muted-foreground" />
          ) : (
            // Optional: Placeholder for consistent spacing if needed, otherwise an empty div is fine for flexbox
            <div className="w-4 h-4" /> // Ensures space is reserved if delete icon is present
          )}
        </div>
        
        {/* Right Icon: Delete Icon */}
        <div className="flex-shrink-0">
          {onDelete && id && (
            <button
              onClick={handleDeleteClick}
              aria-label="Delete link"
              title="Delete link"
              className="p-1 rounded-md hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <Trash2 className="h-5 w-5 text-muted-foreground hover:text-destructive" />
            </button>
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

