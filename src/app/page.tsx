
"use client"; // <-- Added: Make this a client component

import { useState } from 'react'; // <-- Added
import type { FormEvent } from 'react'; // <-- Added (though not strictly used if not using a form element)
import Header from '@/components/BentoLink/Header';
import ContentGrid from '@/components/BentoLink/ContentGrid';
import Footer from '@/components/BentoLink/Footer';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { BlockItem, SocialLink } from '@/types';
import { Input } from '@/components/ui/input'; // <-- Added
import { Button } from '@/components/ui/button'; // <-- Added
import { Link2 } from 'lucide-react'; // <-- Added for button icon

const profileData = {
  name: 'Alex Johnson',
  bio: 'Digital Creator & Tech Enthusiast. Turning ideas into reality, one line of code at a time. Explore my world below!',
  imageUrl: 'https://placehold.co/96x96.png',
  socialLinks: [
    { platform: 'twitter', url: 'https://twitter.com', iconName: 'Twitter' },
    { platform: 'instagram', url: 'https://instagram.com', iconName: 'Instagram' },
    { platform: 'github', url: 'https://github.com', iconName: 'Github' },
    { platform: 'linkedin', url: 'https://linkedin.com', iconName: 'Linkedin' },
  ] as SocialLink[],
};

// Renamed to initialBlocksData
const initialBlocksData: BlockItem[] = []; // <-- Changed to empty array

export default function BentoLinkPage() {
  const [blocks, setBlocks] = useState<BlockItem[]>(initialBlocksData); // <-- State for blocks
  const [newLinkUrl, setNewLinkUrl] = useState(''); // <-- State for new link input

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
      iconName: 'Link',
      colSpan: 1,
    };

    setBlocks(prevBlocks => [...prevBlocks, newBlock]);
    setNewLinkUrl('');
  };

  return (
    <div className="flex flex-col min-h-screen items-center bg-background text-foreground">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <main className="container mx-auto px-4 py-8 md:py-16 max-w-4xl w-full animate-fadeInUp">
        <Header {...profileData} />

        {/* --- New Paste Link Section --- */}
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
        {/* --- End New Paste Link Section --- */}

        <ContentGrid blocks={blocks} /> {/* Use state variable here */}
      </main>
      <Footer />
    </div>
  );
}
