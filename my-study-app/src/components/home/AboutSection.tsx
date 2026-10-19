import { useMemo } from 'react';
import { MiniCalendar } from '../MiniCalendar';
import { ProfileCard } from '../ProfileCard';
import { uploadDaysInMonth } from '../../utils/home';

/** 홈 하단 '기록하는 사람.' — 프로필 타일 + 이번 달 달력 타일(문서를 올린 날에 점) */
export function AboutSection() {
  // '오늘'은 한 번만 만들어 달력의 달·오늘 강조·점 계산이 같은 날짜를 보게 한다
  const today = useMemo(() => new Date(), []);
  const uploadDays = useMemo(
    () => uploadDaysInMonth(today.getFullYear(), today.getMonth() + 1, today),
    [today],
  );

  return (
    <section className="home-block" aria-labelledby="about-h">
      <div className="home-block-head">
        <h2 className="home-block-title" id="about-h">기록하는 사람.</h2>
      </div>

      <div className="about-grid">
        <ProfileCard />
        <MiniCalendar today={today} uploadDays={uploadDays} />
      </div>
    </section>
  );
}
