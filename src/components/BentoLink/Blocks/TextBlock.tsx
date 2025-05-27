import BaseBlock from './BaseBlock';
import type { BlockItem } from '@/types';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type React from 'react';

interface TextBlockProps extends BlockItem {
  innerRef?: React.Ref<HTMLDivElement>;
  draggableProps?: Record<string, any>;
  dragHandleProps?: Record<string, any>;
}

export default function TextBlock({ 
  title, 
  content, 
  pastelColor, 
  className,
  innerRef,
  draggableProps,
  dragHandleProps 
}: TextBlockProps) {
  return (
    <BaseBlock 
      pastelColor={pastelColor} 
      className={cn(className)}
      innerRef={innerRef}
      draggableProps={draggableProps}
      dragHandleProps={dragHandleProps}
    >
      <CardHeader>
        {title && <CardTitle className="text-xl font-semibold text-card-foreground">{title}</CardTitle>}
      </CardHeader>
      <CardContent>
        {content && <p className="text-base text-card-foreground/80 whitespace-pre-wrap">{content}</p>}
      </CardContent>
    </BaseBlock>
  );
}
