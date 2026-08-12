(() => {
  const imgurEmbedUrl = 'https://imgur.com/a/aauu1YX/embed#y5VFWvr';

  function applyShowcaseEmbed() {
    const section = document.querySelector('#main-content section:nth-of-type(2)');
    if (!section) return;

    const box = section.querySelector(':scope > div.grid > a > div');
    if (!box || box.dataset.imgurEmbedApplied === 'true') return;

    box.dataset.imgurEmbedApplied = 'true';
    box.style.setProperty('background-image', 'none', 'important');
    box.style.setProperty('background', 'transparent', 'important');
    box.style.setProperty('min-height', '420px', 'important');
    box.style.setProperty('overflow', 'hidden', 'important');
    box.style.setProperty('border-radius', '1.25rem', 'important');

    box.innerHTML = '';

    const iframe = document.createElement('iframe');
    iframe.src = imgurEmbedUrl;
    iframe.title = 'Aplicativo desenvolvido para o Grupo Covre';
    iframe.loading = 'lazy';
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', '');
    iframe.style.setProperty('display', 'block', 'important');
    iframe.style.setProperty('width', '100%', 'important');
    iframe.style.setProperty('height', '420px', 'important');
    iframe.style.setProperty('border', '0', 'important');
    iframe.style.setProperty('background', 'transparent', 'important');

    box.appendChild(iframe);
  }

  window.addEventListener('DOMContentLoaded', () => {
    applyShowcaseEmbed();

    const observer = new MutationObserver(() => applyShowcaseEmbed());
    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(applyShowcaseEmbed, 100);
    setTimeout(applyShowcaseEmbed, 700);
  });
})();
