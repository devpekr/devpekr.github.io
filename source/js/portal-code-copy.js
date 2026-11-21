(function () {
  var copyIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 7V4.8A1.8 1.8 0 0 1 9.8 3h9.4A1.8 1.8 0 0 1 21 4.8v11.4a1.8 1.8 0 0 1-1.8 1.8H17"/><rect x="3" y="7" width="14" height="14" rx="1.8"/></svg>';
  var copiedIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.2 4.2L19 7"/></svg>';

  function getCopyText(block) {
    var source = block.matches('figure.highlight')
      ? block.querySelector('.code pre')
      : block.querySelector('code') || block;
    if (!source) return '';
    var clone = source.cloneNode(true);
    clone.querySelectorAll('button, .portal-code-copy').forEach(function (el) { el.remove(); });
    clone.querySelectorAll('br').forEach(function (br) { br.replaceWith(document.createTextNode('\n')); });
    return (clone.textContent || '').replace(/\n+$/, '');
  }

  function fallbackCopy(text) {
    var input = document.createElement('textarea');
    input.value = text;
    input.setAttribute('readonly', '');
    input.style.cssText = 'position:fixed;opacity:0;left:-9999px;top:0';
    document.body.appendChild(input);
    input.select();
    var copied = false;
    try { copied = document.execCommand('copy'); } catch (error) { copied = false; }
    input.remove();
    return copied;
  }

  function addCopyButtons() {
    document.querySelectorAll('.portal-article-content figure.highlight, .portal-document-content figure.highlight, .article-entry figure.highlight, .portal-article-content pre:not(.mermaid), .portal-document-content pre:not(.mermaid), .article-entry pre:not(.mermaid)')
      .forEach(function (block) {
        // Highlight.js/Hexo wraps one code window in a figure with separate
        // gutter and code <pre> elements. Add the control to the figure only.
        if (block.tagName === 'PRE' && block.closest('figure.highlight')) return;
        if (block.querySelector(':scope > .portal-code-copy')) return;
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'portal-code-copy';
        button.setAttribute('aria-label', '코드 복사');
        button.title = '코드 복사';
        button.innerHTML = copyIcon;
        block.appendChild(button);

        button.addEventListener('click', function () {
          var text = getCopyText(block);
          var result = navigator.clipboard && window.isSecureContext
            ? navigator.clipboard.writeText(text).then(function () { return true; }).catch(function () { return fallbackCopy(text); })
            : Promise.resolve(fallbackCopy(text));
          result.then(function (copied) {
            if (!copied) {
              button.setAttribute('aria-label', '복사하지 못했습니다');
              button.title = '복사하지 못했습니다';
              return;
            }
            button.innerHTML = copiedIcon;
            button.classList.add('is-copied');
            button.setAttribute('aria-label', '코드를 복사했습니다');
            button.title = '복사했습니다';
            window.setTimeout(function () {
              button.innerHTML = copyIcon;
              button.classList.remove('is-copied');
              button.setAttribute('aria-label', '코드 복사');
              button.title = '코드 복사';
            }, 1400);
          });
        });
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addCopyButtons);
  } else {
    addCopyButtons();
  }
})();
