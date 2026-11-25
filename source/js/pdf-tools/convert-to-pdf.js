(function () {
  'use strict';

  window.PdfToolModules = window.PdfToolModules || {};

  var DEFINITIONS = {
    'jpg-to-pdf': { title: '이미지 PDF 변환', accept: 'image/*', multiple: true },
    'word-to-pdf': { title: 'Word PDF 변환', accept: '.docx', multiple: false },
    'powerpoint-to-pdf': { title: 'PowerPoint PDF 변환', accept: '.pptx', multiple: false },
    'excel-to-pdf': { title: 'Excel PDF 변환', accept: '.xlsx,.xls,.csv', multiple: false },
    'html-to-pdf': { title: 'HTML PDF 변환', accept: '.html,.htm,text/html', multiple: false }
  };

  function option(ctx, name) {
    return ctx.optionsEl.querySelector('[name="' + name + '"]');
  }

  function selected(ctx, name, fallback) {
    var field = option(ctx, name);
    return field ? field.value : fallback;
  }

  function numberOption(ctx, name, fallback) {
    var n = Number(selected(ctx, name, fallback));
    return Number.isFinite(n) ? n : fallback;
  }

  function requireGlobal(path, value) {
    if (!value) throw new Error('필요한 변환 라이브러리(' + path + ')를 불러오지 못했습니다. 페이지를 새로고침한 뒤 다시 시도해 주세요.');
    return value;
  }

  function getJsPdf() {
    var lib = requireGlobal('jsPDF', window.jspdf);
    return requireGlobal('jsPDF 생성자', lib.jsPDF);
  }

  function setProgress(ctx, percent, message) {
    if (ctx.core && typeof ctx.core.setProgress === 'function') ctx.core.setProgress(percent, message);
  }

  function pageSize(format, orientation) {
    var key = String(format || '').toLowerCase() === 'letter' ? 'Letter' : 'A4';
    var sizes = {
      A4: { portrait: [210, 297], landscape: [297, 210] },
      Letter: { portrait: [215.9, 279.4], landscape: [279.4, 215.9] }
    };
    return sizes[key][orientation === 'landscape' ? 'landscape' : 'portrait'].slice();
  }

  function makePdf(format, orientation, unit) {
    var JsPDF = getJsPdf();
    return new JsPDF({ orientation: orientation || 'portrait', unit: unit || 'mm', format: format || 'a4', compress: true });
  }

  function readFile(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = function () { reject(new Error('파일을 읽을 수 없습니다: ' + file.name)); };
      reader.readAsArrayBuffer(file);
    });
  }

  function loadImage(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var image = new Image();
      image.onload = function () { URL.revokeObjectURL(url); resolve(image); };
      image.onerror = function () { URL.revokeObjectURL(url); reject(new Error('이미지를 열 수 없습니다: ' + file.name)); };
      image.src = url;
    });
  }

  function imageFormat(file, image) {
    var canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    var context = canvas.getContext('2d');
    var isJpeg = (file.type || '').toLowerCase() === 'image/jpeg' || /\.jpe?g$/i.test(file.name);
    if (isJpeg) {
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0);
      return { data: canvas.toDataURL('image/jpeg', 0.92), format: 'JPEG' };
    }
    context.drawImage(image, 0, 0);
    return { data: canvas.toDataURL('image/png'), format: 'PNG' };
  }

  function renderOptions(ctx) {
    var id = typeof ctx.tool === 'string' ? ctx.tool : ctx.tool && ctx.tool.id;
    if (id === 'jpg-to-pdf') {
      ctx.optionsEl.innerHTML = '<label>용지 <select name="paper"><option value="original">원본 크기</option><option value="a4">A4</option><option value="letter">Letter</option></select></label>' +
        '<label>방향 <select name="orientation"><option value="auto">자동</option><option value="portrait">세로</option><option value="landscape">가로</option></select></label>' +
        '<label>여백 <select name="margin"><option value="0">없음</option><option value="8">작게</option><option value="18">크게</option></select></label><p>파일 선택 순서대로 이미지 한 장당 PDF 한 페이지를 만듭니다.</p>';
    } else if (id === 'word-to-pdf') {
      ctx.optionsEl.innerHTML = '<label>용지 <select name="paper"><option value="a4">A4</option><option value="letter">Letter</option></select></label>' +
        '<label>여백 <input name="margin" type="number" min="5" max="40" value="18"> mm</label>' +
        '<p class="portal-pdf-notice">DOCX를 HTML로 변환해 브라우저에서 렌더링합니다. 페이지 나눔, 글꼴, 머리글·바닥글과 복잡한 레이아웃은 원본과 다를 수 있습니다.</p>';
    } else if (id === 'powerpoint-to-pdf') {
      ctx.optionsEl.innerHTML = '<label>슬라이드 비율 <select name="ratio"><option value="wide">16:9</option><option value="standard">4:3</option></select></label>' +
        '<p class="portal-pdf-notice">텍스트와 포함된 이미지를 단순 배치합니다. 원본의 테마, 도형, 애니메이션, 정확한 위치·서식은 보존되지 않을 수 있습니다.</p>';
    } else if (id === 'excel-to-pdf') {
      ctx.optionsEl.innerHTML = '<label>시트 <select name="sheet"><option value="all">모든 시트</option></select></label>' +
        '<label>방향 <select name="orientation"><option value="landscape">가로</option><option value="portrait">세로</option></select></label>' +
        '<p class="portal-pdf-notice">셀 표시값을 표로 렌더링합니다. 인쇄 영역, 차트, 조건부 서식, 복잡한 셀 병합은 단순화될 수 있습니다.</p>';
    } else if (id === 'html-to-pdf') {
      ctx.optionsEl.innerHTML = '<label>용지 <select name="paper"><option value="a4">A4</option><option value="letter">Letter</option></select></label>' +
        '<label>여백 <input name="margin" type="number" min="0" max="40" value="12"> mm</label>' +
        '<label class="portal-pdf-html-label">HTML 코드 <textarea name="html" rows="8" placeholder="웹페이지에서 복사한 HTML을 붙여 넣거나 HTML 파일을 추가하세요."></textarea></label>' +
        '<p class="portal-pdf-notice">외부 사이트의 차단된 이미지·글꼴은 출력되지 않을 수 있습니다. 스크립트는 실행하지 않으며 페이지 레이아웃은 인쇄용으로 단순화됩니다.</p>';
      var htmlField = option(ctx, 'html');
      if (htmlField) htmlField.addEventListener('input', function () { renderPreview(ctx); });
    }
    if (id === 'excel-to-pdf') refreshSheetOptions(ctx);
  }

  function refreshSheetOptions(ctx) {
    var field = option(ctx, 'sheet');
    var file = (ctx.files || []).find(function (f) { return /\.(xlsx|xls|csv)$/i.test(f.name); });
    if (!field || !file || !window.XLSX) return;
    readFile(file).then(function (buffer) {
      var workbook = window.XLSX.read(buffer, { type: 'array', cellDates: true });
      var previous = field.value;
      field.innerHTML = '<option value="all">모든 시트</option>' + workbook.SheetNames.map(function (name, i) {
        return '<option value="' + i + '">' + escapeText(name) + '</option>';
      }).join('');
      if (previous !== 'all' && Number(previous) < workbook.SheetNames.length) field.value = previous;
    }).catch(function () { /* execute reports the actual parse error */ });
  }

  function escapeText(value) {
    return String(value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function renderPreview(ctx) {
    if (!ctx.stageEl) return;
    var id = typeof ctx.tool === 'string' ? ctx.tool : ctx.tool && ctx.tool.id;
    var files = ctx.files || [];
    if (id === 'html-to-pdf') {
      var selectedFile = files.find(function (f) { return /\.html?$/i.test(f.name); });
      var html = selectedFile ? '' : ((option(ctx, 'html') || {}).value || '');
      ctx.stageEl.innerHTML = '<div class="portal-pdf-convert-preview"><strong>미리보기</strong><p>' +
        (selectedFile ? 'HTML 파일을 PDF용으로 렌더링합니다.' : html.trim() ? '입력한 HTML을 PDF용으로 렌더링합니다.' : 'HTML 코드를 붙여 넣거나 파일을 추가하세요.') + '</p></div>';
      return;
    }
    ctx.stageEl.innerHTML = '<div class="portal-pdf-convert-preview"><strong>' + (files.length ? files.length + '개 파일 준비됨' : '파일을 추가하세요') + '</strong><p>' +
      escapeText(files.map(function (f) { return f.name; }).join(' · ') || '선택한 파일은 브라우저 안에서 처리됩니다.') + '</p></div>';
    if (id === 'excel-to-pdf') refreshSheetOptions(ctx);
  }

  function getSafeHtml(source) {
    var doc = new DOMParser().parseFromString(source, 'text/html');
    doc.querySelectorAll('script, iframe, object, embed, form, base, meta[http-equiv], link[rel="import"]').forEach(function (el) { el.remove(); });
    doc.querySelectorAll('*').forEach(function (el) {
      Array.from(el.attributes).forEach(function (attr) {
        if (/^on/i.test(attr.name) || ((attr.name === 'href' || attr.name === 'src') && /^\s*javascript:/i.test(attr.value))) el.removeAttribute(attr.name);
      });
    });
    var styles = Array.from(doc.head ? doc.head.querySelectorAll('style') : []).map(function (el) { return el.outerHTML; }).join('');
    return styles + doc.body.innerHTML;
  }

  function captureHtmlPages(ctx, html, settings) {
    var capture = requireGlobal('html2canvas', window.html2canvas);
    var orientation = settings.orientation === 'landscape' ? 'landscape' : 'portrait';
    var size = pageSize(settings.paper, orientation);
    var margin = Math.max(0, Math.min(40, settings.margin || 0));
    var host = document.createElement('div');
    var hostWidth = orientation === 'landscape' ? 1123 : 794;
    host.style.cssText = 'position:fixed;left:-100000px;top:0;width:' + hostWidth + 'px;background:#fff;color:#111;z-index:-1;';
    var content = document.createElement('div');
    content.style.cssText = 'box-sizing:border-box;width:100%;padding:24px;font:14px/1.5 Arial,sans-serif;overflow-wrap:anywhere;';
    content.innerHTML = getSafeHtml(html);
    host.appendChild(content);
    document.body.appendChild(host);
    return capture(content, { scale: 1.5, useCORS: true, allowTaint: false, backgroundColor: '#ffffff', logging: false })
      .then(function (canvas) {
        var pdf = makePdf(settings.paper === 'letter' ? 'letter' : 'a4', orientation);
        var printableW = size[0] - margin * 2;
        var printableH = size[1] - margin * 2;
        var pxPerPage = Math.max(1, Math.floor(canvas.width * printableH / printableW));
        for (var y = 0; y < canvas.height; y += pxPerPage) {
          if (y) pdf.addPage();
          var slice = document.createElement('canvas');
          slice.width = canvas.width;
          slice.height = Math.min(pxPerPage, canvas.height - y);
          slice.getContext('2d').drawImage(canvas, 0, y, canvas.width, slice.height, 0, 0, canvas.width, slice.height);
          var renderH = slice.height * printableW / canvas.width;
          pdf.addImage(slice.toDataURL('image/jpeg', 0.88), 'JPEG', margin, margin, printableW, renderH, undefined, 'FAST');
        }
        return pdf;
      }).finally(function () { host.remove(); });
  }

  async function imagesToPdf(ctx) {
    if (!ctx.files || !ctx.files.length) throw new Error('PDF로 변환할 이미지를 먼저 추가해 주세요.');
    var pdf = null;
    var paper = selected(ctx, 'paper', 'original');
    var orientation = selected(ctx, 'orientation', 'auto');
    var margin = Number(selected(ctx, 'margin', 0));
    for (var i = 0; i < ctx.files.length; i += 1) {
      var file = ctx.files[i];
      if (!/^image\//i.test(file.type) && !/\.(jpe?g|png|gif|webp|bmp|avif)$/i.test(file.name)) continue;
      setProgress(ctx, Math.round(i / ctx.files.length * 90), '이미지 처리 중: ' + file.name);
      var image = await loadImage(file);
      var data = imageFormat(file, image);
      var pageOrientation = orientation === 'auto' ? (image.naturalWidth > image.naturalHeight ? 'landscape' : 'portrait') : orientation;
      if (paper === 'original') {
        var widthMm = image.naturalWidth * 25.4 / 96;
        var heightMm = image.naturalHeight * 25.4 / 96;
        var naturalOrientation = widthMm > heightMm ? 'landscape' : 'portrait';
        var pageW = pageOrientation !== naturalOrientation ? heightMm : widthMm;
        var pageH = pageOrientation !== naturalOrientation ? widthMm : heightMm;
        if (!pdf) pdf = makePdf([pageW, pageH], pageOrientation); else pdf.addPage([pageW, pageH], pageOrientation);
        if (pageOrientation !== naturalOrientation) {
          var fitRatio = Math.min(pageW / image.naturalWidth, pageH / image.naturalHeight);
          var drawW = image.naturalWidth * fitRatio;
          var drawH = image.naturalHeight * fitRatio;
          pdf.addImage(data.data, data.format, (pageW - drawW) / 2, (pageH - drawH) / 2, drawW, drawH, undefined, 'FAST');
        } else {
          pdf.addImage(data.data, data.format, 0, 0, pageW, pageH, undefined, 'FAST');
        }
      } else {
        var size = pageSize(paper, pageOrientation);
        var JsPDF = getJsPdf();
        if (!pdf) pdf = new JsPDF({ orientation: pageOrientation, unit: 'mm', format: paper, compress: true });
        else pdf.addPage(paper, pageOrientation);
        var availableW = Math.max(1, size[0] - margin * 2);
        var availableH = Math.max(1, size[1] - margin * 2);
        var ratio = Math.min(availableW / image.naturalWidth, availableH / image.naturalHeight);
        var w = image.naturalWidth * ratio, h = image.naturalHeight * ratio;
        pdf.addImage(data.data, data.format, (size[0] - w) / 2, (size[1] - h) / 2, w, h, undefined, 'FAST');
      }
    }
    if (!pdf) throw new Error('지원되는 이미지 파일이 없습니다. JPG, PNG, WebP 등 이미지 파일을 추가해 주세요.');
    return pdf;
  }

  async function wordToPdf(ctx) {
    var file = (ctx.files || []).find(function (f) { return /\.docx$/i.test(f.name); });
    if (!file) throw new Error('변환할 DOCX 파일을 추가해 주세요.');
    var mammoth = requireGlobal('mammoth', window.mammoth);
    setProgress(ctx, 15, 'Word 문서 읽는 중');
    var result = await mammoth.convertToHtml({ arrayBuffer: await readFile(file) }, {
      convertImage: mammoth.images && mammoth.images.inline(function (image) {
        return image.read('base64').then(function (data) { return { src: 'data:' + image.contentType + ';base64,' + data }; });
      })
    });
    if (!result.value || !result.value.trim()) throw new Error('문서에서 변환 가능한 내용을 찾지 못했습니다.');
    setProgress(ctx, 40, '문서 페이지 렌더링 중');
    return captureHtmlPages(ctx, '<style>table{border-collapse:collapse;width:100%}td,th{border:1px solid #bbb;padding:5px}img{max-width:100%;height:auto}h1,h2,h3,p,li{page-break-inside:avoid}</style>' + result.value, {
      paper: selected(ctx, 'paper', 'a4'), margin: numberOption(ctx, 'margin', 18), orientation: 'portrait'
    });
  }

  function shapeText(node) {
    var paragraphs = Array.from(node.getElementsByTagName('*')).filter(function (el) { return /(^|:)p$/.test(el.nodeName); });
    if (paragraphs.length) {
      return paragraphs.map(function (p) {
        return Array.from(p.getElementsByTagName('*')).filter(function (el) { return /(^|:)t$/.test(el.nodeName); }).map(function (t) { return t.textContent || ''; }).join('');
      }).filter(Boolean).join('\n');
    }
    return Array.from(node.getElementsByTagName('*')).filter(function (el) { return /(^|:)t$/.test(el.nodeName); }).map(function (t) { return t.textContent || ''; }).join(' ').trim();
  }

  function resolvePptxPath(baseDir, target) {
    if (!target) return '';
    if (target.charAt(0) === '/') return target.slice(1);
    var parts = baseDir.split('/').filter(Boolean);
    target.split('/').forEach(function (segment) {
      if (!segment || segment === '.') return;
      if (segment === '..') parts.pop();
      else parts.push(segment);
    });
    return parts.join('/');
  }

  async function powerpointToPdf(ctx) {
    var file = (ctx.files || []).find(function (f) { return /\.pptx$/i.test(f.name); });
    if (!file) throw new Error('변환할 PPTX 파일을 추가해 주세요.');
    var JSZip = requireGlobal('JSZip', window.JSZip);
    var zip = await JSZip.loadAsync(await readFile(file));
    var slideNames = Object.keys(zip.files).filter(function (name) { return /^ppt\/slides\/slide\d+\.xml$/i.test(name); })
      .sort(function (a, b) { return Number(a.match(/slide(\d+)/i)[1]) - Number(b.match(/slide(\d+)/i)[1]); });
    if (!slideNames.length) throw new Error('PPTX에서 슬라이드를 찾지 못했습니다.');
    var ratio = selected(ctx, 'ratio', 'wide') === 'standard' ? [10, 7.5] : [13.333, 7.5];
    var JsPDF = getJsPdf();
    var pdf = new JsPDF({ orientation: 'landscape', unit: 'mm', format: [ratio[0] * 25.4, ratio[1] * 25.4], compress: true });
    var parser = new DOMParser();
    for (var i = 0; i < slideNames.length; i += 1) {
      setProgress(ctx, Math.round(i / slideNames.length * 90), '슬라이드 변환 중: ' + (i + 1) + '/' + slideNames.length);
      if (i) pdf.addPage([ratio[0] * 25.4, ratio[1] * 25.4], 'landscape');
      var xml = parser.parseFromString(await zip.file(slideNames[i]).async('string'), 'application/xml');
      if (xml.querySelector('parsererror')) throw new Error('슬라이드 XML을 읽을 수 없습니다: ' + slideNames[i]);
      var shapes = Array.from(xml.getElementsByTagName('*')).filter(function (el) { return /(^|:)sp$/.test(el.nodeName) || /(^|:)pic$/.test(el.nodeName); });
      var slideW = ratio[0] * 914400, slideH = ratio[1] * 914400;
      var relName = slideNames[i].replace('slides/', 'slides/_rels/') + '.rels';
      var relationships = {};
      if (zip.file(relName)) {
        var relXml = parser.parseFromString(await zip.file(relName).async('string'), 'application/xml');
        Array.from(relXml.getElementsByTagName('*')).forEach(function (rel) {
          if (/(^|:)Relationship$/.test(rel.nodeName)) relationships[rel.getAttribute('Id')] = rel.getAttribute('Target');
        });
      }
      for (var shapeIndex = 0; shapeIndex < shapes.length; shapeIndex += 1) {
        var shape = shapes[shapeIndex];
        var xfrm = shape.getElementsByTagName('*');
        var offset = null, extent = null;
        for (var n = 0; n < xfrm.length; n += 1) {
          if (/(^|:)off$/.test(xfrm[n].nodeName) && !offset) offset = xfrm[n];
          if (/(^|:)ext$/.test(xfrm[n].nodeName) && !extent) extent = xfrm[n];
        }
        var x = offset ? Number(offset.getAttribute('x')) / slideW * ratio[0] * 25.4 : 8;
        var y = offset ? Number(offset.getAttribute('y')) / slideH * ratio[1] * 25.4 : 8 + shapeIndex * 12;
        var w = extent ? Number(extent.getAttribute('cx')) / slideW * ratio[0] * 25.4 : ratio[0] * 25.4 - 16;
        var h = extent ? Number(extent.getAttribute('cy')) / slideH * ratio[1] * 25.4 : 12;
        var text = shapeText(shape).trim();
        if (text) {
          var fontSize = 12;
          var rPr = Array.from(shape.getElementsByTagName('*')).find(function (el) { return el.getAttribute('sz'); });
          if (rPr) fontSize = Math.max(7, Math.min(32, Number(rPr.getAttribute('sz')) / 100));
          pdf.setFontSize(fontSize);
          var lines = pdf.splitTextToSize(text, Math.max(5, w - 2));
          pdf.text(lines, Math.max(2, x), Math.max(fontSize * 0.4, y + fontSize * 0.4), { maxWidth: Math.max(5, w - 2) });
        }
        var blip = Array.from(shape.getElementsByTagName('*')).find(function (el) { return /(^|:)blip$/.test(el.nodeName); });
        if (blip) {
          var embedId = blip.getAttribute('r:embed') || blip.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'embed');
          var target = relationships[embedId];
          if (target) {
            var mediaPath = resolvePptxPath('ppt/slides', target);
            var media = zip.file(mediaPath);
            if (media) {
              var bytes = await media.async('uint8array');
              var mime = /\.jpe?g$/i.test(mediaPath) ? 'image/jpeg' : /\.gif$/i.test(mediaPath) ? 'image/gif' : 'image/png';
              var base64 = '';
              for (var byteIndex = 0; byteIndex < bytes.length; byteIndex += 0x8000) {
                base64 += String.fromCharCode.apply(null, bytes.subarray(byteIndex, Math.min(byteIndex + 0x8000, bytes.length)));
              }
              try { pdf.addImage('data:' + mime + ';base64,' + btoa(base64), mime === 'image/jpeg' ? 'JPEG' : 'PNG', x, y, Math.max(1, w), Math.max(1, h)); }
              catch (imageError) { /* Unsupported media is omitted while slide text remains available. */ }
            }
          }
        }
      }
    }
    return pdf;
  }

  async function excelToPdf(ctx) {
    var file = (ctx.files || []).find(function (f) { return /\.(xlsx|xls|csv)$/i.test(f.name); });
    if (!file) throw new Error('변환할 Excel 또는 CSV 파일을 추가해 주세요.');
    var XLSX = requireGlobal('XLSX', window.XLSX);
    setProgress(ctx, 15, '스프레드시트 읽는 중');
    var workbook = XLSX.read(await readFile(file), { type: 'array', cellDates: true, cellStyles: false });
    var choice = selected(ctx, 'sheet', 'all');
    var sheets = choice === 'all' ? workbook.SheetNames : [workbook.SheetNames[Number(choice)]].filter(Boolean);
    if (!sheets.length) throw new Error('선택한 시트를 찾을 수 없습니다.');
    var html = '<style>table{border-collapse:collapse;width:100%;font:10px Arial,sans-serif}td,th{border:1px solid #aab2bd;padding:4px;vertical-align:top}tr:nth-child(even){background:#f3f5f8}</style>';
    sheets.forEach(function (name) {
      var sheet = workbook.Sheets[name];
      if (!sheet) return;
      html += '<h2>' + escapeText(name) + '</h2>' + XLSX.utils.sheet_to_html(sheet, { header: '', footer: '' });
    });
    setProgress(ctx, 40, '시트 렌더링 중');
    return captureHtmlPages(ctx, html, { paper: 'a4', margin: 8, orientation: selected(ctx, 'orientation', 'landscape') });
  }

  async function htmlToPdf(ctx) {
    var file = (ctx.files || []).find(function (f) { return /\.(html?|txt)$/i.test(f.name) || /text\/(html|plain)/i.test(f.type); });
    var html = file ? await file.text() : ((option(ctx, 'html') || {}).value || '');
    if (file && /\.txt$/i.test(file.name) && !/<[a-z][\s\S]*>/i.test(html)) {
      html = '<pre style="white-space:pre-wrap;font:inherit">' + escapeText(html) + '</pre>';
    }
    if (!html.trim()) throw new Error('HTML 코드를 붙여 넣거나 HTML 파일을 추가해 주세요.');
    setProgress(ctx, 20, 'HTML 페이지 렌더링 중');
    return captureHtmlPages(ctx, html, { paper: selected(ctx, 'paper', 'a4'), margin: numberOption(ctx, 'margin', 12), orientation: 'portrait' });
  }

  async function execute(ctx) {
    var id = typeof ctx.tool === 'string' ? ctx.tool : ctx.tool && ctx.tool.id;
    var config = DEFINITIONS[id];
    if (!config) throw new Error('알 수 없는 PDF 변환 도구입니다.');
    if (ctx.runBtn) ctx.runBtn.disabled = true;
    if (ctx.resultEl) ctx.resultEl.innerHTML = '';
    try {
      var pdf;
      if (id === 'jpg-to-pdf') pdf = await imagesToPdf(ctx);
      else if (id === 'word-to-pdf') pdf = await wordToPdf(ctx);
      else if (id === 'powerpoint-to-pdf') pdf = await powerpointToPdf(ctx);
      else if (id === 'excel-to-pdf') pdf = await excelToPdf(ctx);
      else pdf = await htmlToPdf(ctx);
      setProgress(ctx, 95, 'PDF 파일 생성 중');
      var blob = pdf.output('blob');
      if (!blob || !blob.size) throw new Error('PDF 파일 생성에 실패했습니다.');
      var filename = {
        'jpg-to-pdf': 'images.pdf', 'word-to-pdf': 'document.pdf', 'powerpoint-to-pdf': 'presentation.pdf',
        'excel-to-pdf': 'spreadsheet.pdf', 'html-to-pdf': 'webpage.pdf'
      }[id];
      if (!ctx.core || typeof ctx.core.downloadBlob !== 'function') throw new Error('파일 다운로드 기능을 사용할 수 없습니다.');
      ctx.core.downloadBlob(blob, filename);
      if (ctx.resultEl) ctx.resultEl.innerHTML = '<p>PDF 생성 완료 · ' + escapeText(filename) + ' (' + escapeText((ctx.core.formatBytes && ctx.core.formatBytes(blob.size)) || blob.size + ' bytes') + ')</p>';
      if (ctx.core.showToast) ctx.core.showToast('PDF 파일을 다운로드했습니다.');
      setProgress(ctx, 100, '완료');
      return blob;
    } catch (error) {
      if (ctx.resultEl) ctx.resultEl.innerHTML = '<p role="alert">변환 실패: ' + escapeText(error.message || String(error)) + '</p>';
      if (ctx.core && ctx.core.showToast) ctx.core.showToast(error.message || 'PDF 변환에 실패했습니다.', true);
      throw error;
    } finally {
      if (ctx.runBtn) ctx.runBtn.disabled = false;
    }
  }

  Object.keys(DEFINITIONS).forEach(function (id) {
    window.PdfToolModules[id] = {
      renderOptions: renderOptions,
      onFilesChanged: renderPreview,
      execute: execute
    };
  });
}());
