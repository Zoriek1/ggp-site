# Publicação no portal GGP

## Acesso e autoria

O painel começa com uma conta compartilhada por professores e alunos. Todas as contas têm as mesmas permissões: criar, editar, salvar rascunhos, publicar, retirar publicações e arquivar. Não há aprovação por cargo. Contas adicionais podem ser configuradas pelo responsável pelo servidor, sem perfis públicos de membros.

O usuário conectado não determina os autores. Preencha os nomes no campo **Autores — um por linha**, na ordem correta. O commit registra a conta que fez a operação; com uma conta compartilhada, não é possível distinguir seus usuários pelo histórico.

## O que publicar

- **Acervo:** artigos, textos e materiais, com leitura no site, PDF ou referência externa.
- **Blog:** posts e comunicados.
- **PGPs:** apresentação, instituição e contatos; os conteúdos aparecem por associação.
- **Guias:** introdução e agregação temática de leituras.
- **Páginas:** sobre, contato e páginas livres.

Artigos exigem pelo menos um PGP. Itens do acervo exigem área do conhecimento e autoria. Conteúdos gerais do GGP podem ser publicados como textos, posts ou comunicados sem PGP associado.

## Fluxo

1. Se necessário, publique primeiro as áreas, palavras-chave e PGPs que serão selecionados.
2. Crie o conteúdo, informe autores e associe os registros pertinentes.
3. Escreva em português; a versão inglesa é opcional. O portal usa português quando falta tradução.
4. Envie arquivos, descreva as imagens e confira a prévia.
5. **Salvar rascunho** guarda as alterações sem substituir a versão pública anterior.
6. **Publicar** valida o registro e confirma um commit no Git antes de atualizar o portal.

Se ocorrer conflito ou falha de rede, o texto permanece no editor. Baixe uma cópia antes de recarregar e compare com a versão mais recente. Publicação recusada não aparece como concluída.

**Retirar de publicação** preserva o texto como rascunho. Registros com dependências publicadas precisam ter seus vínculos removidos primeiro. **Arquivar** oculta o registro das listagens e preserva sua identidade; pode ser republicado pelo painel. Evite arquivar áreas e grupos ainda usados sem revisar os efeitos na navegação.

## Guias e palavras-chave

Use etiquetas cadastradas, evitando sinônimos duplicados. Um guia inclui conteúdos publicados com **qualquer uma** das palavras-chave escolhidas, de todos os PGPs. Leituras manuais aparecem primeiro, na ordem definida; a agregação automática vem depois, ordenada por data, sem repetição. Sem palavras-chave, o guia mostra somente as leituras manuais. Rascunhos e itens arquivados não são agregados.

## Arquivos e referências

Imagens JPEG, PNG e WebP e documentos PDF de até 20 MB podem ser enviados. Texto alternativo é obrigatório nas imagens. PDFs devem conter texto pesquisável sempre que possível. DOI é opcional e validado quando informado. Para recursos já hospedados, prefira a URL institucional original.

Arquivos removidos de um texto continuam no armazenamento para preservar links e o histórico; esta versão não faz limpeza automática. O backup das mídias é separado do Git.

## Visibilidade

**Textos em rascunho e histórico são públicos no repositório Git. Os uploads também possuem URL pública.** Não use este portal para documentos confidenciais. As contas controlam a edição, não a confidencialidade dos arquivos.

As sete publicações importadas inicialmente permanecem em rascunho. Complete os dados com as fontes originais, sem inventar nomes, vínculos, DOIs ou endereços.

## Recuperação da escrita e conflitos

Enquanto você escreve, o painel mantém uma cópia local neste navegador. Ela não substitui **Salvar rascunho** e não publica nada. Ao reabrir o editor, escolha recuperar ou descartar a cópia encontrada. Contas, registros e abas têm cópias independentes; se o navegador bloquear o armazenamento, o painel informa a indisponibilidade.

Links internos avisam quando há alterações pendentes. Recarregar, fechar a aba ou voltar para outra página pode exigir recuperar a cópia ao retornar. Depois de recuperar, salve no acervo. O painel preserva também o texto digitado enquanto uma gravação está em andamento: a confirmação vale para a versão enviada, e as alterações posteriores permanecem pendentes.

Quando outra pessoa altera o mesmo registro, o painel mostra a comparação. Você pode manter seu texto sobre a revisão atual e salvar novamente, ou descartar explicitamente suas alterações e carregar a versão do acervo. Antes de descartar, use **Baixar cópia** se precisar preservar uma alternativa. Não há mesclagem automática dos textos.

## Prévia e endereços

**Pré-visualizar** usa a mesma apresentação da página pública, incluindo imagens, arquivos, associações e leituras de guias. As leituras automáticas e manuais são calculadas sobre o acervo publicado. Links da prévia abrem em outra aba. **Ver publicação** abre sempre a versão pública, mesmo que o rascunho tenha outro endereço.

Ao publicar uma alteração de endereço, os endereços anteriores ficam no histórico do registro e redirecionam para o atual. Salvar apenas o rascunho não altera o endereço público. Endereços de outras publicações, incluindo seu histórico e traduções, não podem ser reutilizados.

O formulário adapta os campos ao tipo de conteúdo. Dados acadêmicos aparecem em uma seção opcional; erros de preenchimento aparecem também próximos aos campos correspondentes.
