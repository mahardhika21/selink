import BaseBlock from './BaseBlock';
import type { BlockItem } from '@/types';
import { cn } from '@/lib/utils';

interface VideoBlockProps extends BlockItem {}

export default function VideoBlock({ videoUrl, title, pastelColor, className }: VideoBlockProps) {
  if (!videoUrl) return null;

  let embedUrl = videoUrl;
  // Basic check for YouTube URL to convert to embed format
  if (videoUrl.includes("youtube.com/watch?v=")) {
    const videoId = videoUrl.split("v=")[1].split("&")[0];
    embedUrl = `https://www.youtube.com/embed/${videoId}`;
  } else if (videoUrl.includes("youtu.be/")) {
    const videoId = videoUrl.split("youtu.be/")[1].split("?")[0];
    embedUrl = `https://www.youtube.com/embed/${videoId}`;
  }
  // Add TikTok embed logic if needed, for now assuming direct embeddable URL or YouTube
  
  return (
    <BaseBlock pastelColor={pastelColor} className={cn("p-0 overflow-hidden", className)}>
      <div className="aspect-video w-full h-full">
        <iframe
          src={embedUrl}
          title={title || 'Embedded Video'}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full"
        ></iframe>
      </div>
    </BaseBlock>
  );
}
