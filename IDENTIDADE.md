# Auto Preencher 2.0 · Oficina

Interface de trabalho compacta, com verde-petróleo como destaque e superfícies neutras. Sem animações decorativas, sombras pesadas, fontes remotas ou dependências de execução.

| Elemento | Claro | Escuro |
| --- | --- | --- |
| Destaque | `#086B59` | `#8CDDBC` |
| Fundo | `#F3F5F2` | `#151E1B` |
| Superfície | `#FFFFFF` | `#1C2923` |
| Texto | `#20332E` | `#EEF4EF` |
| Texto secundário | `#56665F` | `#B3C2B8` |
| Borda | `#7A8F80` | `#698573` |
| Sucesso | `#18633D` | `#9CDEB1` |
| Alerta | `#8A5307` | `#F0C27B` |
| Erro | `#B02B38` | `#FFADB0` |

`design.css` é a fonte dos tokens e dos estilos do painel e popup. `node scripts/sync-shadow-styles.cjs` replica os tokens nos estilos isolados de `content.js` e `sidebar.js`; execute depois de alterar a paleta. Isso mantém o Shadow DOM independente sem expor novos recursos da extensão às páginas.

Tipografia: Segoe UI Variable, Segoe UI e system-ui; base 14 px, rótulos 12 px. Protocolos e números usam Cascadia Mono/Consolas. Controles com altura mínima de 36 px; ações dos scripts e envio da IA com 44 px. Foco visível de 2 px. O teste de compatibilidade verifica contraste AA dos textos e contraste de 3:1 das bordas dos campos. Redução de movimento é respeitada.

Navegação horizontal com ícones e rótulos; formulários em linhas compactas; scripts prontos em duas colunas; opções segmentadas. Prévia recolhível e ações ficam no rodapé da seção Scripts, fora da rolagem do formulário. A conversa da IA rola mantendo o campo de pedido visível. Conteúdo longo continua acessível por rolagem.

A marca reúne linhas de registro e uma confirmação. `brand-mark.svg` contém o vetor. Para gerar novamente o PNG 128×128, execute `node scripts/generate-icon.cjs`: o script usa apenas Node e gera o mesmo desenho com suavização de bordas.

Os temas usam a preferência original de `scriptPanelState`; o padrão permanece claro. Os IDs, ações, textos gerados, dados e chaves de armazenamento existentes são preservados. A cópia interna `extensao-autofill/` não existe nesta distribuição.
