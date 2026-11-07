import { ID } from "./ids";
import { lstr } from "./helpers";

const heroIntroPt = [
  {
    _key: "intro-1",
    _type: "block",
    style: "normal",
    children: [
      {
        _key: "intro-1-1",
        _type: "span",
        text:
          "O GGP é um coletivo que conecta a universidade e a educação básica, articulando " +
          "professores universitários, licenciandos e professores K-12 por meio de PGPs " +
          "(Pequenos Grupos de Pesquisa). Aqui você encontra publicações, materiais didáticos " +
          "e eventos do grupo.",
      },
    ],
    markDefs: [],
  },
];

const heroIntroEn = [
  {
    _key: "intro-en-1",
    _type: "block",
    style: "normal",
    children: [
      {
        _key: "intro-en-1-1",
        _type: "span",
        text:
          "GGP is a research collective bridging university and K-12 education, bringing " +
          "together university professors, teacher-education students and school teachers " +
          "through PGPs (Small Research Groups). Browse our publications, teaching " +
          "materials and events.",
      },
    ],
    markDefs: [],
  },
];

export const siteSettingsDoc = {
  _id: ID.siteSettings,
  _type: "siteSettings",
  siteName: lstr("Grande Grupo de Pesquisa", "Large Research Group"),
  tagline: lstr(
    "Pesquisa e educação em ensino de física na UFG",
    "Research and education in physics teaching at UFG",
  ),
  heroIntro: { pt: heroIntroPt, en: heroIntroEn },
  // TODO completar: contactEmail, logo, logoDark
  social: {
    instagram: "https://instagram.com/ggp.fisica",
    youtube: "https://youtube.com/channel/UCc_-y8bfvMSaXjyd4O69-DQ",
    // TODO linkedin
  },
  organization: {
    legalName: "Grande Grupo de Pesquisa em Ensino de Física",
    parentOrganization: "Universidade Federal de Goiás",
    // TODO address: campus / instituto de física
  },
};
