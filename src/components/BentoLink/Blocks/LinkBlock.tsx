
"use client";

import React, { useState, useRef } from 'react';
import { Trash2, MoreVertical, QrCode, Copy, Download, Edit3 } from 'lucide-react';
import BaseBlock from './BaseBlock';
import type { BlockItem, Category } from '@/types';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
import { QRCodeSVG } from 'qrcode.react';


interface LinkBlockProps extends BlockItem {
  onDelete?: (id: string) => void;
  onUpdateThumbnail?: (blockId: string, newThumbnailUrl: string | null) => void;
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
  onUpdateThumbnail,
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
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const qrCodeSvgRef = useRef<HTMLDivElement>(null);
  const [isEditThumbnailModalOpen, setIsEditThumbnailModalOpen] = useState(false);
  const [newThumbnailInputUrl, setNewThumbnailInputUrl] = useState(thumbnailUrl || '');


  if (!linkUrl && !isSelectionModeActive) return null;

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
    event.stopPropagation();
    onToggleBlockSelection(id);
  };

  const handleQrCodeClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsQrModalOpen(true);
  };

  const handleCopyUrl = async () => {
    if (!linkUrl) return;
    try {
      await navigator.clipboard.writeText(linkUrl);
      toast({
        title: "URL Copied!",
        description: "The link URL has been copied to your clipboard.",
      });
    } catch (err) {
      console.error('Failed to copy URL: ', err);
      toast({
        title: "Copy Failed",
        description: "Could not copy the URL. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadQrCode = () => {
    if (qrCodeSvgRef.current) {
      const svgElement = qrCodeSvgRef.current.querySelector('svg');
      if (svgElement && linkUrl) {
        const serializer = new XMLSerializer();
        let svgString = serializer.serializeToString(svgElement);

        // Ensure width/height attributes are present for canvas rendering
        const declaredWidth = svgElement.getAttribute('width');
        const declaredHeight = svgElement.getAttribute('height');
        const size = declaredWidth || '200'; // Fallback size

        if (!svgString.includes('width=') || !svgString.includes('height=')) {
            svgString = svgString.replace('<svg', `<svg width="${size}" height="${size}"`);
        }
        
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          // Use naturalWidth/Height if available, otherwise fallback to attribute or default
          canvas.width = img.naturalWidth || parseInt(declaredWidth || '200', 10);
          canvas.height = img.naturalHeight || parseInt(declaredHeight || '200', 10);

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#FFFFFF'; // Always fill background with white for PNG
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height); // Draw image to fit canvas
            
            const pngUrl = canvas.toDataURL('image/png');

            const downloadLink = document.createElement('a');
            const safeTitle = (title || linkUrl.split('/').pop() || 'qrcode').replace(/[^a-z0-9_.-]/gi, '_').substring(0, 50);
            downloadLink.href = pngUrl;
            downloadLink.download = `${safeTitle}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);

          } else {
            toast({ title: "Download Error", description: "Could not create canvas context for QR code.", variant: "destructive" });
          }
        };
        img.onerror = (e) => {
          console.error("Image load error for QR download:", e);
          toast({
            title: "Download Failed",
            description: "Could not load QR code image for download. Check console for errors.",
            variant: "destructive",
          });
        };
        // Use unescape(encodeURIComponent(svgString)) for proper UTF-8 handling if SVG contains special characters
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
      } else {
         toast({
          title: "Download Failed",
          description: "QR Code SVG element not found or link URL is missing.",
          variant: "destructive",
        });
      }
    }
  };

  const handleOpenEditThumbnailModal = (event: React.MouseEvent) => {
    event.stopPropagation();
    setNewThumbnailInputUrl(thumbnailUrl || ''); 
    setIsEditThumbnailModalOpen(true);
  };

  const handleSaveThumbnail = () => {
    if (onUpdateThumbnail && id) {
      onUpdateThumbnail(id, newThumbnailInputUrl.trim() === '' ? null : newThumbnailInputUrl.trim());
    }
    setIsEditThumbnailModalOpen(false);
  };

  const proxiedThumbnailUrl = thumbnailUrl ? `/api/image-proxy?url=${encodeURIComponent(thumbnailUrl)}` : null;

  return (
    <>
      <BaseBlock
        pastelColor={pastelColor}
        className={cn(
          "flex flex-col",
          className,
          isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
        )}
        onClick={handleCardClick}
        innerRef={innerRef}
        draggableProps={draggableProps}
        dragHandleProps={dragHandleProps}
      >
        <div
          className={cn(
            "absolute top-2 left-2 z-20 h-7 w-7 flex items-center justify-center rounded-full bg-card/60 backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100",
            { "opacity-100": isSelected }
          )}
          onClick={handleCheckboxWrapperClick}
        >
          <Checkbox
            checked={isSelected}
            aria-label={`Select link ${title || 'Untitled'}`}
            className="h-4 w-4 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
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
                 if (onUpdateThumbnail && id) { // Optionally clear thumbnail if it fails to load
                    onUpdateThumbnail(id, null);
                    toast({
                        title: "Thumbnail Error",
                        description: `Could not load thumbnail for "${title}". It has been removed.`,
                        variant: "destructive"
                    });
                }
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
              <div className="w-4 h-4" /> // Placeholder for alignment
            )}
          </div>

          <div className="flex-shrink-0 flex items-center gap-1">
            {linkUrl && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={handleQrCodeClick}
                aria-label="Show QR Code"
                title="Show QR Code"
              >
                <QrCode className="h-4 w-4" />
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={(e) => e.stopPropagation()}>
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onSelect={handleOpenEditThumbnailModal} className="gap-2">
                  <Edit3 className="h-4 w-4" />
                  Edit Thumbnail
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Move to Category</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {categories.map((category) => (
                  <DropdownMenuItem key={category.id} onSelect={() => handleCategorySelect(category.id)}>
                    {category.name}
                  </DropdownMenuItem>
                ))}
                {categories.length > 0 && <DropdownMenuSeparator />}
                <DropdownMenuItem onSelect={() => handleCategorySelect(null)}>
                  Remove from Category
                </DropdownMenuItem>
                 {onDelete && id && (
                   <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={handleDeleteClick} className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive">
                        <Trash2 className="h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                   </>
                 )}
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Remove original delete button, it's now in dropdown */}
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

      {linkUrl && (
        <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Scan QR Code</DialogTitle>
              <DialogDescription>
                Scan this code with your smartphone to open the link.
              </DialogDescription>
            </DialogHeader>
            <div ref={qrCodeSvgRef} className="flex flex-col items-center justify-center py-4">
              <QRCodeSVG value={linkUrl} size={200} bgColor={"#ffffff"} fgColor={"#000000"} level={"L"} includeMargin={true} />
              <div className="mt-4 flex items-center justify-center w-full max-w-xs">
                <p className="text-xs text-muted-foreground break-all text-center flex-grow overflow-hidden text-ellipsis whitespace-nowrap">
                  {linkUrl}
                </p>
                <Button variant="ghost" size="icon" onClick={handleCopyUrl} className="ml-2 flex-shrink-0 h-7 w-7">
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Copy URL</span>
                </Button>
              </div>
            </div>
            <DialogFooter className="sm:justify-center gap-2">
              <Button type="button" onClick={handleDownloadQrCode} className="gap-1">
                <Download className="h-4 w-4" />
                Download QR
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={isEditThumbnailModalOpen} onOpenChange={setIsEditThumbnailModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Thumbnail</DialogTitle>
            <DialogDescription>
              Enter the URL for the new thumbnail image. Leave blank to remove the current thumbnail.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="url"
              placeholder="https://example.com/image.png"
              value={newThumbnailInputUrl}
              onChange={(e) => setNewThumbnailInputUrl(e.target.value)}
              className="text-sm"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveThumbnail}>
              Save Thumbnail
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

