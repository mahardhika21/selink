import BaseBlock from './BaseBlock';
import type { BlockItem } from '@/types';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TextBlockProps extends BlockItem {}

export default function TextBlock({ title, content, pastelColor, className }: TextBlockProps) {
  return (
    <BaseBlock pastelColor={pastelColor} className={cn(className)}>
      <CardHeader>
        {title && <CardTitle className="text-xl font-semibold text-card-foreground">{title}</CardTitle>}
      </CardHeader>
      <CardContent>
        {content && <p className="text-base text-card-foreground/80 whitespace-pre-wrap">{content}</p>}
      </CardContent>
    </BaseBlock>
  );
}
