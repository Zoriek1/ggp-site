import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { sanityClient } from "./client";
import { env } from "../env";

const builder = sanityClient
  ? imageUrlBuilder(sanityClient)
  : imageUrlBuilder({ projectId: env.projectId || "placeholder", dataset: env.dataset });

export const urlFor = (source: SanityImageSource) => builder.image(source);

export const PRESETS = {
  memberThumb: (src: SanityImageSource) =>
    urlFor(src).width(400).height(400).fit("crop").auto("format").url(),
  memberHero: (src: SanityImageSource) =>
    urlFor(src).width(800).height(800).fit("crop").auto("format").url(),
  publicationCover: (src: SanityImageSource) =>
    urlFor(src).width(640).height(360).fit("crop").auto("format").url(),
  hero: (src: SanityImageSource) =>
    urlFor(src).width(1920).height(1080).fit("crop").auto("format").url(),
  thumb16x9: (src: SanityImageSource) =>
    urlFor(src).width(640).height(360).fit("crop").auto("format").url(),
  logo: (src: SanityImageSource) => urlFor(src).width(160).auto("format").url(),
};
