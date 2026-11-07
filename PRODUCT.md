# Portal GGP

Referência factual do produto implementado em novembro de 2026. A evolução deve estender o portal e seu painel preservando a identidade existente descrita em [DESIGN.md](DESIGN.md).

## Propósito e pessoas

O portal público do Grande Grupo de Pesquisa (GGP), ligado ao ensino de Física na UFG, apresenta seus Pequenos Grupos de Pesquisa (PGPs) e reúne conhecimento compartilhado entre universidade e escola. Leitores encontram publicações e percursos de estudo; professores e alunos organizam e publicam pelo painel.

Há dois modos de uso: **Read** no portal e **Operate** no painel. O portal prioriza descoberta e leitura; o painel prioriza escrever, relacionar registros, conferir e publicar com retorno explícito sobre o resultado.

## Escopo atual

- Portal em português e inglês, nas rotas `/pt` e `/en`; a tradução inglesa é opcional e o conteúdo ausente usa português, com aviso na leitura quando aplicável.
- Acervo de artigos, textos e materiais, com corpo para leitura, imagens, PDFs, DOI e referência externa; blog com posts e comunicados.
- PGPs com apresentação, instituição, contatos e conteúdos associados; áreas do conhecimento e palavras-chave organizam a descoberta.
- Guias com introdução, leituras escolhidas manualmente e agregação por palavras-chave. A agregação usa **qualquer uma** das etiquetas escolhidas (OR), entre todos os PGPs. As leituras manuais vêm primeiro; o conjunto não repete itens.
- Páginas institucionais e configurações do portal; busca, filtros, paginação, troca de idioma e tema claro/escuro.
- Painel próprio em português, em `/admin`, com editor visual/Markdown, prévia, upload, rascunho, publicação, retirada e arquivamento.
- Recuperação de escrita no navegador, aviso ao sair com alterações pendentes e comparação explícita quando outra gravação altera o mesmo registro.
- Prévia compartilhada com a página pública, incluindo arquivos e agregação dos guias; endereços antigos continuam disponíveis por redirecionamento após renomear uma publicação.

Perfis públicos de membros, tipos especializados de teses/eventos/mídia e integrações acadêmicas ficam fora desta versão. Imagens e PDFs são anexos dos registros; não constituem um catálogo especializado de mídia.

## Regras duráveis

Autores são nomes em `string[]`, com ordem editorial, independentes das contas de acesso. Um artigo pode estar associado a vários PGPs por IDs sem duplicar seu registro. IDs permanecem estáveis quando títulos ou endereços mudam.

Artigos exigem ao menos um PGP; itens do acervo exigem autoria e área do conhecimento. Conteúdos gerais do GGP podem ser textos, posts ou comunicados sem PGP. Referências devem apontar para registros válidos antes de publicar.

O painel começa com uma conta compartilhada própria, sem cargos ou aprovação por função. Contas adicionais configuradas no servidor têm as mesmas permissões. A conta registra quem executou a operação, sem definir a autoria do texto; uma conta compartilhada não identifica individualmente seus usuários.

Salvar rascunho preserva a versão pública anterior. Publicar confirma a gravação no Git antes de atualizar o portal. A resposta de uma gravação preserva o texto digitado durante a espera, indicando que ele ainda precisa ser salvo. Conflitos ou falhas mantêm o texto no editor e permitem baixar uma cópia. A recuperação local não publica nem salva no Git. Retirar preserva o registro como rascunho; arquivar preserva sua identidade e o oculta das listagens.

## Fonte de verdade e operação

Metadados YAML e corpos Markdown ficam em `content/published` e `content/drafts`, no mesmo repositório Git público. Rascunhos e histórico são públicos no Git; uploads também têm URL pública. O acesso ao painel controla edição, não confidencialidade.

Mídias ficam em armazenamento persistente no servidor Node próprio, fora das releases e do Git. A configuração inicial considera uma instância. O portal mantém o último snapshot válido quando a leitura remota falha; gravações dependem da integração disponível.

Os detalhes não são duplicados aqui: [arquitetura](docs/ARCHITECTURE.md) define domínio, persistência e autenticação; [guia editorial](docs/EDITORIAL.md) define publicação e vínculos; [implantação](docs/DEPLOY.md) cobre configuração, homologação, backup e recuperação.

## Estado e limites desta referência

Esta referência foi conferida contra o código em `web/src/features/portal`, `web/src/features/admin`, o modelo de conteúdo e a documentação operacional. As capturas em `docs/screenshots/` demonstram as superfícies de portal, painel, editor e login em desktop/mobile e exemplos em tema escuro; seus textos e registros de teste não definem o escopo permanente do produto.

Os comandos de validação e os cenários automatizados ficam em `web/package.json` e `web/tests/`. Cobrem domínio, Git, autenticação, mídia, backup e o percurso editorial no navegador, incluindo recuperação local, rede lenta, edição concorrente, prévia e endereços antigos. A validação local do código não representa homologação de uma implantação.
