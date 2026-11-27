(function (global) {
  'use strict';

  var STORAGE_KEY = 'devpekr.videosubtitle.draft.v1';
  var POSITIONS = {
    tl: '상단 좌', tc: '상단 중', tr: '상단 우',
    ml: '중단 좌', mc: '정중앙', mr: '중단 우',
    bl: '하단 좌', bc: '하단 중', br: '하단 우'
  };

  function createDefaultState() {
    return {
      subtitles: [],
      style: { preset: 'box-translucent', size: 'md', margin: 0.05 }
    };
  }

  function formatTime(seconds) {
    var value = Number(seconds);
    if (!Number.isFinite(value) || value < 0) value = 0;
    var tenths = Math.round(value * 10);
    var wholeSeconds = Math.floor(tenths / 10);
    var fraction = tenths % 10;
    var sec = wholeSeconds % 60;
    var totalMinutes = Math.floor(wholeSeconds / 60);
    var min = totalMinutes % 60;
    var hours = Math.floor(totalMinutes / 60);
    var pad = function (n) { return String(n).padStart(2, '0'); };
    return (hours ? pad(hours) + ':' : '') + pad(min) + ':' + pad(sec) + '.' + fraction;
  }

  function parseTimeInput(input) {
    if (typeof input !== 'string' && typeof input !== 'number') return null;
    var value = String(input).trim();
    if (!value || value.charAt(0) === '-') return null;
    var parts = value.split(':');
    if (parts.length > 3) return null;
    var secondsPart = parts.pop().replace(',', '.');
    if (!/^\d+(?:\.\d+)?$/.test(secondsPart)) return null;
    var seconds = Number(secondsPart);
    if (seconds >= 60 && parts.length > 0) return null;
    var minutes = 0;
    var hours = 0;
    if (parts.length === 1) {
      if (!/^\d+$/.test(parts[0])) return null;
      minutes = Number(parts[0]);
      if (minutes >= 60) return null;
    } else if (parts.length === 2) {
      if (!/^\d+$/.test(parts[0]) || !/^\d+$/.test(parts[1])) return null;
      hours = Number(parts[0]);
      minutes = Number(parts[1]);
      if (minutes >= 60) return null;
    }
    var result = hours * 3600 + minutes * 60 + seconds;
    return Number.isFinite(result) ? result : null;
  }

  function sortSubtitles(list) {
    return (Array.isArray(list) ? list : []).slice().sort(function (a, b) {
      return Number(a.startTime) - Number(b.startTime) || Number(a.endTime) - Number(b.endTime);
    });
  }

  function getActiveSubtitles(list, currentTime) {
    var time = Number(currentTime);
    return (Array.isArray(list) ? list : []).filter(function (item) {
      return Number(item.startTime) <= time && time <= Number(item.endTime);
    });
  }

  function detectOverlapIds(list) {
    var items = Array.isArray(list) ? list : [];
    var ids = new Set();
    for (var i = 0; i < items.length; i += 1) {
      for (var j = i + 1; j < items.length; j += 1) {
        var a = items[i];
        var b = items[j];
        if (a.position === b.position && Number(a.startTime) < Number(b.endTime) && Number(b.startTime) < Number(a.endTime)) {
          ids.add(String(a.id));
          ids.add(String(b.id));
        }
      }
    }
    return ids;
  }

  function toSrtTimestamp(seconds) {
    var ms = Math.max(0, Math.round(Number(seconds) * 1000) || 0);
    var hours = Math.floor(ms / 3600000);
    ms %= 3600000;
    var minutes = Math.floor(ms / 60000);
    ms %= 60000;
    var secs = Math.floor(ms / 1000);
    var millis = ms % 1000;
    var pad = function (n, length) { return String(n).padStart(length, '0'); };
    return pad(hours, 2) + ':' + pad(minutes, 2) + ':' + pad(secs, 2) + ',' + pad(millis, 3);
  }

  function exportSrt(list) {
    return sortSubtitles(list).map(function (item, index) {
      return (index + 1) + '\n' + toSrtTimestamp(item.startTime) + ' --> ' + toSrtTimestamp(item.endTime) + '\n' + String(item.text == null ? '' : item.text).replace(/\r\n?/g, '\n');
    }).join('\n\n');
  }

  function parseSrt(text) {
    var normalized = String(text == null ? '' : text).replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').trim();
    if (!normalized) return [];
    return normalized.split(/\n{2,}/).reduce(function (result, block, index) {
      var lines = block.split('\n');
      if (/^\d+$/.test(lines[0].trim())) lines.shift();
      var timingIndex = lines.findIndex(function (line) { return line.indexOf('-->') !== -1; });
      if (timingIndex < 0) return result;
      var timing = lines[timingIndex].match(/^\s*(\d{1,}:\d{2}:\d{2}[,.]\d{1,3})\s*-->\s*(\d{1,}:\d{2}:\d{2}[,.]\d{1,3})/);
      if (!timing) return result;
      var startTime = parseTimeInput(timing[1].replace(',', '.'));
      var endTime = parseTimeInput(timing[2].replace(',', '.'));
      if (startTime === null || endTime === null || endTime < startTime) return result;
      result.push({
        id: 'srt-' + Date.now().toString(36) + '-' + index + '-' + Math.random().toString(36).slice(2, 7),
        startTime: startTime,
        endTime: endTime,
        text: lines.slice(timingIndex + 1).join('\n'),
        position: 'bc'
      });
      return result;
    }, []);
  }

  function saveDraft(state) {
    try {
      if (!global.localStorage) return false;
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify(state || createDefaultState()));
      return true;
    } catch (error) {
      return false;
    }
  }

  function loadDraft() {
    try {
      if (!global.localStorage) return createDefaultState();
      var raw = global.localStorage.getItem(STORAGE_KEY);
      if (!raw) return createDefaultState();
      var saved = JSON.parse(raw);
      var defaults = createDefaultState();
      if (!saved || typeof saved !== 'object') return defaults;
      return {
        subtitles: Array.isArray(saved.subtitles) ? saved.subtitles.filter(function (sub) {
          return sub && Number.isFinite(Number(sub.startTime)) && Number.isFinite(Number(sub.endTime)) && typeof sub.text === 'string';
        }).map(function (sub) {
          return { id: String(sub.id || ('draft-' + Math.random().toString(36).slice(2))), startTime: Number(sub.startTime), endTime: Number(sub.endTime), text: sub.text, position: POSITIONS[sub.position] ? sub.position : 'bc' };
        }) : defaults.subtitles,
        style: Object.assign({}, defaults.style, saved.style && typeof saved.style === 'object' ? saved.style : {})
      };
    } catch (error) {
      return createDefaultState();
    }
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  global.VSubState = {
    STORAGE_KEY: STORAGE_KEY,
    POSITIONS: POSITIONS,
    createDefaultState: createDefaultState,
    formatTime: formatTime,
    parseTimeInput: parseTimeInput,
    sortSubtitles: sortSubtitles,
    getActiveSubtitles: getActiveSubtitles,
    detectOverlapIds: detectOverlapIds,
    exportSrt: exportSrt,
    parseSrt: parseSrt,
    saveDraft: saveDraft,
    loadDraft: loadDraft,
    escapeHtml: escapeHtml
  };
}(window));
