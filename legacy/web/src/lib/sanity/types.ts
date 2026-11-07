/**
 * Tipos compartilhados do schema Sanity.
 * Mantidos manualmente — quando o schema crescer, considerar `sanity typegen`.
 */

import type { Image } from "sanity";

export type LocalizedString = { pt?: string | null; en?: string | null };
export type LocalizedText = LocalizedString;
export type LocalizedSlug = {
  pt?: { current?: string | null } | null;
  en?: { current?: string | null } | null;
};

export type SanityImage = Image & {
  alt?: string | null;
  altEn?: string | null;
};

export type Ref<T> = T & { _id: string; _type: string };

export type Topic = {
  _id: string;
  name: LocalizedString;
  slug: LocalizedSlug;
};

export type ResearchArea = {
  _id: string;
  name: LocalizedString;
  slug: LocalizedSlug;
};

export type Tag = {
  _id: string;
  label: LocalizedString;
  slug: LocalizedSlug;
};

export type EducationLevel = {
  _id: string;
  name: LocalizedString;
  slug: LocalizedSlug;
  order: number;
};

export type Member = {
  _id: string;
  name: string;
  displayName?: string | null;
  photo?: SanityImage | null;
  role:
    | "coordinator"
    | "researcher"
    | "postdoc"
    | "phd"
    | "msc"
    | "undergrad"
    | "collaborator";
  active: boolean;
  bio?: LocalizedText | null;
  researchAreas?: ResearchArea[] | null;
  topics?: Topic[] | null;
  email?: string | null;
  orcid?: string | null;
  lattesUrl?: string | null;
  linkedinUrl?: string | null;
  personalUrl?: string | null;
  slugPt?: string | null;
  slugEn?: string | null;
};

export type Publication = {
  _id: string;
  title: LocalizedString;
  slug: LocalizedSlug;
  authors?: Pick<Member, "_id" | "name" | "displayName">[] | null;
  externalAuthors?: string[] | null;
  abstract?: LocalizedText | null;
  year: number;
  publishedDate?: string | null;
  venue?: string | null;
  doi?: string | null;
  externalUrl?: string | null;
  featured?: boolean | null;
  topics?: Topic[] | null;
  researchAreas?: ResearchArea[] | null;
  tags?: Tag[] | null;
  pdfFileUrl?: string | null;
  pdfUrl?: string | null;
};

export type Thesis = {
  _id: string;
  title: LocalizedString;
  slug: LocalizedSlug;
  author?: Pick<Member, "_id" | "name"> | null;
  externalAuthorName?: string | null;
  advisor?: Pick<Member, "_id" | "name"> | null;
  coAdvisor?: Pick<Member, "_id" | "name"> | null;
  summary?: LocalizedText | null;
  level: "tcc" | "masters" | "doctorate";
  year: number;
  institution?: string | null;
  program?: string | null;
  topics?: Topic[] | null;
  researchAreas?: ResearchArea[] | null;
  tags?: Tag[] | null;
  pdfFileUrl?: string | null;
  pdfUrl?: string | null;
};

export type TeachingMaterial = {
  _id: string;
  title: LocalizedString;
  slug: LocalizedSlug;
  description?: LocalizedText | null;
  coverImage?: SanityImage | null;
  authors?: Pick<Member, "_id" | "name">[] | null;
  publishedDate?: string | null;
  level?: EducationLevel | null;
  topics?: Topic[] | null;
  tags?: Tag[] | null;
  files?: Array<{
    fileUrl?: string | null;
    url?: string | null;
    label?: LocalizedString | null;
  }> | null;
};

export type MediaItem = {
  _id: string;
  title: LocalizedString;
  slug: LocalizedSlug;
  type: "video" | "lecture" | "podcast" | "webinar";
  videoUrl: string;
  date: string;
  description?: LocalizedText | null;
  speakers?: Pick<Member, "_id" | "name">[] | null;
  externalSpeakers?: string[] | null;
  topics?: Topic[] | null;
  tags?: Tag[] | null;
};

export type Resource = {
  _id: string;
  title: LocalizedString;
  slug: LocalizedSlug;
  description?: LocalizedText | null;
  category: "link" | "dataset" | "tool" | "text" | "other";
  url?: string | null;
  fileUrl?: string | null;
  topics?: Topic[] | null;
  tags?: Tag[] | null;
};

export type EventItem = {
  _id: string;
  title: LocalizedString;
  slug: LocalizedSlug;
  description?: { pt?: unknown; en?: unknown } | null;
  coverImage?: SanityImage | null;
  startDate: string;
  endDate?: string | null;
  location?: string | null;
  isOnline?: boolean | null;
  registrationUrl?: string | null;
  speakers?: Pick<Member, "_id" | "name">[] | null;
  externalSpeakers?: string[] | null;
  topics?: Topic[] | null;
  tags?: Tag[] | null;
};

export type Pgp = {
  _id: string;
  name: string;
  longName?: LocalizedString | null;
  slug: LocalizedSlug;
  description?: LocalizedText | null;
  status: "active" | "forming" | "inactive";
  foundedYear?: number | null;
  school?: string | null;
  coordinator?: Pick<Member, "_id" | "name"> | null;
  members?: Pick<Member, "_id" | "name" | "displayName" | "role" | "photo">[] | null;
  topics?: Topic[] | null;
  researchAreas?: ResearchArea[] | null;
  social?: {
    whatsapp?: string | null;
    telegram?: string | null;
    instagram?: string | null;
  } | null;
};

export type Page = {
  _id: string;
  title: LocalizedString;
  slug: LocalizedSlug;
  kind: "about" | "contact" | "research-lines" | "free";
  body?: { pt?: unknown; en?: unknown } | null;
  seoDescription?: LocalizedText | null;
};

export type SiteSettings = {
  siteName: LocalizedString;
  tagline?: LocalizedString | null;
  logo?: SanityImage | null;
  logoDark?: SanityImage | null;
  heroIntro?: { pt?: unknown; en?: unknown } | null;
  contactEmail?: string | null;
  social?: {
    instagram?: string | null;
    youtube?: string | null;
    linkedin?: string | null;
  } | null;
  organization?: {
    legalName?: string | null;
    parentOrganization?: string | null;
    address?: string | null;
  } | null;
};
