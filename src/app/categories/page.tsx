"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FolderOpen,
  Cpu,
  Shield,
  FileText,
  Headphones,
  BookOpen,
  ArrowRight,
  Sparkles,
  BookCheck,
  Search,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import type { Category, Book } from "@/integrations/supabase/types";

interface CategoryWithCounts extends Category {
  book_count?: number;
}

const CATEGORY_ICONS: Record<string, any> = {
  Cpu,
  Shield,
  FileText,
  Headphones,
  BookOpen,
  FolderOpen,
};

const DEFAULT_CATEGORIES: CategoryWithCounts[] = [
  {
    id: "c1",
    name: "Computer Science",
    slug: "computer-science",
    description: "Distributed architectures, algorithms, runtime analysis, and scalable database systems.",
    icon: "Cpu",
    display_order: 1,
    created_at: "",
    book_count: 3,
  },
  {
    id: "c2",
    name: "Network Security",
    slug: "network-security",
    description: "Applied cryptography, zero-trust network protocols, offensive security, and threat modelling.",
    icon: "Shield",
    display_order: 2,
    created_at: "",
    book_count: 2,
  },
  {
    id: "c3",
    name: "Research Papers",
    slug: "research-papers",
    description: "Peer-reviewed scholarly monographs, machine learning research preprints, and academic theses.",
    icon: "FileText",
    display_order: 3,
    created_at: "",
    book_count: 4,
  },
  {
    id: "c4",
    name: "Audio Books",
    slug: "audio-books",
    description: "High-fidelity audiobooks, recorded lectures, classical philosophy narrations, and symposium discussions.",
    icon: "Headphones",
    display_order: 4,
    created_at: "",
    book_count: 1,
  },
  {
    id: "c5",
    name: "eBooks & Literature",
    slug: "ebooks-literature",
    description: "Classic literature, philosophical journals, historical essays, and digital publication volumes.",
    icon: "BookOpen",
    display_order: 5,
    created_at: "",
    book_count: 2,
  },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithCounts[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: catData, error: catError } = await supabase
          .from("categories")
          .select("*")
          .order("display_order", { ascending: true });

        const { data: booksData } = await supabase
          .from("books")
          .select("category_id")
          .eq("is_archived", false);

        if (!catError && catData && catData.length > 0) {
          const counts: Record<string, number> = {};
          if (booksData) {
            booksData.forEach((b: any) => {
              if (b.category_id) {
                counts[b.category_id] = (counts[b.category_id] || 0) + 1;
              }
            });
          }

          const mapped: CategoryWithCounts[] = (catData as any[]).map((c: any) => ({
            ...c,
            book_count: counts[c.id] || 0,
          }));
          setCategories(mapped);
        }
      } catch (err) {
        console.warn("Could not fetch categories from Supabase, using defaults:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Knowledge Taxonomies & Disciplines"
        subtitle="Browse digital holdings grouped by academic discipline, technical domain, and format."
        action={
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href="/">
              <Search className="h-4 w-4" /> Search All Books
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const IconComp = CATEGORY_ICONS[cat.icon || "FolderOpen"] || FolderOpen;
          return (
            <Card
              key={cat.id}
              className="group relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/40 flex flex-col justify-between"
            >
              <CardHeader className="space-y-3 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground shadow-xs">
                    <IconComp className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary" className="text-xs font-semibold">
                    {cat.book_count ?? 0} {cat.book_count === 1 ? "Resource" : "Resources"}
                  </Badge>
                </div>
                <div>
                  <CardTitle className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                    {cat.name}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-3">
                    {cat.description || "Curated academic resources, publications, and reference guides."}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="pt-0 pb-5">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between text-xs font-semibold text-primary hover:text-primary hover:bg-primary/5 p-2 rounded-lg"
                >
                  <Link href={`/?category=${cat.id}`}>
                    <span>Explore Shelves</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* AI Curation Callout Banner */}
      <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50 via-white to-indigo-50/50 dark:from-indigo-950/20 dark:via-background dark:to-indigo-950/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">Need a personalized syllabus or interdisciplinary search?</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ask our Google Gemini-powered AI Librarian to assemble reading recommendations across categories.
            </p>
          </div>
        </div>
        <Button asChild size="sm" className="bg-primary text-primary-foreground text-xs shrink-0">
          <Link href="/books/b1">Try Contextual AI</Link>
        </Button>
      </div>
    </div>
  );
}
