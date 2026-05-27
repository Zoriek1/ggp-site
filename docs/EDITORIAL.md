# Política Editorial — Site do GGP

Este documento define como o conteúdo do site é criado, revisado e publicado. Ele existe para o site **não virar um Google Sites moderno**: sem ele, o acervo perde consistência em poucos meses.

Toda decisão de produto sobre o site deve respeitar este documento. Quando algo aqui ficar desatualizado, atualize antes de publicar conteúdo novo no padrão antigo.

## 1. Papéis

| Papel | Responsabilidade | Permissão no Sanity |
|---|---|---|
| **Editor-chefe** (coordenador) | Aprova publicação, define taxonomias, autoriza novas tags | Administrator |
| **Editor** (pesquisador sênior) | Cria e revisa conteúdo de qualquer tipo | Editor |
| **Contribuidor** (aluno, colaborador) | Cria conteúdo em rascunho; não publica diretamente | Contributor |

### Workflow de publicação

1. Contribuidor cria documento em **draft** (não publicado).
2. Editor revisa: título, abstract, taxonomias, imagens, PT e EN.
3. Editor-chefe (ou editor com delegação) publica.

## 2. Convenções de título

- **PT**: capitalização de frase (só primeira palavra e nomes próprios em maiúscula).
  - Ex.: "Sequência didática sobre eletromagnetismo no ensino médio"
- **EN**: Title Case.
  - Ex.: "Teaching Sequence on Electromagnetism in High School"
- Sem ponto final.
- Máximo **120 caracteres** (corta bem em listagens e Google).

## 3. Resumos / Abstracts

- 150–300 palavras.
- Texto corrido, sem listas, sem títulos.
- **Sem fórmulas LaTeX** no abstract (renderização inconsistente em metadados; coloque fórmulas no corpo).
- Primeira frase deve dar contexto suficiente para alguém decidir se vai ler.

## 4. Imagens

| Uso | Aspecto | Mínimo | Notas |
|---|---|---|---|
| Foto de membro | 1:1 | 600x600 | Hotspot definido, fundo neutro |
| Capa de publicação/material | 16:9 | 1280x720 | Opcional |
| Hero / banner de evento | 16:9 | 1920x1080 | |
| Thumbnail de mídia | 16:9 | 640x360 | YouTube gera automaticamente |
| Logo | SVG | — | + PNG 512x512 fallback |

Regras:
- **Alt text obrigatório em PT e EN**. Descreva o que aparece e por que importa para o contexto.
- Evite texto embutido na imagem — quebra acessibilidade e i18n.
- Sem watermarks de bancos de imagem.

## 5. Tags e tópicos

- **Use as taxonomias existentes** (`physicsTopic`, `researchArea`, `educationLevel`, `tag`). Sempre referência, nunca string livre.
- Criar nova tag/tópico **requer aprovação do editor-chefe**. Antes de criar, busque variações já existentes (ex.: "mecânica", "Mecânica Clássica", "Física Mecânica" — uma só).
- Cada conteúdo deve ter **pelo menos 1 tópico de física** e, quando aplicável, **1 área de pesquisa**.

### Lista canônica de tópicos de física (ponto de partida — expandir via editor-chefe)

- Mecânica
- Termodinâmica
- Eletromagnetismo
- Óptica
- Ondas e Acústica
- Física Moderna
- Física Quântica
- Relatividade
- Astronomia e Astrofísica
- História e Filosofia da Ciência
- Ensino e Aprendizagem de Física

### Níveis de ensino

- Fundamental I (1º–5º ano)
- Fundamental II (6º–9º ano)
- Ensino Médio
- Ensino Superior — Graduação
- Pós-graduação
- Formação de Professores

## 6. Idioma

- **PT é obrigatório** em todos os campos traduzíveis.
- **EN é fortemente recomendado**, especialmente para publicações com alcance internacional. Pode ficar vazio — o frontend faz fallback para PT com indicador discreto de "tradução pendente".
- Não traduza nomes próprios, instituições ou siglas oficiais.

## 7. DOI e identificadores

- **DOI obrigatório** para publicações já aceitas/publicadas em periódico ou anais.
- **Opcional** para preprints e working papers — usar campo `venue` para indicar onde está disponível.
- **ORCID recomendado** para todo membro pesquisador.
- **Link Lattes** recomendado para membros brasileiros.

## 8. PDFs e arquivos

- Sempre que possível, PDF original do autor (texto pesquisável, não scan).
- Tamanho máximo recomendado: 20 MB. Acima disso, hospedar externamente e usar campo `pdfUrl`.
- Para teses/dissertações antigas só disponíveis em scan, OK — mas marcar nas tags.

## 9. Revisão periódica

- A cada **6 meses**, o editor-chefe revisa o acervo:
  - Links quebrados (`pdfUrl`, `lattesUrl`, `videoUrl`).
  - Membros marcados `active: false` quando saem do grupo.
  - Tópicos e tags pouco usados (mesclar ou remover).
  - Traduções EN pendentes.

## 10. Quando este documento não cobre algo

Pergunte ao editor-chefe **antes** de publicar. Depois, atualize este documento.
