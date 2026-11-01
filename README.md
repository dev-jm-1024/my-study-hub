# My Study Hub

백엔드 개발을 공부하면서 정리한 기록을 모아둔 곳입니다.

책을 읽거나 강의를 듣고 나면 노트는 남는데, 정작 필요할 때는 어디에 뒀는지 몰라 다시 찾아 헤매게 됩니다. 그래서 정리한 PDF를 주제별로 묶어 한 곳에서 바로 꺼내볼 수 있게 만들었습니다. 함께 읽은 책과 실습 코드 저장소도 같이 걸어뒀습니다.

현재 **18개 주제에 문서 102건**이 올라가 있습니다. (그중 1건은 작성 예정)

---

## 무엇을 공부했나

### 프로그래밍

**Java — 26건**

가장 많이 쌓인 주제입니다. 크게 여섯 갈래로 정리했습니다.

- **모던 자바** — 자바의 역사(8~11)부터 동작 파라미터화, 람다 표현식, 스트림(소개 · 활용 · 데이터 수집 · 병렬 처리), 개선된 컬렉션 API, `Optional`, 날짜/시간 API, 디폴트 메소드까지. 『모던 자바 인 액션』의 챕터 구성을 따라갑니다.
- **GC 4부작** — GC 선택이 왜 중요한지에서 시작해, 세대별 수집의 등장 배경, Serial부터 ZGC까지의 계보, G1의 동작 방식.
- **가상 스레드 4부작** — Thread/Executor/Future 복습, Platform Thread와의 차이(속도가 아니라 규모), 생성하는 세 가지 방법, 기존 Thread API와의 비교.
- **JVM 3부작** — JVM이라는 추상 기계와 바이트코드, 클래스 로더 서브시스템과 부모 위임 모델, 런타임 데이터 영역과 실행 엔진.
- **컬렉션 3부작** — 컬렉션 프레임워크란 무엇인가, 핵심 인터페이스의 계약과 주의사항, 구현체 선택 기준.
- **Core** — `Object`의 `equals`·`hashCode` 계약. 동치관계 5조건과 `HashMap` 조회 순서, 흔한 실수.

**Kotlin — 2건**
변수·함수·조건문·반복문 등 기본 문법, 그리고 초기화 지연·컬렉션·Null 처리까지.

### 프레임워크

**Spring Boot — 23건**
스프링부트 시작부터 웹 애플리케이션 개발, 데이터 작업, Spring Security, 자동 구성 속성, REST API, RestTemplate, 스케줄러, WebClient, RestClient까지. 여기에 **Filter와 Interceptor**(개념과 동작 위치, Dispatch/Forward/Redirect), **캐시**(Spring Cache의 어노테이션 기반 메소드 캐싱, Caffeine, 그리고 Caffeine이 빠른 진짜 이유인 Window TinyLFU), **재시도**(Spring Framework 7 코어의 `@Retryable`과 `RetryTemplate`, 사용법)를 더했습니다.

**JSP — 13건**
웹 개발 환경 이해 → Servlet의 개념과 동작 → 초기화 파라미터와 데이터 공유 → JSP 문법과 내장 객체 → 응답 처리와 액션 태그 → 쿠키와 세션 → 예외 처리와 JavaBean → 오라클과 SQL → JDBC 연동 → `PreparedStatement`와 DAO/DTO → DBCP·EL·JSTL. 마지막은 배운 걸 모아 **회원관리 & 게시판을 직접 구현**한 기록 2건입니다.

### 데이터베이스

**MySQL — 6건** · 설치, 사용자 식별과 권한·역할, 내부/외부 조인, 트랜잭션, 인덱스, 데이터 암호화(TDE).
**QueryDSL — 3건** · Q-Type 클래스가 생성되는 원리와 컴파일 타임 타입 안정성, 기본 쿼리 문법, 동적 쿼리를 위한 `BooleanExpression` 조합 패턴.
**MongoDB — 1건** · 기초 개념과 설치.

### 인프라

