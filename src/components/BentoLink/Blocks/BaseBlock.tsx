
"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { PastelColor } from '@/types';

interface BaseBlockProps {
  children: React.ReactNode;
  className?: string;
  pastelColor?: PastelColor;
  onClick?: () => void;
  innerRef?: React.Ref<HTMLDivElement>;
  draggableProps?: Record<string, any>;
  dragHandleProps?: Record<string, any>;
}

export default function BaseBlock({ 
  children, 
  className, 
  pastelColor, 
  onClick,
  innerRef,
  draggableProps,
  dragHandleProps 
}: BaseBlockProps) {
  const pastelClassName = pastelColor ? `pastel-${pastelColor}` : '';
  
  return (
    <Card
      ref={innerRef}
      {...draggableProps}
      {...dragHandleProps}
      className={cn(
        'rounded-2xl transition-all duration-300 ease-in-out overflow-hidden', // Removed shadow-lg
        'hover:shadow-xl hover:-translate-y-1',
        onClick ? 'cursor-pointer' : '',
        pastelClassName,
        className
      )}
      onClick={onClick}
    >
      {children}
    </Card>
  );
}
