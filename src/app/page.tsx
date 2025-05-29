
"use client";

import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import ContentGrid from '@/components/BentoLink/ContentGrid';
import Footer from '@/components/BentoLink/Footer';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { BlockItem } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link2 } from 'lucide-react';
import { getLinkMetadata } from './actions';
import { DragDropContext, type DropResult } from 'react-beautiful-dnd';
import { useToast } from "@/hooks/use-toast";
import RegisteredHostnamesDialog from '@/components/RegisteredHostnamesDialog';

const initialBlocksData: BlockItem[] = [];

export default function BentoLinkPage() {
  const [blocks, setBlocks] = useState<BlockItem[]>(initialBlocksData);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleAddLink = async () => {
    if (!newLinkUrl.trim()) {
      toast({
        title: "Empty Link",
        description: "Please enter a URL.",
        variant: "destructive",
      });
      return;
    }
    
    let normalizedUrl = newLinkUrl.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    try {
      new URL(normalizedUrl); 
    } catch (_) {
      toast({
        title: "Invalid Link",
        description: "Please enter a valid URL (e.g., https://example.com).",
        variant: "destructive",
      });
      return;
    }

    setIsAddingLink(true);

    try {
      const { 
        thumbnailUrl: fetchedThumbnailUrl, 
        pageTitle: fetchedPageTitle, 
        faviconUrl: fetchedFaviconUrl 
      } = await getLinkMetadata(normalizedUrl);
      
      let displayTitle = "New Link";
      if (fetchedPageTitle && fetchedPageTitle.trim()) {
        displayTitle = fetchedPageTitle.trim();
      } else {
        try {
          const urlObj = new URL(normalizedUrl);
          let hostnameForTitle = urlObj.hostname.replace(/^www\./, '');
          displayTitle = hostnameForTitle.length > 50 ? hostnameForTitle.substring(0, 47) + "..." : hostnameForTitle;
          if (!displayTitle) {
             displayTitle = normalizedUrl.length > 50 ? normalizedUrl.substring(0, 47) + "..." : normalizedUrl;
          }
        } catch (e) {
          displayTitle = normalizedUrl.length > 50 ? normalizedUrl.substring(0, 47) + "..." : normalizedUrl;
        }
      }
       if (!displayTitle) displayTitle = "Untitled Link";

      const newBlock: BlockItem = {
        id: crypto.randomUUID(),
        type: 'link',
        title: displayTitle,
        content: normalizedUrl,
        linkUrl: normalizedUrl,
        colSpan: 1,
        thumbnailUrl: fetchedThumbnailUrl,
        thumbnailDataAiHint: fetchedThumbnailUrl ? 'retrieved thumbnail' : undefined,
        faviconUrl: fetchedFaviconUrl,
      };

      setBlocks(prevBlocks => [...prevBlocks, newBlock]);
      setNewLinkUrl('');
    } catch (error: any) {
        console.error("Failed to add link or fetch metadata:", error);
        toast({
          title: "Error Adding Link",
          description: "Could not fetch link metadata. Please try again.",
          variant: "destructive",
        });
    } finally {
      setIsAddingLink(false);
    }
  };

  const handleDeleteBlock = (idToDelete: string) => {
    setBlocks(prevBlocks => prevBlocks.filter(block => block && block.id !== idToDelete));
  };

  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    setBlocks(currentBlocks => {
      const items = Array.from(currentBlocks);
      const [reorderedItem] = items.splice(source.index, 1);

      if (reorderedItem === undefined) {
        console.error(
            "Drag and drop error: reorderedItem is undefined. " +
            `Source index: ${source.index}, Destination index: ${destination.index}. ` +
            "This could indicate an issue with react-beautiful-dnd or inconsistent block data. " +
            "Reverting to previous block order."
        );
        return currentBlocks;
      }
      
      items.splice(destination.index, 0, reorderedItem);
      return items;
    });
  };

  if (!isMounted) {
    return (
      <div className="flex flex-col min-h-screen items-center bg-background text-foreground">
        <RegisteredHostnamesDialog />
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <main className="container mx-auto px-4 py-8 md:py-16 max-w-4xl w-full animate-fadeInUp">
          <div className="my-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-xl mx-auto p-4 rounded-lg border shadow-sm">
            <Input
              type="url"
              placeholder="Enter Link"
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              className="flex-grow text-sm"
              aria-label="Paste link URL to add"
              disabled={true}
            />
            <Button className="sm:w-auto w-full gap-1" disabled={true}>
              <Link2 className="h-4 w-4" />
              Add Link
            </Button>
          </div>
          <ContentGrid blocks={blocks} onDeleteBlock={handleDeleteBlock} isDndEnabled={false} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <div className="flex flex-col min-h-screen items-center bg-background text-foreground">
        <RegisteredHostnamesDialog />
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <main className="container mx-auto px-4 py-8 md:py-16 max-w-4xl w-full animate-fadeInUp">

          <div className="my-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-xl mx-auto p-4 rounded-lg border shadow-sm">
            <Input
              type="url"
              placeholder="Enter Link"
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !isAddingLink) handleAddLink(); }}
              className="flex-grow text-sm"
              aria-label="Paste link URL to add"
              disabled={isAddingLink}
            />
            <Button onClick={handleAddLink} className="sm:w-auto w-full gap-1" disabled={isAddingLink}>
              <Link2 className="h-4 w-4" />
              {isAddingLink ? 'Adding...' : 'Add Link'}
            </Button>
          </div>

          <ContentGrid blocks={blocks} onDeleteBlock={handleDeleteBlock} isDndEnabled={true} />
        </main>
        <Footer />
      </div>
    </DragDropContext>
  );
}

