(() => {
  const IMGUR_ALBUM_URL = 'https://imgur.com/a/aauu1YX';
  const IMGUR_ALBUM_ID = 'a/aauu1YX';

  function runImgurEmbed() {
    if (window.imgurEmbed && typeof window.imgurEmbed.createIframe === 'function') {
      window.imgurEmbed.createIframe();
    }
  }

  function ensureImgurScript() {
    const existing = document.querySelector('script[data-gaveblue-imgur-embed]');
    if (existing) {
      if (window.imgurEmbed) runImgurEmbed();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://s.imgur.com/min/embed.js';
    script.async = true;
    script.charset = 'utf-8';
    script.dataset.gaveblueImgurEmbed = 'true';
    script.addEventListener('load', () => {
      setTimeout(runImgurEmbed, 0);
      setTimeout(runImgurEmbed, 250);
    });
    document.head.appendChild(script);
  }

  function applyShowcaseEmbed() {
    const section = document.querySelector('#main-content section:nth-of-type(2)');
    if (!section) return;

    const grid = section.querySelector(':scope > div.grid');
    if (!grid || grid.children.length < 2) return;

    let wrapper = grid.children[1];

    // A seção original usa um <a> como wrapper. O embed oficial do Imgur
    // também contém um link, então substituímos o wrapper para evitar <a> aninhado.
    if (wrapper.tagName === 'A') {
      const replacement = document.createElement('div');
      replacement.className = wrapper.className;
      replacement.dataset.gaveblueShowcaseWrapper = 'true';
      while (wrapper.firstChild) replacement.appendChild(wrapper.firstChild);
      wrapper.replaceWith(replacement);
      wrapper = replacement;
    }

    if (wrapper.dataset.imgurEmbedApplied === 'true') {
      runImgurEmbed();
      return;
    }

    wrapper.dataset.imgurEmbedApplied = 'true';
    wrapper.style.setProperty('display', 'block', 'important');
    wrapper.style.setProperty('padding', '0', 'important');
    wrapper.style.setProperty('border', '0', 'important');
    wrapper.style.setProperty('background', 'transparent', 'important');
    wrapper.style.setProperty('box-shadow', 'none', 'important');

    let box = wrapper.firstElementChild;
    if (!box) {
      box = document.createElement('div');
      wrapper.appendChild(box);
    }

    box.style.setProperty('background-image', 'none', 'important');
    box.style.setProperty('background', 'transparent', 'important');
    box.style.setProperty('min-height', '0', 'important');
    box.style.setProperty('height', 'auto', 'important');
    box.style.setProperty('overflow', 'visible', 'important');
    box.style.setProperty('border', '0', 'important');
    box.style.setProperty('border-radius', '0', 'important');
    box.style.setProperty('filter', 'none', 'important');
    box.innerHTML = '';

    const blockquote = document.createElement('blockquote');
    blockquote.className = 'imgur-embed-pub';
    blockquote.lang = 'pt-BR';
    blockquote.dataset.id = IMGUR_ALBUM_ID;
    blockquote.dataset.context = 'false';
    blockquote.style.margin = '0 auto';
    blockquote.style.maxWidth = '100%';

    const link = document.createElement('a');
    link.href = IMGUR_ALBUM_URL;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Ver projeto no Imgur';

    blockquote.appendChild(link);
    box.appendChild(blockquote);
    ensureImgurScript();
  }

  const start = () => {
    applyShowcaseEmbed();

    const observer = new MutationObserver(() => applyShowcaseEmbed());
    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(applyShowcaseEmbed, 100);
    setTimeout(applyShowcaseEmbed, 700);
  };

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
