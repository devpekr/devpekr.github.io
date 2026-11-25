(function (window, document) {
  'use strict';

  var progressEl = document.getElementById('pdf-progress');
  var progressBar = document.getElementById('pdf-progress-bar');
  var progressText = document.getElementById('pdf-progress-text');
  var progressPercent = document.getElementById('pdf-progress-percent');
  var toastEl = document.getElementById('pdf-toast');
  var toastTimer = null;

  function formatBytes(bytes) {
    if (!Number.isFinite(Number(bytes)) || Number(bytes) < 0) return '0 B';
    var value = Number(bytes);
    if (value < 1024) return value + ' B';
    var units = ['KB', 'MB', 'GB'];
    var i = -1;
    do { value /= 1024; i++; } while (value >= 1024 && i < units.length - 1);
    return value.toFixed(value >= 10 ? 1 : 2) + ' ' + units[i];
  }

  function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = filename || 'download';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }

  async function downloadZip(entries, zipFilename) {
    if (!window.JSZip) throw new Error('ZIP 라이브러리를 불러오지 못했습니다.');
    var zip = new window.JSZip();
    (entries || []).forEach(function (entry) {
      if (entry && entry.name && entry.data) zip.file(entry.name, entry.data);
    });
    downloadBlob(await zip.generateAsync({ type: 'blob' }), zipFilename || 'files.zip');
  }

  function parsePageRange(rangeStr, totalPages) {
    var total = Number(totalPages);
    var value = String(rangeStr || '').trim();
    if (!Number.isInteger(total) || total < 1) throw new Error('PDF 페이지 수를 확인할 수 없습니다.');
    if (!value || value.toLowerCase() === 'all') return Array.from({ length: total }, function (_, i) { return i; });
    var indices = [];
    value.split(',').forEach(function (part) {
      var token = part.trim();
      if (!token) return;
      var match = token.match(/^(\d+)\s*-\s*(\d+)$/);
      if (match) {
        var start = Number(match[1]);
        var end = Number(match[2]);
        if (start < 1 || end < start || end > total) throw new Error('페이지 범위를 확인하세요: ' + token);
        for (var page = start; page <= end; page++) indices.push(page - 1);
        return;
      }
      if (!/^\d+$/.test(token)) throw new Error('페이지 범위를 확인하세요: ' + token);
      var number = Number(token);
      if (number < 1 || number > total) throw new Error('페이지 번호는 1부터 ' + total + '까지 입력할 수 있습니다.');
      indices.push(number - 1);
    });
    if (!indices.length) throw new Error('페이지 번호를 입력하세요.');
    return indices.filter(function (page, index) { return indices.indexOf(page) === index; });
  }

  function loadPdfJsDoc(arrayBuffer, password) {
    if (!window.pdfjsLib) return Promise.reject(new Error('PDF 미리보기 라이브러리를 불러오지 못했습니다.'));
    var bytes = arrayBuffer instanceof Uint8Array ? arrayBuffer : new Uint8Array(arrayBuffer);
    var options = { data: bytes };
    if (password) options.password = password;
    return window.pdfjsLib.getDocument(options).promise;
  }

  async function renderPageToCanvas(pdfJsDoc, pageNumber1Based, canvas, scale) {
    var page = await pdfJsDoc.getPage(pageNumber1Based);
    var viewport = page.getViewport({ scale: scale || 1 });
    var ratio = window.devicePixelRatio || 1;
    var context = canvas.getContext('2d', { alpha: false });
    canvas.width = Math.ceil(viewport.width * ratio);
    canvas.height = Math.ceil(viewport.height * ratio);
    canvas.style.width = Math.ceil(viewport.width) + 'px';
    canvas.style.height = Math.ceil(viewport.height) + 'px';
    await page.render({ canvasContext: context, viewport: viewport, transform: ratio === 1 ? null : [ratio, 0, 0, ratio, 0, 0] }).promise;
    return { width: viewport.width, height: viewport.height };
  }

  function setProgress(percent, message) {
    if (!progressEl) return;
    var value = Math.max(0, Math.min(100, Number(percent) || 0));
    progressEl.hidden = false;
    if (progressBar) progressBar.style.width = value + '%';
    if (progressText) progressText.textContent = message || '처리 중';
    if (progressPercent) progressPercent.textContent = Math.round(value) + '%';
  }

  function hideProgress() {
    if (progressEl) progressEl.hidden = true;
    if (progressBar) progressBar.style.width = '0%';
  }

  function showToast(message, isError) {
    if (!toastEl) return;
    toastEl.textContent = String(message || '');
    toastEl.classList.toggle('is-error', !!isError);
    toastEl.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toastEl.hidden = true; }, 3600);
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  function fileToArrayBuffer(file) {
    return file.arrayBuffer ? file.arrayBuffer() : new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = function () { reject(reader.error || new Error('파일을 읽지 못했습니다.')); };
      reader.readAsArrayBuffer(file);
    });
  }

  window.PdfToolCore = {
    formatBytes: formatBytes,
    downloadBlob: downloadBlob,
    downloadZip: downloadZip,
    parsePageRange: parsePageRange,
    loadPdfJsDoc: loadPdfJsDoc,
    renderPageToCanvas: renderPageToCanvas,
    setProgress: setProgress,
    hideProgress: hideProgress,
    showToast: showToast,
    escapeHtml: escapeHtml,
    fileToArrayBuffer: fileToArrayBuffer
  };
}(window, document));
