(function () {
  'use strict';

  window.PdfToolModules = window.PdfToolModules || {};

  var DEFINITIONS = {
    'pdf-to-jpg': {
      title: 'PDF를 이미지로 변환',
      description: 'PDF 페이지를 JPG 또는 PNG 이미지로 렌더링합니다.',
      options: '<label>변환 방식<select name="mode"><option value="pages">페이지를 이미지로 변환</option><option value="embedded">PDF 내장 이미지 추출</option></select></label><label>이미지 형식<select name="format"><option value="image/jpeg">JPG</option><option value="image/png">PNG</option></select></label><label>해상도<select name="scale"><option value="1">1x · 보통</option><option value="2" selected>2x · 선명</option><option value="3">3x · 고해상도</option></select></label>'
    },
    'pdf-to-word': {
      title: 'PDF를 Word로 변환',
      description: 'PDF의 텍스트를 추출해 편집 가능한 DOCX 문서로 만듭니다.',
      options: '<label>변환 방식<select name="mode"><option value="text">텍스트 추출 및 단순 레이아웃</option><option value="images">페이지 이미지 삽입</option></select></label><p class="portal-pdf-muted">텍스트 추출은 원본의 복잡한 서식과 정확히 일치하지 않을 수 있습니다.</p>'
    },
    'pdf-to-ppt': {
      title: 'PDF를 PowerPoint로 변환',
      description: '각 PDF 페이지를 PowerPoint 슬라이드로 변환합니다.',
      options: '<label>슬라이드 비율<select name="ratio"><option value="LAYOUT_WIDE">16:9 와이드</option><option value="LAYOUT_4X3">4:3</option></select></label><label>변환 방식<select name="mode"><option value="image">고화질 이미지 슬라이드</option><option value="text">이미지와 추출 텍스트 노트</option></select></label>'
    },
    'pdf-to-excel': {
      title: 'PDF를 Excel로 변환',
      description: '페이지의 텍스트 위치를 분석해 행과 열이 있는 XLSX 시트를 만듭니다.',
      options: '<label>시트 구성<select name="sheets"><option value="pages">페이지별 시트</option><option value="single">하나의 시트로 병합</option></select></label><p class="portal-pdf-muted">PDF의 표 구조를 추정하므로 병합 셀이나 복잡한 표는 다듬기가 필요할 수 있습니다.</p>'
    },
    'pdf-to-pdfa': {
      title: 'PDF를 PDF/A로 변환',
      description: '보존용 PDF/A 식별 메타데이터를 추가한 PDF를 생성합니다.',
      options: '<label>규격 메타데이터<select name="standard"><option value="1">PDF/A-1b</option><option value="2">PDF/A-2b</option></select></label><p class="portal-pdf-warning">브라우저에서 메타데이터를 추가하는 최선 노력 변환입니다. PDF/A 적합성은 검증되지 않으며, 완전한 ISO 준수가 필요한 경우 전용 검증 도구로 확인하세요.</p>'
    }
  };

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  function selected(ctx, name) {
    var field = ctx.optionsEl.querySelector('[name="' + name + '"]');
    return field ? field.value : '';
  }

  function currentFile(ctx) {
    var file = ctx.files && ctx.files[0];
    if (file && file.file) file = file.file;
    if (!file || typeof file.arrayBuffer !== 'function') throw new Error('PDF 파일을 먼저 추가하세요.');
    return file;
  }

  function safeBaseName(name) {
    return String(name || 'converted').replace(/\.pdf$/i, '').replace(/[\\/:*?"<>|]+/g, '-').trim() || 'converted';
  }

  function announce(ctx, message, isError) {
    ctx.resultEl.innerHTML = '<div class="portal-pdf-result' + (isError ? ' is-error' : '') + '" role="status">' + escapeHtml(message) + '</div>';
  }

  function download(ctx, blob, filename) {
    if (ctx.core && typeof ctx.core.downloadBlob === 'function') return ctx.core.downloadBlob(blob, filename);
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.hidden = true;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function progress(ctx, percent, message) {
    if (ctx.core && ctx.core.setProgress) ctx.core.setProgress(percent, message);
  }

  function pdfJs() {
    if (!window.pdfjsLib) throw new Error('PDF.js 라이브러리를 불러오지 못했습니다. 페이지를 새로고침한 뒤 다시 시도하세요.');
    return window.pdfjsLib;
  }

  async function openPdf(file, ctx) {
    var bytes = await file.arrayBuffer();
    if (ctx.core && ctx.core.loadPdfJsDoc) return ctx.core.loadPdfJsDoc(bytes);
    var lib = pdfJs();
    return lib.getDocument({ data: new Uint8Array(bytes) }).promise;
  }

  async function pageCanvas(doc, pageNo, scale, ctx) {
    var page = await doc.getPage(pageNo);
    var viewport = page.getViewport({ scale: scale });
    var canvas = document.createElement('canvas');
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    var renderTask = page.render({ canvasContext: canvas.getContext('2d', { alpha: false }), viewport: viewport });
    await renderTask.promise;
    return { canvas: canvas, page: page, viewport: viewport };
  }

  function canvasBlob(canvas, mime) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) {
        if (blob) resolve(blob);
        else reject(new Error('이미지 파일을 생성하지 못했습니다.'));
      }, mime, mime === 'image/jpeg' ? 0.92 : undefined);
    });
  }

  function addPreview(ctx, canvas, pageNo) {
    if (!ctx.stageEl) return;
    var card = document.createElement('figure');
    card.className = 'portal-pdf-page-preview';
    var image = document.createElement('img');
    image.src = canvas.toDataURL('image/jpeg', 0.72);
    image.alt = 'PDF ' + pageNo + '페이지 미리보기';
    var caption = document.createElement('figcaption');
    caption.textContent = pageNo + '페이지';
    card.appendChild(image);
    card.appendChild(caption);
    ctx.stageEl.appendChild(card);
  }

  async function renderPages(doc, scale, ctx, callback) {
    for (var pageNo = 1; pageNo <= doc.numPages; pageNo += 1) {
      var rendered = await pageCanvas(doc, pageNo, scale, ctx);
      await callback(rendered, pageNo);
      progress(ctx, Math.round(pageNo / doc.numPages * 90), pageNo + ' / ' + doc.numPages + ' 페이지 처리 중');
    }
  }

  function readLines(page, yTolerance) {
    return page.getTextContent().then(function (content) {
      var items = content.items.filter(function (item) { return item.str && item.str.trim(); }).map(function (item) {
        var transform = item.transform || [1, 0, 0, 1, 0, 0];
        return { text: item.str.trim(), x: transform[4], y: transform[5], width: item.width || 0, height: Math.abs(transform[3]) || 10 };
      }).sort(function (a, b) { return b.y - a.y || a.x - b.x; });
      var lines = [];
      items.forEach(function (item) {
        var line = lines.find(function (candidate) { return Math.abs(candidate.y - item.y) <= yTolerance; });
        if (!line) {
          line = { y: item.y, items: [] };
          lines.push(line);
        }
        line.items.push(item);
      });
      lines.sort(function (a, b) { return b.y - a.y; });
      lines.forEach(function (line) {
        line.items.sort(function (a, b) { return a.x - b.x; });
        line.text = line.items.map(function (item, index) {
          if (!index) return item.text;
          var previous = line.items[index - 1];
          return (item.x - (previous.x + previous.width) > Math.max(2, item.height * 0.18) ? ' ' : '') + item.text;
        }).join('');
      });
      return { lines: lines, items: items };
    });
  }

  function optionsMarkup(id) {
    var def = DEFINITIONS[id];
    return '<div class="portal-pdf-convert-options"><div class="portal-pdf-options-heading"><h3>변환 설정</h3><span>브라우저에서 처리</span></div>' + def.options + '</div>';
  }

  function updateStage(ctx) {
    if (!ctx.stageEl) return;
    ctx.stageEl.innerHTML = '';
    var file = ctx.files && ctx.files[0];
    if (!file) {
      ctx.stageEl.innerHTML = '<p class="portal-pdf-empty">PDF를 추가하면 페이지 미리보기가 표시됩니다.</p>';
      return;
    }
    var actual = file.file || file;
    if (!actual || typeof actual.arrayBuffer !== 'function') return;
    ctx.stageEl.innerHTML = '<p class="portal-pdf-empty">페이지 미리보기를 준비하고 있습니다…</p>';
    openPdf(actual, ctx).then(async function (doc) {
      ctx.stageEl.innerHTML = '';
      var count = Math.min(doc.numPages, 8);
      for (var pageNo = 1; pageNo <= count; pageNo += 1) {
        var rendered = await pageCanvas(doc, pageNo, 0.28, ctx);
        addPreview(ctx, rendered.canvas, pageNo);
      }
      if (doc.numPages > count) {
        var note = document.createElement('p');
        note.className = 'portal-pdf-muted';
        note.textContent = '미리보기는 처음 ' + count + '페이지입니다. 전체 ' + doc.numPages + '페이지가 변환됩니다.';
        ctx.stageEl.appendChild(note);
      }
    }).catch(function () {
      ctx.stageEl.innerHTML = '<p class="portal-pdf-empty">PDF 미리보기를 표시할 수 없습니다. 파일이 손상되지 않았는지 확인하세요.</p>';
    });
  }

  async function toImages(ctx, file) {
    var doc = await openPdf(file, ctx);
    var mime = selected(ctx, 'format') || 'image/jpeg';
    var scale = Number(selected(ctx, 'scale')) || 2;
    var base = safeBaseName(file.name);
    var entries = [];
    await renderPages(doc, scale, ctx, async function (rendered, pageNo) {
      entries.push({ name: base + '-page-' + String(pageNo).padStart(3, '0') + (mime === 'image/png' ? '.png' : '.jpg'), data: await canvasBlob(rendered.canvas, mime) });
    });
    if (entries.length === 1) download(ctx, entries[0].data, entries[0].name);
    else if (ctx.core && ctx.core.downloadZip) await ctx.core.downloadZip(entries, base + '-pages.zip');
    else {
      if (!window.JSZip) throw new Error('여러 페이지를 압축하려면 JSZip 라이브러리가 필요합니다.');
      var zip = new window.JSZip();
      entries.forEach(function (entry) { zip.file(entry.name, entry.data); });
      download(ctx, await zip.generateAsync({ type: 'blob' }), base + '-pages.zip');
    }
    announce(ctx, entries.length === 1 ? '이미지를 다운로드했습니다.' : entries.length + '개 이미지를 ZIP 파일로 다운로드했습니다.');
  }

  async function extractEmbeddedImages(ctx, file) {
    var doc = await openPdf(file, ctx);
    var extracted = [];
    var base = safeBaseName(file.name);
    for (var pageNo = 1; pageNo <= doc.numPages; pageNo += 1) {
      var page = await doc.getPage(pageNo);
      var operatorList = await page.getOperatorList();
      var imageIndex = 0;
      for (var i = 0; i < operatorList.fnArray.length; i += 1) {
        var fn = operatorList.fnArray[i];
        if (fn !== pdfJs().OPS.paintImageXObject && fn !== pdfJs().OPS.paintInlineImageXObject && fn !== pdfJs().OPS.paintImageMaskXObject) continue;
        var objectId = operatorList.argsArray[i] && operatorList.argsArray[i][0];
        if (!objectId) continue;
        var store = String(objectId).indexOf('g_') === 0 && page.commonObjs ? page.commonObjs : page.objs;
        var image = await new Promise(function (resolve) { store.get(objectId, resolve); });
        if (!image || !image.width || !image.height || (!image.data && !image.bitmap)) continue;
        var canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        var context = canvas.getContext('2d');
        if (image.bitmap) {
          context.drawImage(image.bitmap, 0, 0, image.width, image.height);
        } else {
          var imageData = context.createImageData(image.width, image.height);
          var channels = image.data.length === image.width * image.height * 4 ? 4 : image.data.length === image.width * image.height * 3 ? 3 : 1;
          for (var pixel = 0, source = 0; pixel < image.width * image.height; pixel += 1) {
            var offset = pixel * 4;
            if (channels === 4) {
              imageData.data[offset] = image.data[source++]; imageData.data[offset + 1] = image.data[source++]; imageData.data[offset + 2] = image.data[source++]; imageData.data[offset + 3] = image.data[source++];
            } else if (channels === 3) {
              imageData.data[offset] = image.data[source++]; imageData.data[offset + 1] = image.data[source++]; imageData.data[offset + 2] = image.data[source++]; imageData.data[offset + 3] = 255;
            } else {
              imageData.data[offset] = image.data[source]; imageData.data[offset + 1] = image.data[source]; imageData.data[offset + 2] = image.data[source++]; imageData.data[offset + 3] = 255;
            }
          }
          context.putImageData(imageData, 0, 0);
        }
        extracted.push({ name: base + '-image-' + String(++imageIndex).padStart(3, '0') + '.png', data: await canvasBlob(canvas, 'image/png') });
      }
      progress(ctx, Math.round(pageNo / doc.numPages * 90), pageNo + ' / ' + doc.numPages + ' 페이지 이미지 검색 중');
    }
    if (!extracted.length) throw new Error('PDF에서 추출할 수 있는 내장 이미지를 찾지 못했습니다. 페이지 이미지 변환 모드를 사용해 보세요.');
    if (extracted.length === 1) download(ctx, extracted[0].data, extracted[0].name);
    else if (ctx.core && ctx.core.downloadZip) await ctx.core.downloadZip(extracted, base + '-images.zip');
    else {
      var zip = new window.JSZip(); extracted.forEach(function (entry) { zip.file(entry.name, entry.data); });
      download(ctx, await zip.generateAsync({ type: 'blob' }), base + '-images.zip');
    }
    announce(ctx, extracted.length + '개 내장 이미지를 추출했습니다.');
  }

  async function toWord(ctx, file) {
    var lib = window.docx;
    if (!lib || !lib.Document || !lib.Packer) throw new Error('DOCX 생성 라이브러리를 불러오지 못했습니다.');
    var doc = await openPdf(file, ctx);
    var paragraphs = [];
    var mode = selected(ctx, 'mode');
    if (mode === 'images') {
      await renderPages(doc, 1.5, ctx, async function (rendered, pageNo) {
        var dataUrl = rendered.canvas.toDataURL('image/png');
        var base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
        var binary = atob(base64);
        var bytes = new Uint8Array(binary.length);
        for (var i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
        var ratio = Math.min(600 / rendered.canvas.width, 800 / rendered.canvas.height, 1);
        paragraphs.push(new lib.Paragraph({ children: [new lib.ImageRun({ data: bytes, transformation: { width: Math.round(rendered.canvas.width * ratio), height: Math.round(rendered.canvas.height * ratio) } })], pageBreakBefore: pageNo > 1 }));
      });
    } else {
      for (var pageNo = 1; pageNo <= doc.numPages; pageNo += 1) {
        var page = await doc.getPage(pageNo);
        var grouped = await readLines(page, 3);
        if (!grouped.lines.length) paragraphs.push(new lib.Paragraph({ text: ' ' }));
        grouped.lines.forEach(function (line) { paragraphs.push(new lib.Paragraph({ text: line.text || ' ' })); });
        if (pageNo < doc.numPages) paragraphs.push(new lib.Paragraph({ text: '', pageBreakBefore: true }));
        progress(ctx, Math.round(pageNo / doc.numPages * 90), pageNo + ' / ' + doc.numPages + ' 페이지 텍스트 추출 중');
      }
    }
    var word = new lib.Document({ sections: [{ properties: {}, children: paragraphs }] });
    download(ctx, await lib.Packer.toBlob(word), safeBaseName(file.name) + '-converted.docx');
    announce(ctx, '편집 가능한 Word 문서를 다운로드했습니다. 원본 서식은 단순화될 수 있습니다.');
  }

  async function toPowerPoint(ctx, file) {
    var PptxGenJS = window.PptxGenJS;
    if (!PptxGenJS) throw new Error('PowerPoint 생성 라이브러리를 불러오지 못했습니다.');
    var doc = await openPdf(file, ctx);
    var pptx = new PptxGenJS();
    pptx.layout = selected(ctx, 'ratio') || 'LAYOUT_WIDE';
    var dimensions = pptx.layout === 'LAYOUT_4X3' ? { width: 10, height: 7.5 } : { width: 13.333, height: 7.5 };
    var textNotes = selected(ctx, 'mode') === 'text';
    await renderPages(doc, 1.8, ctx, async function (rendered, pageNo) {
      var slide = pptx.addSlide();
      slide.addImage({ data: rendered.canvas.toDataURL('image/png'), x: 0, y: 0, w: dimensions.width, h: dimensions.height, sizing: { type: 'contain', w: dimensions.width, h: dimensions.height } });
      if (textNotes) {
        var page = await doc.getPage(pageNo);
        var content = await page.getTextContent();
        var note = content.items.map(function (item) { return item.str; }).join(' ').trim();
        if (note && slide.addNotes) slide.addNotes(note);
      }
    });
    var output = await pptx.write({ outputType: 'blob' });
    download(ctx, output instanceof Blob ? output : new Blob([output], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' }), safeBaseName(file.name) + '-converted.pptx');
    announce(ctx, '페이지별 PowerPoint 슬라이드를 다운로드했습니다.' + (textNotes ? ' 추출 텍스트는 슬라이드 노트에 포함했습니다.' : ''));
  }

  async function toExcel(ctx, file) {
    if (!window.XLSX) throw new Error('Excel 생성 라이브러리를 불러오지 못했습니다.');
    var doc = await openPdf(file, ctx);
    var workbook = window.XLSX.utils.book_new();
    var single = selected(ctx, 'sheets') === 'single';
    var combined = [];
    for (var pageNo = 1; pageNo <= doc.numPages; pageNo += 1) {
      var page = await doc.getPage(pageNo);
      var grouped = await readLines(page, 4);
      var anchors = grouped.items.map(function (item) { return item.x; }).sort(function (a, b) { return a - b; }).reduce(function (result, x) {
        var last = result[result.length - 1];
        if (last === undefined || x - last > 18) result.push(x);
        return result;
      }, []);
      var rows = grouped.lines.map(function (line) {
        var row = [];
        line.items.forEach(function (item) {
          var col = 0;
          var distance = Infinity;
          anchors.forEach(function (anchor, index) {
            var nextDistance = Math.abs(anchor - item.x);
            if (nextDistance < distance) { distance = nextDistance; col = index; }
          });
          while (row.length <= col) row.push('');
          row[col] = row[col] ? row[col] + ' ' + item.text : item.text;
        });
        while (row.length && row[row.length - 1] === '') row.pop();
        return row;
      }).filter(function (row) { return row.some(function (cell) { return cell !== ''; }); });
      if (single) {
        combined.push(['페이지 ' + pageNo]);
        Array.prototype.push.apply(combined, rows);
        combined.push([]);
      } else {
        var sheet = window.XLSX.utils.aoa_to_sheet(rows.length ? rows : [['']]);
        window.XLSX.utils.book_append_sheet(workbook, sheet, '페이지 ' + pageNo);
      }
      progress(ctx, Math.round(pageNo / doc.numPages * 90), pageNo + ' / ' + doc.numPages + ' 페이지 분석 중');
    }
    if (single) window.XLSX.utils.book_append_sheet(workbook, window.XLSX.utils.aoa_to_sheet(combined.length ? combined : [['']]), 'PDF 텍스트');
    var data = window.XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    download(ctx, new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), safeBaseName(file.name) + '-converted.xlsx');
    announce(ctx, '추출한 텍스트를 Excel 파일로 다운로드했습니다. 열 배치는 PDF 좌표를 기준으로 추정했습니다.');
  }

  function xmlEscape(value) {
    return String(value).replace(/[<>&"']/g, function (char) { return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[char]; });
  }

  async function toPdfA(ctx, file) {
    if (!window.PDFLib || !window.PDFLib.PDFDocument) throw new Error('PDF 편집 라이브러리를 불러오지 못했습니다.');
    var lib = window.PDFLib;
    var source = await file.arrayBuffer();
    var doc = await lib.PDFDocument.load(source, { ignoreEncryption: false });
    var part = selected(ctx, 'standard') || '1';
    var now = new Date().toISOString();
    var metadata = '<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/"><pdfaid:part>' + part + '</pdfaid:part><pdfaid:conformance>B</pdfaid:conformance></rdf:Description><rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:format>application/pdf</dc:format><dc:title><rdf:Alt><rdf:li xml:lang="x-default">' + xmlEscape(safeBaseName(file.name)) + '</rdf:li></rdf:Alt></dc:title></rdf:Description><rdf:Description rdf:about="" xmlns:xmp="http://ns.adobe.com/xap/1.0/"><xmp:CreateDate>' + now + '</xmp:CreateDate><xmp:ModifyDate>' + now + '</xmp:ModifyDate></rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="w"?>';
    var stream = doc.context.stream(new TextEncoder().encode(metadata), { Type: lib.PDFName.of('Metadata'), Subtype: lib.PDFName.of('XML') });
    var streamRef = doc.context.register(stream);
    doc.catalog.set(lib.PDFName.of('Metadata'), streamRef);
    var bytes = await doc.save({ useObjectStreams: true, addDefaultPage: false });
    download(ctx, new Blob([bytes], { type: 'application/pdf' }), safeBaseName(file.name) + '-archive-pdfa.pdf');
    announce(ctx, 'PDF/A-' + part + 'b 식별 메타데이터를 추가한 파일을 다운로드했습니다. 메타데이터 추가는 최선 노력이며 PDF/A 적합성은 검증되지 않았습니다.');
  }

  ['pdf-to-jpg', 'pdf-to-word', 'pdf-to-ppt', 'pdf-to-excel', 'pdf-to-pdfa'].forEach(function (id) {
    window.PdfToolModules[id] = {
      renderOptions: function (ctx) {
        ctx.optionsEl.innerHTML = optionsMarkup(id);
        if (id === 'pdf-to-pdfa') {
          var notice = document.createElement('p');
          notice.className = 'portal-pdf-warning';
          notice.setAttribute('role', 'note');
          notice.textContent = 'PDF/A 메타데이터는 최선 노력으로 추가됩니다. 결과 파일은 PDF/A 표준 적합성 검증을 거치지 않습니다.';
          ctx.optionsEl.appendChild(notice);
        }
      },
      onFilesChanged: updateStage,
      execute: async function (ctx) {
        try {
          var file = currentFile(ctx);
          if (!/\.pdf$/i.test(file.name || '') && file.type !== 'application/pdf') throw new Error('PDF 파일만 변환할 수 있습니다.');
          if (ctx.resultEl) ctx.resultEl.innerHTML = '';
          progress(ctx, 2, 'PDF를 열고 있습니다…');
          if (ctx.runBtn) ctx.runBtn.disabled = true;
          if (id === 'pdf-to-jpg') {
            if (selected(ctx, 'mode') === 'embedded') await extractEmbeddedImages(ctx, file);
            else await toImages(ctx, file);
          } else if (id === 'pdf-to-word') await toWord(ctx, file);
          else if (id === 'pdf-to-ppt') await toPowerPoint(ctx, file);
          else if (id === 'pdf-to-excel') await toExcel(ctx, file);
          else await toPdfA(ctx, file);
          progress(ctx, 100, '변환 완료');
        } catch (error) {
          announce(ctx, error && error.message ? error.message : 'PDF 변환 중 오류가 발생했습니다.', true);
          if (ctx.core && ctx.core.showToast) ctx.core.showToast(error && error.message ? error.message : 'PDF 변환 중 오류가 발생했습니다.', true);
        } finally {
          if (ctx.runBtn) ctx.runBtn.disabled = false;
          window.setTimeout(function () { if (ctx.core && ctx.core.hideProgress) ctx.core.hideProgress(); }, 1200);
        }
      }
    };
  });
}());
