"use client";

import { ArrowUpRight } from 'lucide-react';
import BaseBlock from './BaseBlock';
import type { BlockItem } from '@/types';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import IconRenderer from '@/components/IconRenderer';

interface LinkBlockProps extends BlockItem {}

export default function LinkBlock({ title, content, linkUrl, iconName, pastelColor, className }: LinkBlockProps) {
  if (!linkUrl) return null;

  const handleClick = () => {
    if (linkUrl) {
      window.open(linkUrl, '_blank');
    }
  };
  
  return (
    <BaseBlock pastelColor={pastelColor} className={cn("flex flex-col", className)} onClick={handleClick}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        {iconName && <IconRenderer iconName={iconName} className="h-6 w-6 text-muted-foreground" />}
        <ArrowUpRight className="h-5 w-5 text-muted-foreground ml-auto" />
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-end">
        {title && <CardTitle className="text-xl font-semibold mb-1 text-card-foreground">{title}</CardTitle>}
        {content && <p className="text-xs text-card-foreground/80 line-clamp-2">{content}</p>}
      </CardContent>
    </BaseBlock>
  );
}
