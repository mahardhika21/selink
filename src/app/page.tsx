
"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import ContentGrid from '@/components/BentoLink/ContentGrid';
import Footer from '@/components/BentoLink/Footer';
import BulkActionsBar from '@/components/BentoLink/BulkActionsBar';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { BlockItem, Category, SyncPayload } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link2, PlusCircle, Trash2, ListFilter, Columns, CheckCheck, ListX, ArrowRightLeft, Upload, Download as DownloadIcon, Info } from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { useSearchParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import lzString from 'lz-string';

const UNCATEGORIZED_ID = "__UNCATEGORIZED__";

const SelinkLogo = () => (
  <div className="flex items-center gap-2">
    <svg width="28" height="27" viewBox="0 0 162 243" fill="hsl(var(--primary))" xmlns="http://www.w3.org/2000/svg">
      <path d="M86.7826 161.935C85.7016 163.014 84.8918 163.854 84.0549 164.666C76.8707 171.636 70.3241 171.808 63.1482 164.82C50.7373 152.735 38.4937 140.479 26.1618 128.312C21.8857 124.094 17.6622 119.833 14.6495 114.568C3.84262 95.6823 6.36194 73.0432 22.0256 56.4571C35.8582 41.81 50.1038 27.5144 64.7654 13.6984C84.7123 -5.09795 114.947 -4.36432 134.723 14.7515C138.556 18.4562 142.298 22.255 146.065 26.0277C165.147 45.1413 166.789 71.5898 150.221 92.8694C143.157 101.942 143.039 101.979 134.977 94.0243C131.778 90.8674 128.788 87.4987 125.618 84.3107C123.433 82.1127 123.527 80.3669 125.622 77.9418C135.198 66.8572 134.730 56.0111 124.481 45.6982C120.958 42.1531 117.478 38.5608 113.851 35.1246C105.366 27.0859 92.8911 26.8261 84.5248 34.9544C70.9061 48.1857 57.4544 61.5956 44.178 75.1706C35.0986 84.4542 35.2257 95.9666 44.4471 105.392C58.4251 119.68 72.6542 133.722 86.7757 147.869C93.0069 154.111 93.0290 155.313 86.7826 161.935Z" />
      <path d="M99.7846 183.979C105.587 178.206 111.206 172.748 116.678 167.146C126.818 156.766 126.686 145.921 116.324 135.67C102.939 122.428 89.4945 109.246 76.107 96.0067C74.455 94.373 72.9301 92.5979 71.4638 90.7928C69.9738 88.9588 69.5077 86.5053 70.5898 84.6594C73.9945 78.8514 78.218 73.6204 85.0621 71.7078C88.8685 70.6442 92.5503 72.1493 95.2063 74.7669C111.577 90.9004 128.962 106.110 143.742 123.721C157.406 140.002 156.597 166.056 142.424 181.796C127.485 198.386 111.714 214.278 94.9481 229.008C73.736 247.645 45.1663 246.142 25.0828 226.327C20.813 222.114 16.3811 218.044 12.361 213.603C-5.24871 194.149 -4.08626 163.972 16.1254 144.226C18.245 142.155 20.0664 142.241 22.1166 144.274C27.085 149.202 32.0632 154.123 37.1528 158.925C39.7542 161.379 38.0732 162.925 36.3759 164.697C30.2001 171.143 27.4379 178.588 29.9337 187.486C30.7089 190.249 31.9918 192.804 34.0004 194.858C38.4263 199.384 42.7753 204.010 47.4835 208.229C56.4013 216.221 67.4616 215.912 76.1476 207.499C84.0461 199.848 91.7469 191.994 99.7846 183.979Z" />
    </svg>
    <text
      aria-label="Selink Logo"
      role="img"
      fontFamily="var(--font-plus-jakarta-sans), Arial, Helvetica, sans-serif"
      fontSize="20"
      fontWeight="bold"
      fill="hsl(var(--foreground))"
    >
      Selink
    </text>
  </div>
);


export default function BentoLinkPage() {
  const [blocks, setBlocks] = useState<BlockItem[]>([]);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null); 

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDeleteId, setCategoryToDeleteId] = useState<string | null>(null);
  const [categoryToDeleteName, setCategoryToDeleteName] = useState<string | null>(null);

  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);
  
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    setIsMounted(true);
    try {
      const storedBlocks = localStorage.getItem('bentoLinkBlocks');
      if (storedBlocks) {
        setBlocks(JSON.parse(storedBlocks));
      }
      const storedCategories = localStorage.getItem('bentoLinkCategories');
      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
      localStorage.removeItem('bentoLinkBlocks'); 
      localStorage.removeItem('bentoLinkCategories');
    }
  }, []);


  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('bentoLinkBlocks', JSON.stringify(blocks));
    }
  }, [blocks, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('bentoLinkCategories', JSON.stringify(categories));
    }
  }, [categories, isMounted]);
  

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

  const allFilteredBlockIds = useMemo(() => filteredBlocks.map(b => b.id), [filteredBlocks]);

  const canSelectAnyMoreInView = useMemo(() => {
    if (filteredBlocks.length === 0) return false;
    return allFilteredBlockIds.some(id => !selectedBlockIds.includes(id));
  }, [allFilteredBlockIds, selectedBlockIds, filteredBlocks.length]);

  const handleSelectAllFilteredBlocks = () => {
    if (filteredBlocks.length === 0) return;
    setSelectedBlockIds(allFilteredBlockIds);
  };

  const handleClearSelection = () => {
    setSelectedBlockIds([]);
  };

  const handleOpenSyncModal = () => {
    setIsSyncModalOpen(true);
  };

  const handleExportData = () => {
    const syncData: SyncPayload = { blocks, categories };
    const jsonString = JSON.stringify(syncData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const currentDate = format(new Date(), 'yyyy-MM-dd');
    link.href = url;
    link.download = `selink_data_${currentDate}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
      title: "Data Exported",
      description: "Your links and categories have been exported to a JSON file.",
    });
  };

  const triggerImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonString = e.target?.result as string;
        const parsedData = JSON.parse(jsonString) as SyncPayload;

        if (parsedData && Array.isArray(parsedData.blocks) && Array.isArray(parsedData.categories)) {
          setBlocks(parsedData.blocks);
          setCategories(parsedData.categories);
          localStorage.setItem('bentoLinkBlocks', JSON.stringify(parsedData.blocks));
          localStorage.setItem('bentoLinkCategories', JSON.stringify(parsedData.categories));
          toast({
            title: "Data Imported Successfully!",
            description: "Your links and categories have been imported from the JSON file.",
          });
          setIsSyncModalOpen(false); 
        } else {
          throw new Error("Invalid JSON file structure. The file should contain 'blocks' and 'categories' arrays.");
        }
      } catch (error: any) {
        console.error("Error importing JSON file:", error);
        toast({
          title: "Import Failed",
          description: error.message || "Could not import data from JSON file. Please check the file format.",
          variant: "destructive",
        });
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; 
        }
      }
    };
    reader.readAsText(file);
  };


  return (
    <>
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <SidebarProvider defaultOpen={false}>
          <Sidebar side="left" variant="sidebar" collapsible="offcanvas">
            <SidebarHeader className="h-14 flex flex-col justify-center items-start px-4">
              <h2 className="text-base font-medium text-foreground">Categories</h2>
            </SidebarHeader>
            <SidebarContent className="p-2 space-y-2">
               <div className="space-y-2 p-2">
                <Input
                  placeholder="New Category"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddCategory(); }}
                  className="h-9 text-sm bg-[#F9FAFB] dark:bg-muted"
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
              <header className="sticky top-0 z-30 flex h-14 items-center gap-2 bg-card px-4 sm:px-6">
                <SidebarTrigger className="h-8 w-8" />
                <div className="flex-1 flex items-center justify-center">
                  <SelinkLogo />
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={handleOpenSyncModal} aria-label="Sync data">
                    <ArrowRightLeft className="h-5 w-5" />
                  </Button>
                  <ThemeToggle />
                </div>
              </header>

              <main className="container mx-auto px-4 py-8 md:py-12 max-w-5xl w-full animate-fadeInUp flex-grow">
                <div className="my-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-xl mx-auto p-4 rounded-lg shadow-sm bg-card">
                  <Input
                    type="url"
                    placeholder="Enter Link"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !isAddingLink) handleAddLink(); }}
                    className="flex-grow text-sm bg-[#F9FAFB] dark:bg-muted"
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

      <Dialog open={isSyncModalOpen} onOpenChange={setIsSyncModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <DialogTitle>Sync Data</DialogTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p>Data disimpan secara lokal di browser Anda (localStorage). Ekspor data Anda secara berkala untuk membuat cadangan dan menghindari kehilangan data jika cache browser dibersihkan.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <DialogDescription>
              Backup atau restore data tautan dan kategori Anda melalui file JSON.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-6 sm:justify-center gap-3 flex-col sm:flex-row">
            <Button type="button" variant="outline" onClick={triggerImportClick} className="w-full sm:w-auto gap-1.5">
              <Upload className="h-4 w-4" />
              Import JSON
            </Button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImportFileChange} 
              style={{ display: 'none' }} 
              accept=".json" 
            />
            <Button type="button" onClick={handleExportData} className="w-full sm:w-auto gap-1.5">
              <DownloadIcon className="h-4 w-4" />
              Export JSON
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isSelectionModeActive && (
        <BulkActionsBar
          count={selectedBlockIds.length}
          categories={categories}
          onDelete={handleDeleteSelectedBlocks}
          onMove={handleMoveSelectedBlocksToCategory}
          onSelectAll={handleSelectAllFilteredBlocks}
          onClearSelection={handleClearSelection}
          canSelectAnyMore={canSelectAnyMoreInView}
          hasSelection={selectedBlockIds.length > 0}
        />
      )}
    </>
  );
}

    