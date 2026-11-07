---
name: Portal GGP
description: Sistema visual existente do portal de leitura e do painel de publicação do GGP.
colors:
  brand-50: "oklch(96% 0.03 250)"
  brand-100: "oklch(92% 0.06 250)"
  brand-500: "oklch(55% 0.18 252)"
  brand-700: "oklch(40% 0.18 252)"
  brand-900: "oklch(25% 0.12 252)"
  brand-button: "oklch(45% 0.18 252)"
  brand-button-hover: "oklch(35% 0.16 252)"
  ink-50: "oklch(98% 0.005 250)"
  ink-100: "oklch(95% 0.01 250)"
  ink-200: "oklch(89% 0.015 250)"
  ink-300: "oklch(78% 0.02 250)"
  ink-500: "oklch(55% 0.03 250)"
  ink-700: "oklch(35% 0.03 250)"
  ink-900: "oklch(18% 0.03 250)"
  surface: "oklch(100% 0 0)"
  brand-50-dark: "oklch(30% 0.05 252)"
  brand-100-dark: "oklch(36% 0.07 252)"
  brand-500-dark: "oklch(70% 0.15 252)"
  brand-700-dark: "oklch(78% 0.13 252)"
  brand-900-dark: "oklch(88% 0.08 252)"
  ink-50-dark: "oklch(20% 0.02 255)"
  ink-100-dark: "oklch(28% 0.02 255)"
  ink-200-dark: "oklch(37% 0.02 255)"
  ink-300-dark: "oklch(52% 0.02 255)"
  ink-500-dark: "oklch(72% 0.02 255)"
  ink-700-dark: "oklch(86% 0.015 255)"
  ink-900-dark: "oklch(96% 0.01 255)"
  surface-dark: "oklch(25% 0.02 255)"
typography:
  display:
    fontFamily: "Source Serif 4, Source Serif Pro, Crimson Pro, ui-serif, Georgia, serif"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Source Serif 4, Source Serif Pro, Crimson Pro, ui-serif, Georgia, serif"
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
  reading:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    lineHeight: 1.85
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
rounded:
  control: "0.375rem"
  editor: "0.5rem"
  card: "0.75rem"
  login: "0.875rem"
spacing:
  field-gap: "0.5rem"
  action-gap: "0.75rem"
  group-gap: "1rem"
  card-padding: "1.25rem"
  section-padding: "1.5rem"
  column-gap: "2.5rem"
components:
  button-primary:
    backgroundColor: "{colors.brand-button}"
    textColor: "#fff"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0.65rem 1rem"
  button-primary-hover:
    backgroundColor: "{colors.brand-button-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-900}"
    rounded: "{rounded.control}"
    padding: "0.65rem 1rem"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-900}"
    rounded: "{rounded.control}"
    padding: "0.65rem 0.75rem"
  tag:
    backgroundColor: "{colors.brand-50}"
    textColor: "{colors.brand-700}"
    rounded: "{rounded.control}"
    padding: "0.5rem 0.75rem"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-padding}"
---

# Design System: Portal GGP

## Overview

**Creative North Star: "Portal editorial do GGP"**

Nome descritivo do sistema observado, sem propor uma nova identidade. Títulos em serifada, texto e controles em sans-serif, azul institucional e superfícies frias sustentam a leitura do acervo. O painel estende a mesma linguagem com tabelas, campos e ações explícitas.

O portal tem ritmo amplo e hierarquia editorial; o painel concentra a operação mantendo espaço entre grupos de campos. Esta documentação registra o código e as capturas existentes, sem redesenho ou nova direção de marca.

**Key Characteristics:**

- Source Serif 4 nos títulos; Inter no corpo e na operação.
- Azul para links, seleção e ações; neutros semânticos para estrutura.
- Tema escuro por substituição dos mesmos tokens.
- Bordas discretas, cantos moderados e profundidade contida.

## Colors

### Primary

`brand-*` é a família azul de navegação, links, etiquetas e estados. `brand-button` e seu hover mantêm o botão preenchido legível com texto branco nos dois temas; não seguem a inversão do azul usado em texto.

### Neutral

`ink-50` é o fundo geral; `surface` aparece em cabeçalhos, cartões, campos e painéis. `ink-900` identifica texto principal; `ink-700` texto de apoio; `ink-500` metadados; `ink-100` a `ink-300` compõem fundos suaves e divisórias.

Os nomes com sufixo `-dark` no frontmatter documentam as substituições existentes das variáveis de mesmo nome; não são novos tokens no CSS. O tema acompanha `prefers-color-scheme` até haver escolha explícita salva. Erros e confirmações usam os estilos semânticos vermelho/verde já presentes no CSS, sem substituir a marca.

**The Semantic Surface Rule.** Use `surface`, `ink-*` e `brand-*` nas superfícies compartilhadas para preservar os dois temas. A faixa azul profunda do hero e suas ações branca/contornada são um tratamento específico da abertura do portal.

## Typography

Source Serif 4 e Inter são carregadas em `web/src/app/layout.tsx`. O frontmatter preserva as famílias e papéis reais; tamanhos responsivos continuam definidos pelos componentes.

