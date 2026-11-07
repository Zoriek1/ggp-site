/** IDs estáveis para todos os documentos semeados. Manter sincronizado entre módulos. */

export const ID = {
  siteSettings: "siteSettings",
  pageAbout: "page-about",

  topic: {
    mecanica: "topic-mecanica",
    termodinamica: "topic-termodinamica",
    eletromagnetismo: "topic-eletromagnetismo",
    optica: "topic-optica",
    ondas: "topic-ondas",
    moderna: "topic-fisica-moderna",
    quantica: "topic-fisica-quantica",
    relatividade: "topic-relatividade",
    astronomia: "topic-astronomia",
    hfc: "topic-hfc",
    ensino: "topic-ensino-aprendizagem",
  } as const,

  level: {
    fund1: "level-fundamental-1",
    fund2: "level-fundamental-2",
    medio: "level-medio",
    grad: "level-superior-graduacao",
    pos: "level-superior-pos",
    formacao: "level-formacao-professores",
  } as const,

  area: {
    ensinoFisica: "area-ensino-fisica",
    formacaoProfessores: "area-formacao-professores",
    educacaoCiencias: "area-educacao-ciencias",
    hfcEnsino: "area-hfc-ensino",
  } as const,

  member: {
    genovese: "member-genovese",
    macedo: "member-macedo",
    moura: "member-moura",
    faria: "member-faria",
    orsini: "member-orsini",
  } as const,

  publication: {
    afetividade2021: "pub-afetividade-2021",
    compreensoes2019: "pub-compreensoes-2019",
    cepae2019: "pub-cepae-2019",
    objetosDigitais2019: "pub-objetos-digitais-2019",
    acessibilidade2019: "pub-acessibilidade-2019",
    abordagemTematica2019: "pub-abordagem-tematica-2019",
    praciencia2019: "pub-praciencia-2019",
  } as const,

  pgp: {
    sl: "pgp-sl",
    pibidDisciplinas: "pgp-pibid-disciplinas",
    pibidRpEstagio: "pgp-pibid-rp-estagio",
    pibidRpProfessores: "pgp-pibid-rp-professores",
    nossaCaraDidatica: "pgp-nossa-cara-didatica",
    calourosFisica: "pgp-calouros-fisica",
    ceciliaMeireles: "pgp-cecilia-meireles",
    mansoesParaiso: "pgp-mansoes-paraiso",
    waldemarMundim: "pgp-waldemar-mundim",
    oba2026: "pgp-oba-2026",
    tecnocienc: "pgp-tecnocienc",
    colemar: "pgp-colemar",
    igr: "pgp-igr",
    fisikest: "pgp-fisikest",
    clif: "pgp-clif",
    guilda: "pgp-guilda",
    albertSabin: "pgp-albert-sabin",
    cm: "pgp-cm",
    secresalinha: "pgp-secresalinha",
    revistinha: "pgp-revistinha",
    ao: "pgp-ao",
    rb: "pgp-rb",
  } as const,
};

export type DocId = string;
