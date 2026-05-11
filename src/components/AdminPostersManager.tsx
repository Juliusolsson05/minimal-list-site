"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, ImageIcon, Upload, Loader2, Sparkles, Archive, ArchiveRestore } from "lucide-react";
import PosterRenderer from "@/components/PosterRenderer";
import { toast } from "sonner";

interface Poster {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  archivedAt?: Date | null;
}

interface AdminPostersManagerProps {
  posters: Poster[];
}

type PosterFormData = {
  name: string;
  description: string;
  image: string;
};

export default function AdminPostersManager({ posters: initialPosters }: AdminPostersManagerProps) {
  const router = useRouter();
  const [posters, setPosters] = useState(initialPosters);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPoster, setEditingPoster] = useState<Poster | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedPoster, setUploadedPoster] = useState<string | null>(null);
  const [renderedPoster, setRenderedPoster] = useState<string | null>(null);
  const [formData, setFormData] = useState<PosterFormData>({
    name: "",
    description: "",
    image: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      image: "",
    });
    setEditingPoster(null);
    setUploadedPoster(null);
    setRenderedPoster(null);
  };

  const handleOpenDialog = (poster?: Poster) => {
    if (poster) {
      setEditingPoster(poster);
      setFormData({
        name: poster.name,
        description: poster.description,
        image: "",
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;
      setUploadedPoster(imageData);

      // Trigger AI analysis for new posters
      if (!editingPoster) {
        setIsAnalyzing(true);
        try {
          const response = await fetch('/api/ai/analyze-poster', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageData })
          });

          if (response.ok) {
            const { name, description } = await response.json();
            setFormData(prev => ({
              ...prev,
              name: name || prev.name,
              description: description || prev.description
            }));
            toast.success('AI suggestions applied');
          }
        } catch (error) {
          console.error('AI analysis failed:', error);
          // Silent fail - user can still enter manually
        } finally {
          setIsAnalyzing(false);
        }
      }
    };
    reader.readAsDataURL(file);
  }, [editingPoster]);

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Paste event listener for Ctrl+V
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // Only handle paste when dialog is open and creating new poster
      if (!isDialogOpen || editingPoster) return;

      // Don't intercept if user is typing in an input
      if (document.activeElement?.tagName === 'INPUT' ||
          document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            handleFileUpload(file);
            toast.success('Image pasted from clipboard');
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isDialogOpen, editingPoster, handleFileUpload]);

  const handleRendered = useCallback((dataUrl: string) => {
    setRenderedPoster(dataUrl);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Use rendered poster (framed) if available, otherwise existing image
      const imageData = renderedPoster || formData.image;

      // Use uploaded poster (original) for imageOriginal
      const imageOriginalData = uploadedPoster || null;

      if (!imageData && !editingPoster) {
        toast.error('Please upload a poster image');
        setIsLoading(false);
        return;
      }

      const url = editingPoster ? `/api/posters/${editingPoster.id}` : "/api/posters";
      const method = editingPoster ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          ...(imageData && { image: imageData }),
          ...(imageOriginalData && { imageOriginal: imageOriginalData }),
        }),
      });

      if (!response.ok) throw new Error("Failed to save poster");

      router.refresh();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving poster:", error);
      toast.error("Failed to save poster. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this poster?")) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/posters/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete poster");

      setPosters(posters.filter((poster) => poster.id !== id));
      router.refresh();
    } catch (error) {
      console.error("Error deleting poster:", error);
      toast.error("Failed to delete poster. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleArchive = async (poster: Poster) => {
    const archiving = !poster.archivedAt;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/posters/${poster.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: archiving }),
      });

      if (!response.ok) throw new Error("Failed to update poster");

      setPosters(posters.map((p) => p.id === poster.id ? { ...p, archivedAt: archiving ? new Date() : null } : p));
      router.refresh();
      toast.success(archiving ? "Poster archived" : "Poster unarchived");
    } catch (error) {
      console.error("Error toggling archive:", error);
      toast.error("Failed to update poster. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <ImageIcon className="h-6 w-6 text-foreground" />
          <div>
            <h2 className="text-xl font-medium text-foreground">Posters</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your poster collection
            </p>
          </div>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-foreground text-background hover:bg-foreground/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Poster
        </Button>
      </div>

      {/* Posters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posters.map((poster) => (
          <div
            key={poster.id}
            className={`border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow ${poster.archivedAt ? 'opacity-50' : ''}`}
          >
            <div className="aspect-square bg-muted overflow-hidden">
              <img
                src={poster.imageUrl}
                alt={poster.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-4 space-y-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground truncate">{poster.name}</h3>
                  {poster.archivedAt && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground flex-shrink-0">
                      Archived
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{poster.description}</p>
              </div>
              <div className="flex gap-2 pt-2 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenDialog(poster)}
                  disabled={isLoading}
                  className="flex-1"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleArchive(poster)}
                  disabled={isLoading}
                  className="flex-1"
                  title={poster.archivedAt ? 'Unarchive' : 'Archive'}
                >
                  {poster.archivedAt
                    ? <ArchiveRestore className="h-4 w-4" />
                    : <Archive className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(poster.id)}
                  disabled={isLoading}
                  className="flex-1"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {posters.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No posters yet. Start building your collection!
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPoster ? "Edit Poster" : "Add New Poster"}
            </DialogTitle>
            <DialogDescription>
              {editingPoster
                ? "Update poster details below"
                : "Add a new poster to your collection"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="poster-name" className="flex items-center gap-2">
                Poster Name
                {isAnalyzing && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Analyzing...
                  </span>
                )}
              </Label>
              <Input
                id="poster-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={isAnalyzing ? "Analyzing poster..." : "Enter poster name"}
                required
                disabled={isLoading || isAnalyzing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-2">
                Description
                {isAnalyzing && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Sparkles className="h-3 w-3" />
                    AI generating...
                  </span>
                )}
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={isAnalyzing ? "Generating description..." : "Enter description"}
                required
                disabled={isLoading || isAnalyzing}
                rows={3}
              />
            </div>

            {/* Poster Upload & Renderer */}
            <div className="space-y-4 pb-4 border-b border-border">
              <Label>Poster Image</Label>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-foreground/20 transition-colors">
                    <input
                      type="file"
                      id="poster-upload"
                      accept="image/*"
                      onChange={handlePosterChange}
                      className="hidden"
                      disabled={isLoading}
                    />
                    <label
                      htmlFor="poster-upload"
                      className="cursor-pointer block space-y-2"
                    >
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      <div className="text-sm text-muted-foreground">
                        {uploadedPoster ? (
                          <span className="text-foreground">Poster uploaded</span>
                        ) : (
                          <span>Upload poster image</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Click to select or paste (Ctrl+V)
                      </div>
                    </label>
                  </div>
                  {uploadedPoster && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setUploadedPoster(null);
                        setRenderedPoster(null);
                      }}
                      className="w-full"
                    >
                      Remove Poster
                    </Button>
                  )}
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-2">Preview</div>
                  <PosterRenderer
                    posterImage={uploadedPoster || undefined}
                    onRendered={handleRendered}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-foreground text-background hover:bg-foreground/90"
                disabled={isLoading}
              >
                {isLoading
                  ? "Saving..."
                  : editingPoster
                  ? "Save Changes"
                  : "Add Poster"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
