
'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { Input } from '@/components/ui/input';
import { getRegisteredHostnames } from '@/app/actions';
import { ListTree, Search } from 'lucide-react';

export default function RegisteredHostnamesDialog() {
  const [hostnames, setHostnames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  useEffect(() => {
    if (isOpen && hostnames.length === 0 && !isLoading) {
      fetchHostnames();
    }
  }, [isOpen]); // Removed hostnames.length and isLoading to allow re-fetch if dialog is reopened after an initial empty/failed load.

  const filteredHostnames = useMemo(() => {
    if (!searchTerm) {
      return hostnames;
    }
    return hostnames.filter((hostname) =>
      hostname.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [hostnames, searchTerm]);

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
            There are {hostnames.length} hostname(s) currently configured for use with the next/image component.
          </DialogDescription>
        </DialogHeader>

        <div className="relative mt-2 mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search hostnames..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <ScrollArea className="h-[250px] w-full rounded-md border p-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading hostnames...</p>
          ) : filteredHostnames.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {filteredHostnames.map((hostname) => (
                <li key={hostname} className="text-foreground">{hostname}</li>
              ))}
            </ul>
          ) : searchTerm && hostnames.length > 0 ? (
             <p className="text-sm text-muted-foreground text-center">No hostnames found for "{searchTerm}".</p>
          ) : (
            <p className="text-sm text-muted-foreground text-center">No hostnames found or failed to load.</p>
          )}
        </ScrollArea>
         <DialogDescription className="text-xs text-muted-foreground italic mt-4">
            Note: This list is based on the application's configuration. To remove a hostname, please inform the AI assistant to update the configuration files, then restart the server.
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}

