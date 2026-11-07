/**
 * 7 publicações extraídas de trabalhos.ggp.life.
 * TODOs por documento (a completar no Studio depois):
 *  - DOI (nenhuma tem por enquanto)
 *  - PDF (upload ou pdfUrl)
 *  - abstract EN
 *  - externalUrl exato do post de blog (precisa visitar trabalhos.ggp.life e copiar URL)
 *  - autores das #1, #2, #4, #5, #6, #7 (não foram identificados na extração)
 */

import { ID } from "./ids";
import { lstr, lslug, refArray } from "./helpers";

const VENUE_BLOG = "trabalhos.ggp.life";

export const publicationDocs = [
  // #1
  {
    _id: ID.publication.afetividade2021,
    _type: "publication",
    title: lstr(
      "O papel da afetividade na escolha pela licenciatura em física na ótica de licenciandos experientes",
      "The role of affect in choosing a physics teaching degree from the perspective of experienced student teachers",
    ),
    slug: lslug(
      "afetividade-escolha-licenciatura-fisica",
      "affect-choosing-physics-teaching-degree",
    ),
    year: 2021,
    venue: VENUE_BLOG,
    abstract: lstr(
      "Pesquisa que aplica a teoria walloniana da aprendizagem para analisar relações afetivas que " +
        "influenciam a escolha pela licenciatura em física. Questionário online com 16 participantes " +
        "revela que aspectos afetivos são significativos na formação docente.",
    ),
    topics: refArray([ID.topic.ensino]),
    researchAreas: refArray([ID.area.ensinoFisica, ID.area.formacaoProfessores]),
    // TODO authors
  },

  // #2
  {
    _id: ID.publication.compreensoes2019,
    _type: "publication",
    title: lstr(
      "Compreensões iniciais de um agente experiente inserido no GGP-Física-UFG",
    ),
    slug: lslug("compreensoes-iniciais-agente-experiente-ggp"),
    year: 2019,
    venue: VENUE_BLOG,
    topics: refArray([ID.topic.ensino]),
    researchAreas: refArray([ID.area.ensinoFisica]),
    // TODO authors, abstract
  },

  // #3 (FEATURED — única com lista completa de autores)
  {
    _id: ID.publication.cepae2019,
    _type: "publication",
    title: lstr(
      "Centro de ensino e pesquisa aplicada à educação: a influência de capitais social, cultural e econômico no desempenho dos estudantes",
    ),
    slug: lslug("cepae-capitais-social-cultural-economico-desempenho"),
    year: 2019,
    venue: VENUE_BLOG,
    featured: true,
    abstract: lstr(
      "Estudo de caso que examina relações entre capital cultural, social e econômico e o desempenho " +
        "acadêmico em 2018. Narrativas coletadas em entrevistas não-agendadas mostram como as " +
        "trajetórias de vida dos estudantes influenciam diretamente suas práticas escolares.",
    ),
    topics: refArray([ID.topic.ensino]),
    researchAreas: refArray([ID.area.educacaoCiencias, ID.area.formacaoProfessores]),
    authors: refArray([ID.member.genovese]),
    externalAuthors: [
      "Marcos Estêvão Cardoso",
      "José Augusto Rodrigues de Oliveira",
      "Vinícius Martins Bento",
      "Débora Lígia Ferreira da Silva",
      "Leonardo Bruno Assis Oliveira",
      "Guilherme Colherinhas de Oliveira",
    ],
  },

  // #4
  {
    _id: ID.publication.objetosDigitais2019,
    _type: "publication",
    title: lstr(
      "Objetos digitais de aprendizagem: contribuições para a aprendizagem significativa dos conceitos de velocidade e aceleração",
    ),
    slug: lslug("objetos-digitais-aprendizagem-velocidade-aceleracao"),
    year: 2019,
    venue: VENUE_BLOG,
    topics: refArray([ID.topic.mecanica, ID.topic.ensino]),
    researchAreas: refArray([ID.area.ensinoFisica]),
    // TODO authors, abstract
  },

  // #5
  {
    _id: ID.publication.acessibilidade2019,
    _type: "publication",
    title: lstr(
      "Laboratório de acessibilidade informacional: um caminho de inclusão na universidade e seus desafios no ensino de ciências para deficientes visuais",
    ),
    slug: lslug("laboratorio-acessibilidade-deficientes-visuais"),
    year: 2019,
    venue: VENUE_BLOG,
    topics: refArray([ID.topic.ensino]),
    researchAreas: refArray([ID.area.educacaoCiencias]),
    // TODO authors, abstract
  },

  // #6
  {
    _id: ID.publication.abordagemTematica2019,
    _type: "publication",
    title: lstr(
      "Abordagem temática, ensino por pesquisa dirigida e as contribuições de elementos psicopedagógicos",
    ),
    slug: lslug("abordagem-tematica-pesquisa-dirigida-psicopedagogica"),
    year: 2019,
    venue: VENUE_BLOG,
    topics: refArray([ID.topic.ensino]),
    researchAreas: refArray([ID.area.ensinoFisica]),
    // TODO authors, abstract
  },

  // #7
  {
    _id: ID.publication.praciencia2019,
    _type: "publication",
    title: lstr(
      "PraCiência: a criação de um jogo como ferramenta pedagógica para o ensino de física e história da ciência",
      "PraCiência: creating a game as a pedagogical tool for teaching physics and the history of science",
    ),
    slug: lslug(
      "praciencia-jogo-ensino-fisica-historia-ciencia",
      "praciencia-game-teaching-physics-history-science",
    ),
    year: 2019,
    venue: VENUE_BLOG,
    topics: refArray([ID.topic.hfc, ID.topic.ensino]),
    researchAreas: refArray([ID.area.hfcEnsino, ID.area.ensinoFisica]),
    // TODO authors, abstract
  },
];
