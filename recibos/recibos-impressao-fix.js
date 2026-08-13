function obterRecibosVisiveisParaImpressao() {
  return Array.from(document.querySelectorAll('.recibo')).filter((recibo) => {
    const styles = window.getComputedStyle(recibo);
    return (
      styles.display !== 'none' &&
      styles.visibility !== 'hidden' &&
      !recibo.id.startsWith('modelo-')
    );
  });
}

function clonarReciboParaImpressao(reciboOriginal) {
  const clone = reciboOriginal.cloneNode(true);
  clone.classList.remove('selecionado', 'ultima-impressao');
  clone.style.display = 'block';
  clone.style.transform = 'none';
  clone.style.transformOrigin = 'initial';
  clone.style.marginBottom = '20px';

  const camposOriginais = reciboOriginal.querySelectorAll('input, textarea');
  const camposClonados = clone.querySelectorAll('input, textarea');

  camposOriginais.forEach((campoOriginal, index) => {
    const campoClonado = camposClonados[index];
    if (!campoClonado) return;

    if (campoOriginal.type === 'checkbox' || campoOriginal.type === 'radio') {
      campoClonado.checked = campoOriginal.checked;
      return;
    }

    if (campoClonado.tagName === 'TEXTAREA') {
      campoClonado.textContent = campoOriginal.value;
      campoClonado.value = campoOriginal.value;
    } else {
      campoClonado.setAttribute('value', campoOriginal.value);
      campoClonado.value = campoOriginal.value;
    }
  });

  clone.querySelectorAll('.checkbox-recibo').forEach((checkbox) => checkbox.remove());

  return clone.outerHTML;
}

function imprimirPDF() {
  const recibosVisiveis = obterRecibosVisiveisParaImpressao();

  if (!recibosVisiveis.length) {
    alert('Nenhum recibo vis�vel para imprimir.');
    return;
  }

  const estilos = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map((node) => node.outerHTML)
    .join('\n');

  const htmlRecibos = recibosVisiveis.map(clonarReciboParaImpressao).join('');
  const janelaImpressao = window.open('', '_blank', 'width=900,height=1200');

  if (!janelaImpressao) {
    alert('N�o foi poss�vel abrir a janela de impress�o. Verifique se o navegador bloqueou pop-ups.');
    return;
  }

  janelaImpressao.document.open();
  janelaImpressao.document.write(`
    <!doctype html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Impress�o de Recibos</title>
      ${estilos}
      <style>
        html, body {
          width: auto !important;
          height: auto !important;
        }
        body {
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
        }
        .recibo {
          box-shadow: none !important;
          break-after: page !important;
          page-break-after: always !important;
          page-break-inside: avoid !important;
          margin: 20px auto !important;
          width: 100% !important;
          max-width: 700px !important;
          border: none !important;
          border-radius: 0 !important;
          padding: 30px !important;
          background-color: white !important;
          transform: none !important;
        }
        .recibo:last-child {
          break-after: auto !important;
          page-break-after: auto !important;
          margin-bottom: 0 !important;
        }
        .checkbox-recibo,
        .botoes,
        .loading-overlay,
        .status-contador,
        .toast,
        .popup-overlay,
        .whatsapp-btn,
        .btn-sair,
        .toggle-footer-btn,
        .btn-adicionar-recibo {
          display: none !important;
        }
        input, textarea, .linha, .assinatura-nome {
          color: #000 !important;
        }
        input, textarea {
          border-bottom: 0.5px solid #999 !important;
        }
      </style>
    </head>
    <body>
      ${htmlRecibos}
      <script>
        window.onload = function () {
          setTimeout(function () {
            window.print();
            window.close();
          }, 150);
        };
      <\/script>
    </body>
    </html>
  `);
  janelaImpressao.document.close();
}
