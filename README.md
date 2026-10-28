# Auto Preencher — Workspace

Extensão com a identidade Oficina, temas claro/escuro e ferramentas de atendimento em uma barra lateral de 480 px.

## Scripts revisados · versão 1.7
- Revisados os 14 textos da biblioteca exportada em 08/09/2026, mantendo os mesmos objetivos, gatilhos, IDs e variáveis. O áudio `#pro` continua intacto; somente seu título foi corrigido.
- Textos mais claros e diretos para início, desconexão, lentidão, espera, agendamento, visita, localização, encerramento/avaliação, procedimentos, transferência, ajuda adicional e TV Box.
- Recarregar a extensão aplica a revisão automaticamente aos textos que ainda coincidem com a biblioteca original. Alterações posteriores feitas pelo usuário e outros atalhos são preservados.
- Antes da primeira revisão, a biblioteca completa, incluindo áudios, é copiada para `chrome.storage.local.expanderTagsBeforeRevisionV1`. A cópia permanece nas próximas inicializações.
- Os textos para conferência estão em `scripts-revisados/REVISAO.md`; os arquivos JSON original e revisado ficam na mesma pasta. `npm run test:revisions` valida a migração e a preservação dos dados.

## Redesign Oficina · versão 2.0
- Verde-petróleo, superfícies neutras e fontes do sistema. Navegação horizontal, identificação compacta e scripts prontos em duas colunas.
- As ações **Preencher da aba**, **Copiar registro** e **Limpar** ficam sempre visíveis no rodapé de Scripts. A prévia recolhível fica imediatamente acima delas. Limpar atua na sub-aba atual; preencher continua atualizando as três.
- Após o preenchimento, o foco vai ao primeiro campo vazio da sub-aba atual. A cópia mantém o comportamento existente, inclusive limpar a sub-aba copiada após sucesso.
- Em Atendimento, os campos de descrição personalizada e Problema Real do Cliente aparecem somente ao selecionar **OUTROS**. Os scripts prontos continuam preenchendo o registro normalmente.
- Selecionar uma opção de Atendimento também seleciona e preenche o motivo correspondente em Agendamento: LOS → LOSS, PON → PON PISCANDO, sem acesso ao Wi-Fi → NÃO APARECE A REDE WIFI, e os demais motivos equivalentes. Inclui Troca de senha sem acesso remoto e Fibra baixa. Lentidão usa o relato completo de teste/configurações solicitado. O motivo permanece editável; selecionar outro atendimento o substitui, preservando os demais campos do agendamento. Desmarcar a opção não apaga o motivo já preenchido.
- A conversa da IA mantém o pedido no rodapé. O indicador no cabeçalho acompanha a conexão existente; ele não significa que o início automático foi instalado.
- `design.css` concentra o sistema visual, inclusive o popup legado. Modais e sugestões recebem os mesmos tokens por `node scripts/sync-shadow-styles.cjs`. Detalhes em [IDENTIDADE.md](IDENTIDADE.md).
- Preferências e dados existentes permanecem no mesmo armazenamento. Novas instalações começam no tema claro. Recarregue a extensão e atualize as abas abertas.

