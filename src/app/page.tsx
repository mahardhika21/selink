
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
const initialBlocksData: BlockItem[] = [
  {
    id: '1',
    type: 'link',
    title: 'My Portfolio',
    content: 'Check out my latest projects and case studies.',
    linkUrl: '#',
    iconName: 'Link',
    colSpan: 1,
    pastelColor: 'blue',
  },
  {
    id: '2',
    type: 'image',
    imageUrl: 'https://placehold.co/600x400.png',
    imageAlt: 'Abstract design',
    colSpan: 2,
    rowSpan: 1,
    linkUrl: '#',
    dataAiHint: 'abstract design'
  },
  {
    id: '3',
    type: 'video',
    title: 'Product Demo',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    colSpan: 2,
    rowSpan: 1,
    pastelColor: 'mint',
  },
   {
    id: '4',
    type: 'link',
    title: 'Follow me on Twitter',
    content: 'Stay updated with my thoughts and activities.',
    linkUrl: 'https://twitter.com',
    iconName: 'Twitter',
    colSpan: 1,
  },
  {
    id: '5',
    type: 'text',
    title: 'About Me',
    content: "I'm passionate about creating beautiful and functional digital experiences. With a background in design and development, I strive to build products that not only look good but also solve real-world problems. \n\nLet's connect!",
    colSpan: 1,
    rowSpan: 2,
    pastelColor: 'peach',
  },
  {
    id: '6',
    type: 'image',
    imageUrl: 'https://placehold.co/400x600.png',
    imageAlt: 'Vertical abstract design',
    colSpan: 1,
    rowSpan: 2,
    pastelColor: 'yellow',
    dataAiHint: 'vertical pattern'
  },
  {
    id: '7',
    type: 'link',
    title: 'Latest Blog Post',
    content: 'Read my insights on modern web development trends.',
    linkUrl: '#',
    iconName: 'MessageSquare',
    colSpan: 1,
  },
  {
    id: '8',
    type: 'link',
    title: 'GitHub Profile',
    content: 'Explore my open-source contributions.',
    linkUrl: 'https://github.com',
    iconName: 'Github',
    colSpan: 1,
    pastelColor: 'lavender',
  },
  {
    id: '9',
    type: 'link',
    title: 'Watch my Talk',
    iconName: 'MonitorPlay',
    linkUrl: 'https://youtube.com',
    colSpan: 1,
  }
];

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
