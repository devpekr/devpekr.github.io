(function () {
  'use strict';

  window.PdfToolModules = window.PdfToolModules || {};

  var PDF = function () {
    if (!window.PDFLib) throw new Error('PDF 조작 라이브러리를 불러오지 못했습니다. 페이지를 새로고침한 뒤 다시 시도해 주세요.');
    return window.PDFLib;
  };
  var activeCamera = null;
  var scanImages = [];
  var pageItems = [];
  var loadedDocs = [];

  function toolId(ctx) { return ctx.tool && (ctx.tool.id || ctx.tool); }
  function option(ctx, name) { return ctx.optionsEl.querySelector('[name="' + name + '"]'); }
  function value(ctx, name, fallback) { var el = option(ctx, name); return el ? el.value : fallback; }
  function checked(ctx, name) { var el = option(ctx, name); return !!(el && el.checked); }
  function safeName(name) { return String(name || 'document.pdf').replace(/\.pdf$/i, ''); }
  function escape(ctx, text) { return ctx.core.escapeHtml ? ctx.core.escapeHtml(text) : String(text).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
  function progress(ctx, n, message) { if (ctx.core.setProgress) ctx.core.setProgress(n, message); }
  function finish(ctx, message) { if (ctx.core.hideProgress) ctx.core.hideProgress(); if (message && ctx.core.showToast) ctx.core.showToast(message); }
  function requireFiles(ctx, min, max) {
    var files = ctx.files || [];
    if (files.length < min || (max && files.length > max)) throw new Error(max === 1 ? 'PDF 파일을 하나 선택해 주세요.' : 'PDF 파일을 ' + min + '개 이상 선택해 주세요.');
    return files;
  }
  async function bytes(file) { return new Uint8Array(await file.arrayBuffer()); }
  async function loadDoc(file) { return PDF().PDFDocument.load(await bytes(file), { ignoreEncryption: false }); }
  async function savePdf(ctx, doc, filename) {
    var blob = new Blob([await doc.save({ useObjectStreams: true })], { type: 'application/pdf' });
    ctx.core.downloadBlob(blob, filename);
    ctx.resultEl.innerHTML = '<p class="portal-pdf-result-note">' + escape(ctx, filename) + ' 파일을 다운로드했습니다 (' + escape(ctx, ctx.core.formatBytes(blob.size)) + ').</p>';
    finish(ctx, 'PDF 처리가 완료됐습니다.');
  }
  function setOptions(ctx, html) { ctx.optionsEl.innerHTML = html; }
  function commonRange(label, name, placeholder) {
    return '<label class="portal-pdf-field">' + label + '<input name="' + name + '" type="text" placeholder="' + placeholder + '" autocomplete="off"></label>';
  }
  function addStyles() {
    return '<style>.pdf-org-files,.pdf-org-pages{display:grid;gap:10px}.pdf-org-row,.pdf-org-page{display:flex;align-items:center;gap:10px;padding:10px;border:1px solid #e5e7eb;border-radius:12px;background:#fff}.pdf-org-page{display:block}.pdf-org-page canvas{display:block;max-width:100%;height:auto;margin:0 auto 8px;box-shadow:0 2px 8px #0002}.pdf-org-actions{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}.pdf-org-actions button{cursor:pointer}.pdf-org-muted{color:#667085;font-size:.9em}.pdf-org-video{width:min(100%,640px);border-radius:12px;background:#111}.pdf-org-pages{grid-template-columns:repeat(auto-fill,minmax(145px,1fr))}.pdf-org-row button,.pdf-org-actions button{border:1px solid #d0d5dd;background:#fff;border-radius:8px;padding:6px 9px}.pdf-org-selected{outline:2px solid #536dfe}</style>';
  }

  function renderOptions(ctx) {
    var id = toolId(ctx);
    if (id === 'scan-to-pdf') scanImages = [];
    var html = addStyles();
    if (id === 'split') html += '<label class="portal-pdf-field">분할 방식<select name="splitMode"><option value="range">페이지 범위</option><option value="each">모든 페이지 개별 파일</option><option value="chunks">N페이지씩 분할</option></select></label><div data-range>' + commonRange('페이지 범위', 'pageRange', '예: 1-3,5') + '</div><label data-chunks class="portal-pdf-field" hidden>분할할 페이지 수<input name="chunkSize" type="number" min="1" value="2"></label>';
    if (id === 'remove-pages') html += commonRange('제거할 페이지', 'pageRange', '예: 2,4-6') + '<p class="pdf-org-muted">페이지 미리보기에서 페이지를 눌러 범위에 추가할 수도 있습니다.</p>';
    if (id === 'extract-pages') html += commonRange('추출할 페이지', 'pageRange', '예: 1-3,5') + '<label class="portal-pdf-field"><input type="checkbox" name="individual"> 페이지별 PDF를 ZIP으로 받기</label>';
    if (id === 'organize-pdf') html += '<p class="pdf-org-muted">페이지를 옮기고, 회전·복제·삭제하거나 빈 페이지를 추가한 뒤 실행하세요.</p><button type="button" data-add-blank>빈 페이지 추가</button>';
    if (id === 'scan-to-pdf') html += '<div class="portal-pdf-actions"><button type="button" data-camera-start>카메라 시작</button><button type="button" data-camera-capture disabled>촬영</button><button type="button" data-camera-stop disabled>카메라 종료</button><label class="portal-pdf-button">이미지 파일 추가<input data-scan-files type="file" accept="image/*" multiple hidden></label></div><video class="pdf-org-video" data-camera autoplay playsinline hidden></video><label class="portal-pdf-field">페이지 크기<select name="paper"><option value="a4">A4</option><option value="original">원본 비율</option></select></label><p class="pdf-org-muted" data-scan-count></p>';
    setOptions(ctx, html);
    if (id === 'scan-to-pdf') bindScanOptions(ctx);
    if (id === 'split') {
      var mode = option(ctx, 'splitMode');
      mode.addEventListener('change', function () {
        ctx.optionsEl.querySelector('[data-range]').hidden = mode.value !== 'range';
        ctx.optionsEl.querySelector('[data-chunks]').hidden = mode.value !== 'chunks';
      });
    }
    var blank = ctx.optionsEl.querySelector('[data-add-blank]');
    if (blank) blank.addEventListener('click', function () { pageItems.push({ blank: true, rotation: 0 }); renderOrganizePages(ctx); });
  }

  function bindScanOptions(ctx) {
    var video = ctx.optionsEl.querySelector('[data-camera]');
    var start = ctx.optionsEl.querySelector('[data-camera-start]');
    var capture = ctx.optionsEl.querySelector('[data-camera-capture]');
    var stop = ctx.optionsEl.querySelector('[data-camera-stop]');
    var input = ctx.optionsEl.querySelector('[data-scan-files]');
    var count = ctx.optionsEl.querySelector('[data-scan-count]');
    function updateCount() { count.textContent = scanImages.length + '개 이미지 페이지'; }
    start.addEventListener('click', async function () {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('이 브라우저에서 카메라를 사용할 수 없습니다. 이미지 파일을 선택해 주세요.');
        activeCamera = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
        video.srcObject = activeCamera; video.hidden = false; capture.disabled = false; stop.disabled = false; start.disabled = true;
      } catch (e) { if (ctx.core.showToast) ctx.core.showToast(e.message, true); }
    });
    capture.addEventListener('click', function () {
      if (!video.videoWidth) return;
      var canvas = document.createElement('canvas'); canvas.width = video.videoWidth; canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      canvas.toBlob(function (blob) { if (blob) { scanImages.push(new File([blob], 'scan-' + (scanImages.length + 1) + '.jpg', { type: 'image/jpeg' })); updateCount(); renderScanPreview(ctx); } }, 'image/jpeg', .92);
    });
    stop.addEventListener('click', function () {
      if (activeCamera) activeCamera.getTracks().forEach(function (track) { track.stop(); });
      activeCamera = null; video.srcObject = null; video.hidden = true; capture.disabled = true; stop.disabled = true; start.disabled = false;
    });
    input.addEventListener('change', function () { scanImages = scanImages.concat(Array.from(input.files || []).filter(function (f) { return f.type.indexOf('image/') === 0; })); input.value = ''; updateCount(); renderScanPreview(ctx); });
    updateCount();
  }

  async function renderPdfThumb(file, pageNo, canvas, scale) {
    if (!window.pdfjsLib) throw new Error('PDF 미리보기 라이브러리를 불러오지 못했습니다.');
    var doc = await window.PdfToolCore.loadPdfJsDoc(await file.arrayBuffer());
    await window.PdfToolCore.renderPageToCanvas(doc, pageNo, canvas, scale || .45);
  }
  async function renderFileList(ctx) {
    if (toolId(ctx) !== 'merge') return;
    ctx.stageEl.innerHTML = addStyles() + '<h3>합칠 순서</h3><div class="pdf-org-files"></div>';
    var box = ctx.stageEl.querySelector('.pdf-org-files');
    (ctx.files || []).forEach(function (file, index) {
      var row = document.createElement('div'); row.className = 'pdf-org-row';
      row.innerHTML = '<span>' + escape(ctx, file.name) + '</span><span class="pdf-org-muted">' + escape(ctx, ctx.core.formatBytes(file.size)) + '</span><div class="pdf-org-actions"><button data-move="-1" aria-label="위로">↑</button><button data-move="1" aria-label="아래로">↓</button><button data-remove>삭제</button></div>';
      row.querySelectorAll('[data-move]').forEach(function (btn) { btn.disabled = index + Number(btn.dataset.move) < 0 || index + Number(btn.dataset.move) >= ctx.files.length; btn.addEventListener('click', function () { var to = index + Number(btn.dataset.move); var files = ctx.files.slice(); files.splice(to, 0, files.splice(index, 1)[0]); ctx.files.splice(0, ctx.files.length); Array.prototype.push.apply(ctx.files, files); renderFileList(ctx); }); });
      row.querySelector('[data-remove]').addEventListener('click', function () { ctx.files.splice(index, 1); renderFileList(ctx); });
      box.appendChild(row);
    });
  }
  async function renderSimplePages(ctx, id) {
    ctx.stageEl.innerHTML = addStyles() + '<div class="pdf-org-pages" data-thumbs></div>';
    var file = (ctx.files || [])[0]; if (!file || (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name))) return;
    try {
      var pdf = await window.PdfToolCore.loadPdfJsDoc(await file.arrayBuffer());
      var box = ctx.stageEl.querySelector('[data-thumbs]');
      for (var i = 1; i <= pdf.numPages; i++) {
        var card = document.createElement('div'); card.className = 'pdf-org-page';
        var canvas = document.createElement('canvas'); card.appendChild(canvas);
        var label = document.createElement('div'); label.className = 'pdf-org-actions'; label.innerHTML = '<button type="button">페이지 ' + i + '</button>'; card.appendChild(label);
        await window.PdfToolCore.renderPageToCanvas(pdf, i, canvas, .35);
        if (id === 'remove-pages' || id === 'extract-pages') label.firstChild.addEventListener('click', function (n) { return function () { var input = option(ctx, 'pageRange'); var current = input.value.split(',').map(function (v) { return v.trim(); }).filter(Boolean); current.push(String(n)); input.value = Array.from(new Set(current)).join(','); }; }(i));
        box.appendChild(card);
      }
    } catch (e) { ctx.stageEl.insertAdjacentHTML('afterbegin', '<p class="pdf-org-muted">페이지 미리보기를 만들지 못했습니다. 파일 암호나 손상 여부를 확인해 주세요.</p>'); }
  }

  async function renderOrganizePages(ctx) {
    var box = ctx.stageEl.querySelector('[data-organize-pages]');
    if (!box) { ctx.stageEl.innerHTML = addStyles() + '<h3>페이지 순서</h3><div class="pdf-org-pages" data-organize-pages></div>'; box = ctx.stageEl.querySelector('[data-organize-pages]'); }
    box.innerHTML = '';
    for (var i = 0; i < pageItems.length; i++) {
      var item = pageItems[i]; var card = document.createElement('div'); card.className = 'pdf-org-page';
      if (item.blank) card.innerHTML = '<div style="height:150px;display:grid;place-items:center;border:1px dashed #98a2b3">빈 페이지</div>';
      else {
        var can = document.createElement('canvas'); card.appendChild(can);
        var file = ctx.files[item.docIndex];
        try { await renderPdfThumb(file, item.pageIndex + 1, can, .35); }
        catch (_) { can.width = 120; can.height = 160; }
        if (item.rotation) can.style.transform = 'rotate(' + item.rotation + 'deg)';
      }
      var actions = document.createElement('div'); actions.className = 'pdf-org-actions';
      actions.innerHTML = '<button data-move="-1" title="왼쪽">←</button><button data-move="1" title="오른쪽">→</button><button data-rotate>회전</button><button data-copy>복제</button><button data-delete>삭제</button>';
      (function (index, entry) {
        actions.querySelectorAll('[data-move]').forEach(function (b) { b.disabled = index + Number(b.dataset.move) < 0 || index + Number(b.dataset.move) >= pageItems.length; b.onclick = function () { var to = index + Number(b.dataset.move); pageItems.splice(to, 0, pageItems.splice(index, 1)[0]); renderOrganizePages(ctx); }; });
        actions.querySelector('[data-rotate]').onclick = function () { entry.rotation = ((entry.rotation || 0) + 90) % 360; renderOrganizePages(ctx); };
        actions.querySelector('[data-copy]').onclick = function () { pageItems.splice(index + 1, 0, Object.assign({}, entry)); renderOrganizePages(ctx); };
        actions.querySelector('[data-delete]').onclick = function () { pageItems.splice(index, 1); renderOrganizePages(ctx); };
      }(i, item));
      card.appendChild(actions); box.appendChild(card);
    }
  }

  function renderScanPreview(ctx) {
    var allImages = (ctx.files || []).concat(scanImages);
    var count = ctx.optionsEl && ctx.optionsEl.querySelector('[data-scan-count]');
    if (count) count.textContent = allImages.length + '개 이미지 페이지';
    ctx.stageEl.innerHTML = addStyles() + '<div class="pdf-org-pages"></div>';
    var box = ctx.stageEl.firstElementChild.nextElementSibling;
    if (!allImages.length) {
      box.innerHTML = '<p class="pdf-org-muted">카메라로 촬영하거나 이미지 파일을 추가하세요.</p>';
      return;
    }
    var fileCount = (ctx.files || []).length;
    allImages.forEach(function (file, i) {
      var card = document.createElement('div'); card.className = 'pdf-org-page';
      var img = document.createElement('img'); img.src = URL.createObjectURL(file); img.alt = '스캔 페이지 ' + (i + 1); img.style.maxWidth = '100%'; card.appendChild(img);
      var del = document.createElement('button'); del.textContent = '삭제';
      del.onclick = function () {
        URL.revokeObjectURL(img.src);
        if (i < fileCount) ctx.files.splice(i, 1);
        else scanImages.splice(i - fileCount, 1);
        renderScanPreview(ctx);
      };
      card.appendChild(del); box.appendChild(card);
    });
  }

  async function onFilesChanged(ctx) {
    var id = toolId(ctx); pageItems = []; loadedDocs = [];
    if (id === 'merge') return renderFileList(ctx);
    if (id === 'scan-to-pdf') return renderScanPreview(ctx);
    if (id === 'organize-pdf') {
      for (var d = 0; d < (ctx.files || []).length; d++) {
        var doc = await loadDoc(ctx.files[d]); loadedDocs.push(doc);
        for (var p = 0; p < doc.getPageCount(); p++) pageItems.push({ docIndex: d, pageIndex: p, rotation: 0 });
      }
      return renderOrganizePages(ctx);
    }
    return renderSimplePages(ctx, id);
  }

  async function merge(ctx) {
    var files = requireFiles(ctx, 2); var lib = PDF(); var out = await lib.PDFDocument.create();
    for (var i = 0; i < files.length; i++) { progress(ctx, Math.round(i / files.length * 90), 'PDF 합치는 중…'); var src = await lib.PDFDocument.load(await bytes(files[i])); var pages = await out.copyPages(src, src.getPageIndices()); pages.forEach(function (p) { out.addPage(p); }); }
    await savePdf(ctx, out, 'merged.pdf');
  }
  async function split(ctx) {
    var file = requireFiles(ctx, 1, 1)[0]; var lib = PDF(); var doc = await loadDoc(file); var total = doc.getPageCount(); var mode = value(ctx, 'splitMode', 'range'); var groups = [];
    if (mode === 'each') for (var i = 0; i < total; i++) groups.push([i]);
    else if (mode === 'chunks') { var size = Number(value(ctx, 'chunkSize', 2)); if (!Number.isInteger(size) || size < 1) throw new Error('분할 페이지 수는 1 이상의 정수여야 합니다.'); for (var s = 0; s < total; s += size) groups.push(Array.from({ length: Math.min(size, total - s) }, function (_, j) { return s + j; })); }
    else groups = [ctx.core.parsePageRange(value(ctx, 'pageRange', ''), total)];
    if (groups.length === 1) { var one = await libCopy(groups[0]); return savePdf(ctx, one, safeName(file.name) + '-split.pdf'); }
    var entries = [];
    for (var g = 0; g < groups.length; g++) { progress(ctx, Math.round(g / groups.length * 90), '분할 파일 생성 중…'); var part = await libCopy(groups[g]); entries.push({ name: safeName(file.name) + '-part-' + String(g + 1).padStart(2, '0') + '.pdf', data: new Blob([await part.save()], { type: 'application/pdf' }) }); }
    if (!ctx.core.downloadZip) throw new Error('ZIP 다운로드 기능이 준비되지 않았습니다.');
    await ctx.core.downloadZip(entries, safeName(file.name) + '-split.zip');
    ctx.resultEl.textContent = groups.length + '개의 PDF를 ZIP 파일로 다운로드했습니다.'; finish(ctx, '분할이 완료됐습니다.');
    async function libCopy(indices) { var out = await lib.PDFDocument.create(); var pages = await out.copyPages(doc, indices); pages.forEach(function (p) { out.addPage(p); }); return out; }
  }
  async function selectPages(ctx, remove) {
    var file = requireFiles(ctx, 1, 1)[0]; var lib = PDF(); var doc = await loadDoc(file); var total = doc.getPageCount();
    var selected = ctx.core.parsePageRange(value(ctx, 'pageRange', ''), total);
    var indices = remove ? doc.getPageIndices().filter(function (i) { return selected.indexOf(i) < 0; }) : selected;
    if (!indices.length) throw new Error(remove ? '모든 페이지가 제거되어 빈 PDF가 됩니다.' : '추출할 페이지를 지정해 주세요.');
    if (!remove && checked(ctx, 'individual')) {
      var entries = [];
      for (var i = 0; i < indices.length; i++) { var out = await lib.PDFDocument.create(); var pages = await out.copyPages(doc, [indices[i]]); out.addPage(pages[0]); entries.push({ name: 'page-' + String(indices[i] + 1).padStart(3, '0') + '.pdf', data: new Blob([await out.save()], { type: 'application/pdf' }) }); }
      if (!ctx.core.downloadZip) throw new Error('ZIP 다운로드 기능이 준비되지 않았습니다.'); await ctx.core.downloadZip(entries, 'extracted-pages.zip'); ctx.resultEl.textContent = indices.length + '개 페이지를 ZIP 파일로 다운로드했습니다.'; finish(ctx, '페이지 추출이 완료됐습니다.'); return;
    }
    var result = await lib.PDFDocument.create(); (await result.copyPages(doc, indices)).forEach(function (p) { result.addPage(p); });
    await savePdf(ctx, result, remove ? 'removed-pages.pdf' : 'extracted.pdf');
  }
  async function organize(ctx) {
    requireFiles(ctx, 1); if (!pageItems.length) throw new Error('구성할 페이지가 없습니다.');
    var out = await PDF().PDFDocument.create();
    for (var i = 0; i < pageItems.length; i++) {
      progress(ctx, Math.round(i / pageItems.length * 90), '페이지 구성 중…'); var item = pageItems[i];
      if (item.blank) { out.addPage(); continue; }
      var source = loadedDocs[item.docIndex]; if (!source) { source = await loadDoc(ctx.files[item.docIndex]); loadedDocs[item.docIndex] = source; }
      var copied = await out.copyPages(source, [item.pageIndex]); var page = copied[0]; out.addPage(page);
      if (item.rotation) page.setRotation(PDF().degrees((page.getRotation().angle + item.rotation) % 360));
    }
    await savePdf(ctx, out, 'organized.pdf');
  }
  async function scan(ctx) {
    var allImages = (ctx.files || []).concat(scanImages);
    if (!allImages.length) throw new Error('스캔할 이미지가 없습니다. 카메라로 촬영하거나 이미지 파일을 추가해 주세요.');
    var lib = PDF(); var out = await lib.PDFDocument.create(); var a4 = [595.28, 841.89];
    for (var i = 0; i < allImages.length; i++) {
      progress(ctx, Math.round(i / allImages.length * 90), '이미지를 PDF 페이지로 변환 중…'); var image = allImages[i]; var data = await bytes(image); var embedded;
      if (/jpe?g/i.test(image.type) || /\.jpe?g$/i.test(image.name)) embedded = await out.embedJpg(data); else if (/png/i.test(image.type) || /\.png$/i.test(image.name)) embedded = await out.embedPng(data); else {
        var bitmap = await createImageBitmap(image); var canvas = document.createElement('canvas'); canvas.width = bitmap.width; canvas.height = bitmap.height; canvas.getContext('2d').drawImage(bitmap, 0, 0); embedded = await out.embedPng(new Uint8Array(await (await new Promise(function (resolve) { canvas.toBlob(resolve, 'image/png'); })).arrayBuffer()));
      }
      var original = value(ctx, 'paper', 'a4') === 'original'; var scale = original ? 1 : Math.min(a4[0] / embedded.width, a4[1] / embedded.height); var w = embedded.width * scale; var h = embedded.height * scale;
      var page = out.addPage(original ? [w, h] : a4); page.drawImage(embedded, { x: (page.getWidth() - w) / 2, y: (page.getHeight() - h) / 2, width: w, height: h });
    }
    await savePdf(ctx, out, 'scanned.pdf');
  }

  var handlers = {
    merge: merge,
    split: split,
    'remove-pages': function (ctx) { return selectPages(ctx, true); },
    'extract-pages': function (ctx) { return selectPages(ctx, false); },
    'organize-pdf': organize,
    'scan-to-pdf': scan
  };
  Object.keys(handlers).forEach(function (id) {
    window.PdfToolModules[id] = {
      renderOptions: renderOptions,
      onFilesChanged: onFilesChanged,
      execute: async function (ctx) {
        try { ctx.resultEl.innerHTML = ''; await handlers[id](ctx); }
        catch (error) { if (ctx.core.hideProgress) ctx.core.hideProgress(); if (ctx.core.showToast) ctx.core.showToast(error.message || 'PDF 처리 중 오류가 발생했습니다.', true); else throw error; }
      }
    };
  });
}());
