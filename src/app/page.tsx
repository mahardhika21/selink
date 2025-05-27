
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

const initialBlocksData: BlockItem[] = []; 

export default function BentoLinkPage() {
  const [blocks, setBlocks] = useState<BlockItem[]>(initialBlocksData); 
  const [newLinkUrl, setNewLinkUrl] = useState(''); 

  const handleAddLink = () => {
    if (!newLinkUrl.trim()) return;

    let title = "New Link";
    let hostname = newLinkUrl;
    try {
      const url = new URL(newLinkUrl.startsWith('http') ? newLinkUrl : `https://${newLinkUrl}`);
      hostname = url.hostname.replace(/^www\./, '');
      title = hostname.length > 40 ? hostname.substring(0, 37) + "..." : hostname;
    } catch (e) {
      // Fallback for invalid URLs or simple strings
      title = newLinkUrl.length > 40 ? newLinkUrl.substring(0, 37) + "..." : newLinkUrl;
    }
    if (!title) title = "Untitled Link";


    const newBlock: BlockItem = {
      id: crypto.randomUUID(),
      type: 'link',
      title: title,
      content: `Visit ${hostname}`,
      linkUrl: newLinkUrl.startsWith('http') ? newLinkUrl : `https://${newLinkUrl}`,
      colSpan: 1,
      thumbnailUrl: 'https://placehold.co/300x150.png', // Placeholder thumbnail
      thumbnailDataAiHint: 'website thumbnail', // AI hint for the placeholder thumbnail
    };

    setBlocks(prevBlocks => [...prevBlocks, newBlock]);
    setNewLinkUrl('');
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
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddLink(); }}
            className="flex-grow text-sm"
            aria-label="Paste link URL to add"
          />
          <Button onClick={handleAddLink} className="sm:w-auto w-full">
            <Link2 className="mr-2 h-4 w-4" />
            Add Link
          </Button>
        </div>
        
        <ContentGrid blocks={blocks} /> 
      </main>
      <Footer />
    </div>
  );
}
