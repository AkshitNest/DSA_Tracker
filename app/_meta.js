import { metadata as profileMeta } from './profile/metadata';
import { metadata as trackerMeta } from './tracker/metadata';
import { metadata as companiesMeta } from './company-wise-questions/metadata';
import { metadata as supportMeta } from './support/metadata';

// Next.js App Router: re-export metadata from each route's layout or metadata file.
// Since all pages are "use client", we create dedicated layout.js per route.
export { profileMeta, trackerMeta, companiesMeta, supportMeta };
