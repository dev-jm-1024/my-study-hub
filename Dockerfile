# 1️⃣ Nginx 기반의 경량 이미지 사용
FROM nginx:alpine

# 2️⃣ 기본 설정 파일 백업 (선택)
RUN mv /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf.bak

# 3️⃣ 커스텀 nginx 설정 파일 복사 (바로 아래 단계에서 만들 예정)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 4️⃣ 정적 리소스 복사
# Spring Boot 정적 리소스 기본 경로: src/main/resources/static
COPY src/main/resources/static /usr/share/nginx/html

# 5️⃣ 컨테이너 내부 포트 지정
EXPOSE 80

# 6️⃣ Nginx를 포그라운드로 실행
CMD ["nginx", "-g", "daemon off;"]
