
"use client";

import { useState, useEffect, useMemo } from 'react';
import type { FormEvent } from 'react';
import ContentGrid from '@/components/BentoLink/ContentGrid';
import Footer from '@/components/BentoLink/Footer';
import BulkActionsBar from '@/components/BentoLink/BulkActionsBar';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { BlockItem, Category } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link2, PlusCircle, Trash2, ListFilter, Columns } from 'lucide-react';
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
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { useSearchParams } from 'next/navigation'; // Import useSearchParams

const initialBlocksData: BlockItem[] = [];
const UNCATEGORIZED_ID = "__UNCATEGORIZED__";

const SelinkLogo = () => (
  <svg
    aria-label="Selink Logo"
    role="img"
    viewBox="0 0 100 32"
    height="28"
    className="text-foreground"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g fill="hsl(var(--primary))">
      <path d="M14.4 22.8C14.4 22.8 14.4 22.8 14.4 22.8C14.4 24.2 13.9 25.500000000000004 12.899999999999999 26.4C11.899999999999999 27.4 10.6 27.8 9.200000000000001 27.8C7.800000000000001 27.8 6.5 27.4 5.5 26.4C4.4 25.500000000000004 4 24.2 4 22.8C4 21.4 4.4 20.1 5.5 19.1C6.5 18.2 7.800000000000001 17.8 9.200000000000001 17.8H12V14.8H9.200000000000001C7.1000000000000005 14.8 5.300000000000001 15.4 3.8000000000000007 16.8C2.3000000000000007 18.1 1.6000000000000005 19.700000000000003 1.6000000000000005 21.5C1.6000000000000005 23.3 2.3000000000000007 24.9 3.8000000000000007 26.2C5.300000000000001 27.6 7.1000000000000005 28.2 9.200000000000001 28.2C11.300000000000002 28.2 13.100000000000001 27.6 14.600000000000001 26.2C16.100000000000001 24.9 16.8 23.3 16.8 21.5V20.8H14.4V22.8Z"></path>
      <path d="M20.8 9.2C20.8 9.2 20.8 9.2 20.8 9.2C20.8 7.8 21.3 6.5 22.3 5.6C23.3 4.6 24.6 4.2 26 4.2C27.4 4.2 28.7 4.6 29.7 5.6C30.8 6.5 31.2 7.8 31.2 9.2C31.2 10.6 30.8 11.9 29.7 12.9C28.7 13.8 27.4 14.2 26 14.2H23.2V17.2H26C28.1 17.2 29.9 16.6 31.4 15.2C32.9 13.9 33.6 12.3 33.6 10.5C33.6 8.700000000000001 32.9 7.1 31.4 5.8C29.9 4.4 28.1 3.8 26 3.8C23.9 3.8 22.1 4.4 20.6 5.8C19.1 7.1 18.4 8.700000000000001 18.4 10.5V11.2H20.8V9.2Z"></path>
    </g>
    <text x="38" y="22" fontFamily="Arial, Helvetica, sans-serif" fontSize="20" fontWeight="bold" fill="hsl(var(--foreground))">
      Selink
    </text>
  </svg>
);


