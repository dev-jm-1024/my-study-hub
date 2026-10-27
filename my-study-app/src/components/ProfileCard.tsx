import type { CSSProperties } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { siVelog } from 'simple-icons';
import { LINKS } from '../constants';
import { NewTabHint } from './NewTabHint';

/* 홈 '기록하는 사람.' 왼쪽 타일 — 타일 바탕·여백은 home-about.css의 .about-tile */

/** 이미지 한 변(px) — 보이는 크기는 CSS(--profile-img)가 정하고, 이 값은 레이아웃이 흔들리지 않게 미리 알려 주는 용도 */
const AVATAR_SIZE = 64;
/** ↗ 크기(px) — 버튼 글자(body 17px)에 맞춘다. 외부 링크는 전부 ↗ */
const ARROW_SIZE = 12;

interface ProfileLink {
  label: string;
  href: string;
  /** solid = 글자색 바탕, brand = 서비스 브랜드 색 바탕 */
  tone: 'solid' | 'brand';
  /** tone이 brand일 때의 브랜드 색 — CSS에는 --brand 변수로만 넘긴다 (주제 색과 같은 데이터 예외) */
  brand?: string;
}

const PROFILE_LINKS: readonly ProfileLink[] = [
  { label: 'GitHub', href: LINKS.github, tone: 'solid' },
  { label: 'Velog', href: LINKS.velog, tone: 'brand', brand: `#${siVelog.hex}` },
];

export function ProfileCard() {
  return (
    <article className="about-tile profile-card">
      <img
        className="profile-img"
        src="/profile.svg"
        alt="이재민 프로필"
        width={AVATAR_SIZE}
        height={AVATAR_SIZE}
      />
      <div>
        <h3 className="profile-name">이재민</h3>
        <p className="profile-role">BE Developer · @dev-jm-1024</p>
        <p className="profile-bio">
          책을 읽고 강의를 듣고 나면 노트는 남는데, 필요할 때 찾기 어려워 한곳에 모았습니다.
        </p>
      </div>
      <div className="profile-links">
        {PROFILE_LINKS.map(link => (
          <a
            key={link.label}
            className={`profile-btn profile-btn--${link.tone}`}
            href={link.href}
            style={link.brand ? ({ '--brand': link.brand } as CSSProperties) : undefined}
            target="_blank"
            rel="noopener noreferrer"
          >
            {link.label}
            <ArrowUpRight size={ARROW_SIZE} strokeWidth={2.4} aria-hidden="true" />
            <NewTabHint />
          </a>
        ))}
      </div>
    </article>
  );
}
