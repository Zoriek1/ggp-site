/**
 * 5 membros identificados em sites.google.com/view/ggpfisica/quem-somos.
 * TODOs por documento:
 *  - foto (campo `photo` precisa de upload via Studio depois)
 *  - email institucional UFG
 *  - ORCID
 *  - Lattes
 *  - bio expandida
 *
 * Os papéis abaixo são chutes informados (Genovese coordena; demais como pesquisador
 * ou estudante). Coordenador real deve revisar via Studio antes de tornar público.
 */

import { ID } from "./ids";
import { lstr, lslug, refArray } from "./helpers";

const all = (id: string, name: string, role: string, opts: { active?: boolean; bioPt?: string; bioEn?: string } = {}) => ({
  _id: id,
  _type: "member",
  name,
  role,
  active: opts.active ?? true,
  slug: lslug(slugifyName(name)),
  ...(opts.bioPt
    ? { bio: lstr(opts.bioPt, opts.bioEn) }
    : {}),
  researchAreas: refArray([ID.area.ensinoFisica, ID.area.formacaoProfessores]),
  topics: refArray([ID.topic.ensino]),
});

function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export const memberDocs = [
  all(ID.member.genovese, "Luiz Gonzaga Roversi Genovese", "coordinator", {
    bioPt:
      "Coordenador do GGP. Pesquisador em ensino de física, formação de professores e práticas " +
      "pedagógicas em escolas públicas.",
  }),
  all(ID.member.macedo, "Sabrinna A. R. Macedo", "researcher", {
    bioPt: "Professora e pesquisadora associada ao GGP.",
  }),
  all(ID.member.moura, "Tuan Moura", "researcher"),
  all(ID.member.faria, "João Lucas A. de Faria", "msc"),
  all(ID.member.orsini, "Marco Antonio F. Orsini", "researcher"),
];
