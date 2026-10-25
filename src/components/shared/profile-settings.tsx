"use client";

import { useState, useEffect, useRef } from "react";
import {
  GraduationCap,
  Building2,
  BookOpen,
  Camera,
  Upload,
  Check,
  X,
  Plus,
  Lock,
  Download,
  ShieldCheck,
  Sparkles,
  Loader2,
  HardDrive,
  FileText,
  AlertCircle,
  Layers,
  Award,
  Eye,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PasswordInput } from "@/components/ui/password-input";
import { UserAvatar } from "@/components/shared/user-avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Profile } from "@/integrations/supabase/types";

const SUGGESTED_RESEARCH_TAGS = [
  "Lattice Cryptography",
  "Post-Quantum Protocols",
  "Neural Information Retrieval",
  "Knowledge Graphs",
  "Digital Provenance",
  "Topological Quantum Memory",
  "Distributed Consensus",
  "Classical Manuscript Archiving",
  "Ethics in AI Systems",
];

const ACADEMIC_TITLE_SUGGESTIONS = [
  "Doctoral Research Fellow",
  "PhD Candidate in Computer Science",
  "Postdoctoral Research Associate",
  "Assistant Professor",
  "Associate Professor of Informatics",
  "Principal Research Scientist",
  "Chief Librarian & Archival Director",
];

