# TODO: Remove Map-Related Features from Land Model

## Steps to Complete

- [x] Remove geometry and centroid from ILand interface and LandSchema in src/models/Land.ts, including the 2dsphere indexes.
- [x] Update src/components/land/LandMapViewer.tsx to remove geometry and centroid usage.
- [x] Update src/components/land/LandBoundaryMap.tsx to remove or modify boundary drawing functionality.
- [x] Update src/app/api/lands/route.ts to remove geometry and centroid handling.
- [x] Update src/app/farmer/lands/new/page.tsx to remove map-related UI and logic.
- [x] Update src/app/lands/[id]/page.tsx to remove map-related UI and logic.
- [x] Test the application for any remaining references or errors.
- [x] Consider database migration to remove these fields from existing data.