## Barra lateral nas páginas
- A barra se encaixa na borda direita em toda a altura disponível da página, sem moldura, margem externa ou cantos arredondados. Cabeçalho, carregamento e painel acompanham o mesmo tema claro ou escuro.
- O botão discreto fica centralizado na borda direita. Clique nele, no ícone da extensão ou use **Ctrl+Shift+U** para abrir a barra. Essas ações sempre abrem, mesmo quando a barra já está visível.
- A barra fecha **somente pelo × do cabeçalho**, identificado como “Fechar barra lateral”. Sair com o mouse, clicar fora, editar campos ou pressionar Esc mantém a barra aberta. Esc continua fechando a busca e outros diálogos. O botão de fixação e a lógica de fechamento automático foram removidos.
- O ícone da extensão e **Ctrl+Shift+U** abrem essa mesma barra. Os atalhos **Ctrl+Shift+V** (Mundiale) e **Ctrl+Shift+Y** (Native) continuam preenchendo o painel, agora na página de onde foram acionados.
- Scripts, Ayrio AI, Bloco de Notas, Text Expander, Senhas e DNS, Portas, MAC, Mapas e Links permanecem disponíveis. O painel carrega somente na primeira abertura e preserva campos e navegação ao recolher. Os dados salvos acompanham as outras abas; atalhos são consumidos pela aba de origem.
- A barra usa Shadow DOM e um iframe da própria extensão. O manifest expõe somente `panel.html`, conforme as [regras de recursos acessíveis do Chrome](https://developer.chrome.com/docs/extensions/reference/manifest/web-accessible-resources). A permissão `clipboardWrite` mantém os botões de copiar disponíveis no painel incorporado.
- Páginas internas como `chrome://` e `edge://`, a loja de extensões e outras páginas protegidas pelo navegador não aceitam a barra. Arquivos locais exigem habilitar o acesso a URLs de arquivo no gerenciador da extensão.

## Novidades
- Busca de ferramentas com Ctrl+K (ou Command+K), setas e Enter.
- Busca de atalhos por nome, gatilho ou conteúdo.
- Prévia da mensagem durante a edição do Text Expander.
- Sugestões dentro das páginas com até três linhas de conteúdo e posicionamento adaptativo.
- Calendário de agendamento com resumo da data/turno, botões acessíveis, Escape e retorno do foco ao campo.
- Animações curtas, sem filtros pesados ou dependências remotas, respeitando redução de movimento.

## Organização
- `panel.html`: estrutura do painel e busca de ferramentas.
- `design.css`: tokens, layout, componentes e regras responsivas do painel e popup.
- `productivity.js`: busca, prévia de edição e acessibilidade, sem alterar as chaves de armazenamento.
- `sidebar.js`: botão flutuante e barra nas páginas (somente no frame principal).
- `panel-bridge.js`: integração do painel incorporado.
- `popup.html`: popup legado, preservado para compatibilidade; o ícone abre a barra.
- `content.js`: sugestões e modais isolados em Shadow DOM dentro das páginas.

`extensao-autofill/`, `preview/`, `scripts-revisados/` e o serviço `ai-service/` não vieram nesta cópia. Não foi criada uma cópia interna. Os antigos `identity.css`, `panel-base.css`, `sidebar-panel.css` e `popup-ui.css` foram substituídos por `design.css`. `workspace.js` e `ui.css`, sem referências no HTML/manifest ou scripts ativos, foram removidos; nenhum dado de `workspaceLibraryV2` foi apagado.

## IA de atendimento — Groq
**Limitação desta distribuição:** `ai-service/start.ps1` e `ai-service/server.cjs` não existem no disco. O início automático (Native Messaging, instalador e permissão `nativeMessaging`) não foi implementado, conforme a regra de interromper a entrega C quando esses arquivos faltarem. Os comandos `.cmd` existentes foram preservados, mas dependem dessa pasta para funcionar. Restaure o serviço original antes de concluir a integração automática; não execute um instalador inexistente.

Abra `Iniciar-IA.cmd` para usar a chave Groq salva com criptografia da sua conta do Windows e iniciar o serviço local. Recarregue a extensão em `brave://extensions`, atualize a página e abra Alyrio AI. O GPT-OSS 120B atende pedidos de texto; o Qwen 3.8 analisa imagens automaticamente. A chave não fica nos scripts do navegador. Veja [AI-ATENDIMENTO.md](AI-ATENDIMENTO.md) para os passos completos.

A IA gera sugestões para revisar e copiar, aceita imagens e mantém o contexto recente da conversa. Os quatro atalhos de texto estão conectados aos comandos correspondentes. O botão de histórico carrega o texto para revisão antes de consultar a API. Nenhuma resposta da IA é encaminhada automaticamente ao cliente.

`npm run test:ai` valida a integração com respostas simuladas e dados fictícios, sem chamar APIs externas. A API exige uma chave própria e está sujeita aos limites da conta Groq.

## Usar
Carregue esta pasta (a que contém `manifest.json`) como extensão sem compactação no Chrome/Edge. Para instalações existentes, recarregue a extensão em `chrome://extensions` ou `edge://extensions` e atualize as abas abertas para o botão aparecer automaticamente. O ícone também pode injetar a barra em uma página já aberta.

## Mundiale beta
- A extração do beta é independente. O Mundiale anterior mantém seu extrator e a atualização de protocolo pela URL; os atalhos e o Native continuam iguais.
- O preenchimento Mundiale (Ctrl+Shift+V ou Buscar Dados) também reconhece `https://app-beta.withub.ai/`. Quando necessário, abre as informações pelo ícone de janela e aguarda o telefone aparecer.
- Extrai o primeiro nome, como na versão anterior, o telefone principal e o protocolo exibido no atendimento. Se as duas versões estiverem abertas, prioriza a aba ativa.
- No beta, os tokens `{{PROTOCOLO}}` e `{{PROTO}}` do Text Expander consultam o protocolo visível a cada expansão. Sem um protocolo visível, deixam o valor vazio para não reutilizar o de outra conversa.
- Testes locais com o HTML fornecido: `node tests/withub-beta.cjs`, `node tests/withub-expander.cjs` e `node tests/background.cjs`. A validação não acessa uma sessão autenticada do Mundiale.

## Withub atual (app.withub.ai)
- Buscar Dados e Ctrl+Shift+V reconhecem a página inicial, `/inbox` e URLs com `?idTicket=`, além das versões anteriores.
- No layout atual, o nome vem do cabeçalho `h2`, o protocolo do selo visível e o telefone de “Telefone principal” ou, como alternativa, do campo `idLead`. Endereços como `553196000123@meta-whatsapp.com.withub.ai` são convertidos para `31 9 96000123`, seguindo o formato usado pelos scripts.
- A busca prioriza a aba que abriu o painel. Se faltar um dos dados, o campo correspondente fica vazio para evitar misturar clientes. Os textos dos scripts são preservados.
- `{{PROTOCOLO}}` e `{{PROTO}}` consultam o selo visível a cada expansão, acompanhando a troca de atendimento. Não usam o protocolo salvo de outra conversa quando o selo estiver ausente.
- Recarregue a extensão em `brave://extensions` e atualize a aba do Withub para aplicar a versão atual. A cópia interna `extensao-autofill` também foi atualizada.
- `npm run test:withub` valida os seletores com HTML fornecido e dados fictícios, as duas versões anteriores e o Text Expander. A sessão autenticada ainda exige conferência no navegador do usuário.

## Mapas e Técnicos
- O mapa acompanha automaticamente as buscas após uma breve pausa na digitação. Uma busca por nome centraliza a primeira região encontrada; a lista mantém todos os resultados. Coordenadas válidas são aplicadas automaticamente, e Enter aplica imediatamente. A lista do mapa selecionado é consultada automaticamente ao abrir a seção e a cada minuto enquanto ela estiver visível. Mudanças recarregam também o mapa, preservando filtros e coordenadas.
- Cole latitude e longitude em “Buscar por coordenada” e pressione Enter ou “Localizar no mapa”. O mapa centraliza o ponto e a lista mostra as regiões cujos polígonos contêm a coordenada, preservando áreas sobrepostas e excluindo vazios internos. Exemplos: `-19.506267, -43.898814` ou `-19,506267; -43,898814`. A consulta usa o mapa selecionado e os dados locais; nenhum resultado não significa ausência de cobertura. Troque o mapa para consultar a mesma coordenada em outra fonte ou use “Limpar coordenada” para voltar à lista completa.
- A seção reúne os três links informados, com os mapas originais e uma lista pesquisável por região, técnico ou observação.
- `maps-data.js` inclui a cópia dos KMLs públicos consultados em 08/09/2026: 35 regiões de PROVERNET 2026, 50 de BRSUPER 2026 e 5 de Rotas HBA. As descrições preservam os responsáveis, tipos de atendimento e restrições publicados na fonte.
- Os três mapas possuem lista local e visualização integrada. Também é possível selecionar um mapa e importar um KML exportado pela conta com acesso. KMZ e KML contendo apenas links de rede não são aceitos.
- A lista é uma cópia local, com data de obtenção. A sincronização automática consulta os dados públicos; “Atualizar lista do Google” permite consultar imediatamente. Mapas que exigem login continuam dependendo de importação manual. Uma falha mantém a cópia anterior. As atualizações e importações ficam em `chrome.storage.local`, na chave `technicianMapsV1`.
- O mapa incorporado consulta o Google quando a seção é aberta e depende de conexão e disponibilidade do serviço. “Ver região no mapa” centraliza a área aproximada; consulte os polígonos para conferir os limites.
- `maps.js` usa as permissões de rede já presentes na extensão. Os dados importados são exibidos como texto.
- Teste específico: com a prévia na porta 4174 (`$env:PORT='4174'; npm run preview` no PowerShell), execute `npm run test:maps`.

## Validar
1. `npm test` executa o contrato de textos/IDs/ganchos, a comparação com a base preservada, o contraste, os textos/correspondências dos motivos e o teste de comportamento da barra. `npm run test:sidebar` executa somente este último.
2. `npm run test:visual` captura as nove ferramentas, incluindo as três sub-abas de Scripts, em 360 e 480 px, nos temas claro e escuro. Verifica transbordamento, ações/campo da IA visíveis e textareas dos scripts acessíveis sem rolagem em 480×768 com campos vazios.
3. `npm run test:browser` verifica preenchimento, cópia exata, limpeza da aba atual, busca, retenção de áudio, cópia de portas/senhas, IA simulada, sugestões, calendário e a barra incorporada. Todos os dados são fictícios e a rede externa fica bloqueada.
4. `node tests/visual.cjs before` captura a interface original a partir do commit local `e8d5d20`. O golden dos textos foi gravado antes do redesign e está no commit `3ee902e`.

Capturas em `verification/before`, `verification/after` e `verification/interaction`. Os testes visuais usam Playwright (dependência de desenvolvimento já declarada). Usam Edge instalado no Windows ou o Chromium do Playwright; `AUTO_PREENCHER_BROWSER` permite escolher outro executável. Nenhuma dependência foi adicionada à extensão em execução.

Os comandos históricos `preview`, `test:background`, `test:withub`, `test:ai`, `test:revisions`, `test:legacy`, `test:maps` e `test:passwords` continuam declarados, mas seus arquivos não vieram nesta distribuição. Eles não comprovam validação enquanto as pastas originais não forem restauradas. `npm test` e `test:sidebar` foram direcionados aos novos testes disponíveis, sem fabricar substitutos para as suítes ausentes.

Os testes de navegador simulam as APIs da extensão e o serviço da IA. Não validam Native Messaging, uma instalação real no Brave nem sessões autenticadas de Withub/Native. A integração deve ser conferida manualmente nessas sessões. Conteúdo longo pode exigir rolagem; prévia e ações permanecem acessíveis.