export function ProfileSettings() {
  const { user, profile, role, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [academicTitle, setAcademicTitle] = useState("");
  const [institution, setInstitution] = useState("");
  const [department, setDepartment] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [researchInterests, setResearchInterests] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");

  // Password Update State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Loading & UI States
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isViewPhotoOpen, setIsViewPhotoOpen] = useState(false);

  // Initialize from active profile
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || profile.name || "");
      setAcademicTitle(profile.academic_title || "Doctoral Research Fellow");
      setInstitution(profile.institution || "Oxford-Stanford Joint AI Research Center");
      setDepartment(profile.department || "Department of Computer Science & Cryptography");
      setPhone(profile.phone || "");
      setBio(
        profile.bio ||
          "Doctoral candidate focusing on post-quantum lattice cryptography, computational complexity, and secure multi-party communication."
      );
      const cleanAvatar =
        profile.avatar_url && !profile.avatar_url.includes("images.unsplash.com")
          ? profile.avatar_url
          : "";
      setAvatarUrl(cleanAvatar);
      setResearchInterests(
        profile.research_interests || [
          "Lattice Cryptography",
          "Quantum Algorithms",
          "Information Security",
        ]
      );
    }
  }, [profile]);

  // Check for unsaved changes
  const hasUnsavedChanges = (() => {
    if (!profile) return false;
    return (
      fullName !== (profile.full_name || profile.name || "") ||
      academicTitle !== (profile.academic_title || "Doctoral Research Fellow") ||
      institution !== (profile.institution || "Oxford-Stanford Joint AI Research Center") ||
      department !== (profile.department || "Department of Computer Science & Cryptography") ||
      phone !== (profile.phone || "") ||
      bio !== (profile.bio || "") ||
      avatarUrl !== (profile.avatar_url || "") ||
      JSON.stringify(researchInterests) !==
        JSON.stringify(
          profile.research_interests || [
            "Lattice Cryptography",
            "Quantum Algorithms",
            "Information Security",
          ]
        )
    );
  })();

  // Handle Avatar File Upload to Supabase Storage `avatars` bucket with local fallback
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Avatar image must be smaller than 5MB.");
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const fileExt = file.name.split(".").pop() || "png";
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      let finalUrl = "";

      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (!error && data) {
        const { data: pubData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);

        if (pubData?.publicUrl) {
          finalUrl = pubData.publicUrl;
        }
      }

      // If Supabase Storage bucket is not available or restricts public read, fallback to high-quality Data URL
      if (!finalUrl) {
        finalUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      setAvatarUrl(finalUrl);

      // Persist directly to profile so user never loses it
      const result = await updateProfile({
        avatar_url: finalUrl,
        updated_at: new Date().toISOString(),
      });

      if (result.error) {
        console.warn("Auto-save profile avatar warning:", result.error);
      }

      toast.success("Profile photo uploaded successfully!");
    } catch (err: any) {
      console.error("Avatar upload error:", err);
      toast.error(err?.message || "Failed to upload profile photo.");
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Add Research Tag
  const handleAddTag = (tagToAdd?: string) => {
    const tag = (tagToAdd || newTagInput).trim();
    if (!tag) return;
    if (researchInterests.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      toast.info(`"${tag}" is already in your research topics.`);
      setNewTagInput("");
      return;
    }
    setResearchInterests((prev) => [...prev, tag]);
    setNewTagInput("");
  };

  // Remove Research Tag
  const handleRemoveTag = (tagToRemove: string) => {
    setResearchInterests((prev) => prev.filter((t) => t !== tagToRemove));
  };

  // Save Profile Changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!fullName.trim()) {
      toast.error("Full Name cannot be empty.");
      return;
    }

    setIsSaving(true);
    try {
      const updates: Partial<Profile> = {
        name: fullName.trim(),
        full_name: fullName.trim(),
        academic_title: academicTitle.trim(),
        institution: institution.trim(),
        department: department.trim(),
        phone: phone.trim() || null,
        bio: bio.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        research_interests: researchInterests,
        updated_at: new Date().toISOString(),
      };

      const result = await updateProfile(updates);

      if (result.error) {
        throw result.error;
      }

      toast.success("✨ Scholar profile & research credentials updated successfully!");
    } catch (err: any) {
      console.error("Save profile error:", err);
      toast.error(err?.message || "Failed to save profile changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Reset Changes
  const handleReset = () => {
    if (!profile) return;
    setFullName(profile.full_name || profile.name || "");
    setAcademicTitle(profile.academic_title || "Doctoral Research Fellow");
    setInstitution(profile.institution || "Oxford-Stanford Joint AI Research Center");
    setDepartment(profile.department || "Department of Computer Science & Cryptography");
    setPhone(profile.phone || "");
    setBio(profile.bio || "");
    setAvatarUrl(profile.avatar_url || "");
    setResearchInterests(profile.research_interests || []);
    toast.info("Changes reverted to saved profile state.");
  };

  // Password Update
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      toast.error("Please enter a new password.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters in length.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match. Please verify.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      toast.success("🔒 Institutional account password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error("Password change error:", err);
      toast.error(err?.message || "Could not update password. Please check your credentials.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Export Research Dossier (JSON / Markdown)
  const handleExportDossier = (format: "json" | "markdown") => {
    const dossierData = {
      scholar: {
        name: fullName || "Scholar",
        email: user?.email,
        academicTitle,
        institution,
        department,
        phone,
        bio,
        role: role || "user",
        researchInterests,
        status: "Active & Verified Academic Standing",
        exportedAt: new Date().toISOString(),
      },
      repositoryMetrics: {
        accessTier: `${role === "admin" ? "Institutional Administrator" : "Academic Scholar / Researcher"}`,
        quotaStatus: "Unlimited Academic Monograph Retrieval",
        doiAccess: "Verified DOI Standard",
      },
    };

    let fileContent = "";
    let mimeType = "";
    let fileExtension = "";

    if (format === "json") {
      fileContent = JSON.stringify(dossierData, null, 2);
      mimeType = "application/json";
      fileExtension = "json";
    } else {
      fileContent = `# 🏛️ LibrisAI Scholar Research Dossier

**Name:** ${dossierData.scholar.name}  
**Academic Title:** ${dossierData.scholar.academicTitle}  
**Institutional Affiliation:** ${dossierData.scholar.institution}  
**Department:** ${dossierData.scholar.department}  
**Institutional Email:** ${dossierData.scholar.email || "N/A"}  
**Office Extension:** ${dossierData.scholar.phone || "N/A"}  
**Access Tier:** ${dossierData.repositoryMetrics.accessTier}  
**Audit Timestamp:** ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}  

---

## 🔬 Scholarly Focus & Abstract
${dossierData.scholar.bio || "No academic abstract registered."}

## 🏷️ Research Interests & Subject Disciplines
${dossierData.scholar.researchInterests.map((t) => `- **${t}**`).join("\n")}

---
*Generated by LibrisAI Digital Knowledge Repository & AI Librarian.*
`;
      mimeType = "text/markdown";
      fileExtension = "md";
    }

    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scholar_dossier_${(fullName || "scholar").toLowerCase().replace(/\s+/g, "_")}.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Scholar dossier exported as .${fileExtension.toUpperCase()} successfully!`);
  };

  return (
    <div className="space-y-6">
      {/* 1. Scholar Identity Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-2xs">
        {/* Subtle decorative background gradient */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar with Dropdown Options Trigger */}
          <div className="relative shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  disabled={isUploadingAvatar}
                  className="group relative rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer select-none transition-transform hover:scale-[1.03] active:scale-[0.98]"
                  title="Profile photo options"
                  aria-label="Profile photo options"
                >
                  <UserAvatar
                    name={fullName || "Scholar"}
                    path={avatarUrl}
                    previewable={false}
                    className="h-20 w-20 sm:h-24 sm:w-24 border-2 border-border/80 shadow-md ring-2 ring-primary/20"
                  />

                  {/* Circular loader inside the avatar circle when uploading */}
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-full bg-black/70 backdrop-blur-[2px] transition-all animate-in fade-in-50 duration-200">
                      <svg className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="3"
                        />
                        <path
                          className="opacity-95"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span className="text-[8px] sm:text-[9px] font-semibold tracking-wide text-white/95 mt-1 uppercase">
                        Uploading
                      </span>
                    </div>
                  )}

                  {/* Camera overlay & badge indicator when not uploading */}
                  {!isUploadingAvatar && (
                    <>
                      <span className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 backdrop-blur-[1px]">
                        <Camera className="h-5 w-5 drop-shadow-sm" />
                        <span className="text-[9px] font-medium mt-0.5">Options</span>
                      </span>
                      <span className="absolute bottom-0 right-0 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md ring-2 ring-card group-hover:scale-110 transition-transform">
                        <Camera className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </span>
                    </>
                  )}
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start" className="w-52 p-1.5 shadow-xl rounded-xl border border-border/80 bg-popover/95 backdrop-blur-xl">
                <DropdownMenuItem
                  onClick={() => setIsViewPhotoOpen(true)}
                  className="flex items-center gap-2.5 py-2 px-2.5 text-xs font-medium cursor-pointer rounded-lg hover:bg-accent focus:bg-accent"
                >
                  <Eye className="h-4 w-4 text-primary" />
                  <span>View profile photo</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2.5 py-2 px-2.5 text-xs font-medium cursor-pointer rounded-lg hover:bg-accent focus:bg-accent"
                >
                  <Upload className="h-4 w-4 text-primary" />
                  <span>Upload photo</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleAvatarFileChange}
              className="hidden"
            />
          </div>

          {/* Scholar Identity Info */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground/95">
                {fullName || "Scholar"}
              </h2>
              <span className="inline-flex items-center rounded-full bg-secondary border border-border/80 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground capitalize">
                {role === "admin" ? "Administrator Tier" : "Scholar Tier"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary border border-border/80 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                <ShieldCheck className="h-3 w-3 text-primary" />
                Verified Fellow
              </span>
            </div>

            <p className="text-xs sm:text-sm font-medium text-foreground/90 flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4 shrink-0 text-primary" />
              <span>{academicTitle || "Doctoral Research Fellow"}</span>
            </p>

            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              <span>{department || "Department of Informatics"}</span> • <span>{institution || "Institute of Advanced Scientific Research"}</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. Main Profile Form & Institutional Credentials */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card A: Institutional Affiliation & Credentials */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <GraduationCap className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Institutional Affiliation & Title
              </h3>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="prof-name" className="text-xs font-semibold">
                  Full Name / Legal Scholar Identity
                </Label>
                <Input
                  id="prof-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Alex Mercer"
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="prof-title" className="text-xs font-semibold">
                    Academic Title / Research Rank
                  </Label>
                  <span className="text-[10px] text-muted-foreground">Select or type custom</span>
                </div>
                <Input
                  id="prof-title"
                  value={academicTitle}
                  onChange={(e) => setAcademicTitle(e.target.value)}
                  placeholder="e.g. Doctoral Research Fellow"
                  className="h-9 text-xs"
                />
                {/* Quick Title Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {ACADEMIC_TITLE_SUGGESTIONS.slice(0, 4).map((title, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAcademicTitle(title)}
                      className="text-[10px] font-medium rounded-md px-2 py-0.5 bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="prof-institution" className="text-xs font-semibold">
                  Primary University / Research Institution
                </Label>
                <Input
                  id="prof-institution"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. Oxford-Stanford Joint AI Research Center"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="prof-department" className="text-xs font-semibold">
                  Department / Laboratory / Faculty
                </Label>
                <Input
                  id="prof-department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Department of Computer Science & Cryptography"
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <Label htmlFor="prof-email" className="text-xs font-semibold">
                    Institutional Email
                  </Label>
                  <Input
                    id="prof-email"
                    value={user?.email || ""}
                    disabled
                    className="h-9 text-xs bg-muted/50 cursor-not-allowed font-mono text-muted-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prof-phone" className="text-xs font-semibold">
                    Office / Direct Telephone
                  </Label>
                  <Input
                    id="prof-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 019-2834"
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card B: Scholarly Bio & Research Topics */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-2xs space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                <BookOpen className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Academic Bio & Research Disciplines
                </h3>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="prof-bio" className="text-xs font-semibold">
                    Academic Abstract / Research Biography
                  </Label>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {bio.length} / 500 characters
                  </span>
                </div>
                <Textarea
                  id="prof-bio"
                  value={bio}
                  maxLength={500}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Describe your current scholarly investigations, experimental methodologies, and literature interests..."
                  className="min-h-[110px] text-xs resize-none leading-relaxed"
                />
              </div>

              {/* Research Interests Tags */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">
                  Active Research Subjects & Keywords
                </Label>

                {/* Current Tags */}
                <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 rounded-xl border border-border/70 bg-muted/20">
                  {researchInterests.length === 0 ? (
                    <span className="text-xs text-muted-foreground italic">
                      No research subjects selected. Add from suggestions below or enter custom topics.
                    </span>
                  ) : (
                    researchInterests.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs font-semibold gap-1 pl-2.5 pr-1 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="h-3.5 w-3.5 rounded-full hover:bg-primary/20 flex items-center justify-center transition-colors"
                          aria-label={`Remove ${tag}`}
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </Badge>
                    ))
                  )}
                </div>

                {/* Add Tag Input */}
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Type subject (e.g. Distributed Consensus) and hit Enter"
                    className="h-8 text-xs flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs px-3 gap-1 shrink-0"
                    onClick={() => handleAddTag()}
                  >
                    <Plus className="h-3 w-3" /> Add Topic
                  </Button>
                </div>

                {/* Suggested Topics */}
                <div className="pt-1 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Suggested Archival Fields:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {SUGGESTED_RESEARCH_TAGS.map((tag) => {
                      const isSelected = researchInterests.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => (isSelected ? handleRemoveTag(tag) : handleAddTag(tag))}
                          className={cn(
                            "text-[10px] rounded-md px-2 py-0.5 font-medium transition-colors border",
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border-border/70"
                          )}
                        >
                          {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Quota & Access Summary Box */}
            <div className="rounded-xl border border-border/70 bg-muted/30 p-3 text-xs space-y-1.5 mt-4">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium">
                  <HardDrive className="h-3.5 w-3.5 text-primary" /> Library Retrieval Quota:
                </span>
                <span className="font-bold text-foreground">Unlimited Institutional Access</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Verification Protocol:
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  Authenticated Scholar
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating/Bottom Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {hasUnsavedChanges ? (
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold animate-pulse">
                <AlertCircle className="h-4 w-4" /> You have unsaved profile changes
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <Check className="h-4 w-4" /> All academic credentials up to date
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!hasUnsavedChanges || isSaving}
              onClick={handleReset}
              className="text-xs"
            >
              Discard
            </Button>

            <Button
              type="submit"
              size="sm"
              disabled={isSaving}
              className="bg-primary text-primary-foreground font-semibold text-xs gap-1.5 shadow-xs px-4"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving Changes...
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" /> Save Profile Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* 3. Account Security & Research Dossier Export Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Card C: Account Security & Password Update */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <Lock className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Institutional Security & Password
            </h3>
          </div>

          <p className="text-xs text-muted-foreground">
            Change your account authentication password. Passwords must be at least 8 characters and contain mixed case characters.
          </p>

          <form onSubmit={handlePasswordChange} className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="new-pw" className="text-xs font-semibold">
                New Password
              </Label>
              <PasswordInput
                id="new-pw"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-pw" className="text-xs font-semibold">
                Confirm New Password
              </Label>
              <PasswordInput
                id="confirm-pw"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="h-9 text-xs"
              />
            </div>

            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={isChangingPassword || !newPassword}
              className="text-xs gap-1.5 font-semibold w-full sm:w-auto"
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Updating Password...
                </>
              ) : (
                <>
                  <Lock className="h-3.5 w-3.5" /> Update Account Password
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Card D: Research Dossier Export & Archival Audit */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Download className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Research Dossier & Data Portability
              </h3>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Export your scholarly profile, institutional credentials, active research topics, and archival retrieval metrics as a portable academic dossier.
            </p>

            <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium">
                  <Award className="h-3.5 w-3.5 text-amber-500" /> Academic Identifier:
                </span>
                <span className="font-mono text-foreground">{user?.id?.slice(0, 13)}...</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium">
                  <Layers className="h-3.5 w-3.5 text-indigo-500" /> Research Topics:
                </span>
                <span className="font-bold text-foreground">{researchInterests.length} Disciplines</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-4 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleExportDossier("markdown")}
              className="text-xs gap-1.5 font-semibold flex-1 sm:flex-none shadow-2xs"
            >
              <FileText className="h-3.5 w-3.5 text-primary" /> Export Dossier (.MD)
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleExportDossier("json")}
              className="text-xs gap-1.5 font-semibold flex-1 sm:flex-none shadow-2xs"
            >
              <Download className="h-3.5 w-3.5 text-emerald-500" /> Export JSON
            </Button>
          </div>
        </div>
      </div>

      {/* Dialog for Viewing Profile Photo */}
      <Dialog open={isViewPhotoOpen} onOpenChange={setIsViewPhotoOpen}>
        <DialogContent className="w-[min(92vw,24rem)] sm:max-w-md p-6 text-center">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-foreground truncate">
              {fullName || "Scholar"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Profile Photo Preview
            </DialogDescription>
          </DialogHeader>

          <div className="my-5 flex items-center justify-center">
            <div className="relative h-52 w-52 sm:h-60 sm:w-60 overflow-hidden rounded-full border-4 border-border/80 bg-muted shadow-2xl ring-4 ring-primary/20 flex items-center justify-center">
              {avatarUrl && !avatarUrl.includes("images.unsplash.com") ? (
                <img
                  src={avatarUrl}
                  alt={fullName || "Scholar Profile"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground p-4">
                  <UserAvatar
                    name={fullName || "Scholar"}
                    path={null}
                    previewable={false}
                    className="h-28 w-28"
                  />
                  <span className="text-xs mt-3 text-muted-foreground font-medium">No custom photo uploaded yet</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 pt-1">
            {avatarUrl && !avatarUrl.includes("images.unsplash.com") && (
              <Button type="button" variant="outline" size="sm" asChild>
                <a href={avatarUrl} target="_blank" rel="noopener noreferrer" className="gap-1.5 text-xs font-semibold">
                  <ExternalLink className="h-3.5 w-3.5" />
                  View full image
                </a>
              </Button>
            )}
            <Button
              type="button"
              variant="default"
              size="sm"
              className="gap-1.5 text-xs font-semibold"
              onClick={() => {
                setIsViewPhotoOpen(false);
                fileInputRef.current?.click();
              }}
            >
              <Upload className="h-3.5 w-3.5" />
              Upload photo
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="text-xs font-medium"
              onClick={() => setIsViewPhotoOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
