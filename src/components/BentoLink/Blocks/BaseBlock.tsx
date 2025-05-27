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
}

export default function BaseBlock({ children, className, pastelColor, onClick }: BaseBlockProps) {
  const pastelClassName = pastelColor ? `pastel-${pastelColor}` : '';
  
  return (
    <Card
      className={cn(
        'rounded-2xl shadow-lg transition-all duration-300 ease-in-out overflow-hidden',
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
