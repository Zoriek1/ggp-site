import { ID } from "./ids";
import { lstr, lslug } from "./helpers";

export const taxonomyDocs = [
  // physicsTopic (lista canônica do docs/EDITORIAL.md)
  {
    _id: ID.topic.mecanica,
    _type: "physicsTopic",
    name: lstr("Mecânica", "Mechanics"),
    slug: lslug("mecanica", "mechanics"),
  },
  {
    _id: ID.topic.termodinamica,
    _type: "physicsTopic",
    name: lstr("Termodinâmica", "Thermodynamics"),
    slug: lslug("termodinamica", "thermodynamics"),
  },
  {
    _id: ID.topic.eletromagnetismo,
    _type: "physicsTopic",
    name: lstr("Eletromagnetismo", "Electromagnetism"),
    slug: lslug("eletromagnetismo", "electromagnetism"),
  },
  {
    _id: ID.topic.optica,
    _type: "physicsTopic",
    name: lstr("Óptica", "Optics"),
    slug: lslug("optica", "optics"),
  },
  {
    _id: ID.topic.ondas,
    _type: "physicsTopic",
    name: lstr("Ondas e Acústica", "Waves and Acoustics"),
    slug: lslug("ondas-e-acustica", "waves-and-acoustics"),
  },
  {
    _id: ID.topic.moderna,
    _type: "physicsTopic",
    name: lstr("Física Moderna", "Modern Physics"),
    slug: lslug("fisica-moderna", "modern-physics"),
  },
  {
    _id: ID.topic.quantica,
    _type: "physicsTopic",
    name: lstr("Física Quântica", "Quantum Physics"),
    slug: lslug("fisica-quantica", "quantum-physics"),
  },
  {
    _id: ID.topic.relatividade,
    _type: "physicsTopic",
    name: lstr("Relatividade", "Relativity"),
    slug: lslug("relatividade", "relativity"),
  },
  {
    _id: ID.topic.astronomia,
    _type: "physicsTopic",
    name: lstr("Astronomia e Astrofísica", "Astronomy and Astrophysics"),
    slug: lslug("astronomia-e-astrofisica", "astronomy-and-astrophysics"),
  },
  {
    _id: ID.topic.hfc,
    _type: "physicsTopic",
    name: lstr("História e Filosofia da Ciência", "History and Philosophy of Science"),
    slug: lslug("historia-e-filosofia-da-ciencia", "history-and-philosophy-of-science"),
  },
  {
    _id: ID.topic.ensino,
    _type: "physicsTopic",
    name: lstr("Ensino e Aprendizagem de Física", "Physics Teaching and Learning"),
    slug: lslug("ensino-e-aprendizagem-de-fisica", "physics-teaching-and-learning"),
  },

  // educationLevel
  {
    _id: ID.level.fund1,
    _type: "educationLevel",
    name: lstr("Fundamental I", "Elementary (grades 1–5)"),
    slug: lslug("fundamental-1", "elementary-1"),
    order: 10,
  },
  {
    _id: ID.level.fund2,
    _type: "educationLevel",
    name: lstr("Fundamental II", "Middle school (grades 6–9)"),
    slug: lslug("fundamental-2", "elementary-2"),
    order: 20,
  },
  {
    _id: ID.level.medio,
    _type: "educationLevel",
    name: lstr("Ensino Médio", "High school"),
    slug: lslug("ensino-medio", "high-school"),
    order: 30,
  },
  {
    _id: ID.level.grad,
    _type: "educationLevel",
    name: lstr("Superior — Graduação", "Higher Ed — Undergraduate"),
    slug: lslug("superior-graduacao", "higher-undergrad"),
    order: 40,
  },
  {
    _id: ID.level.pos,
    _type: "educationLevel",
    name: lstr("Pós-graduação", "Graduate school"),
    slug: lslug("pos-graduacao", "graduate"),
    order: 50,
  },
  {
    _id: ID.level.formacao,
    _type: "educationLevel",
    name: lstr("Formação de Professores", "Teacher Education"),
    slug: lslug("formacao-de-professores", "teacher-education"),
    order: 60,
  },

  // researchArea
  {
    _id: ID.area.ensinoFisica,
    _type: "researchArea",
    name: lstr("Ensino e Aprendizagem de Física", "Physics Teaching and Learning"),
    slug: lslug("ensino-e-aprendizagem-de-fisica", "physics-teaching-and-learning"),
  },
  {
    _id: ID.area.formacaoProfessores,
    _type: "researchArea",
    name: lstr("Formação de Professores", "Teacher Education"),
    slug: lslug("formacao-de-professores", "teacher-education"),
  },
  {
    _id: ID.area.educacaoCiencias,
    _type: "researchArea",
    name: lstr("Educação em Ciências", "Science Education"),
    slug: lslug("educacao-em-ciencias", "science-education"),
  },
  {
    _id: ID.area.hfcEnsino,
    _type: "researchArea",
    name: lstr("História e Filosofia da Ciência no Ensino", "HPS in Science Teaching"),
    slug: lslug("hfc-no-ensino", "hps-in-teaching"),
  },
];
