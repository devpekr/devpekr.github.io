const https = require('https');
const fs = require('fs');

const year = 2025;
const countryCode = 'KR';

function fetchHolidays() {
    return new Promise((resolve, reject) => {
        const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => (data += chunk));
            res.on('end', () => {
                try {
                    const holidays = JSON.parse(data);
                    // holidays는 배열 [{date: "2025-01-01", localName: "신정", ...}, ...]
                    resolve(holidays);
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', err => reject(err));
    });
}

function generateCalendar(holidays) {
    const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];

    let html = '<style>\n' +
        '.calendar {border-collapse: collapse; width: 100%; margin-bottom: 2em;}\n' +
        '.calendar th, .calendar td {border: 1px solid #ccc; text-align: center; padding: 6px;}\n' +
        '.calendar td[title] {cursor: help;}\n' +
        '.holiday {background-color: #fcc; font-weight: bold;}\n' +
        '.sat {color: blue;}\n' +
        '.sun {color: red;}\n' +
        '</style>\n';

    html += '<table class="calendar">\n';

    for (let month = 0; month < 12; month++) {
        html += `<tr><td colspan="7" style="text-align:center; font-weight:bold; background:#eee;">${month + 1}월</td></tr>\n`;

        // 요일 헤더
        html += '<tr>';
        daysOfWeek.forEach(d => html += `<th>${d}</th>`);
        html += '</tr>\n';

        // **UTC 기준 1일 요일 계산**
        const firstDateUTC = new Date(Date.UTC(year, month, 1));
        const firstDay    = firstDateUTC.getUTCDay();
        const lastDate    = new Date(Date.UTC(year, month + 1, 0)); // UTC 기준 말일
        const lastDay     = lastDate.getUTCDate();

        let day = 1;
        let done = false;

        while (!done) {
            html += '<tr>';
            for (let i = 0; i < 7; i++) {
                if (day === 1 && i < firstDay) {
                    html += '<td></td>';
                    continue;
                }
                if (day > lastDay) {
                    html += '<td></td>';
                    done = true;
                    continue;
                }

                const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;

                const holiday = holidays.find(h => h.date === dateStr);
                const isHoliday = !!holiday;
                const holidayName = isHoliday ? holiday.localName : '';

                const classes = [
                    i === 0 ? 'sun' : '',
                    i === 6 ? 'sat' : '',
                    isHoliday ? 'holiday' : ''
                ].filter(c => c);

                let cellText = `${day}`;
                if (holidayName) cellText += `<br><small>${holidayName}</small>`;

                html += `<td class="${classes.join(' ')}" title="${holidayName}">${cellText}</td>`;
                day++;
            }
            html += '</tr>\n';
        }
    }

    html += '</table>\n';
    return html;
}

(async () => {
    try {
        const holidays = await fetchHolidays();

        const calendarHtml = generateCalendar(holidays);

        const content =
            `---
title: 2025년 달력 및 공휴일 (Nager.Date API)
date: 2025-07-04 22:57:40
---

${calendarHtml}
`;

        fs.writeFileSync('./source/_posts/2025_calendar.md', content, 'utf8');
        console.log('✅ 2025년 달력 파일 생성 완료: source/_posts/2025_calendar.md');
    } catch (e) {
        console.error('❌ 공휴일 API 호출 실패:', e);
    }
})();
