-- CreateTable
CREATE TABLE "Series" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "roundFormat" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "seriesId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    CONSTRAINT "Event_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Score" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "seriesId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "usaArcheryNo" TEXT NOT NULL,
    "archerName" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "ageClass" TEXT NOT NULL,
    "total" INTEGER NOT NULL,
    "arrows" TEXT NOT NULL,
    CONSTRAINT "Score_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Score_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Series_slug_key" ON "Series"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Event_seriesId_externalId_key" ON "Event"("seriesId", "externalId");

-- CreateIndex
CREATE INDEX "Score_seriesId_idx" ON "Score"("seriesId");

-- CreateIndex
CREATE UNIQUE INDEX "Score_eventId_usaArcheryNo_division_gender_ageClass_key" ON "Score"("eventId", "usaArcheryNo", "division", "gender", "ageClass");
