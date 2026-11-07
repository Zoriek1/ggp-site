/**
 * Seed dos PGPs. Apenas siglas/nomes exatos enviados pelo coordenador.
 * Sem expansão de nome de escola, descrição, membros ou redes — tudo TODO no Studio.
 *
 * "É tudo PGP" — clubes, preparações, grupos editoriais e PGPs propriamente ditos
 * compartilham o mesmo schema. Coordenador pode classificar via tags depois se quiser.
 */

import { ID } from "./ids";
import { lslug } from "./helpers";

function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const make = (id: string, name: string) => ({
  _id: id,
  _type: "pgp",
  name,
  slug: lslug(slugifyName(name)),
  status: "active",
});

export const pgpDocs = [
  make(ID.pgp.sl, "PGP-SL"),
  make(ID.pgp.pibidDisciplinas, "GGP-PIBID-Disciplinas"),
  make(ID.pgp.pibidRpEstagio, "GGP/PIBID/RP/ESTAGIO"),
  make(ID.pgp.pibidRpProfessores, "GGP/PIBID/RP_PROFESSORES"),
  make(ID.pgp.nossaCaraDidatica, "Nossa Cara Didática"),
  make(ID.pgp.calourosFisica, "Calouros da Física"),
  make(ID.pgp.ceciliaMeireles, "PGP Cecília Meireles"),
  make(ID.pgp.mansoesParaiso, "PGP_Mansões Paraíso"),
  make(ID.pgp.waldemarMundim, "PGP - Waldemar Mundim"),
  make(ID.pgp.oba2026, "Preparação OBA 2026"),
  make(ID.pgp.tecnocienc, "PGP - TECNOCIENC-Desoriente"),
  make(ID.pgp.colemar, "PGP-Colemar"),
  make(ID.pgp.igr, "PGP - IGR"),
  make(ID.pgp.fisikest, "FISIKEST"),
  make(ID.pgp.clif, "CLIF - Clube do Livro"),
  make(ID.pgp.guilda, "G.U.I.L.D.A."),
  make(ID.pgp.albertSabin, "PGP - CE Albert Sabin"),
  make(ID.pgp.cm, "PGP CM"),
  make(ID.pgp.secresalinha, "SecreSalinha"),
  make(ID.pgp.revistinha, "REVISTINHA GGP"),
  make(ID.pgp.ao, "PGP-AO"),
  make(ID.pgp.rb, "PGP-RB"),
];
