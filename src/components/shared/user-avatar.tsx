"use client";

import { useState } from "react";
import { Maximize2, ExternalLink, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function UserAvatar({
  name,
  path,
  className,
  previewable = false,
}: {
  name: string;
  path?: string | null;
  className?: string;
  previewable?: boolean;
}) {
  const [previewOpen, setPreviewOpen] = useState(false);

  // Validate photo URL: ensure it is a real image and not a dummy Unsplash photo
  const hasValidPhoto = Boolean(
    path &&
    typeof path === "string" &&
    path.trim().length > 0 &&
    !path.includes("images.unsplash.com")
  );

  const avatar = (
    <Avatar
      className={cn(
        "h-9 w-9 bg-muted/80 border border-border/70 select-none",
        previewable &&
          hasValidPhoto &&
          "cursor-pointer transition-transform hover:scale-105 active:scale-95 hover:ring-2 hover:ring-primary/40",
        className
      )}
    >
      {hasValidPhoto && (
        <AvatarImage src={path!} alt={name} className="object-cover" />
      )}
      <AvatarFallback className="bg-muted/90 text-muted-foreground flex items-center justify-center font-medium">
        <UserIcon className="h-[52%] w-[52%] text-muted-foreground/75" />
      </AvatarFallback>
    </Avatar>
  );

  if (!previewable || !hasValidPhoto) {
    return avatar;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setPreviewOpen(true)}
        className="group relative inline-flex shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        title="Tap to preview photo"
        aria-label={`Preview ${name}'s photo`}
      >
        {avatar}
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-black/35 opacity-0 transition-opacity group-hover:opacity-100">
          <Maximize2 className="h-3.5 w-3.5 text-white drop-shadow" />
        </span>
      </button>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="w-[min(92vw,24rem)] sm:max-w-md p-5 text-center">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-foreground truncate">
              {name}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              User photo preview
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 flex items-center justify-center">
            <div className="relative h-56 w-56 sm:h-64 sm:w-64 overflow-hidden rounded-full border-4 border-border bg-muted shadow-xl ring-4 ring-primary/20">
              <img src={path!} alt={name} className="h-full w-full object-cover" />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" asChild>
              <a href={path!} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                View full image
              </a>
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setPreviewOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
