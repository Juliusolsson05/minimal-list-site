CREATE TABLE "Song" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "album" TEXT,
    "imageUrl" TEXT NOT NULL,
    "link" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Song_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Song_slug_key" ON "Song"("slug");
CREATE INDEX "Song_slug_idx" ON "Song"("slug");
CREATE INDEX "Song_archivedAt_idx" ON "Song"("archivedAt");
CREATE INDEX "Song_addedAt_idx" ON "Song"("addedAt");
