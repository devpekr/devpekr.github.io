(function () {
  'use strict';

  window.PdfToolModules = window.PdfToolModules || {};

  var COMPRESSION = {
    strong: { label: '강력 · 72 dpi / JPEG 45%', dpi: 72, quality: 0.45 },
    balanced: { label: '권장 · 120 dpi / JPEG 70%', dpi: 120, quality: 0.70 },
    quality: { label: '고화질 · 150 dpi / JPEG 85%', dpi: 150, quality: 0.85 }
  };

  function escape(ctx, value) {
    return ctx.core && ctx.core.escapeHtml
      ? ctx.core.escapeHtml(String(value == null ? '' : value))
      : String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
      });
  }

  function selectedFile(ctx) {
    return ctx.files && ctx.files[0] ? ctx.files[0] : null;
  }

  function setOptions(ctx, html) {
    if (ctx.optionsEl) ctx.optionsEl.innerHTML = html;
  }

  function status(ctx, message, isError) {
    if (ctx.resultEl) {
      ctx.resultEl.innerHTML = '<div class="portal-pdf-result-message' +
        (isError ? ' is-error' : '') + '">' + escape(ctx, message) + '</div>';
    }
    if (isError && ctx.core && ctx.core.showToast) ctx.core.showToast(message, true);
  }

  function optionValue(ctx, name, fallback) {
    var field = ctx.optionsEl && ctx.optionsEl.querySelector('[name="' + name + '"]');
    return field ? field.value : fallback;
  }

  function setBusy(ctx, busy) {
    if (ctx.runBtn) ctx.runBtn.disabled = !!busy;
  }

  function reportProgress(ctx, percent, message) {
    if (ctx.core && ctx.core.setProgress) ctx.core.setProgress(percent, message);
  }

  function hideProgress(ctx) {
    if (ctx.core && ctx.core.hideProgress) ctx.core.hideProgress();
  }

  function pdfLib() {
    if (!window.PDFLib || !window.PDFLib.PDFDocument) {
      throw new Error('PDF 처리 라이브러리를 불러오지 못했습니다. 페이지를 새로고침한 뒤 다시 시도해 주세요.');
    }
    return window.PDFLib;
  }

  async function loadPdfJs(ctx, file) {
    if (!ctx.core || typeof ctx.core.loadPdfJsDoc !== 'function') {
      throw new Error('PDF 렌더러가 준비되지 않았습니다.');
    }
    return ctx.core.loadPdfJsDoc(await file.arrayBuffer());
  }

  function canvasBlob(canvas, quality) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) {
        if (blob) resolve(blob);
        else reject(new Error('페이지 이미지를 만들지 못했습니다. 브라우저 메모리 여유를 확인해 주세요.'));
      }, 'image/jpeg', quality);
    });
  }

  async function renderCanvas(doc, pageNumber, scale) {
    var page = await doc.getPage(pageNumber);
    var viewport = page.getViewport({ scale: scale });
    var canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.ceil(viewport.width));
    canvas.height = Math.max(1, Math.ceil(viewport.height));
    var context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Canvas를 초기화하지 못했습니다.');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: context, viewport: viewport }).promise;
    return { canvas: canvas, page: page, viewport: viewport };
  }

  async function buildRasterPdf(ctx, file, settings, mode) {
    var PDFDocument = pdfLib().PDFDocument;
    var source = await loadPdfJs(ctx, file);
    var output = await PDFDocument.create();
    var total = source.numPages;
    var scale = settings.scale;
    for (var index = 1; index <= total; index += 1) {
      reportProgress(ctx, Math.round(((index - 1) / total) * 88),
        mode === 'repair' ? '페이지 렌더링으로 복구 중 (' + index + '/' + total + ')' : '페이지 압축 중 (' + index + '/' + total + ')');
      var rendered = await renderCanvas(source, index, scale);
      var blob = await canvasBlob(rendered.canvas, settings.quality);
      var image = await output.embedJpg(new Uint8Array(await blob.arrayBuffer()));
      var pointsPerPixel = 1 / scale;
      var page = output.addPage([
        rendered.canvas.width * pointsPerPixel,
        rendered.canvas.height * pointsPerPixel
      ]);
      page.drawImage(image, {
        x: 0, y: 0,
        width: rendered.canvas.width * pointsPerPixel,
        height: rendered.canvas.height * pointsPerPixel
      });
      rendered.canvas.width = 0;
      rendered.canvas.height = 0;
    }
    if (source.destroy) await source.destroy();
    reportProgress(ctx, 92, 'PDF 파일 생성 중');
    var bytes = await output.save({ useObjectStreams: true, addDefaultPage: false });
    return new Blob([bytes], { type: 'application/pdf' });
  }

  function download(ctx, blob, filename) {
    if (!ctx.core || typeof ctx.core.downloadBlob !== 'function') {
      throw new Error('다운로드 기능을 사용할 수 없습니다.');
    }
    ctx.core.downloadBlob(blob, filename);
  }

  function fileSummary(ctx, file) {
    var size = ctx.core && ctx.core.formatBytes ? ctx.core.formatBytes(file.size) : file.size + ' bytes';
    return escape(ctx, file.name) + ' · ' + escape(ctx, size);
  }

  function renderCommonStage(ctx, label, description) {
    var file = selectedFile(ctx);
    if (!ctx.stageEl) return;
    ctx.stageEl.innerHTML = file
      ? '<div class="portal-pdf-file-summary"><strong>' + label + '</strong><span>' + fileSummary(ctx, file) +
        '</span><p>' + description + '</p></div>'
      : '<div class="portal-pdf-empty-state">PDF 파일을 추가하면 처리 옵션과 제한 사항을 안내합니다.</div>';
  }

  var compress = {
    renderOptions: function (ctx) {
      setOptions(ctx, '<label class="portal-pdf-field"><span>압축 수준</span><select name="compression-level">' +
        Object.keys(COMPRESSION).map(function (key) {
          return '<option value="' + key + '"' + (key === 'balanced' ? ' selected' : '') + '>' + COMPRESSION[key].label + '</option>';
        }).join('') + '</select></label><p class="portal-pdf-help">각 페이지를 선택한 해상도의 JPEG 이미지로 다시 구성합니다. 텍스트 검색, 선택, 링크, 양식 및 벡터 품질은 유지되지 않습니다.</p>');
      renderCommonStage(ctx, 'PDF 압축', '페이지를 이미지로 재구성하므로 원본에 따라 파일 크기가 오히려 커질 수도 있습니다.');
    },
    onFilesChanged: function (ctx) {
      renderCommonStage(ctx, 'PDF 압축', '선택한 해상도로 페이지를 렌더링한 뒤 JPEG 압축 PDF로 만듭니다.');
      if (ctx.resultEl) ctx.resultEl.innerHTML = '';
    },
    execute: async function (ctx) {
      var file = selectedFile(ctx);
      if (!file) return status(ctx, '먼저 PDF 파일을 추가해 주세요.', true);
      var level = COMPRESSION[optionValue(ctx, 'compression-level', 'balanced')] || COMPRESSION.balanced;
      setBusy(ctx, true);
      try {
        reportProgress(ctx, 1, 'PDF를 읽는 중');
        var blob = await buildRasterPdf(ctx, file, { scale: level.dpi / 72, quality: level.quality }, 'compress');
        var delta = file.size ? ((file.size - blob.size) / file.size) * 100 : 0;
        download(ctx, blob, 'compressed.pdf');
        status(ctx, '압축된 PDF를 다운로드했습니다. 원본 ' + (ctx.core.formatBytes ? ctx.core.formatBytes(file.size) : file.size + ' bytes') +
          ' → 결과 ' + (ctx.core.formatBytes ? ctx.core.formatBytes(blob.size) : blob.size + ' bytes') +
          ' (' + (delta >= 0 ? delta.toFixed(1) + '% 감소' : Math.abs(delta).toFixed(1) + '% 증가') + '). 결과는 이미지 기반 PDF라 텍스트 검색이나 선택은 지원하지 않습니다.');
      } catch (error) {
        status(ctx, error && error.message ? error.message : 'PDF 압축에 실패했습니다.', true);
      } finally {
        hideProgress(ctx);
        setBusy(ctx, false);
      }
    }
  };

  var repair = {
    renderOptions: function (ctx) {
      setOptions(ctx, '<label class="portal-pdf-field"><span>복구 방법</span><select name="repair-mode">' +
        '<option value="structure" selected>구조 재작성 · pdf-lib</option>' +
        '<option value="render">렌더링 복구 · 페이지를 이미지로 재구성</option>' +
        '</select></label><p class="portal-pdf-help">구조 재작성은 브라우저 라이브러리가 열 수 있는 PDF만 다시 저장합니다. 심하게 손상된 파일, 암호화, 복구 불가능한 객체는 복원할 수 없습니다. 렌더링 복구도 PDF.js가 읽을 수 있는 페이지만 처리하며 텍스트·벡터·양식 정보가 사라집니다.</p>');
      renderCommonStage(ctx, 'PDF 복구', '복구 성공 여부는 입력 구조와 손상 정도에 따라 달라집니다.');
    },
    onFilesChanged: function (ctx) {
      renderCommonStage(ctx, 'PDF 복구', '선택한 복구 방법으로 처리 가능한 내용을 다시 저장합니다.');
      if (ctx.resultEl) ctx.resultEl.innerHTML = '';
    },
    execute: async function (ctx) {
      var file = selectedFile(ctx);
      if (!file) return status(ctx, '먼저 PDF 파일을 추가해 주세요.', true);
      var mode = optionValue(ctx, 'repair-mode', 'structure');
      setBusy(ctx, true);
      try {
        reportProgress(ctx, 5, 'PDF 복구 준비 중');
        var blob;
        if (mode === 'render') {
          blob = await buildRasterPdf(ctx, file, { scale: 1.5, quality: 0.88 }, 'repair');
        } else {
          var PDFDocument = pdfLib().PDFDocument;
          var bytes = await file.arrayBuffer();
          reportProgress(ctx, 35, 'PDF 구조를 다시 저장 중');
          var document = await PDFDocument.load(bytes, {
            ignoreEncryption: true,
            updateMetadata: false,
            throwOnInvalidObject: false
          });
          var saved = await document.save({ useObjectStreams: true, addDefaultPage: false });
          blob = new Blob([saved], { type: 'application/pdf' });
        }
        download(ctx, blob, 'repaired.pdf');
        status(ctx, mode === 'render'
          ? 'PDF.js가 읽을 수 있는 페이지를 이미지 기반 PDF로 저장했습니다. 복구 범위는 렌더링 가능한 페이지에 한정되며 텍스트 검색, 선택, 링크, 양식 및 벡터 정보는 보존되지 않습니다.'
          : 'PDF를 라이브러리에서 열어 구조를 다시 저장했습니다. 이것은 손상 데이터의 완전 복구를 보장하지 않으며, 원본에서 읽을 수 없는 내용은 되살릴 수 없습니다.');
      } catch (error) {
        status(ctx, '복구 결과를 만들지 못했습니다. 입력 PDF를 라이브러리에서 열 수 없거나 손상·암호화된 구조일 수 있습니다. ' +
          (error && error.message ? error.message : ''), true);
      } finally {
        hideProgress(ctx);
        setBusy(ctx, false);
      }
    }
  };

  function bboxValue(box, first, second) {
    if (!box) return 0;
    return Number(box[first] != null ? box[first] : box[second]) || 0;
  }

  async function addOcrTextLayer(pdfDoc, page, words, canvas, font) {
    var pageWidth = page.getWidth();
    var pageHeight = page.getHeight();
    var scaleX = pageWidth / canvas.width;
    var scaleY = pageHeight / canvas.height;
    var count = 0;
    words.forEach(function (word) {
      var text = String(word.text || '').trim();
      if (!text) return;
      // pdf-lib's built-in Helvetica can encode ASCII only. Reject unsupported glyphs
      // before writing so the module never claims to have produced a searchable PDF
      // when the text layer was silently omitted or corrupted.
      if (!/^[\x20-\x7E\t]+$/.test(text)) {
        throw new Error('인식 결과에 한글 또는 기본 Helvetica가 지원하지 않는 문자가 있습니다. 검색 가능한 PDF를 만들려면 해당 언어의 임베드 폰트가 필요합니다. OCR 텍스트는 별도 TXT로 제공됩니다.');
      }
      var box = word.bbox || {};
      var x0 = bboxValue(box, 'x0', 'left');
      var y0 = bboxValue(box, 'y0', 'top');
      var y1 = bboxValue(box, 'y1', 'bottom');
      var height = Math.max(1, y1 - y0) * scaleY;
      var fontSize = Math.max(4, Math.min(72, height * 0.86));
      page.drawText(text, {
        x: Math.max(0, x0 * scaleX),
        y: Math.max(0, pageHeight - y1 * scaleY + (height - fontSize) * 0.15),
        size: fontSize,
        font: font,
        opacity: 0
      });
      count += 1;
    });
    return count;
  }

  var ocr = {
    renderOptions: function (ctx) {
      setOptions(ctx, '<label class="portal-pdf-field"><span>OCR 언어</span><select name="ocr-language">' +
        '<option value="kor+eng" selected>한국어 + 영어</option><option value="eng">영어</option>' +
        '<option value="kor">한국어</option><option value="jpn">일본어</option></select></label>' +
        '<p class="portal-pdf-help">페이지를 브라우저에서 인식하고 텍스트 파일을 제공합니다. 검색 가능한 PDF 텍스트 레이어는 내장 기본 글꼴로 표현 가능한 문자에 한해 생성됩니다. 한글·일본어 등 글꼴이 필요한 문자가 있으면 PDF 생성을 성공으로 표시하지 않고 OCR 텍스트만 제공합니다.</p>');
      renderCommonStage(ctx, 'OCR PDF', '모든 페이지를 2배 해상도로 렌더링해 브라우저에서 인식합니다. 파일은 서버로 전송되지 않습니다.');
    },
    onFilesChanged: function (ctx) {
      renderCommonStage(ctx, 'OCR PDF', '페이지가 많거나 크면 인식에 시간이 걸리고 브라우저 메모리를 더 사용합니다.');
      if (ctx.resultEl) ctx.resultEl.innerHTML = '';
    },
    execute: async function (ctx) {
      var file = selectedFile(ctx);
      if (!file) return status(ctx, '먼저 PDF 파일을 추가해 주세요.', true);
      if (!window.Tesseract || typeof window.Tesseract.createWorker !== 'function') {
        return status(ctx, 'Tesseract.js v5를 불러오지 못했습니다. OCR 라이브러리가 포함된 페이지에서 다시 시도해 주세요.', true);
      }
      setBusy(ctx, true);
      var worker;
      var textPages = [];
      var searchablePdf = null;
      var unsupportedText = false;
      try {
        var language = optionValue(ctx, 'ocr-language', 'kor+eng');
        reportProgress(ctx, 1, 'OCR 엔진 준비 중 (' + language + ')');
        worker = await window.Tesseract.createWorker(language);
        var source = await loadPdfJs(ctx, file);
        var output = await pdfLib().PDFDocument.create();
        var font = await output.embedFont(pdfLib().StandardFonts.Helvetica);
        for (var index = 1; index <= source.numPages; index += 1) {
          reportProgress(ctx, Math.round(((index - 1) / source.numPages) * 85), '페이지 OCR 중 (' + index + '/' + source.numPages + ')');
          var rendered = await renderCanvas(source, index, 2);
          var recognized = await worker.recognize(rendered.canvas);
          var data = recognized && recognized.data ? recognized.data : {};
          var words = Array.isArray(data.words) ? data.words : [];
          var pageText = String(data.text || words.map(function (word) { return word.text || ''; }).join(' ')).trim();
          textPages.push('--- ' + index + ' ---\n' + pageText);

          var imageBlob = await canvasBlob(rendered.canvas, 0.92);
          var image = await output.embedJpg(new Uint8Array(await imageBlob.arrayBuffer()));
          var page = output.addPage([rendered.canvas.width / 2, rendered.canvas.height / 2]);
          page.drawImage(image, { x: 0, y: 0, width: page.getWidth(), height: page.getHeight() });
          try {
            await addOcrTextLayer(output, page, words, rendered.canvas, font);
          } catch (error) {
            if (error && /임베드 폰트가 필요/.test(error.message)) {
              unsupportedText = true;
            } else {
              throw error;
            }
          }
          rendered.canvas.width = 0;
          rendered.canvas.height = 0;
        }
        if (source.destroy) await source.destroy();
        if (worker.terminate) {
          await worker.terminate();
          worker = null;
        }

        var txt = new Blob([textPages.join('\n\n')], { type: 'text/plain;charset=utf-8' });
        download(ctx, txt, 'ocr-text.txt');
        if (!unsupportedText) {
          reportProgress(ctx, 92, '검색 가능한 PDF 생성 중');
          var pdfBytes = await output.save({ useObjectStreams: true, addDefaultPage: false });
          searchablePdf = new Blob([pdfBytes], { type: 'application/pdf' });
          download(ctx, searchablePdf, 'ocr-searchable.pdf');
          status(ctx, 'OCR 텍스트 파일과 검색 가능한 PDF를 다운로드했습니다. PDF는 원본 페이지 이미지 위에 투명 텍스트 레이어를 추가한 결과입니다.');
        } else {
          status(ctx, 'OCR 텍스트 파일을 다운로드했습니다. 검색 가능한 PDF는 만들지 않았습니다. 인식된 한글·일본어 문자를 PDF 텍스트로 임베드할 글꼴이 이 페이지에 없어 PDF를 제공하면 검색 결과가 손상되기 때문입니다. 다운로드된 TXT 파일에서 인식 결과를 확인해 주세요.', true);
        }
        if (ctx.resultEl) {
          var preview = textPages.join('\n\n');
          ctx.resultEl.insertAdjacentHTML('beforeend', '<details class="portal-pdf-ocr-preview"><summary>인식 텍스트 미리보기</summary><pre>' + escape(ctx, preview.slice(0, 12000)) +
            (preview.length > 12000 ? '\n… 미리보기는 12,000자까지 표시됩니다.' : '') + '</pre></details>');
        }
      } catch (error) {
        status(ctx, 'OCR 처리에 실패했습니다. 검색 가능한 PDF가 생성되지 않았습니다. ' +
          (error && error.message ? error.message : '파일 또는 OCR 언어 데이터를 확인해 주세요.'), true);
      } finally {
        if (worker && worker.terminate) {
          try { await worker.terminate(); } catch (ignore) { /* cleanup only */ }
        }
        hideProgress(ctx);
        setBusy(ctx, false);
      }
    }
  };

  window.PdfToolModules.compress = compress;
  window.PdfToolModules.repair = repair;
  window.PdfToolModules.ocr = ocr;
}());
