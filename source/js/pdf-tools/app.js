(function (window, document) {
  'use strict';

  var CATEGORIES = [
    { id: 'all', name: '전체' },
    { id: 'organize', name: 'PDF 구성' },
    { id: 'optimize', name: 'PDF 최적화' },
    { id: 'to-pdf', name: 'PDF로 변환' },
    { id: 'from-pdf', name: 'PDF에서 변환' },
    { id: 'edit', name: 'PDF 편집' },
    { id: 'security', name: 'PDF 보안' },
    { id: 'analysis', name: '분석 · AI' }
  ];

  var TOOLS = [
    ['merge','organize','PDF 합치기','여러 PDF를 선택한 순서대로 하나로 합칩니다.','.pdf',true],
    ['split','organize','PDF 분할','페이지 범위나 일정한 페이지 수로 나눕니다.','.pdf',false],
    ['remove-pages','organize','페이지 제거','원하지 않는 페이지를 골라 제거합니다.','.pdf',false],
    ['extract-pages','organize','페이지 추출','필요한 페이지만 새 PDF로 추출합니다.','.pdf',false],
    ['organize-pdf','organize','PDF 구성','페이지 순서, 방향을 바꾸고 복제하거나 삭제합니다.','.pdf',true],
    ['scan-to-pdf','organize','PDF로 스캔','카메라나 이미지 파일을 PDF로 만듭니다.','image/*',true],
    ['compress','optimize','PDF 압축','렌더링 품질을 조절해 PDF 용량을 줄입니다.','.pdf',false],
    ['repair','optimize','PDF 복구','열 수 있는 PDF를 다시 저장하거나 렌더링합니다.','.pdf',false],
    ['ocr','optimize','OCR PDF','스캔 PDF에서 텍스트를 인식해 추출합니다.','.pdf',false],
    ['jpg-to-pdf','to-pdf','JPG를 PDF로','이미지를 순서대로 PDF 페이지에 배치합니다.','image/*',true],
    ['word-to-pdf','to-pdf','Word를 PDF로','DOCX 문서를 브라우저에서 PDF로 변환합니다.','.docx',false],
    ['powerpoint-to-pdf','to-pdf','PowerPoint를 PDF로','PPTX의 텍스트와 이미지를 PDF로 변환합니다.','.pptx',false],
    ['excel-to-pdf','to-pdf','Excel을 PDF로','시트와 표 데이터를 PDF로 변환합니다.','.xlsx,.xls,.csv',false],
    ['html-to-pdf','to-pdf','HTML을 PDF로','HTML 코드나 파일을 페이지 PDF로 만듭니다.','.html,.htm,.txt',false],
    ['pdf-to-jpg','from-pdf','PDF를 JPG로','PDF 페이지를 JPG 또는 PNG 이미지로 저장합니다.','.pdf',false],
    ['pdf-to-word','from-pdf','PDF를 Word로','PDF 텍스트나 페이지 이미지로 DOCX를 만듭니다.','.pdf',false],
    ['pdf-to-ppt','from-pdf','PDF를 PowerPoint로','각 PDF 페이지를 프레젠테이션 슬라이드로 만듭니다.','.pdf',false],
    ['pdf-to-excel','from-pdf','PDF를 Excel로','페이지 텍스트 위치를 표 형태로 정리합니다.','.pdf',false],
    ['pdf-to-pdfa','from-pdf','PDF/A로 변환','보관용 식별 메타데이터를 PDF에 추가합니다.','.pdf',false],
    ['rotate','edit','PDF 회전','전체 또는 개별 페이지 방향을 바꿉니다.','.pdf',false],
    ['page-numbers','edit','페이지 번호 추가','페이지에 번호를 표시합니다.','.pdf',false],
    ['watermark','edit','워터마크 추가','텍스트나 이미지 워터마크를 삽입합니다.','.pdf',false],
    ['crop','edit','PDF 자르기','페이지의 보이는 영역을 조정합니다.','.pdf',false],
    ['edit-pdf','edit','PDF 편집','페이지 위에 텍스트나 도형을 그립니다.','.pdf',false],
    ['forms','edit','PDF 양식','기존 양식 필드를 채우거나 새 필드를 추가합니다.','.pdf',false],
    ['unlock','security','PDF 잠금 해제','암호로 열어 페이지를 새 PDF로 저장합니다.','.pdf',false],
    ['protect','security','PDF 비밀번호 설정','비밀번호 보호 PDF 생성을 시도합니다.','.pdf',false],
    ['sign','security','PDF 서명','그리거나 입력한 서명을 PDF에 넣습니다.','.pdf',false],
    ['redact','security','PDF 검열','영역을 검은색으로 덮어 페이지 이미지로 만듭니다.','.pdf',false],
    ['compare','security','PDF 비교','두 PDF의 텍스트 또는 페이지 이미지를 비교합니다.','.pdf',true],
    ['ai-summarize','analysis','AI PDF 요약','PDF에서 텍스트를 추출해 요약합니다.','.pdf',false],
    ['translate','analysis','PDF 번역','PDF에서 추출한 텍스트를 선택한 언어로 번역합니다.','.pdf',false],
    ['pdf-to-markdown','analysis','PDF를 Markdown으로','페이지 텍스트를 제목과 목록 형태로 바꿉니다.','.pdf',false]
  ].map(function (row) {
    return { id:row[0], category:row[1], title:row[2], desc:row[3], accept:row[4], multiple:row[5], requiresFiles:row[0] !== 'scan-to-pdf' && row[0] !== 'html-to-pdf', minFiles:row[0] === 'compare' ? 2 : 1 };
  });

  var categoryNames = CATEGORIES.reduce(function (map, item) { map[item.id] = item.name; return map; }, {});
  var hub = document.getElementById('pdf-hub');
  var workspace = document.getElementById('pdf-workspace');
  var tabsEl = document.getElementById('pdf-category-tabs');
  var gridEl = document.getElementById('pdf-tool-grid');
  var searchEl = document.getElementById('pdf-tool-search');
  var emptyEl = document.getElementById('pdf-empty-state');
  var fileInput = document.getElementById('pdf-file-input');
  var dropzone = document.getElementById('pdf-dropzone');
  var fileList = document.getElementById('pdf-file-list');
  var optionsEl = document.getElementById('pdf-options-panel');
  var stageEl = document.getElementById('pdf-stage');
  var runBtn = document.getElementById('pdf-run-btn');
  var selectedCategory = 'all';
  var selectedTool = null;
  var activeFiles = [];

  var TOOL_ICONS = {
    merge: '⧉', split: '✂', 'remove-pages': '⌫', 'extract-pages': '⎙', 'organize-pdf': '▤', 'scan-to-pdf': '📷',
    compress: '🗜', repair: '🔧', ocr: '🔍',
    'jpg-to-pdf': '🖼', 'word-to-pdf': '📝', 'powerpoint-to-pdf': '📊', 'excel-to-pdf': '📈', 'html-to-pdf': '🌐',
    'pdf-to-jpg': '🎞', 'pdf-to-word': '📄', 'pdf-to-ppt': '📽', 'pdf-to-excel': '▦', 'pdf-to-pdfa': '🏛',
    rotate: '↻', 'page-numbers': '#', watermark: '💧', crop: '⌌', 'edit-pdf': '✎', forms: '☑',
    unlock: '🔓', protect: '🔒', sign: '✍', redact: '■', compare: '⇄',
    'ai-summarize': '✨', translate: '🌍', 'pdf-to-markdown': '⬇'
  };

  function iconFor(tool) {
    return TOOL_ICONS[tool.id] || { organize:'▤', optimize:'◉', 'to-pdf':'↓', 'from-pdf':'↑', edit:'✎', security:'◇', analysis:'✦' }[tool.category] || 'PDF';
  }

  function renderTabs() {
    tabsEl.innerHTML = CATEGORIES.map(function (category) {
      var count = category.id === 'all' ? TOOLS.length : TOOLS.filter(function (tool) { return tool.category === category.id; }).length;
      return '<button type="button" class="portal-pdf-category-tab' + (selectedCategory === category.id ? ' is-active' : '') + '" role="tab" aria-selected="' + (selectedCategory === category.id) + '" data-category="' + category.id + '">' + categoryNames[category.id] + ' <span>' + count + '</span></button>';
    }).join('');
  }

  function renderTools() {
    var query = searchEl.value.trim().toLocaleLowerCase();
    var filtered = TOOLS.filter(function (tool) {
      var inCategory = selectedCategory === 'all' || tool.category === selectedCategory;
      var matches = !query || (tool.title + ' ' + tool.desc + ' ' + categoryNames[tool.category]).toLocaleLowerCase().indexOf(query) !== -1;
      return inCategory && matches;
    });
    gridEl.innerHTML = filtered.map(function (tool) {
      var isActive = selectedTool && selectedTool.id === tool.id;
      return '<button class="portal-pdf-tool-card' + (isActive ? ' is-active' : '') + '" type="button" data-tool-id="' + tool.id + '" title="' + tool.desc + '"><span class="portal-pdf-tool-icon" aria-hidden="true">' + iconFor(tool) + '</span><span class="portal-pdf-tool-copy"><strong>' + tool.title + '</strong><small>' + categoryNames[tool.category] + '</small></span></button>';
    }).join('');
    emptyEl.hidden = filtered.length > 0;
  }

  function context() {
    return { tool:selectedTool, files:activeFiles, stageEl:stageEl, optionsEl:optionsEl, resultEl:document.getElementById('pdf-result-area'), runBtn:runBtn, core:window.PdfToolCore };
  }

  function updateRunState() {
    if (!selectedTool) { runBtn.disabled = true; return; }
    var enoughFiles = !selectedTool.requiresFiles || activeFiles.length >= selectedTool.minFiles;
    runBtn.disabled = !enoughFiles;
  }

  function showFiles() {
    var core = window.PdfToolCore;
    fileList.innerHTML = activeFiles.map(function (file, index) {
      return '<li class="portal-pdf-file-item"><span class="portal-pdf-file-meta"><strong>' + core.escapeHtml(file.name) + '</strong><small>' + core.formatBytes(file.size) + '</small></span><button type="button" class="portal-pdf-remove-file" data-remove-file="' + index + '" aria-label="' + core.escapeHtml(file.name) + ' 제거">×</button></li>';
    }).join('');
    document.getElementById('pdf-stage-hint').textContent = activeFiles.length ? activeFiles.length + '개 파일이 선택되었습니다.' : '파일을 추가하면 여기에 표시됩니다.';
    if (!activeFiles.length) stageEl.innerHTML = '<div class="portal-pdf-stage-empty">파일을 추가하면 미리보기를 표시합니다.</div>';
    updateRunState();
  }

  function notifyFiles() {
    showFiles();
    var module = window.PdfToolModules && window.PdfToolModules[selectedTool.id];
    if (module && typeof module.onFilesChanged === 'function') {
      try { module.onFilesChanged(context()); }
      catch (error) { window.PdfToolCore.showToast(error.message || '파일을 표시하지 못했습니다.', true); }
    }
    updateRunState();
  }

  function acceptFiles(fileArray, append) {
    var incoming = Array.prototype.slice.call(fileArray || []);
    if (!selectedTool || !incoming.length) return;
    if (selectedTool.accept && selectedTool.accept !== '*') {
      incoming = incoming.filter(function (file) {
        if (selectedTool.accept === 'image/*') return file.type.indexOf('image/') === 0 || /\.(jpe?g|png|gif|webp|bmp|avif)$/i.test(file.name);
        var ext = '.' + file.name.split('.').pop().toLowerCase();
        return selectedTool.accept.split(',').some(function (token) { return token.trim().toLowerCase() === ext; });
      });
    }
    if (!incoming.length) { window.PdfToolCore.showToast('이 도구에서 지원하는 파일 형식을 선택해 주세요.', true); return; }
    activeFiles = selectedTool.multiple
      ? (append ? activeFiles.concat(incoming) : incoming)
      : [incoming[0]];
    notifyFiles();
  }

  function chooseTool(id) {
    selectedTool = TOOLS.find(function (tool) { return tool.id === id; });
    if (!selectedTool) return;
    var module = window.PdfToolModules && window.PdfToolModules[id];
    if (!module) { window.PdfToolCore.showToast('이 PDF 도구 모듈을 불러오지 못했습니다.', true); return; }
    activeFiles = [];
    fileInput.value = '';
    window.PdfToolCore.hideProgress();
    workspace.hidden = false;
    document.getElementById('pdf-ws-title').textContent = selectedTool.title;
    document.getElementById('pdf-ws-desc').textContent = selectedTool.desc;
    document.getElementById('pdf-ws-category').textContent = categoryNames[selectedTool.category];
    document.getElementById('pdf-ws-notice').textContent = id === 'ai-summarize' || id === 'translate' ? '이 기능은 추출 텍스트를 처리 API로 전송합니다.' : '';
    fileInput.accept = selectedTool.accept;
    fileInput.multiple = selectedTool.multiple;
    document.getElementById('pdf-accept-hint').textContent = selectedTool.accept === 'image/*' ? '이미지 파일' : selectedTool.accept.replace(/\./g, '').toUpperCase() + ' 파일';
    document.getElementById('pdf-result-area').innerHTML = '';
    document.getElementById('pdf-progress').hidden = true;
    runBtn.textContent = '실행하기';
    optionsEl.innerHTML = '';
    stageEl.innerHTML = '<div class="portal-pdf-stage-empty">파일을 추가하면 미리보기를 표시합니다.</div>';
    module.renderOptions(context());
    notifyFiles();
    renderTools();
  }

  tabsEl.addEventListener('click', function (event) {
    var button = event.target.closest('[data-category]');
    if (!button) return;
    selectedCategory = button.dataset.category;
    renderTabs(); renderTools();
  });
  gridEl.addEventListener('click', function (event) {
    var button = event.target.closest('[data-tool-id]');
    if (button) chooseTool(button.dataset.toolId);
  });
  searchEl.addEventListener('input', renderTools);
  dropzone.addEventListener('click', function (event) { if (event.target !== fileInput) fileInput.click(); });
  dropzone.addEventListener('keydown', function (event) { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); fileInput.click(); } });
  fileInput.addEventListener('change', function () { acceptFiles(fileInput.files, true); fileInput.value = ''; });
  ['dragenter','dragover'].forEach(function (name) { dropzone.addEventListener(name, function (event) { event.preventDefault(); dropzone.classList.add('is-dragover'); }); });
  ['dragleave','drop'].forEach(function (name) { dropzone.addEventListener(name, function (event) { event.preventDefault(); dropzone.classList.remove('is-dragover'); }); });
  dropzone.addEventListener('drop', function (event) { acceptFiles(event.dataTransfer && event.dataTransfer.files, true); });
  fileList.addEventListener('click', function (event) {
    var button = event.target.closest('[data-remove-file]');
    if (!button) return;
    activeFiles.splice(Number(button.dataset.removeFile), 1);
    notifyFiles();
  });
  runBtn.addEventListener('click', async function () {
    if (!selectedTool) return;
    var module = window.PdfToolModules && window.PdfToolModules[selectedTool.id];
    if (!module || typeof module.execute !== 'function') { window.PdfToolCore.showToast('이 도구의 실행 기능을 불러오지 못했습니다.', true); return; }
    runBtn.disabled = true;
    document.getElementById('pdf-result-area').innerHTML = '';
    try { await module.execute(context()); }
    catch (error) {
      document.getElementById('pdf-result-area').innerHTML = '<div class="portal-pdf-result-message is-error">' + window.PdfToolCore.escapeHtml(error && error.message ? error.message : '처리 중 오류가 발생했습니다.') + '</div>';
      window.PdfToolCore.showToast(error && error.message ? error.message : '처리 중 오류가 발생했습니다.', true);
    } finally { window.PdfToolCore.hideProgress(); updateRunState(); }
  });

  window.PdfToolRegistry = TOOLS;
  renderTabs();
  renderTools();
  if (TOOLS.length) chooseTool(TOOLS[0].id);
}(window, document));
