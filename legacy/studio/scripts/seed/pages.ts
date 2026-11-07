import { ID } from "./ids";
import { lstr, lslug } from "./helpers";

const aboutPt = [
  {
    _key: "ab-pt-1",
    _type: "block",
    style: "h2",
    children: [{ _key: "s1", _type: "span", text: "O que é o GGP" }],
    markDefs: [],
  },
  {
    _key: "ab-pt-2",
    _type: "block",
    style: "normal",
    children: [
      {
        _key: "s2",
        _type: "span",
        text:
          "O Grande Grupo de Pesquisa (GGP) é um coletivo de pesquisa em ensino de física " +
          "sediado na Universidade Federal de Goiás. Funciona como ponte entre a universidade " +
          "e a educação básica, articulando professores universitários, licenciandos e " +
          "professores que atuam na escola pública.",
      },
    ],
    markDefs: [],
  },
  {
    _key: "ab-pt-3",
    _type: "block",
    style: "h2",
    children: [{ _key: "s3", _type: "span", text: "PGPs — Pequenos Grupos de Pesquisa" }],
    markDefs: [],
  },
  {
    _key: "ab-pt-4",
    _type: "block",
    style: "normal",
    children: [
      {
        _key: "s4",
        _type: "span",
        text:
          "O trabalho cotidiano acontece em unidades menores chamadas PGPs. Cada PGP reúne " +
          "pesquisadores em torno de uma escola, projeto ou linha de investigação específica. " +
          "Hoje mais de 20 PGPs estão ativos — incluindo clubes, preparações para olimpíadas, " +
          "grupos editoriais e grupos de estudo.",
      },
    ],
    markDefs: [],
  },
  {
    _key: "ab-pt-5",
    _type: "block",
    style: "h2",
    children: [{ _key: "s5", _type: "span", text: "Comunidade antes de produção" }],
    markDefs: [],
  },
  {
    _key: "ab-pt-6",
    _type: "block",
    style: "normal",
    children: [
      {
        _key: "s6",
        _type: "span",
        text:
          "Mais do que um grupo que publica, o GGP é descrito por seus membros como um " +
          "espaço para discutir projetos enquanto se partilham as vidas. A formação de " +
          "professores acontece tanto pela pesquisa formal quanto pela construção de " +
          "comunidade.",
      },
    ],
    markDefs: [],
  },
  {
    _key: "ab-pt-7",
    _type: "block",
    style: "h2",
    children: [
      { _key: "s7", _type: "span", text: "O que é considerado correto para um PGP" },
    ],
    markDefs: [],
  },
  {
    _key: "ab-pt-8",
    _type: "block",
    style: "normal",
    listItem: "number",
    level: 1,
    children: [
      {
        _key: "s8",
        _type: "span",
        text: "Aluno como possuidor de um saber próprio e equivalente ao acadêmico.",
      },
    ],
    markDefs: [],
  },
  {
    _key: "ab-pt-9",
    _type: "block",
    style: "normal",
    listItem: "number",
    level: 1,
    children: [
      {
        _key: "s9",
        _type: "span",
        text: "Formação C-U — intersecção entre colégio e faculdade.",
      },
    ],
    markDefs: [],
  },
  {
    _key: "ab-pt-10",
    _type: "block",
    style: "normal",
    listItem: "number",
    level: 1,
    children: [
      {
        _key: "s10",
        _type: "span",
        text:
          "Liberdade para a aprendizagem — ambiente livre para circulação de estagiandos nas escolas.",
      },
    ],
    markDefs: [],
  },
  {
    _key: "ab-pt-11",
    _type: "block",
    style: "normal",
    listItem: "number",
    level: 1,
    children: [
      {
        _key: "s11",
        _type: "span",
        text: "Aluno não tratado como objeto experimental, e sim como ajudante.",
      },
    ],
    markDefs: [],
  },
];

const aboutEn = [
  {
    _key: "ab-en-1",
    _type: "block",
    style: "h2",
    children: [{ _key: "s1", _type: "span", text: "About GGP" }],
    markDefs: [],
  },
  {
    _key: "ab-en-2",
    _type: "block",
    style: "normal",
    children: [
      {
        _key: "s2",
        _type: "span",
        text:
          "The Grande Grupo de Pesquisa (Large Research Group, GGP) is a physics-education " +
          "research collective based at the Universidade Federal de Goiás (UFG). It bridges " +
          "the university and K-12 education by bringing together university professors, " +
          "teacher-education students and in-service school teachers.",
      },
    ],
    markDefs: [],
  },
  {
    _key: "ab-en-3",
    _type: "block",
    style: "h2",
    children: [{ _key: "s3", _type: "span", text: "PGPs — Small Research Groups" }],
    markDefs: [],
  },
  {
    _key: "ab-en-4",
    _type: "block",
    style: "normal",
    children: [
      {
        _key: "s4",
        _type: "span",
        text:
          "Day-to-day work happens in smaller units called PGPs. Each PGP gathers researchers " +
          "around a school, project or specific research line. More than 20 PGPs are active — " +
          "including book clubs, olympiad prep groups, editorial groups and study circles.",
      },
    ],
    markDefs: [],
  },
  {
    _key: "ab-en-5",
    _type: "block",
    style: "h2",
    children: [
      { _key: "s5", _type: "span", text: "What is considered right for a PGP" },
    ],
    markDefs: [],
  },
  {
    _key: "ab-en-6",
    _type: "block",
    style: "normal",
    listItem: "number",
    level: 1,
    children: [
      {
        _key: "s6",
        _type: "span",
        text: "The student holds a knowledge of their own, equivalent to the academic.",
      },
    ],
    markDefs: [],
  },
  {
    _key: "ab-en-7",
    _type: "block",
    style: "normal",
    listItem: "number",
    level: 1,
    children: [
      {
        _key: "s7",
        _type: "span",
        text: "C-U Training — the intersection between school and university.",
      },
    ],
    markDefs: [],
  },
  {
    _key: "ab-en-8",
    _type: "block",
    style: "normal",
    listItem: "number",
    level: 1,
    children: [
      {
        _key: "s8",
        _type: "span",
        text:
          "Freedom to learn — a free environment for student teachers to circulate through schools.",
      },
    ],
    markDefs: [],
  },
  {
    _key: "ab-en-9",
    _type: "block",
    style: "normal",
    listItem: "number",
    level: 1,
    children: [
      {
        _key: "s9",
        _type: "span",
        text: "Students are not treated as experimental subjects but as collaborators.",
      },
    ],
    markDefs: [],
  },
];

export const pagesDocs = [
  {
    _id: ID.pageAbout,
    _type: "page",
    title: lstr("Sobre", "About"),
    slug: lslug("sobre", "about"),
    kind: "about",
    body: { pt: aboutPt, en: aboutEn },
    seoDescription: lstr(
      "Coletivo de pesquisa em ensino de física na UFG, organizado em Pequenos Grupos de Pesquisa (PGPs).",
      "Physics education research collective at UFG, organized into Small Research Groups (PGPs).",
    ),
  },
];