export default function BentoLinkPage() {
  const [blocks, setBlocks] = useState<BlockItem[]>(initialBlocksData);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null); 

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDeleteId, setCategoryToDeleteId] = useState<string | null>(null);
  const [categoryToDeleteName, setCategoryToDeleteName] = useState<string | null>(null);

  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);

  // Initialize useSearchParams. If this page needs to react to URL query parameters,
  // this is the correct hook to use in a Client Component.
  // The warning "params are being enumerated" often relates to improper access
  // of searchParams (especially when passed from Server Components or used with Object.keys directly).
  const searchParams = useSearchParams();

  useEffect(() => {
    // Example: log current search params. This helps verify they are accessible.
    // Avoid enumerating `searchParams` directly with `Object.keys(searchParams)`.
    // Instead, use methods like `searchParams.get('key')` or iterate with `searchParams.forEach(...)` or `for (const key of searchParams.keys())`.
    if (searchParams && searchParams.toString()) {
      console.log('BentoLinkPage current search params (via useSearchParams):', searchParams.toString());
    }
  }, [searchParams]); // Re-run if searchParams change.


  useEffect(() => {
    setIsMounted(true);
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
      setBlocks(prevBlocks =>
        prevBlocks.map(block =>
          block.categoryId === categoryToDeleteId ? { ...block, categoryId: null } : block
        )
      );
      if (selectedCategoryId === categoryToDeleteId) {
        setSelectedCategoryId(null); 
      }
      toast({
        title: "Category Deleted",
        description: `Category "${categoryToDeleteName}" has been deleted. Links within it are now uncategorized.`,
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
          if (!hostnameForTitle && urlObj.hostname) hostnameForTitle = urlObj.hostname; 
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
        categoryId: selectedCategoryId === UNCATEGORIZED_ID ? null : selectedCategoryId, 
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
    setBlocks(currentBlocks => currentBlocks.filter(block => block && block.id !== idToDelete));
    setSelectedBlockIds(prev => prev.filter(id => id !== idToDelete)); 
  };

  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;
    setBlocks(currentBlocks => {
      const items = Array.from(currentBlocks);
      const [reorderedItem] = items.splice(source.index, 1);
      if (reorderedItem === undefined) {
        return currentBlocks; 
      }
      items.splice(destination.index, 0, reorderedItem);
      return items;
    });
  };

  const handleAssignCategoryToBlock = (blockId: string, categoryId: string | null) => {
    setBlocks(prevBlocks =>
      prevBlocks.map(block =>
        block.id === blockId ? { ...block, categoryId: categoryId } : block
      )
    );
    const block = blocks.find(b => b.id === blockId);
    const category = categories.find(c => c.id === categoryId);
    if (block) {
      toast({
        title: "Link Category Updated",
        description: `Link "${block.title}" moved to ${category ? `"${category.name}"` : 'Uncategorized'}.`,
      });
    }
  };

  const handleToggleBlockSelection = (blockId: string) => {
    setSelectedBlockIds(prevSelectedIds =>
      prevSelectedIds.includes(blockId)
        ? prevSelectedIds.filter(id => id !== blockId)
        : [...prevSelectedIds, blockId]
    );
  };

  const handleDeleteSelectedBlocks = () => {
    setBlocks(prevBlocks => prevBlocks.filter(block => !selectedBlockIds.includes(block.id)));
    const numDeleted = selectedBlockIds.length;
    setSelectedBlockIds([]);
    toast({
      title: "Links Deleted",
      description: `${numDeleted} link(s) have been deleted.`,
    });
  };

  const handleMoveSelectedBlocksToCategory = (newCategoryId: string | null) => {
    setBlocks(prevBlocks =>
      prevBlocks.map(block =>
        selectedBlockIds.includes(block.id) ? { ...block, categoryId: newCategoryId } : block
      )
    );
    const categoryName = newCategoryId ? categories.find(c => c.id === newCategoryId)?.name : 'Uncategorized';
    const numMoved = selectedBlockIds.length;
    setSelectedBlockIds([]);
    toast({
      title: "Links Moved",
      description: `${numMoved} link(s) moved to ${categoryName || 'Uncategorized'}.`,
    });
  };


  const filteredBlocks = useMemo(() => {
    if (selectedCategoryId === null) { 
      return blocks;
    }
    if (selectedCategoryId === UNCATEGORIZED_ID) { 
      return blocks.filter(block => !block.categoryId);
    }
    return blocks.filter(block => block.categoryId === selectedCategoryId);
  }, [blocks, selectedCategoryId]);

  const isSelectionModeActive = selectedBlockIds.length > 0;

  return (
    <>
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <SidebarProvider defaultOpen={false}>
          <Sidebar side="left" variant="sidebar" collapsible="offcanvas">
            <SidebarHeader className="h-14 flex flex-col justify-center items-start border-b px-4">
              <h2 className="text-base font-semibold text-foreground">Categories</h2>
            </SidebarHeader>
            <SidebarContent className="p-2 space-y-2">
               <div className="space-y-2 p-2">
                <Input
                  placeholder="New Category"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddCategory(); }}
                  className="h-9 text-sm bg-muted"
                />
                <Button onClick={handleAddCategory} size="sm" className="w-full gap-1">
                  <PlusCircle className="h-4 w-4" />
                  Add Category
                </Button>
              </div>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setSelectedCategoryId(null)}
                    isActive={selectedCategoryId === null}
                    className="w-full justify-start"
                    tooltip="Show all links"
                  >
                    <Columns className="h-4 w-4" /> All Links
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setSelectedCategoryId(UNCATEGORIZED_ID)}
                    isActive={selectedCategoryId === UNCATEGORIZED_ID}
                    className="w-full justify-start"
                    tooltip="Show uncategorized links"
                  >
                    <ListFilter className="h-4 w-4" /> Uncategorized
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {categories.length > 0 && <SidebarSeparator className="my-2" />}

                {categories.length === 0 && (
                  <SidebarMenuItem className="text-muted-foreground text-xs px-3 py-2 text-center">
                    No categories yet.
                  </SidebarMenuItem>
                )}
                {categories.map((category) => (
                  <SidebarMenuItem key={category.id} className="flex items-center justify-between pr-1 hover:bg-accent/50 rounded-md">
                    <SidebarMenuButton
                      tooltip={category.name}
                      onClick={() => setSelectedCategoryId(category.id)}
                      isActive={selectedCategoryId === category.id}
                      className="flex-grow justify-start"
                    >
                      <span className="truncate">{category.name}</span>
                    </SidebarMenuButton>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => { e.stopPropagation(); openDeleteDialog(category);}}
                      aria-label={`Delete category ${category.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
            </SidebarFooter>
          </Sidebar>

          <SidebarInset>
            <div className="flex flex-col min-h-screen bg-background text-foreground">
              <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background px-4 sm:px-6">
                <SidebarTrigger className="h-8 w-8" />
                <div className="flex-1 flex items-center">
                  <SelinkLogo />
                </div>
                <div className="ml-auto flex items-center gap-2">
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

                <ContentGrid
                  blocks={filteredBlocks} 
                  onDeleteBlock={handleDeleteBlock}
                  isDndEnabled={isMounted && !isSelectionModeActive}
                  categories={categories}
                  onAssignCategoryToBlock={handleAssignCategoryToBlock}
                  selectedBlockIds={selectedBlockIds}
                  onToggleBlockSelection={handleToggleBlockSelection}
                  isSelectionModeActive={isSelectionModeActive}
                />
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
              This action cannot be undone. Deleting the category "{categoryToDeleteName}" will permanently remove it. Links previously in this category will become uncategorized.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteCategory}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isSelectionModeActive && (
        <BulkActionsBar
          count={selectedBlockIds.length}
          categories={categories}
          onDelete={handleDeleteSelectedBlocks}
          onMove={handleMoveSelectedBlocksToCategory}
        />
      )}
    </>
  );
}
    
