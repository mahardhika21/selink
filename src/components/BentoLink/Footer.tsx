import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="text-center mt-auto py-8">
      <p className="text-sm text-muted-foreground flex items-center justify-center">
        Built with 
        <Heart className="w-4 h-4 mx-1 text-primary fill-primary" /> 
        by @irfan.0z
      </p>
    </footer>
  );
}
