import { useId } from 'react';

/* 홈 '기록하는 사람.' 오른쪽 타일 — 이번 달 달력. 문서를 올린 날은 날짜 아래 점으로 표시한다.
   달은 today가 속한 달로 고정이다(이전·다음 달 이동 없음). 타일 바탕·여백은 home-about.css의 .about-tile.
   스크린 리더: 표(table)로 만들어 요일 머리와 칸이 연결되고, 오늘은 aria-current="date",
   올린 날은 숨은 글씨 '문서를 올린 날'로 읽힌다 — 점 자체는 장식이라 aria-hidden */

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

/** 범례 줄 뒤쪽 덩어리 — 올리는 주기의 목표 */
const UPLOAD_GOAL = '매주 일요일에 올리는 것이 목표예요';

interface MiniCalendarProps {
  /** 달력이 보여 줄 달과 '오늘'의 기준 — 호출하는 쪽이 한 번만 만든다 */
  today: Date;
  /** 그 달에 문서가 올라온 날(일) — utils/home.ts의 uploadDaysInMonth */
  uploadDays: readonly number[];
}

export function MiniCalendar({ today, uploadDays }: MiniCalendarProps) {
  const headingId = useId();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0=1월
  const date = today.getDate();

  const firstWeekday = new Date(year, month, 1).getDay(); // 0=일
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const uploaded = new Set(uploadDays);

  // 앞 빈 칸 + 날짜 + 마지막 줄 뒤 빈 칸 → 7칸씩 한 줄
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % WEEKDAYS.length !== 0) cells.push(null);
  const weeks = Array.from({ length: cells.length / WEEKDAYS.length }, (_, w) =>
    cells.slice(w * WEEKDAYS.length, (w + 1) * WEEKDAYS.length),
  );

  return (
    <article className="about-tile cal-card">
      <div className="cal-head">
        <h3 className="cal-title" id={headingId}>{year}년 {month + 1}월</h3>
        <p className="cal-today-label">오늘 {date}일 {WEEKDAYS[today.getDay()]}요일</p>
      </div>

      <table className="cal-grid" aria-labelledby={headingId}>
        <thead>
          <tr>
            {WEEKDAYS.map(w => (
              <th key={w} className="cal-wd" scope="col" aria-label={`${w}요일`}>{w}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, w) => (
            <tr key={w}>
              {week.map((d, i) =>
                d === null ? (
                  <td key={i} />
                ) : (
                  <td key={i} aria-current={d === date ? 'date' : undefined}>
                    <span className="cal-num">
                      {d}
                      {uploaded.has(d) && <span className="cal-sr">{' '}문서를 올린 날</span>}
                    </span>
                    {/* 점 자리는 모든 날짜 칸에 있다 — 올린 날만 색이 있어 줄 높이가 일정하다 */}
                    <span className={`cal-dot${uploaded.has(d) ? ' cal-dot--on' : ''}`} aria-hidden="true" />
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* 범례 줄 — 두 덩어리가 한 줄에 안 들어가면 덩어리째 아래로 내려간다 (구분 점은 줄 맨 앞에서 가려진다: home-about.css) */}
      <p className="cal-legend">
        <span className="cal-legend-row">
          <span className="cal-legend-item">
            {uploadDays.length > 0 ? (
              <>
                <span className="cal-legend-dot" aria-hidden="true" />
                문서를 올린 날
              </>
            ) : (
              '이번 달에 올린 문서가 아직 없어요'
            )}
          </span>
          <span className="cal-legend-item">{UPLOAD_GOAL}</span>
        </span>
      </p>
    </article>
  );
}
