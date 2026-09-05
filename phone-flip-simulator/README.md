# Phone Flip Simulator

Jogo web de compra e revenda de celulares, em português, com partida salva automaticamente no navegador (localStorage). Aplicativo estático independente dos outros projetos desta pasta.

## Executar

Com Node.js instalado, abra um terminal nesta pasta e execute `node server.js` (ou `npm start`). Acesse http://127.0.0.1:4173. Para publicar em hospedagem estática, envie `index.html`, `styles.css`, `app.js` e `engine.js` para `/phone-flip-simulator/`. Não há backend ou dependências de instalação. É necessário servir por HTTP, pois o jogo usa módulos JavaScript. A fonte do Google Fonts é opcional; há fallback local.

## Jogar

Analise uma oportunidade no marketplace, inspecione se desejar, compre e prepare o anúncio no estoque. Avance os dias para receber propostas. Aceite, recuse ou negocie; contrapropostas dentro do orçamento do comprador concluem a venda. Ofertas expiram após dois dias e anúncios antigos recebem ofertas menores. As compras do marketplace expiram em cinco dias.

Cada venda aumenta a reputação em 3 pontos. Deixar uma proposta expirar sem resposta reduz 1 ponto. A reputação determina visualizações, chance de propostas e orçamento dos compradores. Os defeitos são informados no anúncio; aparelhos bloqueados têm avaliação residual muito baixa. A inspeção é debitada imediatamente, mesmo se o aparelho não for comprado. O patrimônio considera saldo e avaliação ajustada pelas condições reais dos aparelhos, inclusive defeitos ocultos. Lucro realizado líquido soma vendas menos respectivos custos de compra e todas as inspeções da partida. O lucro de cada aparelho inclui apenas sua própria inspeção.

Metas desbloqueiam modelos com base no maior patrimônio alcançado e permanecem conquistadas após quedas de mercado. Histórico registra os últimos 60 dias; feed mantém os últimos 180 acontecimentos. Reiniciar exige confirmação. Não há dinheiro real, conta, login ou sincronização entre dispositivos. Abas da mesma origem sincronizam o salvamento; use uma aba por vez para jogar.

## Verificar

`node --test tests/engine.test.js` (ou `npm test`) executa testes de contabilidade, inspeção, negociação, expiração, progressão, serialização e uma simulação de 300 dias. O motor está em `engine.js`, a interface em `app.js` e o visual responsivo em `styles.css`.
