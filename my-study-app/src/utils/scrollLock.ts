/* 모달이 열린 동안 뒤 화면 스크롤 잠금 — 서랍·햄버거 메뉴·미리보기 시트·검색 팔레트가 함께 쓴다.
   - html·body 둘 다 잠근다: base.css의 html { overflow-x: clip } 때문에 body의 overflow는 화면 스크롤로 전파되지 않는다
   - html { scrollbar-gutter: stable }이 스크롤바 자리를 지켜, 잠가도 화면 폭이 그대로다(View Transition이 취소되지 않는다)
   - 잠금은 겹쳐 걸 수 있다(서랍 위에 검색 팔레트). 마지막 잠금이 풀릴 때 원래 inline 값을 되돌린다
   - 잠근 순서 = 모달이 쌓인 순서. 맨 위 층만 키(Esc·Tab)를 받게 할 때 isTopLock으로 묻는다 */

const locks: (() => void)[] = [];
let saved: { el: HTMLElement; x: string; y: string }[] = [];

/** 잠그고, 푸는 함수를 돌려준다. 푸는 함수는 여러 번 불려도 한 번만 푼다 */
export function lockScroll(): () => void {
  if (locks.length === 0) {
    saved = [document.documentElement, document.body].map(el => {
      const entry = { el, x: el.style.overflowX, y: el.style.overflowY };
      el.style.overflow = 'hidden';
      return entry;
    });
  }

  const release = () => {
    const at = locks.indexOf(release);
    if (at < 0) return;
    locks.splice(at, 1);
    if (locks.length > 0) return;
    for (const { el, x, y } of saved) {
      el.style.overflowX = x;
      el.style.overflowY = y;
    }
    saved = [];
  };
  locks.push(release);
  return release;
}

/** release가 가장 나중에 건(맨 위 층의) 잠금인지 */
export function isTopLock(release: () => void): boolean {
  return locks[locks.length - 1] === release;
}
