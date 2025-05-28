
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getRegisteredHostnames } from '@/app/actions';
import { ListTree } from 'lucide-react';

export default function RegisteredHostnamesDialog() {
  const [hostnames, setHostnames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchHostnames = async () => {
    setIsLoading(true);
    try {
      const names = await getRegisteredHostnames();
      setHostnames(names);
    } catch (error) {
      console.error("Failed to fetch registered hostnames:", error);
      // Optionally, show a toast error to the user
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch hostnames when the dialog is opened, but only if not already fetched or empty
  useEffect(() => {
    if (isOpen && hostnames.length === 0) { 
      fetchHostnames();
    }
  }, [isOpen]); // Re-run if isOpen changes, hostnames.length dependency removed to allow re-fetch if manually cleared

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="fixed top-4 left-4 z-50 rounded-full shadow-md">
          <ListTree className="h-5 w-5" />
          <span className="sr-only">View Registered Hostnames</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Registered Image Hostnames</DialogTitle>
          <DialogDescription>
            These are the hostnames currently configured for use with the next/image component in your application.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[300px] w-full rounded-md border p-4 my-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading hostnames...</p>
          ) : hostnames.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {hostnames.map((hostname) => (
                <li key={hostname} className="text-foreground">{hostname}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No hostnames found or failed to load.</p>
          )}
        </ScrollArea>
         <DialogDescription className="text-xs text-muted-foreground italic">
            Note: This list is based on the application's configuration when this feature was last updated. If new hostnames are added directly to `next.config.js`, they may not appear here immediately.
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
