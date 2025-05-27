
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
import { getLinkThumbnailUrl } from './actions';
import { DragDropContext, type DropResult } from 'react-beautiful-dnd';
import { useToast } from "@/hooks/use-toast";

const initialBlocksData: BlockItem[] = [];

export default function BentoLinkPage() {
  const [blocks, setBlocks] = useState<BlockItem[]>(initialBlocksData);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    // Potential future use: Load blocks from localStorage
    // const savedBlocks = localStorage.getItem('bentoBlocks');
    // if (savedBlocks) {
    //   setBlocks(JSON.parse(savedBlocks));
    // }
  }, []);

  // Potential future use: Save blocks to localStorage
  // useEffect(() => {
  //   if (isMounted) { // Ensure this runs only on client and after initial mount
  //     localStorage.setItem('bentoBlocks', JSON.stringify(blocks));
  //   }
  // }, [blocks, isMounted]);

  const handleAddLink = async () => {
    if (!newLinkUrl.trim()) {
      toast({
        title: "Empty Link",
        description: "Please enter a URL.",
        variant: "destructive",
      });
      return;
    }
    setIsAddingLink(true);

    let normalizedUrl = newLinkUrl.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    try {
      // Validate URL structure
      new URL(normalizedUrl); // This will throw an error if the URL is invalid

      let title = "New Link";
      let hostname = newLinkUrl; // Fallback hostname
      try {
        const urlObj = new URL(normalizedUrl); // Use the already validated normalizedUrl
        hostname = urlObj.hostname.replace(/^www\./, '');
        title = hostname.length > 40 ? hostname.substring(0, 37) + "..." : hostname;
      } catch (e) {
        // This catch is for URL parsing for title/hostname, not for overall validation
        title = newLinkUrl.length > 40 ? newLinkUrl.substring(0, 37) + "..." : newLinkUrl;
        console.warn("Could not parse URL for title, using input string:", newLinkUrl);
      }
      if (!title) title = "Untitled Link";

      const fetchedThumbnailUrl = await getLinkThumbnailUrl(normalizedUrl);
      const isPlaceholder = fetchedThumbnailUrl.includes('placehold.co');

      const newBlock: BlockItem = {
        id: crypto.randomUUID(),
        type: 'link',
        title: title,
        content: normalizedUrl,
        linkUrl: normalizedUrl,
        colSpan: 1,
        thumbnailUrl: fetchedThumbnailUrl,
        thumbnailDataAiHint: isPlaceholder ? 'website thumbnail' : 'retrieved thumbnail',
      };

      setBlocks(prevBlocks => [...prevBlocks, newBlock]);
      setNewLinkUrl('');
    } catch (error: any) {
      if (error instanceof TypeError && error.message.includes('Invalid URL')) {
        toast({
          title: "Invalid Link",
          description: "Please enter a valid URL (e.g., https://example.com).",
          variant: "destructive",
        });
      } else {
        console.error("Failed to add link:", error);
        toast({
          title: "Error Adding Link",
          description: "Could not add the link. Please try again.",
          variant: "destructive",
        });
      }
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

