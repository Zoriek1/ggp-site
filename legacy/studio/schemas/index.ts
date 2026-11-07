import { localizedString } from "./objects/localizedString";
import { localizedText } from "./objects/localizedText";
import { localizedSlug } from "./objects/localizedSlug";
import { localizedBody } from "./objects/localizedBody";
import { externalFile } from "./objects/externalFile";

import { researchArea } from "./taxonomy/researchArea";
import { physicsTopic } from "./taxonomy/physicsTopic";
import { tag } from "./taxonomy/tag";
import { educationLevel } from "./taxonomy/educationLevel";

import { member } from "./people/member";
import { pgp } from "./pgps/pgp";

import { publication } from "./academic/publication";
import { thesis } from "./academic/thesis";
import { teachingMaterial } from "./academic/teachingMaterial";
import { media } from "./academic/media";
import { resource } from "./academic/resource";
import { event } from "./academic/event";

import { page } from "./institutional/page";
import { siteSettings } from "./institutional/siteSettings";

export const schemaTypes = [
  // Objects
  localizedString,
  localizedText,
  localizedSlug,
  localizedBody,
  externalFile,
  // Taxonomy
  researchArea,
  physicsTopic,
  tag,
  educationLevel,
  // People
  member,
  // PGPs
  pgp,
  // Academic
  publication,
  thesis,
  teachingMaterial,
  media,
  resource,
  event,
  // Institutional
  page,
  siteSettings,
];
