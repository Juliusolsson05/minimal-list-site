"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore, Edit, Music, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

interface AdminMusicManagerProps {
  songs: Song[];
}

type FormData = {
  name: string;
  artist: string;
  album: string;
  link: string;
  addedAt: string;
  image: string;
};

function toInputDate(date: Date | string): string {
  return new Date(date).toISOString().slice(0, 10);
}

export default function AdminMusicManager({ songs: initialSongs }: AdminMusicManagerProps) {
  const router = useRouter();
  const [songs, setSongs] = useState(initialSongs);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    artist: "",
    album: "",
    link: "",
    addedAt: toInputDate(new Date()),
    image: "",
  });

  const resetForm = () => {
    setEditingSong(null);
    setFormData({
      name: "",
      artist: "",
      album: "",
      link: "",
      addedAt: toInputDate(new Date()),
      image: "",
    });
  };

  const handleOpenDialog = (song?: Song) => {
    if (song) {
      setEditingSong(song);
      setFormData({
        name: song.name,
        artist: song.artist,
        album: song.album || "",
        link: song.link || "",
        addedAt: toInputDate(song.addedAt),
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      setFormData((current) => ({
        ...current,
        image: readerEvent.target?.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.image && !editingSong) {
        alert("Please upload cover art");
        return;
      }

      const response = await fetch(editingSong ? `/api/songs/${editingSong.id}` : "/api/songs", {
        method: editingSong ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          ...(formData.image ? { image: formData.image } : {}),
        }),
      });

      if (!response.ok) throw new Error("Failed to save song");

      router.refresh();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving song:", error);
      alert("Failed to save song. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleArchive = async (song: Song) => {
    const archiving = !song.archivedAt;
    setIsLoading(true);

    try {
      const response = await fetch(`/api/songs/${song.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: archiving }),
      });

      if (!response.ok) throw new Error("Failed to update song");

      setSongs(songs.map((current) => (
        current.id === song.id ? { ...current, archivedAt: archiving ? new Date() : null } : current
      )));
      router.refresh();
    } catch (error) {
      console.error("Error toggling song archive:", error);
      alert("Failed to update song. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this song?")) return;
    setIsLoading(true);

    try {
      const response = await fetch(`/api/songs/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete song");

      setSongs(songs.filter((song) => song.id !== id));
      router.refresh();
    } catch (error) {
      console.error("Error deleting song:", error);
      alert("Failed to delete song. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium text-foreground">Music</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage songs, albums, and cover art
          </p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-foreground text-background hover:bg-foreground/90"
        >
          <Music className="h-4 w-4 mr-2" />
          Add Music
        </Button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Song
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Added
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-border">
              {songs.map((song) => (
                <tr
                  key={song.id}
                  className={`hover:bg-muted/50 transition-colors ${song.archivedAt ? "opacity-50" : ""}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded bg-muted overflow-hidden flex-shrink-0">
                        <img
                          src={song.imageUrl}
                          alt={song.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground truncate">
                            {song.name}
                          </p>
                          {song.archivedAt && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                              Archived
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {song.artist}{song.album ? ` - ${song.album}` : ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {toInputDate(song.addedAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(song)}
                        disabled={isLoading}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleArchive(song)}
                        disabled={isLoading}
                        title={song.archivedAt ? "Unarchive" : "Archive"}
                      >
                        {song.archivedAt
                          ? <ArchiveRestore className="h-4 w-4" />
                          : <Archive className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(song.id)}
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

      {songs.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          No music yet. Add a first song or album.
        </p>
      )}

      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingSong ? "Edit Music" : "Add Music"}</DialogTitle>
            <DialogDescription>
              Add a song, album, or other music reference to your list.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="song-name">Name</Label>
                <Input
                  id="song-name"
                  value={formData.name}
                  onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="song-artist">Artist</Label>
                <Input
                  id="song-artist"
                  value={formData.artist}
                  onChange={(event) => setFormData({ ...formData, artist: event.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="song-album">Album</Label>
                <Input
                  id="song-album"
                  value={formData.album}
                  onChange={(event) => setFormData({ ...formData, album: event.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="song-added-at">Added date</Label>
                <Input
                  id="song-added-at"
                  type="date"
                  value={formData.addedAt}
                  onChange={(event) => setFormData({ ...formData, addedAt: event.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="song-link">Link</Label>
              <Input
                id="song-link"
                type="url"
                value={formData.link}
                onChange={(event) => setFormData({ ...formData, link: event.target.value })}
                placeholder="https://open.spotify.com/..."
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="song-image">Cover art</Label>
              <div className="flex items-center gap-4">
                {(formData.image || editingSong?.imageUrl) && (
                  <div className="h-20 w-20 overflow-hidden rounded bg-muted">
                    <img
                      src={formData.image || editingSong?.imageUrl}
                      alt="Cover preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <Label
                  htmlFor="song-image"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  <Upload className="h-4 w-4" />
                  Upload cover
                </Label>
                <Input
                  id="song-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isLoading}
                />
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
                disabled={isLoading}
                className="bg-foreground text-background hover:bg-foreground/90"
              >
                {isLoading ? "Saving..." : editingSong ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
