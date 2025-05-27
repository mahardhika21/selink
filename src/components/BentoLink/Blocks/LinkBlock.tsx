"use client";

import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import BaseBlock from './BaseBlock';
import type { BlockItem } from '@/types';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import IconRenderer from '@/components/IconRenderer';

interface LinkBlockProps extends BlockItem {}

export default function LinkBlock({
  title,
  content,
  linkUrl,
  iconName,
  pastelColor,
  className,
  thumbnailUrl,
  thumbnailDataAiHint,
}: LinkBlockProps) {
  if (!linkUrl) return null;

  const handleClick = () => {
    if (linkUrl) {
      window.open(linkUrl, '_blank');
    }
  };
  
  return (
    <BaseBlock pastelColor={pastelColor} className={cn("flex flex-col", className)} onClick={handleClick}>
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
        {iconName && <IconRenderer iconName={iconName} className="h-6 w-6 text-muted-foreground" />}
        <ArrowUpRight className="h-5 w-5 text-muted-foreground ml-auto" />
      </CardHeader>
      <CardContent 
        className={cn(
          "flex-grow flex flex-col justify-end px-4",
          thumbnailUrl ? "pb-4" : "pb-6 px-6" // Adjust padding
        )}
      >
        {title && <CardTitle className="text-xl font-semibold mb-1 text-card-foreground">{title}</CardTitle>}
        {content && <p className="text-xs text-card-foreground/80 line-clamp-2">{content}</p>}
      </CardContent>
    </BaseBlock>
  );
}
