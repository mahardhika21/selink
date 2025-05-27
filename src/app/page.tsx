import { Github, Instagram, Linkedin, Link as LinkIcon, MessageSquare, MonitorPlay, Twitter, Youtube, Image as ImageIcon, FileText } from 'lucide-react';
import Header from '@/components/BentoLink/Header';
import ContentGrid from '@/components/BentoLink/ContentGrid';
import Footer from '@/components/BentoLink/Footer';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { BlockItem, SocialLink } from '@/types';

const profileData = {
  name: 'Alex Johnson',
  bio: 'Digital Creator & Tech Enthusiast. Turning ideas into reality, one line of code at a time. Explore my world below!',
  imageUrl: 'https://placehold.co/96x96.png',
  socialLinks: [
    { platform: 'twitter', url: 'https://twitter.com', icon: Twitter },
    { platform: 'instagram', url: 'https://instagram.com', icon: Instagram },
    { platform: 'github', url: 'https://github.com', icon: Github },
    { platform: 'linkedin', url: 'https://linkedin.com', icon: Linkedin },
  ] as SocialLink[],
};

const blocksData: BlockItem[] = [
  {
    id: '1',
    type: 'link',
    title: 'My Portfolio',
    content: 'Check out my latest projects and case studies.',
    linkUrl: '#',
    icon: LinkIcon,
    colSpan: 1,
    pastelColor: 'blue',
  },
  {
    id: '2',
    type: 'image',
    imageUrl: 'https://placehold.co/600x400.png',
    imageAlt: 'Abstract design',
    colSpan: 2,
    rowSpan: 1, // Make this block square-ish on larger screens if combined with colSpan 2
    linkUrl: '#',
    dataAiHint: 'abstract design'
  },
  {
    id: '3',
    type: 'video',
    title: 'Product Demo',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Placeholder video
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
    icon: Twitter,
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
    icon: MessageSquare,
    colSpan: 1,
  },
  {
    id: '8',
    type: 'link',
    title: 'GitHub Profile',
    content: 'Explore my open-source contributions.',
    linkUrl: 'https://github.com',
    icon: Github,
    colSpan: 1,
    pastelColor: 'lavender',
  },
  {
    id: '9',
    type: 'link',
    title: 'Watch my Talk',
    icon: MonitorPlay,
    linkUrl: 'https://youtube.com',
    colSpan: 1,
  }
];

export default function BentoLinkPage() {
  return (
    <div className="flex flex-col min-h-screen items-center bg-background text-foreground">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <main className="container mx-auto px-4 py-8 md:py-16 max-w-4xl w-full animate-fadeInUp">
        <Header {...profileData} />
        <ContentGrid blocks={blocksData} />
      </main>
      <Footer />
    </div>
  );
}
