import { useState, useEffect } from 'react';

const WEEK = ['일', '월', '화', '수', '목', '금', '토'];
const pad = (n: number) => String(n).padStart(2, '0');

export function Clock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const dateStr = `${now.getMonth() + 1}월 ${now.getDate()}일 (${WEEK[now.getDay()]})`;

  return (
    <div className="dash-card clock-card">
      <div className="dash-head">
        <span className="dash-title">현재 시각</span>
        <span className="dash-sub">{dateStr}</span>
      </div>
      <div className="clock-time">
        <span className="clock-hm">{pad(now.getHours())}:{pad(now.getMinutes())}</span>
        <span className="clock-sec">{pad(now.getSeconds())}</span>
      </div>
    </div>
  );
}