- **Display:** abertura em serifada semibold, de `2.25rem` a `3.75rem`, entrelinha curta.
- **Headline:** páginas públicas de `2.25rem` a `3rem`; painel de `1.875rem` a `2.25rem`. Seções públicas usam `1.875rem`.
- **Title:** cartões em serifada, `1.125rem`, entrelinha `1.375`.
- **Body:** corpo em Inter; leitura Markdown com entrelinha ampliada. A introdução limita-se a `72ch`; editor e prévia, a `75ch`.
- **Label:** campos e ações em Inter semibold. Metadados usam `0.75rem`; subtítulo de tipo nos cartões usa caixa alta e espaçamento entre letras.

## Layout

O contêiner público tem largura máxima de `76rem` e margens internas de `1.25rem`. Cartões passam de uma para duas colunas em `40rem` e três em `64rem`, com intervalo de `1.25rem`. Leitura detalhada usa uma coluna central de até `48rem`.

O painel tem navegação lateral de `15rem`, conteúdo flexível e largura máxima de `100rem`. O editor separa corpo e metadados em uma coluna flexível mais `18rem`; abaixo de `1100px`, os metadados seguem abaixo do corpo. Até `760px`, o painel usa uma coluna e navegação horizontal rolável, ações quebram linha e filtros ocupam a largura disponível. A tabela preserva suas colunas com rolagem horizontal.

O login usa duas colunas e passa a uma até `760px`. A navegação pública troca por menu abaixo de `48rem`; a assinatura extensa da marca aparece a partir de `64rem`. O ritmo combina intervalos pequenos nos campos com separações maiores entre blocos editoriais.

## Elevation & Depth

Fundos tonais e bordas fazem a maior parte da separação. Cartões públicos têm sombra pequena em repouso e média no hover, acompanhada de deslocamento vertical de `-0.125rem`; o painel usa predominantemente superfícies planas. O menu móvel público usa sombra maior. Os valores exatos de sombra extraídos do Tailwind estão no sidecar.

Transições de cartão usam `200ms`; imagens, `300ms`; o skip-link, `150ms`. `prefers-reduced-motion` reduz animações e transições no CSS global.

## Shapes

Controles e etiquetas compartilham cantos discretos; cartões, tabelas, estados vazios e prévias usam cantos um pouco mais amplos. O editor tem borda contínua com toolbar em faixa tonal. Linhas finas separam navegação, blocos, registros e metadados; os PGPs da abertura aparecem em linhas separadas, com seta de acesso.

## Components

### Buttons

Botão primário azul preenchido; secundário na superfície com borda neutra. Ambos têm altura mínima de `2.75rem`, rótulos semibold e ações que podem quebrar linha em conjuntos. O primário escurece no hover; o secundário muda a borda para azul. Durante operações, controles desabilitados usam opacidade reduzida e cursor de espera.

### Chips

Etiquetas de taxonomia são links com fundo azul suave e texto azul. Representam PGPs, áreas e palavras-chave; não há um novo seletor visual de chips no editor, que usa listas com checkboxes.

### Cards / Containers

Cartões públicos têm conteúdo em coluna, preenchimento compacto, título serifado e metadados discretos. Imagem é opcional, recortada em proporção `16:9` ou `1:1`. Estados vazios usam borda tracejada e mensagem textual. Tabelas administrativas usam cabeçalho tonal, divisórias e realce suave da linha no hover.

### Inputs / Fields

Campos usam superfície semântica, borda `ink-300`, rótulo visível e altura mínima de `2.75rem`. Áreas de texto permitem expansão vertical. O foco compartilhado é contorno azul de `2px`, afastado `2px`; mensagens de erro e sucesso acompanham o resultado da operação. O editor visual herda as mesmas superfícies, texto e azul para ferramentas ativas.

### Navigation

Marca textual `GGP.` em serifada acompanha portal e painel. O portal oferece navegação, busca, idioma e tema; o painel oferece seções, retorno ao portal e saída. Abas Português/English do editor usam linha azul e peso semibold na seleção. O menu público móvel fecha ao navegar, com Escape ou clique externo.

## Do's and Don'ts

### Do:

- **Do** estender os tokens semânticos e a dupla Source Serif 4/Inter existente.
- **Do** manter a leitura pública e a operação do painel reconhecíveis como o mesmo produto.
- **Do** preservar rótulos, foco visível, quebra de ações e leitura nos dois temas.

### Don't:

- **Don't** substituir superfícies compartilhadas por branco fixo sem respeitar o tema.
- **Don't** transformar o tratamento específico do hero em padrão de todos os painéis.
- **Don't** promover textos, registros de teste ou indicadores de desenvolvimento das capturas a elementos da identidade.

Fontes: `web/src/app/globals.css`, `web/src/app/layout.tsx`, `web/src/components/{Card,Header,MobileNav}.tsx`, `web/src/features/{portal,admin}` e capturas em `docs/screenshots/`. O código é a autoridade de execução; o frontmatter é o inventário portátil extraído. Escopo de produto em [PRODUCT.md](PRODUCT.md); operação e arquitetura em [docs/](docs/ARCHITECTURE.md).
