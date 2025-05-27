
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
import { getLinkThumbnailUrl } from './actions'; // Import the server action

const initialBlocksData: BlockItem[] = [];

export default function BentoLinkPage() {
  const [blocks, setBlocks] = useState<BlockItem[]>(initialBlocksData);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [isAddingLink, setIsAddingLink] = useState(false);

  const handleAddLink = async () => {
    if (!newLinkUrl.trim()) return;
    setIsAddingLink(true);

    let normalizedUrl = newLinkUrl;
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    let title = "New Link";
    let hostname = newLinkUrl; // Fallback hostname
    try {
      const urlObj = new URL(normalizedUrl);
      hostname = urlObj.hostname.replace(/^www\./, '');
      title = hostname.length > 40 ? hostname.substring(0, 37) + "..." : hostname;
    } catch (e) {
      // Fallback for invalid URLs or simple strings
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
      content: normalizedUrl, // Set content to the full URL
      linkUrl: normalizedUrl,
      colSpan: 1,
      thumbnailUrl: fetchedThumbnailUrl,
      thumbnailDataAiHint: isPlaceholder ? 'website thumbnail' : 'retrieved thumbnail',
    };

    setBlocks(prevBlocks => [...prevBlocks, newBlock]);
    setNewLinkUrl('');
    setIsAddingLink(false);
  };

  // Effect to prevent hydration errors with crypto.randomUUID
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // Or a loading spinner
  }

  return (
    <div className="flex flex-col min-h-screen items-center bg-background text-foreground">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <main className="container mx-auto px-4 py-8 md:py-16 max-w-4xl w-full animate-fadeInUp">

        <div className="my-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-xl mx-auto p-4 rounded-lg border shadow-sm">
          <Input
            type="url"
            placeholder="https://your-link.com"
            value={newLinkUrl}
            onChange={(e) => setNewLinkUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !isAddingLink) handleAddLink(); }}
            className="flex-grow text-sm"
            aria-label="Paste link URL to add"
            disabled={isAddingLink}
          />
          <Button onClick={handleAddLink} className="sm:w-auto w-full" disabled={isAddingLink}>
            <Link2 className="mr-2 h-4 w-4" />
            {isAddingLink ? 'Adding...' : 'Add Link'}
          </Button>
        </div>

        <ContentGrid blocks={blocks} />
      </main>
      <Footer />
    </div>
  );
}
