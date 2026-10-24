"use client";

import { useState } from "react";
import {
  FolderKanban,
  Trash2,
  Plus,
  Loader2,
  FolderOpen,
  Edit2,
  Check,
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
  createUserCollection,
  deleteUserCollection,
  COLLECTION_COLORS,
  type CollectionWithCount,
} from "@/lib/collections";
import type { CollectionColor } from "@/integrations/supabase/types";

interface ManageCollectionsDialogProps {
  collections: CollectionWithCount[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCollectionsUpdated?: () => void;
  onCollectionsChange?: () => void;
  userId?: string;
  onCreateClick?: () => void;
}

export function ManageCollectionsDialog({
  collections,
  open,
  onOpenChange,
  onCollectionsUpdated,
  onCollectionsChange,
  userId,
  onCreateClick,
}: ManageCollectionsDialogProps) {
  const { user } = useAuth();
  const notifyUpdated = () => {
    onCollectionsUpdated?.();
    onCollectionsChange?.();
  };
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [newColDesc, setNewColDesc] = useState("");
  const [newColColor, setNewColColor] = useState<CollectionColor>("indigo");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;

    const userId = user?.id || "demo";
    try {
      setCreating(true);
      await createUserCollection(userId, {
        name: newColName,
        description: newColDesc,
        color: newColColor,
      });

      setNewColName("");
      setNewColDesc("");
      setShowCreateForm(false);
      toast.success(`Collection created successfully!`);
      notifyUpdated();
    } catch (err) {
      console.warn("Could not create collection:", err);
      toast.error("Failed to create collection");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (collectionId: string, collectionName: string) => {
    const activeUserId = userId || user?.id || "demo";
    try {
      setDeletingId(collectionId);
      await deleteUserCollection(activeUserId, collectionId);
      toast.success(`Collection "${collectionName}" deleted.`);
      notifyUpdated();
    } catch (err) {
      console.warn("Could not delete collection:", err);
      toast.error("Failed to delete collection");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Manage Research Collections</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Organize your thematic reading lists, syllabus dossiers, and research archives.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Collection list */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {collections.length > 0 ? (
              collections.map((col) => {
                const colorMeta =
                  COLLECTION_COLORS[(col.color as CollectionColor) || "indigo"] ||
                  COLLECTION_COLORS.indigo;

                return (
                  <div
                    key={col.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div
                        className={`h-3.5 w-3.5 rounded-full shrink-0 ${colorMeta.dotClass}`}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-foreground truncate">
                            {col.name}
                          </h4>
                          <Badge
                            variant="outline"
                            className="text-[10px] py-0 px-1.5 font-mono text-muted-foreground border-border/80"
                          >
                            {col.book_count} {col.book_count === 1 ? "book" : "books"}
                          </Badge>
                        </div>
                        {col.description && (
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                            {col.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={deletingId === col.id}
                      onClick={() => handleDelete(col.id, col.name)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                      title="Delete Collection"
                    >
                      {deletingId === col.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 border border-dashed rounded-xl">
                <FolderOpen className="h-8 w-8 mx-auto text-muted-foreground/50 mb-1.5" />
                <p className="text-xs font-semibold text-foreground">No Collections Created</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Create custom collections below to categorize your saved monographs.
                </p>
              </div>
            )}
          </div>

          {/* Inline Create Form or Trigger */}
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
              onSubmit={handleCreate}
              className="rounded-xl border border-border/80 bg-card p-4 space-y-3.5 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Create Collection</span>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="text-[11px] text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>

              <div className="space-y-1">
                <Label htmlFor="manage-col-name" className="text-[11px] font-semibold">
                  Collection Title
                </Label>
                <Input
                  id="manage-col-name"
                  placeholder="e.g. Distributed Consensus Systems"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  className="h-8 text-xs"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="manage-col-desc" className="text-[11px] font-semibold">
                  Description
                </Label>
                <Input
                  id="manage-col-desc"
                  placeholder="e.g. Research materials for upcoming dissertation"
                  value={newColDesc}
                  onChange={(e) => setNewColDesc(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

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
                Create Collection
              </Button>
            </form>
          )}
        </div>

        <DialogFooter className="pt-2 border-t border-border/60">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
