"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FolderPlus,
  Check,
  Plus,
  Loader2,
  FolderOpen,
  Sparkles,
  BookMarked,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchUserCollections,
  createUserCollection,
  toggleBookInCollection,
  COLLECTION_COLORS,
  type CollectionWithCount,
} from "@/lib/collections";
import type { CollectionColor } from "@/integrations/supabase/types";

interface AddToCollectionDialogProps {
  bookId: string;
  bookTitle: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCollectionsUpdated?: () => void;
  userId?: string;
}

export function AddToCollectionDialog({
  bookId,
  bookTitle,
  trigger,
  open: externalOpen,
  onOpenChange: setExternalOpen,
  onCollectionsUpdated,
  userId,
}: AddToCollectionDialogProps) {
  const { user } = useAuth();
  const effectiveUserId = userId || user?.id || "demo";
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setIsOpen = setExternalOpen || setInternalOpen;

  const [collections, setCollections] = useState<CollectionWithCount[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [newColDesc, setNewColDesc] = useState("");
  const [newColColor, setNewColColor] = useState<CollectionColor>("indigo");

  const loadCollections = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchUserCollections(effectiveUserId);
      setCollections(data);
    } finally {
      setLoading(false);
    }
  }, [effectiveUserId]);

  useEffect(() => {
    if (isOpen) {
      loadCollections();
    }
  }, [isOpen, loadCollections]);

  const handleToggle = async (collection: CollectionWithCount) => {
    try {
      const { added, collection: updatedCol } = await toggleBookInCollection(
        effectiveUserId,
        collection.id,
        bookId
      );

      setCollections((prev) =>
        prev.map((c) => (c.id === updatedCol.id ? updatedCol : c))
      );

      if (added) {
        toast.success(`Added "${bookTitle}" to "${collection.name}"`);
      } else {
        toast.info(`Removed "${bookTitle}" from "${collection.name}"`);
      }

      if (onCollectionsUpdated) {
        onCollectionsUpdated();
      }
    } catch (err) {
      console.warn("Could not toggle collection:", err);
      toast.error("Failed to update collection");
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;

    try {
      setCreating(true);
      const created = await createUserCollection(effectiveUserId, {
        name: newColName,
        description: newColDesc,
        color: newColColor,
      });

      // Automatically add this monograph to the newly created collection
      const { collection: withBook } = await toggleBookInCollection(
        effectiveUserId,
        created.id,
        bookId
      );

      setCollections((prev) => [withBook, ...prev]);
      setNewColName("");
      setNewColDesc("");
      setShowCreateForm(false);
      toast.success(`Created collection "${created.name}" and added monograph!`);

      if (onCollectionsUpdated) {
        onCollectionsUpdated();
      }
    } catch (err) {
      console.warn("Could not create collection:", err);
      toast.error("Could not create collection");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md w-full max-w-[calc(100vw-2rem)] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
              <FolderPlus className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base font-bold truncate">Research Collections</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground truncate">
                Save &quot;{bookTitle}&quot; to your research dossiers
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Existing Collections List */}
        <div className="space-y-3 py-2 max-h-[320px] overflow-y-auto overflow-x-hidden w-full min-w-0 pr-1">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : collections.length > 0 ? (
            <div className="space-y-2 w-full min-w-0">
              {collections.map((col) => {
                const colorMeta =
                  COLLECTION_COLORS[(col.color as CollectionColor) || "indigo"] ||
                  COLLECTION_COLORS.indigo;
                const isSelected = col.book_ids.includes(bookId);

                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => handleToggle(col)}
                    className={`w-full min-w-0 flex items-center justify-between p-3 rounded-xl border text-left transition-all gap-3 ${
                      isSelected
                        ? "border-primary/50 bg-primary/5 shadow-2xs"
                        : "border-border/70 hover:border-border hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`h-3 w-3 rounded-full shrink-0 ${colorMeta.dotClass}`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-foreground truncate">
                          {col.name}
                        </p>
                        {col.description && (
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                            {col.description}
                          </p>
                        )}
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {col.book_count} {col.book_count === 1 ? "monograph" : "monographs"}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full border transition-all shrink-0 ${
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-border/80 bg-background text-transparent"
                      }`}
                    >
                      <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 border border-dashed rounded-xl p-4">
              <FolderOpen className="h-8 w-8 mx-auto text-muted-foreground/60 mb-2" />
              <p className="text-xs font-semibold text-foreground">No Collections Yet</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Create your first collection below to organize this monograph.
              </p>
            </div>
          )}

          {/* Create New Collection Inline Form */}
          {!showCreateForm ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowCreateForm(true)}
              className="w-full text-xs font-semibold gap-1.5 border-dashed hover:border-primary/50 text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5 text-primary" /> Create New Collection
            </Button>
          ) : (
            <form
              onSubmit={handleCreateCollection}
              className="rounded-xl border border-border/80 bg-card p-3.5 space-y-3 mt-2 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">New Research Collection</span>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="text-[11px] text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>

              <div className="space-y-1">
                <Label htmlFor="inline-col-name" className="text-[11px] font-semibold">
                  Name
                </Label>
                <Input
                  id="inline-col-name"
                  placeholder="e.g. Post-Quantum Cryptography"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  className="h-8 text-xs"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="inline-col-desc" className="text-[11px] font-semibold">
                  Description (optional)
                </Label>
                <Input
                  id="inline-col-desc"
                  placeholder="e.g. PhD thesis primary literature"
                  value={newColDesc}
                  onChange={(e) => setNewColDesc(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              {/* Color Selection */}
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold">Color Tag</Label>
                <div className="flex items-center gap-2">
                  {(Object.keys(COLLECTION_COLORS) as CollectionColor[]).map((colorKey) => {
                    const c = COLLECTION_COLORS[colorKey];
                    const isColSelected = newColColor === colorKey;
                    return (
                      <button
                        key={colorKey}
                        type="button"
                        onClick={() => setNewColColor(colorKey)}
                        className={`h-5 w-5 rounded-full transition-all ${c.dotClass} ${
                          isColSelected
                            ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110"
                            : "opacity-75 hover:opacity-100"
                        }`}
                        title={c.label}
                      />
                    );
                  })}
                </div>
              </div>

              <Button
                type="submit"
                size="sm"
                disabled={creating || !newColName.trim()}
                className="w-full text-xs font-semibold bg-primary text-primary-foreground gap-1.5"
              >
                {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                Create &amp; Add Monograph
              </Button>
            </form>
          )}
        </div>

        <DialogFooter className="pt-2 border-t border-border/60">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-xs"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
