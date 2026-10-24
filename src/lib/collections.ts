import { supabase } from "@/integrations/supabase/client";
import type { Collection, CollectionColor } from "@/integrations/supabase/types";

export interface CollectionWithCount extends Collection {
  book_count: number;
  book_ids: string[];
}

export const COLLECTION_COLORS: Record<CollectionColor, { label: string; badgeClass: string; dotClass: string; hex: string }> = {
  indigo: {
    label: "Indigo",
    badgeClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    dotClass: "bg-indigo-500",
    hex: "#6366F1",
  },
  emerald: {
    label: "Emerald",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    dotClass: "bg-emerald-500",
    hex: "#10B981",
  },
  amber: {
    label: "Amber",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    dotClass: "bg-amber-500",
    hex: "#F59E0B",
  },
  rose: {
    label: "Rose",
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    dotClass: "bg-rose-500",
    hex: "#F43F5E",
  },
  cyan: {
    label: "Cyan",
    badgeClass: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    dotClass: "bg-cyan-500",
    hex: "#06B6D4",
  },
  purple: {
    label: "Purple",
    badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    dotClass: "bg-purple-500",
    hex: "#A855F7",
  },
  blue: {
    label: "Blue",
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    dotClass: "bg-blue-500",
    hex: "#3B82F6",
  },
};

export const SEED_COLLECTIONS: CollectionWithCount[] = [
  {
    id: "col-crypto",
    user_id: "demo",
    name: "Post-Quantum Cryptography Thesis",
    description: "Foundational papers on lattice-based cryptography, isogeny protocols, and quantum resistance.",
    color: "indigo",
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date().toISOString(),
    book_count: 2,
    book_ids: ["b-crypto", "b-topology"],
  },
  {
    id: "col-neural",
    user_id: "demo",
    name: "Neural Cognition & Memory Models",
    description: "Monographs covering synthetic associative memory, plastic neural circuits, and attention manifolds.",
    color: "emerald",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date().toISOString(),
    book_count: 1,
    book_ids: ["b-neural"],
  },
  {
    id: "col-distributed",
    user_id: "demo",
    name: "Distributed Consensus Dossier",
    description: "Byzantine fault tolerance, state-machine replication, and algorithmic complexity in distributed databases.",
    color: "amber",
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date().toISOString(),
    book_count: 1,
    book_ids: ["b-distributed"],
  },
];

const LOCAL_STORAGE_KEY_PREFIX = "librisai_collections_";

function getLocalCollections(userId: string): CollectionWithCount[] {
  if (typeof window === "undefined") return SEED_COLLECTIONS;
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${userId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Could not read local collections:", err);
  }
  return SEED_COLLECTIONS;
}

function saveLocalCollections(userId: string, collections: CollectionWithCount[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(collections));
  } catch (err) {
    console.warn("Could not persist local collections:", err);
  }
}

/**
 * Fetch all research collections for a user, with book counts and IDs.
 */
export async function fetchUserCollections(userId: string): Promise<CollectionWithCount[]> {
  try {
    // Attempt Supabase fetch
    const { data: colData, error: colError } = await (supabase
      .from("collections") as any)
      .select("*, collection_books(book_id)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!colError && colData && colData.length > 0) {
      const mapped: CollectionWithCount[] = colData.map((c: any) => {
        const bookIds = Array.isArray(c.collection_books)
          ? c.collection_books.map((cb: any) => cb.book_id)
          : [];
        return {
          id: c.id,
          user_id: c.user_id,
          name: c.name,
          description: c.description,
          color: c.color || "indigo",
          created_at: c.created_at,
          updated_at: c.updated_at,
          book_count: bookIds.length,
          book_ids: bookIds,
        };
      });
      saveLocalCollections(userId, mapped);
      return mapped;
    }
  } catch (err) {
    console.warn("Using offline / fallback collection store:", err);
  }

  return getLocalCollections(userId);
}

/**
 * Create a new research collection.
 */
export async function createUserCollection(
  userId: string,
  input: { name: string; description?: string; color?: string }
): Promise<CollectionWithCount> {
  const newCol: CollectionWithCount = {
    id: `col-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    user_id: userId,
    name: input.name.trim(),
    description: input.description?.trim() || null,
    color: input.color || "indigo",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    book_count: 0,
    book_ids: [],
  };

  try {
    const { data, error } = await (supabase
      .from("collections") as any)
      .insert({
        user_id: userId,
        name: newCol.name,
        description: newCol.description,
        color: newCol.color,
      })
      .select()
      .single();

    if (!error && data) {
      newCol.id = data.id;
      newCol.created_at = data.created_at;
      newCol.updated_at = data.updated_at;
    }
  } catch (err) {
    console.warn("Could not insert collection to Supabase, saving locally:", err);
  }

  const existing = getLocalCollections(userId);
  const updated = [newCol, ...existing.filter((c) => c.id !== newCol.id)];
  saveLocalCollections(userId, updated);
  return newCol;
}

/**
 * Delete a collection by ID.
 */
export async function deleteUserCollection(userId: string, collectionId: string): Promise<boolean> {
  try {
    await (supabase.from("collections") as any).delete().eq("id", collectionId).eq("user_id", userId);
  } catch (err) {
    console.warn("Could not delete collection from Supabase, removing locally:", err);
  }

  const existing = getLocalCollections(userId);
  const updated = existing.filter((c) => c.id !== collectionId);
  saveLocalCollections(userId, updated);
  return true;
}

/**
 * Toggle a monograph inside a collection (add if not present, remove if present).
 */
export async function toggleBookInCollection(
  userId: string,
  collectionId: string,
  bookId: string
): Promise<{ added: boolean; collection: CollectionWithCount }> {
  const existing = getLocalCollections(userId);
  const targetCol = existing.find((c) => c.id === collectionId);

  if (!targetCol) {
    throw new Error("Collection not found");
  }

  const isPresent = targetCol.book_ids.includes(bookId);
  let added = false;

  if (isPresent) {
    // Remove
    targetCol.book_ids = targetCol.book_ids.filter((id) => id !== bookId);
    targetCol.book_count = targetCol.book_ids.length;
    added = false;

    try {
      await (supabase
        .from("collection_books") as any)
        .delete()
        .eq("collection_id", collectionId)
        .eq("book_id", bookId);
    } catch (e) {
      console.warn("Could not delete from collection_books in Supabase:", e);
    }
  } else {
    // Add
    targetCol.book_ids.push(bookId);
    targetCol.book_count = targetCol.book_ids.length;
    added = true;

    try {
      await (supabase
        .from("collection_books") as any)
        .insert({
          collection_id: collectionId,
          book_id: bookId,
        });
    } catch (e) {
      console.warn("Could not insert into collection_books in Supabase:", e);
    }
  }

  const updatedCollections = existing.map((c) => (c.id === collectionId ? targetCol : c));
  saveLocalCollections(userId, updatedCollections);

  return { added, collection: targetCol };
}
