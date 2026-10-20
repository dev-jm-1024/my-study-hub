/* 화면을 덮는 층이 열려 있는지 — 열린 동안 뒤에서 혼자 움직이는 것(홈 셸프 흐름)이 멈추게 알린다.
   덮개 블러 밑 배경이 매 프레임 바뀌면 전체 화면 블러를 매 프레임 다시 그린다 (Ch9 검수 R7).
   - 층: 스크롤을 잠그는 모달 전부(서랍·햄버거 메뉴·미리보기 시트·검색 팔레트 — scrollLock이 건다) + 데스크톱 드롭다운(useNavMenu)
   - 층은 겹쳐 열 수 있다(드롭다운을 연 채 검색 팔레트) — 세어서, 첫 층이 열릴 때와 마지막 층이 닫힐 때만 알린다 */

let open = 0;
const listeners = new Set<() => void>();

const emit = () => {
  for (const fn of [...listeners]) fn();
};

/** 층 하나가 열렸다고 알리고, 닫혔다고 알리는 함수를 돌려준다. 닫는 함수는 여러 번 불려도 한 번만 센다 */
export function addOverlay(): () => void {
  let done = false;
  if (open++ === 0) emit();
  return () => {
    if (done) return;
    done = true;
    if (--open === 0) emit();
  };
}

/** 지금 덮는 층이 하나라도 열려 있는지 */
export const isOverlayOpen = () => open > 0;

/** 열림 여부가 바뀔 때마다 부른다. 구독을 푸는 함수를 돌려준다 */
export function subscribeOverlay(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}
