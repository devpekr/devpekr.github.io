(function () {
  'use strict';

  window.PdfToolModules = window.PdfToolModules || {};
  var P = window.PDFLib;
  var activePage = 0;
  var editorState = { tool: 'text', color: '#202124', width: 3, items: [], undo: [] };

  function fail(message) { throw new Error(message); }
  function esc(value) {
    return window.PdfToolCore && window.PdfToolCore.escapeHtml
      ? window.PdfToolCore.escapeHtml(String(value))
      : String(value).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; });
  }
  function option(ctx, name) { return ctx.optionsEl.querySelector('[name="' + name + '"]'); }
  function val(ctx, name, fallback) { var el = option(ctx, name); return el ? el.value : fallback; }
  function checked(ctx, name) { var el = option(ctx, name); return !!(el && el.checked); }
  function setOptions(ctx, html) { ctx.optionsEl.innerHTML = html; }
  function needPdfLib() { if (!P || !P.PDFDocument) fail('PDF 편집 라이브러리를 불러오지 못했습니다.'); }
  function needFile(ctx) { if (!ctx.files || !ctx.files.length) fail('PDF 파일을 먼저 추가해 주세요.'); return ctx.files[0]; }
  async function load(ctx) {
    needPdfLib();
    return P.PDFDocument.load(await needFile(ctx).arrayBuffer(), { updateMetadata: false });
  }
  async function save(ctx, doc, filename) {
    var bytes = await doc.save();
    var blob = new Blob([bytes], { type: 'application/pdf' });
    if (ctx.core && ctx.core.downloadBlob) ctx.core.downloadBlob(blob, filename);
    else {
      var url = URL.createObjectURL(blob), a = document.createElement('a');
      a.href = url; a.download = filename; a.click(); setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }
    if (ctx.resultEl) ctx.resultEl.textContent = filename + ' 파일을 생성해 다운로드했습니다.';
    return blob;
  }
  function progress(ctx, n, message) { if (ctx.core && ctx.core.setProgress) ctx.core.setProgress(n, message); }
  function done(ctx) { if (ctx.core && ctx.core.hideProgress) ctx.core.hideProgress(); }
  function degree(deg) { return P.degrees(((deg % 360) + 360) % 360); }
  function control(label, content) { return '<label class="portal-pdf-edit-control"><span>' + label + '</span>' + content + '</label>'; }
  function select(name, choices) { return '<select name="' + name + '">' + choices.map(function (x) { return '<option value="' + esc(x[0]) + '">' + esc(x[1]) + '</option>'; }).join('') + '</select>'; }
  function input(name, type, value, attrs) { return '<input name="' + name + '" type="' + type + '" value="' + esc(value) + '" ' + (attrs || '') + '>'; }
  function button(action, text, attrs) { return '<button type="button" data-action="' + action + '" ' + (attrs || '') + '>' + text + '</button>'; }

  function renderRotate(ctx) {
    setOptions(ctx, '<p>모든 페이지 또는 특정 페이지를 회전합니다.</p>' + control('회전 각도', select('rotation', [['90','시계 방향 90°'],['-90','반시계 방향 90°'],['180','180°']])) + control('적용 페이지', input('pages','text','all','placeholder="전체 또는 1,3-5"')) + button('rotate-all','회전 적용'));
    ctx.optionsEl.querySelector('[data-action="rotate-all"]').addEventListener('click', async function () {
      try {
        var doc = await load(ctx), indices = parsePages(ctx, doc.getPageCount()), delta = Number(val(ctx,'rotation','90'));
        indices.forEach(function (i) { var page = doc.getPage(i), current = page.getRotation().angle; page.setRotation(degree(current + delta)); });
        await save(ctx, doc, 'rotated.pdf');
      } catch (err) { report(ctx, err); }
    });
  }
  function parsePages(ctx, total) {
    var raw = (val(ctx, 'pages', 'all') || 'all').trim();
    if (!raw || raw.toLowerCase() === 'all' || raw === '전체') return Array.from({length: total}, function (_, i) { return i; });
    if (ctx.core && ctx.core.parsePageRange) return ctx.core.parsePageRange(raw, total);
    var found = new Set();
    raw.split(',').forEach(function (part) {
      var m = part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/); if (!m) fail('페이지 범위를 확인해 주세요. 예: 1,3-5');
      var a = Number(m[1]), b = Number(m[2] || m[1]); if (a < 1 || b < a || b > total) fail('페이지 범위가 문서 범위를 벗어났습니다.');
      for (var n = a; n <= b; n++) found.add(n - 1);
    });
    return Array.from(found).sort(function (a,b) { return a-b; });
  }
  function canvasText(text, size, color, family) {
    var canvas = document.createElement('canvas'), scale = 2, c = canvas.getContext('2d');
    c.font = (size * scale) + 'px ' + (family || 'sans-serif');
    var width = Math.max(1, Math.ceil(c.measureText(text).width + size * scale * 0.4));
    canvas.width = width; canvas.height = Math.ceil(size * scale * 1.6);
    c = canvas.getContext('2d'); c.font = (size * scale) + 'px ' + (family || 'sans-serif');
    c.fillStyle = color; c.textBaseline = 'middle'; c.fillText(text, size * scale * 0.2, canvas.height / 2);
    return canvas;
  }
  async function renderNumbers(ctx) {
    setOptions(ctx, control('위치', select('position', [['bottom-center','아래 가운데'],['bottom-left','아래 왼쪽'],['bottom-right','아래 오른쪽'],['top-center','위 가운데'],['top-left','위 왼쪽'],['top-right','위 오른쪽']])) +
      control('시작 번호', input('start','number','1','min="0"')) + control('글자 크기', input('fontSize','number','12','min="6" max="72"')) +
      control('번호 형식', select('format', [['n','1'],['n-total','1 / 전체 페이지 수'],['dash','- 1 -']])) +
      control('여백 (pt)', input('margin','number','28','min="0"')) + control('접두 문구', input('prefix','text','','placeholder="예: 페이지"')) + button('add-numbers','페이지 번호 추가'));
    ctx.optionsEl.querySelector('[data-action="add-numbers"]').addEventListener('click', async function () {
      try {
        var doc = await load(ctx), pages = doc.getPages(), start = Math.max(0, Number(val(ctx,'start','1')) || 1), size = Math.max(6, Number(val(ctx,'fontSize','12')) || 12), margin = Math.max(0, Number(val(ctx,'margin','28')) || 0), pos = val(ctx,'position','bottom-center'), fmt = val(ctx,'format','n'), prefix = val(ctx,'prefix','');
        for (var i = 0; i < pages.length; i++) {
          var page = pages[i], n = start + i, label = prefix + (fmt === 'n-total' ? n + ' / ' + pages.length : fmt === 'dash' ? '- ' + n + ' -' : String(n));
          var png = await doc.embedPng(canvasText(label, size, '#222222').toDataURL('image/png'));
          var pw = png.width / 2, ph = png.height / 2;
          var w = page.getWidth(), h = page.getHeight(), x = pos.endsWith('left') ? margin : pos.endsWith('right') ? w-margin-pw : (w-pw)/2;
          var y = pos.startsWith('top') ? h-margin-ph : margin;
          page.drawImage(png, { x: Math.max(0,x), y: Math.max(0,y), width: pw, height: ph });
        }
        await save(ctx, doc, 'numbered.pdf');
      } catch (err) { report(ctx, err); }
    });
  }
  function renderWatermark(ctx) {
    setOptions(ctx, control('유형', select('kind', [['text','텍스트'],['image','이미지']])) +
      '<div data-watermark-text>' + control('문구', input('text','text','기밀 문서','')) + control('글자 크기', input('fontSize','number','48','min="8" max="200"')) + '</div>' +
      '<div data-watermark-image hidden>' + control('이미지 파일', input('image','file','','accept="image/png,image/jpeg"')) + '</div>' +
      control('색상', input('color','color','#777777')) + control('불투명도', input('opacity','number','0.22','min="0.05" max="1" step="0.05"')) +
      control('회전 각도', input('angle','number','-35','min="-180" max="180"')) + control('배치', select('layout',[['center','중앙'],['tile','바둑판 반복']])) + button('watermark','워터마크 추가'));
    option(ctx,'kind').addEventListener('change', function () {
      ctx.optionsEl.querySelector('[data-watermark-text]').hidden = val(ctx,'kind','text') !== 'text';
      ctx.optionsEl.querySelector('[data-watermark-image]').hidden = val(ctx,'kind','text') !== 'image';
    });
    ctx.optionsEl.querySelector('[data-action="watermark"]').addEventListener('click', async function () {
      try {
        var doc = await load(ctx), kind = val(ctx,'kind','text'), png;
        if (kind === 'image') {
          var file = option(ctx,'image').files[0]; if (!file) fail('워터마크로 사용할 PNG 또는 JPG를 선택해 주세요.');
          var bytes = new Uint8Array(await file.arrayBuffer());
          png = (/jpe?g/i.test(file.type) || /\.jpe?g$/i.test(file.name)) ? await doc.embedJpg(bytes) : await doc.embedPng(bytes);
        } else {
          var text = val(ctx,'text','').trim(); if (!text) fail('워터마크 문구를 입력해 주세요.');
          png = await doc.embedPng(canvasText(text, Math.max(8,Number(val(ctx,'fontSize','48'))||48), val(ctx,'color','#777777')).toDataURL('image/png'));
        }
        var opacity = Math.min(1,Math.max(0.05,Number(val(ctx,'opacity','0.22'))||0.22)), angle = Number(val(ctx,'angle','-35'))||0;
        doc.getPages().forEach(function (page) {
          var w=page.getWidth(), h=page.getHeight(), maxW=w*0.72, maxH=h*0.72, scale=Math.min(maxW/png.width,maxH/png.height,1), iw=png.width*scale, ih=png.height*scale;
          if (val(ctx,'layout','center') === 'tile') {
            for (var y=ih; y<h+ih; y+=ih*2.5) for (var x=iw; x<w+iw; x+=iw*2.5) page.drawImage(png,{x:x-iw/2,y:y-ih/2,width:iw,height:ih,opacity:opacity,rotate:degree(angle)});
          } else page.drawImage(png,{x:(w-iw)/2,y:(h-ih)/2,width:iw,height:ih,opacity:opacity,rotate:degree(angle)});
        });
        await save(ctx,doc,'watermarked.pdf');
      } catch (err) { report(ctx, err); }
    });
  }

  function renderCrop(ctx) {
    setOptions(ctx, '<p>페이지 바깥쪽에서 잘라낼 여백을 포인트 단위로 입력합니다.</p>' +
      control('위',input('top','number','0','min="0"'))+control('오른쪽',input('right','number','0','min="0"'))+control('아래',input('bottom','number','0','min="0"'))+control('왼쪽',input('left','number','0','min="0"'))+
      control('적용 범위',select('scope',[['all','모든 페이지'],['current','현재 페이지']])) + '<div data-crop-page hidden>' + control('현재 페이지',input('page','number','1','min="1"')) + '</div>'+button('crop','자르기 적용'));
    option(ctx,'scope').addEventListener('change',function(){ctx.optionsEl.querySelector('[data-crop-page]').hidden=val(ctx,'scope','all')!=='current';});
    ctx.optionsEl.querySelector('[data-action="crop"]').addEventListener('click',async function(){
      try { var doc=await load(ctx), pages=doc.getPages(), scope=val(ctx,'scope','all'), indices=scope==='current'?[Math.max(0,Math.min(pages.length-1,(Number(val(ctx,'page','1'))||1)-1))]:pages.map(function(_,i){return i;});
        indices.forEach(function(i){var p=pages[i],box=p.getCropBox?p.getCropBox():{x:0,y:0,width:p.getWidth(),height:p.getHeight()},w=box.width,h=box.height,l=Math.max(0,Number(val(ctx,'left','0'))||0),r=Math.max(0,Number(val(ctx,'right','0'))||0),t=Math.max(0,Number(val(ctx,'top','0'))||0),b=Math.max(0,Number(val(ctx,'bottom','0'))||0); if(l+r>=w||t+b>=h)fail('잘라낼 여백의 합은 페이지 크기보다 작아야 합니다.'); p.setCropBox(box.x+l,box.y+b,w-l-r,h-t-b);});
        await save(ctx,doc,'cropped.pdf');
      }catch(err){report(ctx,err);}
    });
  }

  async function renderEdit(ctx) {
    editorState={tool:'text',color:'#202124',width:3,items:[],undo:[]}; activePage=0;
    setOptions(ctx, control('페이지',input('page','number','1','min="1"'))+control('도구',select('tool',[['text','텍스트 추가'],['image','이미지 추가'],['rect','사각형'],['circle','원'],['draw','자유 그리기']]))+
      control('텍스트',input('label','text','텍스트','',''))+control('이미지',input('asset','file','','accept="image/png,image/jpeg"'))+control('색상',input('color','color','#202124'))+control('선 굵기',input('stroke','number','3','min="1" max="30"'))+
      button('undo','실행 취소')+button('clear','현재 페이지 지우기')+button('save-edit','PDF 편집 저장'));
    ['tool','color','stroke','page'].forEach(function(name){
      var el=option(ctx,name); if(!el)return;
      el.addEventListener('change',function(e){if(name==='tool')editorState.tool=e.target.value;if(name==='color')editorState.color=e.target.value;if(name==='stroke')editorState.width=Number(e.target.value)||3;if(name==='page'){activePage=Math.max(0,(Number(e.target.value)||1)-1); paintEditor(ctx);}});
    });
    ctx.stageEl.innerHTML='<div class="portal-pdf-edit-canvas-wrap"><canvas data-edit-canvas></canvas></div><p>캔버스에서 클릭하거나 드래그해 페이지에 요소를 배치하세요.</p>';
    var canvas=ctx.stageEl.querySelector('canvas'); canvas.style.maxWidth='100%'; canvas.style.touchAction='none';
    canvas.addEventListener('pointerdown',function(e){var box=canvas.getBoundingClientRect(), pos={x:(e.clientX-box.left)/box.width,y:(e.clientY-box.top)/box.height}; editorState.undo.push(editorState.items.slice()); var last=editorState.items[editorState.items.length-1];
      if(editorState.tool==='draw'&&last&&last.page===activePage&&last.type==='draw'&&last.drag){last.points.push(pos);paintEditor(ctx);return;}
      var item={page:activePage,type:editorState.tool,x:pos.x,y:pos.y,x2:pos.x,y2:pos.y,color:editorState.color,width:editorState.width,label:val(ctx,'label','텍스트'),points:[pos]};
      if(item.type==='image'){var file=option(ctx,'asset').files[0];if(!file){report(ctx,new Error('이미지 추가 도구에서 이미지를 선택해 주세요.'));return;}item.file=file;item.x2=Math.min(1,pos.x+0.25);item.y2=Math.min(1,pos.y+0.2);}
      if(item.type==='draw')item.drag=true; editorState.items.push(item); canvas.setPointerCapture(e.pointerId); paintEditor(ctx);
    });
    canvas.addEventListener('pointermove',function(e){if(!e.buttons)return;var item=editorState.items[editorState.items.length-1];if(!item||item.page!==activePage)return;var box=canvas.getBoundingClientRect(),pos={x:(e.clientX-box.left)/box.width,y:(e.clientY-box.top)/box.height};item.x2=pos.x;item.y2=pos.y;if(item.type==='draw')item.points.push(pos);paintEditor(ctx);});
    canvas.addEventListener('pointerup',function(){var item=editorState.items[editorState.items.length-1];if(item)item.drag=false;});
    ctx.optionsEl.querySelector('[data-action="undo"]').addEventListener('click',function(){editorState.items=editorState.undo.pop()||[];paintEditor(ctx);});
    ctx.optionsEl.querySelector('[data-action="clear"]').addEventListener('click',function(){editorState.undo.push(editorState.items.slice());editorState.items=editorState.items.filter(function(x){return x.page!==activePage;});paintEditor(ctx);});
    ctx.optionsEl.querySelector('[data-action="save-edit"]').addEventListener('click',async function(){
      try{var doc=await load(ctx), pages=doc.getPages();for(var pi=0;pi<pages.length;pi++){var page=pages[pi], w=page.getWidth(),h=page.getHeight(), layer=document.createElement('canvas');layer.width=Math.ceil(w*2);layer.height=Math.ceil(h*2);var c=layer.getContext('2d');c.scale(2,2);
          var imageItems=editorState.items.filter(function(it){return it.page===pi&&it.type==='image';});
          for(var ii=0;ii<imageItems.length;ii++){var itImage=imageItems[ii], raw=new Uint8Array(await itImage.file.arrayBuffer()), isJpg=/jpe?g/i.test(itImage.file.type)||/\.jpe?g$/i.test(itImage.file.name), embeddedImage=isJpg?await doc.embedJpg(raw):await doc.embedPng(raw), ix=Math.min(itImage.x,itImage.x2)*w, iy=Math.min(itImage.y,itImage.y2)*h, iw=Math.max(1,Math.abs(itImage.x2-itImage.x)*w), ih=Math.max(1,Math.abs(itImage.y2-itImage.y)*h);page.drawImage(embeddedImage,{x:ix,y:h-iy-ih,width:iw,height:ih});}
          var drawItems=editorState.items.filter(function(it){return it.page===pi&&it.type!=='image';});
          drawItems.forEach(function(it){var x=it.x*w,y=it.y*h,x2=it.x2*w,y2=it.y2*h;c.strokeStyle=it.color;c.fillStyle=it.color;c.lineWidth=it.width;c.lineCap='round';c.lineJoin='round';if(it.type==='text'){c.font='18px sans-serif';c.textBaseline='top';c.fillText(it.label,x,y);}else if(it.type==='rect'){c.strokeRect(x,y,x2-x,y2-y);}else if(it.type==='circle'){c.beginPath();c.ellipse((x+x2)/2,(y+y2)/2,Math.abs(x2-x)/2,Math.abs(y2-y)/2,0,0,Math.PI*2);c.stroke();}else if(it.type==='draw'){c.beginPath();it.points.forEach(function(pt,i){var px=pt.x*w,py=pt.y*h;i?c.lineTo(px,py):c.moveTo(px,py);});c.stroke();}});
          if(drawItems.length){var embedded=await doc.embedPng(layer.toDataURL('image/png'));page.drawImage(embedded,{x:0,y:0,width:w,height:h});}
        }await save(ctx,doc,'edited.pdf');}catch(err){report(ctx,err);}
    });
    await paintEditor(ctx);
  }
  async function paintEditor(ctx){var canvas=ctx.stageEl.querySelector('[data-edit-canvas]');if(!canvas||!ctx.files.length)return;try{var core=ctx.core;if(!core||!core.loadPdfJsDoc||!core.renderPageToCanvas)return;var proxy=await core.loadPdfJsDoc(await ctx.files[0].arrayBuffer()), num=Math.max(1,Math.min(proxy.numPages,activePage+1));activePage=num-1;await core.renderPageToCanvas(proxy,num,canvas,1.25);var c=canvas.getContext('2d'),w=canvas.width,h=canvas.height,dpr=window.devicePixelRatio||1;editorState.items.filter(function(it){return it.page===activePage;}).forEach(function(it){c.strokeStyle=it.color;c.fillStyle=it.color;c.lineWidth=it.width*1.25*dpr;c.lineCap='round';c.lineJoin='round';if(it.type==='text'){c.font=(22*dpr)+'px sans-serif';c.textBaseline='top';c.fillText(it.label,it.x*w,it.y*h);}else if(it.type==='rect')c.strokeRect(it.x*w,it.y*h,(it.x2-it.x)*w,(it.y2-it.y)*h);else if(it.type==='circle'){c.beginPath();c.ellipse((it.x+it.x2)*w/2,(it.y+it.y2)*h/2,Math.abs(it.x2-it.x)*w/2,Math.abs(it.y2-it.y)*h/2,0,0,Math.PI*2);c.stroke();}else if(it.type==='draw'){c.beginPath();it.points.forEach(function(p,i){i?c.lineTo(p.x*w,p.y*h):c.moveTo(p.x*w,p.y*h);});c.stroke();}});}catch(e){report(ctx,e);}}

  async function refreshForms(ctx){if(!ctx.files.length)return;try{var doc=await load(ctx),form=doc.getForm(),fields=form.getFields(),holder=ctx.optionsEl.querySelector('[data-existing-fields]');if(!holder)return;holder.innerHTML=fields.length?fields.map(function(f){var name=f.getName(), controlHtml='';if(f instanceof P.PDFTextField)controlHtml='<input data-pdf-field="'+esc(name)+'" type="text" value="'+esc(f.getText()||'')+'">';else if(f instanceof P.PDFCheckBox)controlHtml='<input data-pdf-field="'+esc(name)+'" type="checkbox" '+(f.isChecked()?'checked':'')+'>';else if(f instanceof P.PDFDropdown)controlHtml='<select data-pdf-field="'+esc(name)+'">'+f.getOptions().map(function(v){return '<option '+(f.getSelected().indexOf(v)>=0?'selected':'')+'>'+esc(v)+'</option>';}).join('')+'</select>';else if(f instanceof P.PDFRadioGroup)controlHtml='<select data-pdf-field="'+esc(name)+'">'+f.getOptions().map(function(v){return '<option '+(f.getSelected()===v?'selected':'')+'>'+esc(v)+'</option>';}).join('')+'</select>';else controlHtml='<span>지원하지 않는 필드 유형</span>';return '<label class="portal-pdf-form-field"><span>'+esc(name)+'</span>'+controlHtml+'</label>';}).join(''):'<p>기존 양식 필드가 없습니다.</p>';await paintFormPreview(ctx);}catch(e){report(ctx,e);}}

  async function renderForms(ctx) {
    setOptions(ctx, '<p>기존 양식 필드를 읽고 값을 입력하거나 새 텍스트·체크 필드를 배치합니다.</p>'+control('모드',select('mode',[['fill','기존 필드 채우기'],['add','새 필드 추가']]))+
      '<div data-existing-fields></div><div data-new-field hidden>'+control('필드 유형',select('fieldType',[['text','텍스트 필드'],['checkbox','체크박스']]))+control('필드 이름',input('fieldName','text','field_1'))+control('필드 페이지',input('fieldPage','number','1','min="1"'))+'<p>필드를 놓을 위치를 미리보기에서 클릭하세요.</p></div>'+button('save-form','양식 PDF 저장'));
    ctx.stageEl.innerHTML='<div class="portal-pdf-form-preview"><canvas data-form-canvas></canvas></div><div data-form-fields></div>';
    option(ctx,'mode').addEventListener('change',function(){var add=val(ctx,'mode','fill')==='add';ctx.optionsEl.querySelector('[data-existing-fields]').hidden=add;ctx.optionsEl.querySelector('[data-new-field]').hidden=!add;});
    option(ctx,'fieldPage').addEventListener('change',function(){paintFormPreview(ctx);});
    ctx.stageEl.onclick=function(e){if(val(ctx,'mode','fill')!=='add'||e.target.tagName!=='CANVAS')return;var r=e.target.getBoundingClientRect();ctx.stageEl.dataset.fieldX=String((e.clientX-r.left)/r.width);ctx.stageEl.dataset.fieldY=String((e.clientY-r.top)/r.height);ctx.stageEl.dataset.fieldPage=val(ctx,'fieldPage','1');var note=ctx.stageEl.querySelector('[data-form-fields]');if(note)note.textContent='필드 위치 선택됨: 페이지 '+ctx.stageEl.dataset.fieldPage;};
    ctx.optionsEl.querySelector('[data-action="save-form"]').addEventListener('click',async function(){try{var doc=await load(ctx), form=doc.getForm(), mode=val(ctx,'mode','fill');
      if(mode==='fill'){var fields=form.getFields(), changed=0;fields.forEach(function(field){var inputEl=ctx.optionsEl.querySelector('[data-pdf-field="'+CSS.escape(field.getName())+'"]');if(!inputEl)return;if(field instanceof P.PDFTextField){field.setText(inputEl.value);changed++;}else if(field instanceof P.PDFCheckBox){inputEl.checked?field.check():field.uncheck();changed++;}else if(field instanceof P.PDFDropdown){field.select(inputEl.value);changed++;}else if(field instanceof P.PDFRadioGroup){field.select(inputEl.value);changed++;}});if(!fields.length)fail('이 PDF에서 양식 필드를 찾지 못했습니다. 새 필드 추가 모드를 사용해 주세요.');if(!changed)fail('수정된 양식 입력값이 없습니다.');}
      else {var name=val(ctx,'fieldName','').trim();if(!name)fail('필드 이름을 입력해 주세요.');var pageNo=Number(ctx.stageEl.dataset.fieldPage||val(ctx,'fieldPage','1')), pages=doc.getPages();if(!ctx.stageEl.dataset.fieldX||pageNo<1||pageNo>pages.length)fail('미리보기에서 필드를 배치할 위치를 클릭해 주세요.');var page=pages[pageNo-1], x=Number(ctx.stageEl.dataset.fieldX)*page.getWidth(), y=(1-Number(ctx.stageEl.dataset.fieldY))*page.getHeight();if(val(ctx,'fieldType','text')==='checkbox'){var cb=form.createCheckBox(name);cb.addToPage(page,{x:x,y:y,width:16,height:16});}else{var tf=form.createTextField(name);tf.addToPage(page,{x:x,y:y-20,width:180,height:24,borderWidth:1});}}
      await save(ctx,doc,'filled-form.pdf');
    }catch(err){report(ctx,err);}});
    await refreshForms(ctx);
  }
  async function paintFormPreview(ctx){var canvas=ctx.stageEl.querySelector('[data-form-canvas]');if(!canvas||!ctx.files.length||!ctx.core||!ctx.core.loadPdfJsDoc)return;var pdf=await ctx.core.loadPdfJsDoc(await ctx.files[0].arrayBuffer());await ctx.core.renderPageToCanvas(pdf,Math.max(1,Math.min(pdf.numPages,Number(val(ctx,'fieldPage','1'))||1)),canvas,1.1);}
  function report(ctx, err){done(ctx);var message=err&&err.message?err.message:String(err);if(ctx.core&&ctx.core.showToast)ctx.core.showToast(message,true);else if(ctx.resultEl)ctx.resultEl.textContent='오류: '+message;}

  var definitions={
    'rotate':{renderOptions:renderRotate,onFilesChanged:function(){},execute:function(ctx){return trigger(ctx,'rotate-all');}},
    'page-numbers':{renderOptions:renderNumbers,onFilesChanged:function(){},execute:function(ctx){return trigger(ctx,'add-numbers');}},
    'watermark':{renderOptions:renderWatermark,onFilesChanged:function(){},execute:function(ctx){return trigger(ctx,'watermark');}},
    'crop':{renderOptions:renderCrop,onFilesChanged:function(){},execute:function(ctx){return trigger(ctx,'crop');}},
    'edit-pdf':{renderOptions:renderEdit,onFilesChanged:function(ctx){paintEditor(ctx);},execute:function(ctx){return trigger(ctx,'save-edit');}},
    'forms':{renderOptions:renderForms,onFilesChanged:function(ctx){refreshForms(ctx);},execute:function(ctx){return trigger(ctx,'save-form');}}
  };
  function trigger(ctx, action){var el=ctx.optionsEl.querySelector('[data-action="'+action+'"]');if(!el)fail('도구 옵션이 준비되지 않았습니다.');el.click();return Promise.resolve();}
  Object.keys(definitions).forEach(function(id){window.PdfToolModules[id]=definitions[id];});
}());