**Linux — 6건** · 기본 명령어, 파일 시스템, 사용자 권한, 네트워크 설정, `systemctl` 서비스 관리, 쉘 스크립트.
**Kafka — 2건** · 대용량 이벤트 스트리밍 플랫폼의 개념과 구조, 그리고 RabbitMQ·Redis와 뭐가 다른지.
**Network — 2건** · 네트워크 기본 개념과 장치, 프로토콜, OSI 7계층, 그리고 HTTP 기초(클라이언트·서버, URI, 메소드와 상태 코드).
**Web Server — 1건** · Nginx와 Apache의 구조·동작 방식 비교.
**Docker — 2건** · 서버·하이퍼바이저 가상화와 컨테이너 가상화의 차이, Docker의 Client-Server 구조와 컨테이너 엔진·런타임, 컨테이너 실행과 삭제.

### 아키텍처

**API — 6건** · API란 무엇인가에서 시작해 REST, GraphQL, gRPC, SOAP, WebSocket까지 통신 방식을 훑었습니다.
**OOP — 4건** · 절차지향과 객체지향의 차이(TDA 원칙과 책임 중심 설계), VO/DTO/DAO/Entity의 본질과 올바른 활용, 데이터가 아닌 행동 중심 설계와 덕 타이핑, 그리고 SOLID.
**소프트웨어 아키텍처 — 1건** · 아키텍처의 네 가지 차원, 아키텍처와 설계의 차이, 트레이드오프.
**대규모 시스템 설계 — 2건** · 사용자 수에 따른 규모 확장성(단일 서버에서 로드밸런서·캐시·CDN·샤딩까지)과 DNS 조회 과정·캐시·레코드.

### 테스팅

**JUnit — 1건** · 단위 테스트란 무엇인가.
**예외처리 핸드북** · 프로젝트에서 만난 예외와 해결법을 기록할 자리입니다. 아직 준비 중입니다.

---

## 함께 읽은 책

사이트의 추천 도서 페이지에 23권을 정리해뒀습니다. 위 문서들의 바탕이 된 책들입니다. (사이트의 분류 태그 기준이며, 여러 태그가 붙은 책은 첫 태그에만 적었습니다.)

| 분류 | 책 |
|---|---|
| Java & Spring | 모던 자바 인 액션 · 자바 성능 튜닝 이야기 · 자바/스프링 개발자를 위한 실용주의 프로그래밍 · Spring in Action 제5판 · 자바와 JUnit을 활용한 실용주의 단위 테스트 · 이것이 Spring AI다 |
| Architecture | 가상 면접 사례로 배우는 대규모 시스템 설계 기초 · 헤드 퍼스트 소프트웨어 아키텍처 · 객체지향의 사실과 오해 · 오브젝트 · 클린 아키텍처 |
| Data & Infra | Real MySQL 8.0 (1권) · MongoDB 완벽 가이드 · 혼자 공부하는 SQL · 아파치 카프카 애플리케이션 프로그래밍 with 자바 · 개발자를 위한 쉬운 도커 |
| CS | 혼자 공부하는 네트워크 · HTTP 완벽 가이드 · 면접을 위한 CS 전공지식 노트 · 혼자 공부하는 컴퓨터 구조+운영체제 |
| Career | 요즘 우아한 개발 · 주니어 백엔드 개발자가 반드시 알아야 할 실무 지식 |
| AI | 핸즈온 머신러닝 3판 |

## 실습 코드

문서로만 남기지 않고 직접 짜본 것들입니다.

