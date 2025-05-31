
"use client";

import type React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Trash2, FolderOutput } from 'lucide-react';
import type { Category } from '@/types';

interface BulkActionsBarProps {
  count: number;
  categories: Category[];
  onDelete: () => void;
  onMove: (categoryId: string | null) => void;
}

export default function BulkActionsBar({ count, categories, onDelete, onMove }: BulkActionsBarProps) {
  if (count === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl h-16 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          {count} item{count > 1 ? 's' : ''} selected
        </span>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <FolderOutput className="h-4 w-4" />
                Move to
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Move selected to</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {categories.map((category) => (
                <DropdownMenuItem key={category.id} onSelect={() => onMove(category.id)}>
                  {category.name}
                </DropdownMenuItem>
              ))}
              {categories.length > 0 && <DropdownMenuSeparator />}
              <DropdownMenuItem onSelect={() => onMove(null)}>
                Uncategorized
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="destructive" size="sm" onClick={onDelete} className="gap-1.5">
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
