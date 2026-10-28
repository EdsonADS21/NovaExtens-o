# Redesign do Auto Preencher · 2.0

**A e B concluídas. C interrompida conforme a condição expressa do pedido:** `ai-service/start.ps1` e `ai-service/server.cjs` não existem nesta cópia. Não foi inventado um serviço substituto nem criado instalador sem o serviço original.

## Resultado

- **A — Visual:** identidade Oficina em verde-petróleo, temas claro/escuro, navegação horizontal, identificação compacta, scripts em duas colunas e opções segmentadas. Prévia recolhível e ações de preencher/copiar/limpar ficam fora da rolagem. A conversa da IA mantém o pedido visível. Popup, sugestões, senhas, calendário e marca acompanham o sistema. Manifest atualizado de 1.9 para 2.0.
- **B — Fechamento:** apenas o × fecha a barra. Mouse, clique fora, Esc e edição não fecham. Launcher e mensagem usada pelo ícone/atalho sempre abrem. Removidos fixação, temporizador de fechamento e rastreamento de edição. O iframe permanece montado e preserva os campos ao reabrir.
- **C — Bloqueio:** faltam os dois arquivos essenciais do serviço. Nenhum host, instalador, registro, tarefa, arquivo de chave ou permissão nova foi criado. A IA continua usando o contrato original. Os estados de início automático não foram fabricados na interface nem nas capturas.

## Segurança de compatibilidade e testes

As alterações locais anteriores foram preservadas no commit `e8d5d20`, na branch `redesign-v2`. O golden foi gerado antes das edições e registrado separadamente em `3ee902e`. A entrega A está em `e06f0a7`; B e a verificação final, em `9b072dd`. Nenhum push ou publicação foi feito.

| Verificação | Antes | Depois |
| --- | --- | --- |
| `npm test` | Falhava: `tests/redesign.cjs` ausente | Passa: contrato, compatibilidade e barra |
| `test:sidebar` | Falhava: testes originais ausentes | Passa com teste novo do comportamento solicitado |
| `test:background`, `test:withub`, `test:ai`, `test:revisions` | Falhavam: arquivos ausentes | Continuam indisponíveis pelo mesmo motivo |
| Contrato dos textos | 28 saídas salvas antes de editar | 28 saídas idênticas, incluindo vazios, acentos e opções |
| IDs e atributos usados pelo código | Um gancho opcional da IA não existia no HTML | IDs estáticos, auxiliares de busca e atributos verificados; gancho opcional mantido oculto |
| Navegador | 28 capturas de referência | 44 telas finais + 38 capturas de interação, sem erros de JavaScript nos fluxos verificados |

`npm run test:visual` passou em 360×768 e 480×768, nos dois temas, em todas as nove ferramentas e três sub-abas de Scripts. Verificou ausência de transbordamento, ações e pedido da IA visíveis. Em 480×768, os textareas dos scripts vazios cabem sem rolagem. Textos longos crescem até um limite e continuam acessíveis por rolagem.

`npm run test:browser` passou: preencher/foco, cópia exata da prévia, limpeza apenas da aba atual, busca, edição preservando áudio, cópia de senhas/portas, resposta da IA simulada e seus estados de conexão, sugestões, calendário e barra incorporada em 360, 480 e 1366 px nos dois temas. Mouse, clique fora, Esc, busca, edição, abertura repetida, × e retenção dos campos foram conferidos. O atalho/ícone foi validado pelo contrato de mensagem `show-sidebar`; o acionamento físico na instalação real precisa de conferência manual.

`tests/compatibility.cjs` compara com a base preservada: background, IA, mapas, revisão dos atalhos e comandos locais permanecem idênticos. Em `content.js`, apenas estilos e preferência visual mudaram. No painel, os construtores e demais regras foram preservados. Contraste dos principais pares de tokens atende AA; bordas dos campos têm contraste mínimo de 3:1. A busca pelos nomes/cores/fontes anteriores e por mecanismos de fechamento automático não encontrou restos nos arquivos ativos correspondentes. Todos os JavaScripts passaram na verificação de sintaxe. O manifest só mudou a versão, sem adicionar `key` ou permissões.

Os testes de navegador usam dados fictícios, APIs da extensão simuladas e rede externa bloqueada. Não houve chamada à Groq ou envio a clientes. Não foi validada uma instalação real no Brave, sessão autenticada de Withub/Native ou o serviço da IA. As suítes originais faltantes não foram consideradas aprovadas. Nenhum `.env` ou arquivo DPAPI foi lido, copiado ou registrado.

Capturas: [antes](verification/before), [depois](verification/after), [interações e barra](verification/interaction). Resultados das suítes históricas: [suite-results.json](verification/suite-results.json).

## Arquivos

- **Alterados:** `panel.html`, `panel.js`, `panel-bridge.js`, `productivity.js`, `sidebar.js`, `content.js`, `popup.html`, `brand-mark.svg`, `icon128.png`, `manifest.json`, `package.json`, `IDENTIDADE.md`, `README.md`, `AI-ATENDIMENTO.md`.
- **Criados:** `design.css`, `scripts/generate-icon.cjs`, `scripts/sync-shadow-styles.cjs`, `tests/contract.cjs`, `tests/golden.json`, `tests/hooks.json`, `tests/compatibility.cjs`, `tests/sidebar.cjs`, `tests/browser-support.cjs`, `tests/browser.cjs`, `tests/visual.cjs`, este relatório e `verification/`.
- **Removidos:** `identity.css`, `panel-base.css`, `sidebar-panel.css`, `popup-ui.css` (consolidados em `design.css`); `workspace.js` e `ui.css` (não eram referenciados pelo HTML, manifest ou código ativo). Nenhum armazenamento foi apagado. `extensao-autofill/` não existe no disco e não foi criada.

O PNG é reproduzível por `node scripts/generate-icon.cjs`, sem dependências novas. Mudanças nos tokens devem ser replicadas nos estilos isolados com `node scripts/sync-shadow-styles.cjs`. Não há etapa de build para usar a extensão.

## Próximos passos do operador

1. Recarregar a extensão em `brave://extensions` e atualizar as abas abertas, mantendo a mesma instalação e pasta.
2. Conferir em sessão real de Withub/Native **Preencher da aba**, cópia do registro, atalhos e fechamento pelo ×. A cópia continua limpando a sub-aba após sucesso, como antes.
3. Para concluir C, restaurar a pasta original `ai-service/`, incluindo `start.ps1` e `server.cjs`, sem compartilhar chaves. Então será possível implementar o host e o instalador reutilizando a lógica DPAPI existente.
4. Somente depois de C implementada: copiar o ID da extensão, executar o instalador uma vez e reabrir o navegador para confirmar o início automático. **Esse instalador ainda não existe nesta entrega.**

Não foram implementados atalhos adicionais, alterações nos textos, novos modelos de IA ou mudanças na regra de limpar após copiar, por excederem a preservação de funcionamento. O principal limite atual é a ausência do serviço local e das suítes originais; os testes locais não substituem o uso real autenticado.
