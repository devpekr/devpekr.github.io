'use strict';

const path = require('path');
const fs = require('fs');

hexo.extend.tag.register('fa_all_free_class', function() {
    const dataPath = path.join(hexo.source_dir, '_data', 'fa-classes.json');
    let classes = [];

    try {
        classes = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    } catch (e) {
        return '<p>아이콘 클래스 데이터 로딩 실패</p>';
    }

    // 아이콘명 추출: ex) "fa-classic fa-solid fa-camera fa-fw" → camera
    function getIconName(cls) {
        const parts = cls.split(' ');
        // 'fa-' 로 시작하는 클래스 중, fa-solid/fa-regular/fa-brands 제외하고 나머지 첫번째 찾기
        for (const p of parts) {
            if (p.startsWith('fa-') && !['fa-solid','fa-regular','fa-brands','fa-fw','fa-classic'].includes(p)) {
                return p.slice(3);
            }
        }
        return 'unknown';
    }

    // HTML 생성
    const htmlIcons = classes.map(cls => {
        const iconName = getIconName(cls);
        const style = 'margin:12px; font-size:36px; cursor:pointer; text-align:center; user-select:none;';

        return `
      <div class="fa-icon-wrapper" style="display:inline-block; width:90px; text-align:center;">
        <i class="${cls}" style="${style}" data-icon-name="${iconName}"></i>
        <div style="font-size:12px; margin-top:6px; word-break: break-word;">${iconName}</div>
      </div>
    `;
    });

    // 복사 스크립트 포함 (한 번만 넣으면 되지만 간단하게 여기 넣음)
    const script = `
    <script>
      document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.fa-icon-wrapper i').forEach(el => {
          el.addEventListener('click', () => {
            const iconName = el.getAttribute('data-icon-name');
            const text = '{% fa ' + iconName + ' %}';
            navigator.clipboard.writeText(text).then(() => {
              alert('복사됨: ' + text);
            }).catch(() => {
              alert('복사에 실패했습니다.');
            });
          });
        });
      });
    </script>
  `;

    return `<div style="display:flex; flex-wrap:wrap; gap:10px;">${htmlIcons.join('')}</div>${script}`;
}, { ends: false });
