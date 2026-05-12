"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Edit, Trash2, Package, ImageIcon, Sparkles, Archive, ArchiveRestore, Music } from "lucide-react";
import AdminPostersManager from "@/components/AdminPostersManager";
import AdminMusicManager from "@/components/AdminMusicManager";
import AIProductCreator from "@/components/AIProductCreator";
import { siteConfig } from "@/lib/site-config";

interface Item {
  id: string;
  name: string;
  slug: string;
  description: string;
  details: string;
  price: string | null;
  link: string | null;
  imageUrl: string;
  categoryId: string;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface User {
  name?: string | null;
  email: string;
}

interface Poster {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Song {
  id: string;
  slug: string;
  name: string;
  artist: string;
  album: string | null;
  imageUrl: string;
  link: string | null;
  addedAt: Date;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface AdminDashboardProps {
  items: Item[];
  categories: Category[];
  posters: Poster[];
  songs: Song[];
  user: User;
}

type FormData = {
  name: string;
  description: string;
  details: string;
  price: string;
  image: string;
  link: string;
  categoryId: string;
};

export default function AdminDashboard({ items: initialItems, categories, posters, songs, user }: AdminDashboardProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedItemImage, setUploadedItemImage] = useState<string | null>(null);
  const [uploadedItemImageOriginal, setUploadedItemImageOriginal] = useState<string | null>(null);
  const [useAiBackgroundRemoval, setUseAiBackgroundRemoval] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [showAICreator, setShowAICreator] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    details: "",
    price: "",
    image: "",
    link: "",
    categoryId: categories[0]?.id || "",
  });

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      details: "",
      price: "",
      image: "",
      link: "",
      categoryId: categories[0]?.id || "",
    });
    setEditingItem(null);
    setUploadedItemImage(null);
    setUploadedItemImageOriginal(null);
    setUseAiBackgroundRemoval(false);
  };

  const handleItemImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const originalImage = event.target?.result as string;
        setUploadedItemImageOriginal(originalImage);

        if (!useAiBackgroundRemoval || !siteConfig.features.ai) {
          setUploadedItemImage(originalImage);
          return;
        }

        setIsProcessingImage(true);
        try {
          const response = await fetch('/api/ai/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image: originalImage,
              targetItem: formData.name,
            }),
          });

          if (!response.ok) throw new Error('Failed to process image');

          const data = await response.json();
          setUploadedItemImage(data.image || originalImage);
        } catch (error) {
          console.error("Error processing image:", error);
          alert("AI image processing failed. Using the original image instead.");
          setUploadedItemImage(originalImage);
        } finally {
          setIsProcessingImage(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenDialog = (item?: Item) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        details: item.details,
        price: item.price || "",
        image: "",
        link: item.link || "",
        categoryId: item.category.id,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Use uploaded image if available, otherwise existing/form image
      const imageData = uploadedItemImage || formData.image;

      if (!imageData && !editingItem) {
        alert('Please upload an item image');
        setIsLoading(false);
        return;
      }

      const url = editingItem ? `/api/items/${editingItem.id}` : "/api/items";
      const method = editingItem ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          ...(imageData && { image: imageData }),
          ...(uploadedItemImageOriginal && { imageOriginal: uploadedItemImageOriginal }),
        }),
      });

      if (!response.ok) throw new Error("Failed to save item");

      router.refresh();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving item:", error);
      alert("Failed to save item. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/items/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete item");

      setItems(items.filter((item) => item.id !== id));
      router.refresh();
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleArchive = async (item: Item) => {
    const archiving = !item.archivedAt;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/items/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: archiving }),
      });

      if (!response.ok) throw new Error("Failed to update item");

      setItems(items.map((i) => i.id === item.id ? { ...i, archivedAt: archiving ? new Date() : null } : i));
      router.refresh();
    } catch (error) {
      console.error("Error toggling archive:", error);
      alert("Failed to update item. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAIComplete = (data: { image: string; imageOriginal: string; productData: { title: string; price: string; tagline: string; description: string } }) => {
    // Populate form with AI-generated data
    setFormData({
      name: data.productData.title,
      description: data.productData.tagline,
      details: data.productData.description,
      price: data.productData.price,
      image: data.image,
      link: "",
      categoryId: categories[0]?.id || "",
    });
    setUploadedItemImage(data.image);
    setUploadedItemImageOriginal(data.imageOriginal);
    setShowAICreator(false);
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-light tracking-tight text-foreground">
                Admin Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Welcome, {user.name || user.email}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="border-border"
              >
                View Site
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-border"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="items" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="items" className="gap-2">
              <Package className="h-4 w-4" />
              Items
            </TabsTrigger>
            {siteConfig.features.posters && (
              <TabsTrigger value="posters" className="gap-2">
                <ImageIcon className="h-4 w-4" />
                Posters
              </TabsTrigger>
            )}
            {siteConfig.features.music && (
              <TabsTrigger value="music" className="gap-2">
                <Music className="h-4 w-4" />
                Music
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="items" className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-medium text-foreground">Items</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage your curated collection
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleOpenDialog()}
                  className="border-border"
                >
                  Add Item
                </Button>
                {siteConfig.features.ai && (
                  <Button
                    onClick={() => setShowAICreator(true)}
                    className="bg-foreground text-background hover:bg-foreground/90"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Add with AI
                  </Button>
                )}
              </div>
            </div>

        {/* Items Table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-muted/50 transition-colors ${item.archivedAt ? 'opacity-50' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded bg-muted overflow-hidden flex-shrink-0">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground truncate">
                              {item.name}
                            </p>
                            {item.archivedAt && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                                Archived
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground">
                        {item.category.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {item.price}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(item)}
                          disabled={isLoading}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleArchive(item)}
                          disabled={isLoading}
                          title={item.archivedAt ? 'Unarchive' : 'Archive'}
                        >
                          {item.archivedAt
                            ? <ArchiveRestore className="h-4 w-4" />
                            : <Archive className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          disabled={isLoading}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
          </TabsContent>

          {siteConfig.features.posters && (
            <TabsContent value="posters">
              <AdminPostersManager posters={posters} />
            </TabsContent>
          )}

          {siteConfig.features.music && (
            <TabsContent value="music">
              <AdminMusicManager songs={songs} />
            </TabsContent>
          )}

        </Tabs>
      </main>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Item" : "Add New Item"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Make changes to the item below"
                : "Fill in the details to add a new item to your collection"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">Details</Label>
              <Textarea
                id="details"
                value={formData.details}
                onChange={(e) =>
                  setFormData({ ...formData, details: e.target.value })
                }
                required
                disabled={isLoading}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="$1,999"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoryId: value })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-image">Product Image</Label>
              {siteConfig.features.ai && (
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={useAiBackgroundRemoval}
                    onChange={(e) => setUseAiBackgroundRemoval(e.target.checked)}
                    disabled={isLoading || isProcessingImage}
                    className="h-4 w-4"
                  />
                  Use AI background removal / studio image
                </label>
              )}
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-foreground/20 transition-colors">
                <input
                  type="file"
                  id="item-image"
                  accept="image/*"
                  onChange={handleItemImageUpload}
                  className="hidden"
                  disabled={isLoading || isProcessingImage}
                />
                <label
                  htmlFor="item-image"
                  className="cursor-pointer block space-y-2"
                >
                  {isProcessingImage ? (
                    <p className="text-sm text-muted-foreground">Processing image...</p>
                  ) : uploadedItemImage || editingItem ? (
                    <div className="space-y-2">
                      {uploadedItemImage && (
                        <img
                          src={uploadedItemImage}
                          alt="Preview"
                          className="max-h-32 mx-auto rounded"
                        />
                      )}
                      <p className="text-sm text-foreground">
                        {uploadedItemImage ? 'Click to change image' : 'Click to upload new image'}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="text-sm text-muted-foreground">
                        Upload product image
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Click to select image
                      </div>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Product Link (Optional)</Label>
              <Input
                id="link"
                type="url"
                value={formData.link}
                onChange={(e) =>
                  setFormData({ ...formData, link: e.target.value })
                }
                placeholder="https://..."
                disabled={isLoading}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={isLoading || isProcessingImage}
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
                  : editingItem
                  ? "Save Changes"
                  : "Add Item"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* AI Product Creator */}
      {showAICreator && (
        <AIProductCreator
          onComplete={handleAIComplete}
          onCancel={() => setShowAICreator(false)}
        />
      )}
    </div>
  );
}
