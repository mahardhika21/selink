
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
  onDelete,
}: LinkBlockProps) {
  const { toast } = useToast();

  if (!linkUrl) return null;

  const handleCardClick = () => {
    if (linkUrl) {
      window.open(linkUrl, '_blank');
    }
  };

  const handleDeleteClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card click when delete icon is clicked
    if (onDelete && id) {
      onDelete(id);
      toast({
        title: "Link Removed",
        description: `"${title || 'Link'}" has been removed.`,
      });
    }
  };

  return (
    <BaseBlock pastelColor={pastelColor} className={cn("flex flex-col", className)} onClick={handleCardClick}>
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
          "flex flex-row items-center justify-between space-y-0 pb-2 px-4",
          thumbnailUrl ? "pt-4" : "pt-6 px-6" // Adjust padding based on thumbnail presence
        )}
      >
        <div className="flex-shrink-0"> {/* Icon on the left */}
          {iconName && <IconRenderer iconName={iconName} className="h-6 w-6 text-muted-foreground" />}
        </div>

        <div className="flex items-center space-x-1 ml-auto"> {/* Icons on the right */}
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
          "flex-grow flex flex-col justify-end px-4",
          thumbnailUrl ? "pb-4" : "pb-6 px-6" // Adjust padding
        )}
      >
        {title && <CardTitle className="text-xl font-semibold mb-1 text-card-foreground">{title}</CardTitle>}
        {content && <p className="text-xs text-card-foreground/80 line-clamp-1 break-all">{content}</p>}
      </CardContent>
    </BaseBlock>
  );
}