- [modern-java](https://github.com/dev-jm-1024/modern-java) — Modern Java 학습 실습 코드
- [JMS-study](https://github.com/dev-jm-1024/JMS-study) — JMS를 이용한 채팅 구현
- [jsp-study](https://github.com/dev-jm-1024/jsp-study) — JSP 공부

## 만들어본 것들

공부 외에 직접 만든 프로젝트도 사이트에 함께 올려뒀습니다. 인스타그램 데이터 분석 도구, 맥에서 윈도우 호환 ZIP을 만드는 `mzip`, 노치에서 펼쳐지는 런처 독 `ddock`, 그리고 이 사이트 자체입니다.

---

## 사이트 이용

- **검색** — `⌘K` 또는 `Ctrl+K`로 어디서든 검색창을 엽니다. 카테고리뿐 아니라 개별 문서 제목까지 찾아지고, "자바"·"스프링"처럼 한글로 검색해도 잡힙니다.
- **미리보기** — 목록의 눈 아이콘을 누르면 내려받지 않고 바로 열어볼 수 있습니다.
- **다크 모드** — 상단에서 전환하며, 선택은 브라우저에 저장됩니다.
- 모바일에서도 볼 수 있게 반응형으로 맞춰뒀습니다.

---

## 기술적인 부분

공부 기록이 주인 저장소라 사이트 자체는 단순하게 만들었습니다. 서버 사이드 로직 없는 React SPA 한 덩어리이고, 문서 목록은 전부 TypeScript 상수 파일에 들어 있습니다. **PDF 실물은 이 저장소에 없고** 별도 저장소(`study-doc-hub`)에 올려둔 뒤 링크만 관리합니다.

`main`에 push하면 GitHub Actions가 Docker 이미지를 빌드해 Docker Hub에 올리고, Netlify가 별도로 사이트를 재배포합니다.

<details>
<summary><b>자료를 추가할 때</b></summary>

대부분 `my-study-app/src/data/` 아래 파일만 고치면 되고, 문서 수·검색 인덱스·페이지 분할은 자동으로 따라옵니다.

| 하고 싶은 것 | 고칠 파일 |
|---|---|
| PDF 문서 추가 | `pdfs.ts` — 해당 카테고리 배열에 `{ icon, title, description, pdfUrl }` 추가 |
| 카테고리 신설 | `menus.ts` + `pdfs.ts` + `topics.ts`(배지·설명·한글 별칭) + `styles/home-sections.css`에 `.t-<key> { --t: 색상 }` |
| 카테고리 공지 | `notices.ts` — 키가 없으면 공지 영역 자체가 안 뜸 |
| 추천 도서 | `books.ts` (`tags`가 필터 칩과 매칭) |
| 실습 코드 링크 | `repos.ts` |
| 만든 프로젝트 | `vibe.projects.json` |

**놓치기 쉬운 것**

- GitHub PDF 링크는 반드시 **raw 형식**으로. 브라우저에서 복사한 `github.com/.../blob/...`은 뷰어 페이지라 다운로드가 안 됩니다.
- 한 카테고리에 여러 시리즈가 섞이면 제목 번호가 충돌합니다. `GC - 1.`, `JVM - 2.`, `컬렉션 - 0.`처럼 시리즈 접두사를 붙입니다. (원서 챕터 번호는 결번이 있어도 그대로 둡니다.)
- `pdfUrl`을 비워두면 "준비 중" 항목이 됩니다.
- 새 PDF 호스트를 쓰면 `nginx.conf`의 CSP `connect-src`에도 추가해야 합니다.

</details>

<details>
<summary><b>저장소 구조</b></summary>

```
pdf-center/
├─ my-study-app/               ← 실제 배포되는 React 앱
│  └─ src/
│     ├─ data/                 문서·도서·레포·공지 등 모든 콘텐츠
│     ├─ pages/                Home, Download, Books, GitHub, Vibe, 404
│     ├─ components/           Navbar, Sidebar, CommandPalette, PdfPreview 등
│     ├─ hooks/ utils/ types/
│     └─ styles/               index.css가 순서대로 import (responsive.css는 반드시 마지막)
├─ src/main/resources/static/  레거시 정적 사이트 — 배포되지 않음
├─ static-react/               빌드 산출물 (gitignore)
└─ Dockerfile · nginx.conf · netlify.toml
```

`build.gradle.kts`와 `src/main/java/`의 Spring Boot 스캐폴드, `src/main/resources/static/`의 Vanilla JS 사이트는 React로 옮기기 전의 흔적이라 현재 배포에 관여하지 않습니다. 다만 레거시 쪽 `css/common/`과 `css/components/`는 React 앱이 그대로 `@import`해서 쓰므로 **지우면 안 됩니다.**

```bash
cd my-study-app
npm install
npm run dev     # http://localhost:3000
npm run build   # 타입 체크 포함 — push 전 검증용
```

</details>
