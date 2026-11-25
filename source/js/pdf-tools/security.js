(function () {
  'use strict';

  window.PdfToolModules = window.PdfToolModules || {};

  var IDS = ['unlock', 'protect', 'sign', 'redact', 'compare'];
  var state = { doc: null, canvas: null, marks: [], signature: null, mode: '' };
  var core;

  function escape(value) { return (core && core.escapeHtml ? core.escapeHtml(String(value || '')) : String(value || '').replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; })); }
  function pdfjs() { if (!window.pdfjsLib) throw new Error('PDF.js 라이브러리를 불러오지 못했습니다.'); return window.pdfjsLib; }
  function pdflib() { if (!window.PDFLib) throw new Error('pdf-lib 라이브러리를 불러오지 못했습니다.'); return window.PDFLib; }
  function fileFor(ctx, n) { return ctx.files && ctx.files[n || 0]; }
  function option(ctx, name) { var el = ctx.optionsEl.querySelector('[name="' + name + '"]'); return el ? el.value : ''; }
  function checked(ctx, name) { var el = ctx.optionsEl.querySelector('[name="' + name + '"]'); return !!(el && el.checked); }
  function setResult(ctx, html) { ctx.resultEl.innerHTML = html; }
  function notify(ctx, message, error) { if (ctx.core && ctx.core.showToast) ctx.core.showToast(message, !!error); }
  function download(ctx, bytes, name, type) {
    var blob = bytes instanceof Blob ? bytes : new Blob([bytes], { type: type || 'application/pdf' });
    ctx.core.downloadBlob(blob, name);
    setResult(ctx, '<p>파일을 만들었습니다: <strong>' + escape(name) + '</strong></p>');
  }
  function read(file) { return file.arrayBuffer(); }
  function loadDoc(file, password) { return core.loadPdfJsDoc ? core.loadPdfJsDoc(file, password) : pdfjs().getDocument({ data: new Uint8Array(file), password: password || undefined }).promise; }
  function renderOptions(ctx) {
    core = ctx.core || window.PdfToolCore;
    state = { doc: null, canvas: null, marks: [], signature: null, mode: ctx.tool.id };
    var id = ctx.tool.id;
    var html = '';
    if (id === 'unlock') html = '<label class="portal-pdf-field">문서 비밀번호<input name="password" type="password" autocomplete="current-password" placeholder="비밀번호 입력"></label><p class="portal-pdf-note">페이지를 2배 해상도 이미지로 다시 만들어 암호 없는 PDF로 저장합니다. 텍스트 검색, 선택, 벡터 요소는 이미지로 바뀝니다.</p>';
    if (id === 'protect') html = '<label class="portal-pdf-field">열기 비밀번호<input name="userPassword" type="password" autocomplete="new-password" required></label><label class="portal-pdf-field">소유자 비밀번호<input name="ownerPassword" type="password" autocomplete="new-password" required></label><label><input name="allowPrint" type="checkbox" checked> 인쇄 허용</label> <label><input name="allowCopy" type="checkbox"> 복사 허용</label><p class="portal-pdf-note">PDF 전체를 이미지화한 뒤 jsPDF 암호화 옵션으로 저장합니다. 암호화가 지원되지 않거나 실제 암호화 출력을 만들 수 없으면 실패로 알립니다.</p>';
    if (id === 'sign') html = '<label>서명 방식 <select name="signMode"><option value="draw">직접 그리기</option><option value="text">텍스트 서명</option><option value="image">도장 이미지 업로드</option></select></label><label>페이지 <input name="page" type="number" min="1" value="1"></label><label>서명 위치는 미리보기에서 클릭</label><div class="portal-pdf-sign-tools"><canvas name="signaturePad" width="420" height="130" aria-label="서명 입력"></canvas><input name="signatureText" type="text" placeholder="서명 이름"><input name="signatureImage" type="file" accept="image/png,image/jpeg"></div><button type="button" data-clear-sign>서명 지우기</button><p class="portal-pdf-note">미리보기에서 삽입 위치를 지정한 뒤 실행하세요.</p>';
    if (id === 'redact') html = '<p>미리보기 위에서 드래그해 검열 영역을 추가하세요. 검은색으로 영구 덮어쓰며 해당 페이지는 이미지로 재구성됩니다.</p><button type="button" data-clear-marks>검열 영역 모두 지우기</button><div class="portal-pdf-marks" aria-live="polite"></div><p class="portal-pdf-note">검열 페이지의 기존 텍스트 레이어는 결과물에 포함되지 않습니다.</p>';
    if (id === 'compare') html = '<label>비교 방식 <select name="compareMode"><option value="text">텍스트 차이</option><option value="pixel">시각적 픽셀 차이</option></select></label><label>페이지 번호 <input name="page" type="number" min="1" value="1"></label><p>첫 번째 파일과 두 번째 파일을 선택하세요. 텍스트 비교는 추출된 텍스트를, 픽셀 비교는 페이지 렌더링 이미지를 대조합니다.</p>';
    ctx.optionsEl.innerHTML = html;
    ctx.stageEl.innerHTML = '<p class="portal-pdf-note">PDF를 추가하면 페이지 미리보기가 표시됩니다.</p>';
    ctx.resultEl.innerHTML = '';
    if (id === 'sign' || id === 'redact') bindDrawingOptions(ctx);
  }
  function bindDrawingOptions(ctx) {
    var pad = ctx.optionsEl.querySelector('[name="signaturePad"]');
    if (pad) {
      var pctx = pad.getContext('2d'); pctx.lineWidth = 3; pctx.lineCap = 'round'; pctx.strokeStyle = '#182230';
      var drawing = false;
      pad.addEventListener('pointerdown', function (e) { drawing = true; pad.setPointerCapture(e.pointerId); var r = pad.getBoundingClientRect(); pctx.beginPath(); pctx.moveTo((e.clientX-r.left)*pad.width/r.width, (e.clientY-r.top)*pad.height/r.height); });
      pad.addEventListener('pointermove', function (e) { if (!drawing) return; var r = pad.getBoundingClientRect(); pctx.lineTo((e.clientX-r.left)*pad.width/r.width, (e.clientY-r.top)*pad.height/r.height); pctx.stroke(); });
      pad.addEventListener('pointerup', function () { drawing = false; state.signature = pad.toDataURL('image/png'); });
      ctx.optionsEl.querySelector('[data-clear-sign]').addEventListener('click', function () { pctx.clearRect(0,0,pad.width,pad.height); state.signature = null; });
      var mode = ctx.optionsEl.querySelector('[name="signMode"]');
      mode.addEventListener('change', function () { var text=ctx.optionsEl.querySelector('[name="signatureText"]'), image=ctx.optionsEl.querySelector('[name="signatureImage"]'); text.hidden=mode.value!=='text'; image.hidden=mode.value!=='image'; pad.hidden=mode.value!=='draw'; });
      mode.dispatchEvent(new Event('change'));
      ctx.optionsEl.querySelector('[name="signatureImage"]').addEventListener('change', function (e) { var f=e.target.files[0]; if (!f) return; var rd=new FileReader(); rd.onload=function(){state.signature=rd.result;}; rd.readAsDataURL(f); });
    }
    var clear = ctx.optionsEl.querySelector('[data-clear-marks]');
    if (clear) clear.addEventListener('click', function () { state.marks=[]; if (state.canvas) drawMarks(state.canvas); updateMarkList(ctx); });
  }
  function drawMarks(canvas) {
    var c=canvas.getContext('2d');
    if (state.baseImage) c.putImageData(state.baseImage,0,0);
    c.fillStyle='#000'; state.marks.forEach(function(m){c.fillRect(m.x,m.y,m.w,m.h);});
  }
  function updateMarkList(ctx) { var list=ctx.optionsEl.querySelector('.portal-pdf-marks'); if(list) list.textContent=state.marks.length ? state.marks.length+'개 영역을 검열합니다.' : '지정된 검열 영역이 없습니다.'; }
  async function showPreview(ctx) {
    var f=fileFor(ctx,0); if (!f) { ctx.stageEl.innerHTML='<p class="portal-pdf-note">PDF 파일을 추가하세요.</p>'; return; }
    if (ctx.tool.id === 'compare') { ctx.stageEl.innerHTML='<p>비교 파일: '+escape(f.name)+(fileFor(ctx,1)?' · '+escape(fileFor(ctx,1).name):' · 두 번째 PDF를 추가하세요.')+'</p>'; return; }
    if (!['sign','redact'].includes(ctx.tool.id)) return;
    try {
      var doc=await loadDoc(await read(f), option(ctx,'password'));
      var num=Math.max(1,Math.min(doc.numPages,parseInt(option(ctx,'page')||'1',10)));
      var canvas=document.createElement('canvas'); canvas.className='portal-pdf-security-preview'; canvas.style.maxWidth='100%'; canvas.style.height='auto'; canvas.style.cursor='crosshair';
      await core.renderPageToCanvas(doc,num,canvas,1.25);
      state.doc=doc; state.canvas=canvas; state.marks=[];
      if(ctx.tool.id==='redact') {
        state.baseImage=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height);
        var dragging=null;
        canvas.addEventListener('pointerdown',function(e){var r=canvas.getBoundingClientRect(); dragging={x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}; canvas.setPointerCapture(e.pointerId);});
        canvas.addEventListener('pointerup',function(e){if(!dragging)return;var r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*canvas.width/r.width,y=(e.clientY-r.top)*canvas.height/r.height;state.marks.push({page:num,x:Math.min(x,dragging.x),y:Math.min(y,dragging.y),w:Math.abs(x-dragging.x),h:Math.abs(y-dragging.y)});dragging=null;drawMarks(canvas);updateMarkList(ctx);});
      } else canvas.addEventListener('click',function(e){var r=canvas.getBoundingClientRect();state.signaturePlacement={page:num,x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height,canvasWidth:canvas.width,canvasHeight:canvas.height};canvas.style.outline='2px solid #3984ff';});
      ctx.stageEl.replaceChildren(canvas);
    } catch(e) { ctx.stageEl.innerHTML='<p class="portal-pdf-note">미리보기를 표시할 수 없습니다: '+escape(e.message)+'</p>'; }
  }
  function onFilesChanged(ctx) { core=ctx.core||window.PdfToolCore; state.mode=ctx.tool.id; showPreview(ctx); }
  async function rasterPdf(file, password, scale, drawPage) {
    var doc=await loadDoc(await read(file),password), pages=[];
    for(var i=1;i<=doc.numPages;i++) { var page=await doc.getPage(i), vp=page.getViewport({scale:scale||2}), c=document.createElement('canvas'); c.width=Math.ceil(vp.width); c.height=Math.ceil(vp.height); await page.render({canvasContext:c.getContext('2d'),viewport:vp}).promise; if(drawPage) await drawPage(c,i,page); pages.push({canvas:c,width:vp.width,height:vp.height}); if(core.setProgress) core.setProgress(Math.round(i/doc.numPages*80),'페이지 처리 중 ('+i+'/'+doc.numPages+')'); }
    return pages;
  }
  async function makeImagePdf(pages, encryption) {
    var JsPDF=window.jspdf&&window.jspdf.jsPDF;
    if(!JsPDF) throw new Error('jsPDF 라이브러리를 불러오지 못했습니다.');
    var opts={orientation:pages[0].width>pages[0].height?'landscape':'portrait',unit:'pt',format:[pages[0].width,pages[0].height],compress:true};
    if(encryption) opts.encryption=encryption;
    var pdf=new JsPDF(opts);
    if(encryption && !(pdf.internal && (pdf.internal.encryption || pdf.__private__ && pdf.__private__.encryption))) throw new Error('현재 로드된 jsPDF가 암호화 옵션을 지원하는지 확인할 수 없습니다. 보호된 PDF를 생성하지 않았습니다.');
    pages.forEach(function(p,i){if(i)pdf.addPage([p.width,p.height],p.width>p.height?'landscape':'portrait'); pdf.addImage(p.canvas.toDataURL('JPEG',0.92),'JPEG',0,0,p.width,p.height,undefined,'FAST');});
    var out=pdf.output('arraybuffer');
    if(encryption) {
      // Do not report protection unless the serialized PDF contains an encryption dictionary.
      var bytes=new Uint8Array(out), str=''; for(var j=0;j<bytes.length;j++) str+=String.fromCharCode(bytes[j]);
      if(str.indexOf('/Encrypt')<0) throw new Error('출력 PDF에서 암호화 사전을 확인하지 못했습니다. 보호된 파일을 제공하지 않았습니다.');
    }
    return out;
  }
  async function execute(ctx) {
    core=ctx.core||window.PdfToolCore;
    try {
      var id=ctx.tool.id, f=fileFor(ctx,0); if(!f) throw new Error('PDF 파일을 추가하세요.');
      if(id==='compare') return await compare(ctx);
      if(id==='unlock') {
        var pass=option(ctx,'password'); if(!pass) throw new Error('문서 비밀번호를 입력하세요.');
        var pages=await rasterPdf(f,pass,2); var out=await makeImagePdf(pages); download(ctx,out,'unlocked.pdf');
      } else if(id==='protect') {
        var user=option(ctx,'userPassword'), owner=option(ctx,'ownerPassword'); if(!user||!owner) throw new Error('열기 비밀번호와 소유자 비밀번호를 모두 입력하세요.');
        if(user===owner) throw new Error('열기 비밀번호와 소유자 비밀번호는 다르게 설정하세요.');
        var rp=await rasterPdf(f,'',1.6), enc={userPassword:user,ownerPassword:owner,userPermissions:[...(checked(ctx,'allowPrint')?['打印']:[]),...(checked(ctx,'allowCopy')?['复制']:[])]};
        // jsPDF's documented permission tokens are English identifiers, not translated labels.
        enc.userPermissions=[]; if(checked(ctx,'allowPrint')) enc.userPermissions.push('print'); if(checked(ctx,'allowCopy')) enc.userPermissions.push('copy');
        download(ctx,await makeImagePdf(rp,enc),'protected.pdf');
      } else if(id==='redact') {
        if(!state.marks.length) throw new Error('미리보기에서 검열 영역을 하나 이상 지정하세요.');
        var marks=state.marks.slice(), rp2=await rasterPdf(f,'',2,function(canvas,pageNo){var c=canvas.getContext('2d'); c.fillStyle='#000'; marks.filter(function(m){return m.page===pageNo;}).forEach(function(m){var sx=canvas.width/(state.canvas?state.canvas.width:canvas.width);c.fillRect(m.x*sx,m.y*sx,m.w*sx,m.h*sx);});});
        download(ctx,await makeImagePdf(rp2),'redacted.pdf');
      } else if(id==='sign') await sign(ctx,f);
      if(core.hideProgress) core.hideProgress();
    } catch(e) { if(core.hideProgress)core.hideProgress(); setResult(ctx,'<p role="alert">'+escape(e.message||'작업을 완료하지 못했습니다.')+'</p>'); notify(ctx,e.message||'작업을 완료하지 못했습니다.',true); }
  }
  async function sign(ctx,file) {
    var place=state.signaturePlacement; if(!place) throw new Error('미리보기에서 서명을 넣을 위치를 클릭하세요.');
    var mode=option(ctx,'signMode'), data=state.signature;
    if(mode==='text') { var text=ctx.optionsEl.querySelector('[name="signatureText"]').value.trim(); if(!text)throw new Error('서명할 이름을 입력하세요.'); var c=document.createElement('canvas'); c.width=700;c.height=180;var x=c.getContext('2d');x.fillStyle='#182230';x.font='italic 72px cursive';x.fillText(text,12,120);data=c.toDataURL('image/png'); }
    if(!data) throw new Error(mode==='image'?'서명 이미지를 선택하세요.':'서명을 먼저 그려 주세요.');
    var bytes=await read(file), lib=pdflib(), doc=await lib.PDFDocument.load(bytes), img;
    if(data.indexOf('image/jpeg')>=0) img=await doc.embedJpg(data); else img=await doc.embedPng(data);
    var pnum=Math.max(1,Math.min(doc.getPageCount(),place.page)), page=doc.getPage(pnum-1), size=page.getSize(), scale=size.width/place.canvasWidth, w=Math.min(size.width*.42,img.width*scale*.5), h=w*img.height/img.width;
    page.drawImage(img,{x:place.x*scale,y:size.height-place.y*scale-h,width:w,height:h});
    download(ctx,await doc.save(),'signed.pdf');
  }
  async function compare(ctx) {
    var a=fileFor(ctx,0),b=fileFor(ctx,1); if(!b)throw new Error('비교할 PDF 두 개를 추가하세요.');
    var mode=option(ctx,'compareMode'), n=Math.max(1,parseInt(option(ctx,'page')||'1',10)), da=await loadDoc(await read(a)), db=await loadDoc(await read(b));
    if(mode==='text') {
      if(n>da.numPages||n>db.numPages)throw new Error('선택한 페이지가 두 문서 모두에 있어야 합니다.');
      var ta=(await (await da.getPage(n)).getTextContent()).items.map(function(x){return x.str;}).join(' '), tb=(await (await db.getPage(n)).getTextContent()).items.map(function(x){return x.str;}).join(' ');
      var aa=ta.split(/\s+/),bb=tb.split(/\s+/),max=Math.max(aa.length,bb.length), rows=[]; for(var i=0;i<max;i++)if(aa[i]!==bb[i])rows.push({left:aa[i]||'',right:bb[i]||''});
      setResult(ctx,'<h3>텍스트 비교 · '+rows.length+'개 차이</h3><pre>'+escape(rows.length?rows.map(function(r){return '- '+r.left+'  →  '+r.right;}).join('\n'):'텍스트 차이가 없습니다.')+'</pre><button type="button" data-download-diff>차이 보고서 다운로드</button>');
      ctx.resultEl.querySelector('[data-download-diff]').addEventListener('click',function(){core.downloadBlob(new Blob([rows.map(function(r){return '- '+r.left+'  →  '+r.right;}).join('\n')],{type:'text/plain'}),'comparison.txt');});
    } else {
      if(n>da.numPages||n>db.numPages)throw new Error('선택한 페이지가 두 문서 모두에 있어야 합니다.');
      var ca=document.createElement('canvas'),cb=document.createElement('canvas'); await core.renderPageToCanvas(da,n,ca,1.5); await core.renderPageToCanvas(db,n,cb,1.5);
      var w=Math.max(ca.width,cb.width),h=Math.max(ca.height,cb.height),ia=document.createElement('canvas'),ib=document.createElement('canvas'); ia.width=ib.width=w;ia.height=ib.height=h;ia.getContext('2d').drawImage(ca,0,0);ib.getContext('2d').drawImage(cb,0,0);
      var ad=ia.getContext('2d').getImageData(0,0,w,h),bd=ib.getContext('2d').getImageData(0,0,w,h),diff=ia.getContext('2d').createImageData(w,h),count=0;
      for(var k=0;k<ad.data.length;k+=4){var d=Math.abs(ad.data[k]-bd.data[k])+Math.abs(ad.data[k+1]-bd.data[k+1])+Math.abs(ad.data[k+2]-bd.data[k+2]);if(d>70){diff.data[k]=235;diff.data[k+1]=45;diff.data[k+2]=55;diff.data[k+3]=220;count++;}else{diff.data[k]=ad.data[k];diff.data[k+1]=ad.data[k+1];diff.data[k+2]=ad.data[k+2];diff.data[k+3]=255;}}
      ia.getContext('2d').putImageData(diff,0,0); var out=document.createElement('canvas');out.width=w;out.height=h;out.getContext('2d').drawImage(ia,0,0);out.style.maxWidth='100%';out.style.height='auto';
      ctx.stageEl.replaceChildren(out); setResult(ctx,'<p>페이지 '+n+' · 차이가 감지된 픽셀 '+count.toLocaleString()+'개 (빨간색)</p><button type="button" data-dl-diff>차이 이미지 다운로드</button>');
      ctx.resultEl.querySelector('[data-dl-diff]').addEventListener('click',function(){out.toBlob(function(blob){core.downloadBlob(blob,'comparison-diff.png');});});
    }
  }
  IDS.forEach(function (id) { window.PdfToolModules[id] = { renderOptions: renderOptions, onFilesChanged: onFilesChanged, execute: execute }; });
}());
