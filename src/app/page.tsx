
"use client";

import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import ContentGrid from '@/components/BentoLink/ContentGrid';
import Footer from '@/components/BentoLink/Footer';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { BlockItem } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link2, PlusCircle, Trash2 } from 'lucide-react';
import { getLinkMetadata } from './actions';
import { DragDropContext, type DropResult } from 'react-beautiful-dnd';
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const initialBlocksData: BlockItem[] = [];

interface Category {
  id: string;
  name: string;
}

export default function BentoLinkPage() {
  const [blocks, setBlocks] = useState<BlockItem[]>(initialBlocksData);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDeleteId, setCategoryToDeleteId] = useState<string | null>(null);
  const [categoryToDeleteName, setCategoryToDeleteName] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    // Categories will start empty now
  }, []);

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Empty Category Name",
        description: "Please enter a name for the category.",
        variant: "destructive",
      });
      return;
    }
    const newCategory: Category = {
      id: crypto.randomUUID(),
      name: newCategoryName.trim(),
    };
    setCategories(prevCategories => [...prevCategories, newCategory]);
    setNewCategoryName('');
    toast({
      title: "Category Added",
      description: `Category "${newCategory.name}" has been added.`,
    });
  };

  const openDeleteDialog = (category: Category) => {
    setCategoryToDeleteId(category.id);
    setCategoryToDeleteName(category.name);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDeleteCategory = () => {
    if (categoryToDeleteId) {
      setCategories(prevCategories => prevCategories.filter(cat => cat.id !== categoryToDeleteId));
      toast({
        title: "Category Deleted",
        description: `Category "${categoryToDeleteName}" has been deleted.`,
      });
    }
    setIsDeleteDialogOpen(false);
    setCategoryToDeleteId(null);
    setCategoryToDeleteName(null);
  };


  const handleAddLink = async () => {
    if (!newLinkUrl.trim()) {
      toast({
        title: "Empty Link",
        description: "Please enter a URL.",
        variant: "destructive",
      });
      return;
    }
    
    let normalizedUrl = newLinkUrl.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    try {
      new URL(normalizedUrl); 
    } catch (_) {
      toast({
        title: "Invalid Link",
        description: "Please enter a valid URL (e.g., https://example.com).",
        variant: "destructive",
      });
      return;
    }

    setIsAddingLink(true);

    try {
      const { 
        thumbnailUrl: fetchedThumbnailUrl, 
        pageTitle: fetchedPageTitle, 
        faviconUrl: fetchedFaviconUrl 
      } = await getLinkMetadata(normalizedUrl);
      
      let displayTitle = "New Link";
      if (fetchedPageTitle && fetchedPageTitle.trim()) {
        displayTitle = fetchedPageTitle.trim();
      } else {
        try {
          const urlObj = new URL(normalizedUrl);
          let hostnameForTitle = urlObj.hostname.replace(/^www\./, '');
          displayTitle = hostnameForTitle.length > 50 ? hostnameForTitle.substring(0, 47) + "..." : hostnameForTitle;
          if (!displayTitle) {
             displayTitle = normalizedUrl.length > 50 ? normalizedUrl.substring(0, 47) + "..." : normalizedUrl;
          }
        } catch (e) {
          displayTitle = normalizedUrl.length > 50 ? normalizedUrl.substring(0, 47) + "..." : normalizedUrl;
        }
      }
       if (!displayTitle) displayTitle = "Untitled Link";

      const newBlock: BlockItem = {
        id: crypto.randomUUID(),
        type: 'link',
        title: displayTitle,
        content: normalizedUrl,
        linkUrl: normalizedUrl,
        colSpan: 1,
        thumbnailUrl: fetchedThumbnailUrl,
        thumbnailDataAiHint: fetchedThumbnailUrl ? 'retrieved thumbnail' : undefined,
        faviconUrl: fetchedFaviconUrl,
      };

      setBlocks(prevBlocks => [...prevBlocks, newBlock]);
      setNewLinkUrl('');
    } catch (error: any) {
        console.error("Failed to add link or fetch metadata:", error);
        toast({
          title: "Error Adding Link",
          description: error.message || "Could not fetch link metadata. Please try again.",
          variant: "destructive",
        });
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
  

  return (
    <>
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <SidebarProvider defaultOpen={false}>
          <Sidebar side="left" variant="sidebar" collapsible="offcanvas">
            <SidebarHeader className="p-4 border-b">
              <h2 className="text-lg font-semibold text-foreground">Categories</h2>
            </SidebarHeader>
            <SidebarContent className="p-2 space-y-2">
               <div className="space-y-2 p-2">
                <Input 
                  placeholder="New Category Name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddCategory(); }}
                  className="h-9 text-sm"
                />
                <Button onClick={handleAddCategory} size="sm" className="w-full gap-1">
                  <PlusCircle className="h-4 w-4" />
                  Add Category
                </Button>
              </div>
              <SidebarMenu>
                {categories.length === 0 && (
                  <SidebarMenuItem className="text-muted-foreground text-xs px-3 py-2">
                    No categories yet.
                  </SidebarMenuItem>
                )}
                {categories.map((category) => (
                  <SidebarMenuItem key={category.id} className="flex items-center justify-between pr-1 hover:bg-accent/50 rounded-md">
                    <SidebarMenuButton 
                      tooltip={category.name} 
                      className="flex-grow justify-start h-9 text-sm hover:bg-transparent focus-visible:bg-transparent data-[active=true]:bg-transparent"
                      // onClick={() => console.log("Selected category:", category.name)} // Placeholder action
                    >
                      <span className="truncate">{category.name}</span>
                    </SidebarMenuButton>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => openDeleteDialog(category)}
                      aria-label={`Delete category ${category.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
              {/* Add potential sidebar footer content here if needed */}
            </SidebarFooter>
          </Sidebar>

          <SidebarInset>
            <div className="flex flex-col min-h-screen bg-background text-foreground">
              <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background px-4 sm:px-6">
                <SidebarTrigger className="h-8 w-8" />
                <h1 className="flex-1 text-xl font-semibold text-primary truncate">BentoLink Editor</h1>
                <div className="ml-auto">
                  <ThemeToggle />
                </div>
              </header>

              <main className="container mx-auto px-4 py-8 md:py-12 max-w-5xl w-full animate-fadeInUp flex-grow">
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

                <ContentGrid blocks={blocks} onDeleteBlock={handleDeleteBlock} isDndEnabled={isMounted} />
              </main>
              <Footer />
            </div>
          </SidebarInset>
        </SidebarProvider>
      </DragDropContext>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this category?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Deleting the category "{categoryToDeleteName}" will permanently remove it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteCategory}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
