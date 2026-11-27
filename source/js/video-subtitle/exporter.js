(function (window) {
  'use strict';

  function getAnchor(pos, width, height, marginRatio) {
    const mx = Math.round(width * marginRatio);
    const my = Math.round(height * marginRatio);
    const key = /^(t|m|b)(l|c|r)$/.test(pos || '') ? pos : 'bc';
    const vertical = key.charAt(0);
    const horizontal = key.charAt(1);
    return {
      x: horizontal === 'l' ? mx : horizontal === 'r' ? width - mx : width / 2,
      y: vertical === 't' ? my : vertical === 'b' ? height - my : height / 2,
      align: horizontal === 'l' ? 'left' : horizontal === 'r' ? 'right' : 'center',
      vAlign: vertical === 't' ? 'top' : vertical === 'b' ? 'bottom' : 'middle'
    };
  }

  function wrapTextLines(ctx, text, maxWidth) {
    const lines = [];
    String(text == null ? '' : text).split(/\r?\n/).forEach(function (sourceLine) {
      if (!sourceLine) { lines.push(''); return; }
      let line = '';
      for (let i = 0; i < sourceLine.length; i += 1) {
        const candidate = line + sourceLine.charAt(i);
        if (line && ctx.measureText(candidate).width > maxWidth) {
          const lastSpace = line.lastIndexOf(' ');
          if (lastSpace > 0) {
            lines.push(line.slice(0, lastSpace));
            line = line.slice(lastSpace + 1) + sourceLine.charAt(i);
          } else {
            lines.push(line);
            line = sourceLine.charAt(i);
          }
        } else {
          line = candidate;
        }
      }
      lines.push(line);
    });
    return lines.length ? lines : [''];
  }

  function roundedRect(ctx, x, y, width, height, radius) {
    const r = Math.max(0, Math.min(radius, width / 2, height / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  function drawSubtitles(ctx, width, height, activeList, style) {
    const settings = style || {};
    const scales = { sm: 0.035, md: 0.048, lg: 0.062, xl: 0.078 };
    const preset = settings.preset || 'box-translucent';
    const margin = Number(settings.margin) || 0.05;
    const fontSize = Math.max(16, Math.round(Math.min(width, height) * (scales[settings.size] || scales.md)));
    ctx.font = '700 ' + fontSize + 'px "Pretendard", "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
    ctx.textBaseline = 'top';
    (activeList || []).forEach(function (sub) {
      const anchor = getAnchor(sub.position, width, height, margin);
      const maxWidth = Math.round(width * (anchor.align === 'center' ? 0.86 : 0.68));
      const lines = wrapTextLines(ctx, sub.text, Math.max(1, maxWidth));
      const lineHeight = Math.round(fontSize * 1.32);
      const padX = Math.round(fontSize * 0.5);
      const padY = Math.round(fontSize * 0.28);
      const widths = lines.map(function (line) { return ctx.measureText(line).width; });
      const maxLineW = Math.max(0, ...widths);
      const blockW = Math.min(maxWidth, maxLineW);
      const totalH = lines.length * lineHeight;
      const boxW = blockW + padX * 2;
      const boxH = totalH + padY * 2;
      let boxX = anchor.align === 'left' ? anchor.x : anchor.align === 'right' ? anchor.x - boxW : anchor.x - boxW / 2;
      let startY = anchor.vAlign === 'top' ? anchor.y : anchor.vAlign === 'bottom' ? anchor.y - boxH : anchor.y - boxH / 2;
      boxX = Math.max(0, Math.min(width - boxW, boxX));
      startY = Math.max(0, Math.min(height - boxH, startY));
      if (preset !== 'outline-only') {
        roundedRect(ctx, boxX, startY, boxW, boxH, Math.round(fontSize * 0.22));
        ctx.fillStyle = preset === 'box-solid' ? 'rgba(0, 0, 0, 0.94)' : 'rgba(0, 0, 0, 0.72)';
        ctx.fill();
        if (preset === 'box-translucent') {
          ctx.lineWidth = Math.max(2, fontSize * 0.1);
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.95)';
          ctx.stroke();
        }
      }
      ctx.textAlign = anchor.align;
      ctx.textBaseline = 'top';
      if (preset === 'outline-only') {
        ctx.lineJoin = 'round';
        ctx.lineWidth = Math.max(3, fontSize * 0.16);
        ctx.strokeStyle = '#000000';
      }
      ctx.fillStyle = '#FFFFFF';
      lines.forEach(function (line, index) {
        let x = anchor.align === 'left' ? boxX + padX : anchor.align === 'right' ? boxX + boxW - padX : boxX + boxW / 2;
        const y = startY + padY + index * lineHeight;
        if (preset === 'outline-only') ctx.strokeText(line, x, y);
        ctx.fillText(line, x, y);
      });
    });
  }

  function pickMimeType() {
    if (!window.MediaRecorder || !MediaRecorder.isTypeSupported) return '';
    const types = ['video/mp4;codecs=avc1,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
    return types.find(function (type) { return MediaRecorder.isTypeSupported(type); }) || '';
  }

  function exportVideo(file, state, callbacks) {
    const cb = callbacks || {};
    let video = null;
    let objectUrl = null;
    let audioCtx = null;
    let recorder = null;
    let frameId = null;
    let settled = false;
    let aborted = false;
    let chunks = [];
    let rejectPromise;
    let resolvePromise;
    const promise = new Promise(function (resolve, reject) { resolvePromise = resolve; rejectPromise = reject; });

    function cleanup() {
      if (frameId != null) cancelAnimationFrame(frameId);
      if (video) { video.pause(); video.removeAttribute('src'); video.load(); }
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      if (audioCtx && audioCtx.state !== 'closed') audioCtx.close().catch(function () {});
    }
    function finish(error, blob) {
      if (settled) return;
      settled = true;
      cleanup();
      if (error) rejectPromise(error);
      else resolvePromise(blob);
    }
    function abort() {
      if (settled) return;
      aborted = true;
      if (video) video.pause();
      if (recorder && recorder.state !== 'inactive') {
        try { recorder.stop(); } catch (_) { finish(new Error('내보내기를 중단했습니다.')); }
      } else finish(new Error('내보내기를 중단했습니다.'));
    }
    promise.abort = abort;

    try {
      if (!file) throw new Error('내보낼 동영상 파일을 찾을 수 없습니다.');
      if (!window.MediaRecorder) throw new Error('이 브라우저는 동영상 녹화를 지원하지 않습니다.');
      video = document.createElement('video');
      video.muted = false;
      video.volume = 1;
      video.playsInline = true;
      video.preload = 'auto';
      objectUrl = URL.createObjectURL(file);
      video.src = objectUrl;
    } catch (error) { finish(error); return promise; }

    video.addEventListener('loadedmetadata', function () {
      if (settled) return;
      const width = video.videoWidth;
      const height = video.videoHeight;
      if (!width || !height || !Number.isFinite(video.duration)) { finish(new Error('동영상 정보를 읽을 수 없습니다.')); return; }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx || !canvas.captureStream) { finish(new Error('이 브라우저는 Canvas 동영상 녹화를 지원하지 않습니다.')); return; }
      const stream = canvas.captureStream(30);
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          audioCtx = new AudioCtx();
          const source = audioCtx.createMediaElementSource(video);
          const dest = audioCtx.createMediaStreamDestination();
          source.connect(dest);
          dest.stream.getAudioTracks().forEach(function (track) { stream.addTrack(track); });
        }
      } catch (_) { if (audioCtx && audioCtx.state !== 'closed') audioCtx.close().catch(function () {}); audioCtx = null; }
      const mimeType = pickMimeType();
      try { recorder = mimeType ? new MediaRecorder(stream, { mimeType: mimeType }) : new MediaRecorder(stream); }
      catch (error) { finish(error); return; }
      recorder.ondataavailable = function (event) { if (event.data && event.data.size) chunks.push(event.data); };
      recorder.onerror = function (event) { finish(event.error || new Error('동영상 녹화 중 오류가 발생했습니다.')); };
      recorder.onstop = function () {
        if (aborted) { finish(new Error('내보내기를 중단했습니다.')); return; }
        const type = recorder.mimeType || mimeType || 'video/webm';
        finish(null, new Blob(chunks, { type: type }));
      };
      video.addEventListener('ended', function () { if (recorder && recorder.state !== 'inactive') recorder.stop(); });
      function drawFrame() {
        if (settled || aborted) return;
        ctx.drawImage(video, 0, 0, width, height);
        const current = video.currentTime || 0;
        const active = window.VSubState ? window.VSubState.getActiveSubtitles(state.subtitles || [], current) : [];
        drawSubtitles(ctx, width, height, active, state.style || {});
        if (typeof cb.onProgress === 'function') cb.onProgress(video.duration ? Math.min(1, current / video.duration) : 0);
        if (!video.ended) frameId = requestAnimationFrame(drawFrame);
      }
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(function () {});
      video.currentTime = 0;
      try { recorder.start(250); } catch (error) { finish(error); return; }
      frameId = requestAnimationFrame(drawFrame);
      video.play().catch(function (error) { finish(error); });
      if (typeof cb.onStart === 'function') cb.onStart();
    }, { once: true });
    video.addEventListener('error', function () { finish(new Error('동영상 파일을 열 수 없습니다.')); }, { once: true });
    return promise;
  }

  window.VSubExporter = {
    getAnchor: getAnchor,
    wrapTextLines: wrapTextLines,
    drawSubtitles: drawSubtitles,
    pickMimeType: pickMimeType,
    exportVideo: exportVideo
  };
})(window);
