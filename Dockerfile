# ══════════════════════════════════════════════════════════════
#  Stage 1: React 빌드
#  - my-study-app/src/index.css 가 ../../src/main/resources/static/css/ 경로를
#    참조하므로, 프로젝트 루트 구조를 /project/ 에 그대로 재현한다.
# ══════════════════════════════════════════════════════════════
FROM node:22-alpine AS builder

WORKDIR /project

# 1) CSS 의존 파일 먼저 복사 (캐시 레이어 최적화)
COPY src/main/resources/static/css/ src/main/resources/static/css/

# 2) package.json 만 먼저 복사 → npm ci (의존성 캐시)
COPY my-study-app/package*.json my-study-app/
WORKDIR /project/my-study-app
RUN npm ci

# 3) 나머지 소스 복사 후 빌드
COPY my-study-app/ .
RUN npm run build
# vite.config.ts outDir: '../static-react' → /project/static-react/

# ══════════════════════════════════════════════════════════════
#  Stage 2: Nginx 서빙
# ══════════════════════════════════════════════════════════════
FROM nginx:alpine

RUN mv /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf.bak
COPY nginx.conf /etc/nginx/conf.d/default.conf

# React 빌드 결과물 복사
COPY --from=builder /project/static-react /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
