const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function MiniCalendar() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();

  const firstWeekday = new Date(year, month, 1).getDay(); // 0=일
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="dash-card">
      <div className="dash-head">
        <span className="dash-title">{year}년 {month + 1}월</span>
        <span className="dash-sub">오늘 {today}일</span>
      </div>

      <div className="cal-grid cal-weekdays">
        {WEEKDAYS.map((w, i) => (
          <span key={w} className={`cal-wd${i === 0 ? ' cal-sun' : ''}`}>{w}</span>
        ))}
      </div>

      <div className="cal-grid">
        {cells.map((d, i) => (
          <span
            key={i}
            className={
              'cal-day' +
              (d === null ? ' cal-empty' : '') +
              (d === today ? ' cal-today' : '') +
              (d !== null && i % 7 === 0 ? ' cal-sun' : '')
            }
          >
            {d ?? ''}
          </span>
        ))}
      </div>
    </div>
  );
}
