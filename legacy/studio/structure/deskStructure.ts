import type { StructureResolver } from "sanity/structure";
import {
  CogIcon,
  DocumentIcon,
  UserIcon,
  DocumentTextIcon,
  BookIcon,
  PresentationIcon,
  PlayIcon,
  PackageIcon,
  CalendarIcon,
  TagIcon,
  ComponentIcon,
  FolderIcon,
} from "@sanity/icons";

export const deskStructure: StructureResolver = (S) =>
  S.list()
    .title("Conteúdo")
    .items([
      S.listItem()
        .title("Institucional")
        .icon(FolderIcon)
        .child(
          S.list()
            .title("Institucional")
            .items([
              S.listItem()
                .title("Configurações do site")
                .icon(CogIcon)
                .child(
                  S.document()
                    .schemaType("siteSettings")
                    .documentId("siteSettings"),
                ),
              S.documentTypeListItem("page").title("Páginas").icon(DocumentIcon),
            ]),
        ),

      S.divider(),

      S.listItem()
        .title("Pessoas")
        .icon(UserIcon)
        .child(S.documentTypeList("member").title("Membros")),

      S.divider(),

      S.listItem()
        .title("PGPs")
        .icon(UserIcon)
        .child(S.documentTypeList("pgp").title("PGPs")),

      S.divider(),

      S.listItem()
        .title("Repositório acadêmico")
        .icon(FolderIcon)
        .child(
          S.list()
            .title("Repositório acadêmico")
            .items([
              S.documentTypeListItem("publication").title("Publicações").icon(DocumentTextIcon),
              S.documentTypeListItem("thesis").title("Teses & Dissertações").icon(BookIcon),
              S.documentTypeListItem("teachingMaterial").title("Materiais didáticos").icon(PresentationIcon),
              S.documentTypeListItem("media").title("Mídia (vídeos, palestras)").icon(PlayIcon),
              S.documentTypeListItem("resource").title("Recursos gerais").icon(PackageIcon),
              S.documentTypeListItem("event").title("Eventos").icon(CalendarIcon),
            ]),
        ),

      S.divider(),

      S.listItem()
        .title("Taxonomias")
        .icon(TagIcon)
        .child(
          S.list()
            .title("Taxonomias")
            .items([
              S.documentTypeListItem("researchArea").title("Áreas de pesquisa").icon(TagIcon),
              S.documentTypeListItem("physicsTopic").title("Tópicos de física").icon(ComponentIcon),
              S.documentTypeListItem("educationLevel").title("Níveis de ensino").icon(BookIcon),
              S.documentTypeListItem("tag").title("Tags livres").icon(TagIcon),
            ]),
        ),
    ]);
