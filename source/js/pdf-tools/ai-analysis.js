(function (window, document) {
  'use strict';

  window.PdfToolModules = window.PdfToolModules || {};
  var AI_PROXY_URL = 'https://rest.dev.pe.kr/api/toyproject/pdf/ai';
  var CHUNK_SIZE = 5000;

  function option(ctx, name) {
    var el = ctx.optionsEl.querySelector('[name="' + name + '"]');
    if (el && el.type === 'checkbox') return el.checked ? 'yes' : 'no';
    return el ? el.value : '';
  }

  function setOptions(ctx, html) { ctx.optionsEl.innerHTML = html; }
  function progress(ctx, percent, message) {
    if (ctx.core && ctx.core.setProgress) ctx.core.setProgress(percent, message);
  }
  async function extractPdf(file, ctx) {
    if (!window.pdfjsLib) throw new Error('PDF 텍스트 추출 라이브러리를 불러오지 못했습니다.');
    var buffer = ctx.core && ctx.core.fileToArrayBuffer ? await ctx.core.fileToArrayBuffer(file) : await file.arrayBuffer();
    var pdf = ctx.core && ctx.core.loadPdfJsDoc
      ? await ctx.core.loadPdfJsDoc(buffer)
      : await window.pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
    var pages = [], allSizes = [];
    for (var p = 1; p <= pdf.numPages; p++) {
      progress(ctx, Math.round((p - 1) / pdf.numPages * 20), 'PDF 텍스트 추출 중 · ' + p + '/' + pdf.numPages);
      var content = await (await pdf.getPage(p)).getTextContent();
      var items = (content.items || []).filter(function (item) { return item.str && item.str.trim(); }).map(function (item) {
        var transform = item.transform || [];
        var size = Math.abs(Number(transform[0]) || Number(transform[3]) || 0);
        if (size) allSizes.push(size);
        return { text:item.str.trim(), x:Number(transform[4]) || 0, y:Number(transform[5]) || 0, size:size, end:!!item.hasEOL };
      });
      items.sort(function (a, b) { return Math.abs(a.y - b.y) > 2 ? b.y - a.y : a.x - b.x; });
      var lines = [];
      items.forEach(function (item) {
        var line = lines[lines.length - 1];
        if (!line || Math.abs(line.y - item.y) > 2) {
          line = { y:item.y, items:[] }; lines.push(line);
        }
        line.items.push(item);
      });
      pages.push(lines.map(function (line) {
        line.items.sort(function (a, b) { return a.x - b.x; });
        var text = line.items.map(function (item, index) {
          if (!index) return item.text;
          var prev = line.items[index - 1];
          return (item.x - (prev.x + Math.max(1, prev.text.length * prev.size * 0.45)) > item.size * 0.25 ? ' ' : '') + item.text;
        }).join('').trim();
        return { text:text, size:line.items.reduce(function (sum, item) { return sum + item.size; }, 0) / line.items.length };
      }).filter(function (line) { return line.text; }));
    }
    return { pages:pages, averageSize:allSizes.length ? allSizes.reduce(function (a, b) { return a + b; }, 0) / allSizes.length : 0, totalPages:pdf.numPages };
  }

  function makeChunks(text, maxSize) {
    var paragraphs = String(text || '').split(/\n\s*\n/), chunks = [], current = '';
    paragraphs.forEach(function (paragraph) {
      var part = paragraph.trim();
      if (!part) return;
      while (part.length > maxSize) {
        if (current) { chunks.push(current); current = ''; }
        var cut = part.lastIndexOf(' ', maxSize);
        if (cut < maxSize * 0.6) cut = maxSize;
        chunks.push(part.slice(0, cut)); part = part.slice(cut).trim();
      }
      if (current && current.length + part.length + 2 > maxSize) { chunks.push(current); current = ''; }
      current += (current ? '\n\n' : '') + part;
    });
    if (current) chunks.push(current);
    return chunks;
  }

  async function callProxy(task, text, params) {
    var response = await window.fetch(AI_PROXY_URL, {
      method:'POST', headers:{ 'Content-Type':'application/json' },
      body:JSON.stringify({ task:task, text:text, options:params || {} })
    });
    var body;
    try { body = await response.json(); } catch (_) { body = null; }
    if (!response.ok) throw new Error(body && (body.error || body.message) || 'AI 처리 API 오류 (' + response.status + ')');
    if (body && body.error) throw new Error(body.error);
    var result = typeof body === 'string' ? body : body && (body.result || body.output || body.text || body.translation || body.summary || body.content);
    if (typeof result !== 'string' || !result.trim()) throw new Error('AI API 응답에서 결과 텍스트를 찾지 못했습니다.');
    return result.trim();
  }

  function fallbackSummary(text, length) {
    var sentences = String(text).replace(/\s+/g, ' ').match(/[^.!?。！？]+[.!?。！？]?/g) || [];
    sentences = sentences.map(function (s) { return s.trim(); }).filter(function (s) { return s.length > 35; });
    if (!sentences.length) return String(text).slice(0, length === 'short' ? 700 : length === 'detailed' ? 2600 : 1500).trim();
    var words = String(text).toLocaleLowerCase().match(/[\p{L}\p{N}]{2,}/gu) || [], freq = Object.create(null);
    words.forEach(function (word) { if (word.length > 1) freq[word] = (freq[word] || 0) + 1; });
    var ranked = sentences.map(function (sentence, index) {
      var tokens = sentence.toLocaleLowerCase().match(/[\p{L}\p{N}]{2,}/gu) || [], score = tokens.reduce(function (sum, token) { return sum + Math.log(1 + (freq[token] || 0)); }, 0) / Math.sqrt(Math.max(tokens.length, 1));
      if (index === 0) score *= 1.12;
      return { sentence:sentence, index:index, score:score };
    });
    var count = length === 'short' ? 3 : length === 'detailed' ? 12 : 6;
    return ranked.sort(function (a, b) { return b.score - a.score; }).slice(0, count).sort(function (a, b) { return a.index - b.index; }).map(function (item) { return '- ' + item.sentence; }).join('\n');
  }

  function markdownFromPdf(data, ctx) {
    var detect = option(ctx, 'headings') === 'yes', separators = option(ctx, 'pageBreaks') === 'yes';
    return data.pages.map(function (lines, index) {
      var output = lines.map(function (line) {
        var text = line.text.trim();
        if (/^(?:[•●▪◦‣]|\*|[-+])\s+/.test(text)) return '- ' + text.replace(/^(?:[•●▪◦‣]|\*|[-+])\s+/, '');
        if (/^\d+[.)]\s+/.test(text)) return text.replace(/^(\d+)[.)]\s+/, '$1. ');
        if (detect && data.averageSize && line.size >= data.averageSize * 1.22 && text.length < 120) return (line.size >= data.averageSize * 1.65 ? '# ' : '## ') + text;
        return text;
      });
      if (detect) {
        // Use uppercase and numbered title patterns when font size is unavailable.
        output = output.map(function (line) {
          if (/^(?:#{1,6})\s/.test(line)) return line;
          if (line.length < 90 && !/[.!?。！？]$/.test(line) && (line === line.toLocaleUpperCase() || /^\d+(?:\.\d+)*\s+/.test(line))) return (line.length < 45 ? '## ' : '### ') + line;
          return line;
        });
      }
      var page = output.join('\n\n');
      return separators && index < data.pages.length - 1 ? page + '\n\n---' : page;
    }).filter(Boolean).join('\n\n');
  }

  function showTextResult(ctx, text, filename, mime) {
    ctx.resultEl.innerHTML = '<div class="portal-pdf-result-message"><p>완료 · 결과를 복사하거나 파일로 저장할 수 있습니다.</p><div class="portal-pdf-result-actions"><button type="button" data-copy-result>복사</button><button type="button" data-download-result>다운로드</button></div><pre data-result-text style="white-space:pre-wrap;max-height:32rem;overflow:auto"></pre></div>';
    ctx.resultEl.querySelector('[data-result-text]').textContent = text;
    ctx.resultEl.querySelector('[data-copy-result]').addEventListener('click', async function () {
      try { await navigator.clipboard.writeText(text); if (ctx.core && ctx.core.showToast) ctx.core.showToast('결과를 복사했습니다.'); }
      catch (_) { if (ctx.core && ctx.core.showToast) ctx.core.showToast('클립보드에 복사하지 못했습니다.', true); }
    });
    ctx.resultEl.querySelector('[data-download-result]').addEventListener('click', function () {
      var blob = new Blob([text], { type:mime || 'text/markdown;charset=utf-8' });
      if (ctx.core && ctx.core.downloadBlob) ctx.core.downloadBlob(blob, filename);
      else { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click(); URL.revokeObjectURL(a.href); }
    });
  }

  function renderSummarize(ctx) {
    setOptions(ctx, '<label>요약 길이 <select name="length"><option value="short">짧게</option><option value="medium" selected>보통</option><option value="detailed">상세</option></select></label><p>텍스트 추출이 가능한 PDF를 요약합니다. AI 처리 API에 추출 텍스트가 전송됩니다.</p>');
  }
  function renderTranslate(ctx) {
    setOptions(ctx, '<label>원본 언어 <select name="source"><option value="auto">자동 감지</option><option value="한국어">한국어</option><option value="영어">영어</option><option value="일본어">일본어</option></select></label> <label>번역 언어 <select name="target"><option>한국어</option><option>영어</option><option>일본어</option></select></label><p>추출 텍스트를 선택한 언어로 순차 번역합니다. AI 처리 API에 텍스트가 전송됩니다.</p>');
  }
  function renderMarkdown(ctx) {
    setOptions(ctx, '<label><input type="checkbox" name="headings" value="yes" checked> 헤딩 자동 감지</label> <label><input type="checkbox" name="pageBreaks" value="yes" checked> 페이지 구분선(---) 포함</label>');
  }

  async function execute(ctx) {
    if (!ctx.files || !ctx.files.length) throw new Error('PDF 파일을 먼저 추가해 주세요.');
    var data = await extractPdf(ctx.files[0], ctx);
    var fullText = data.pages.map(function (page) { return page.map(function (line) { return line.text; }).join('\n'); }).filter(Boolean).join('\n\n');
    if (!fullText.trim()) throw new Error('PDF에서 텍스트를 찾지 못했습니다. 스캔 PDF의 OCR은 OCR PDF 도구에서 먼저 실행해 주세요.');
    var id = ctx.tool.id, output, filename, mime = 'text/markdown;charset=utf-8';
    if (id === 'pdf-to-markdown') {
      output = markdownFromPdf(data, ctx); filename = 'converted.md';
    } else {
      var chunks = makeChunks(fullText, CHUNK_SIZE);
      if (id === 'ai-summarize') {
        var length = option(ctx, 'length') || 'medium', results = [];
        try {
          for (var i = 0; i < chunks.length; i++) {
            progress(ctx, 20 + Math.round((i / chunks.length) * 75), 'AI 요약 중 · ' + (i + 1) + '/' + chunks.length);
          results.push(await callProxy('summarize', chunks[i], { length:length }));
          }
          output = results.length === 1 ? results[0] : results.map(function (item) { return '- ' + item.replace(/^\s*[-*]\s*/, ''); }).join('\n');
        } catch (error) {
          output = '**AI 요약 API에 연결하지 못해 브라우저 내 문장 중요도 요약을 표시합니다.**\n\n' + fallbackSummary(fullText, length);
          if (ctx.core && ctx.core.showToast) ctx.core.showToast(error.message + ' · 로컬 요약으로 대체했습니다.');
        }
        output = '# PDF 요약\n\n' + output; filename = 'summary.md';
      } else if (id === 'translate') {
        var source = option(ctx, 'source') || 'auto', target = option(ctx, 'target') || '한국어', translated = [];
        for (var j = 0; j < chunks.length; j++) {
          progress(ctx, 20 + Math.round((j / chunks.length) * 75), '번역 중 · ' + (j + 1) + '/' + chunks.length);
          translated.push(await callProxy('translate', chunks[j], { sourceLang:source, targetLang:target }));
        }
        output = translated.join('\n\n'); filename = 'translated.md';
      } else throw new Error('지원하지 않는 분석 도구입니다.');
    }
    progress(ctx, 100, '완료');
    showTextResult(ctx, output, filename, mime);
  }

  window.PdfToolModules['ai-summarize'] = { renderOptions:renderSummarize, onFilesChanged:function () {}, execute:execute };
  window.PdfToolModules.translate = { renderOptions:renderTranslate, onFilesChanged:function () {}, execute:execute };
  window.PdfToolModules['pdf-to-markdown'] = { renderOptions:renderMarkdown, onFilesChanged:function () {}, execute:execute };
}(window, document));
