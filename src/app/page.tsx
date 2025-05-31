
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
    viewBox="0 0 105 32" // Adjusted for new icon + text
    height="28" // Controls the overall height
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* New SVG Icon Part */}
    <svg x="0" y="2" width="28" height="28" viewBox="0 0 512 512">
      <g fill="hsl(var(--primary))">
        <path d="M301.4,286.7h-91.1c-8.6,0-15.5,6.9-15.5,15.4c0,8.4,6.9,15.4,15.5,15.4h91.1c8.5,0,15.4-7,15.4-15.4 C316.8,293.6,309.9,286.7,301.4,286.7z"></path>
        <path d="M210.3,225h44.8c8.6,0,15.5-7,15.5-15.5s-6.9-15.4-15.5-15.4h-44.8c-8.6,0-15.5,6.9-15.5,15.4S201.8,225,210.3,225z"></path>
        <path d="M256,0C114.6,0,0,114.6,0,256s114.6,256,256,256s256-114.6,256-256S397.4,0,256,0z M383,303.3 c-0.3,44.4-36.4,80.7-80.8,80.7h-92.9c-44.5,0-80.8-36.4-80.8-80.7v-94.4c0-44.5,36.4-80.9,80.8-80.9h56.6 c20.9,2.5,51.2,20.4,62.4,44.1c3.1,6.7,4.7,7.7,7.3,27.5c1.4,10.2,2,17.7,6.6,21.9c6.5,5.8,30.2,1.9,34.9,5.6l3.6,2.8l2.1,4.4 l0.8,3.6L383,303.3z"></path>
      </g>
    </svg>
    {/* Text Part */}
    <text 
      x="36" 
      y="22" 
      fontFamily="var(--font-plus-jakarta-sans), Arial, Helvetica, sans-serif" 
      fontSize="20" 
      fontWeight="bold" 
      fill="hsl(var(--foreground))"
    >
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
    
