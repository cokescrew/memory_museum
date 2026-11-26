# 추억 박물관 복구본

1. ZIP 압축 해제 후 package.json이 있는 폴더를 VS Code로 열기.
2. PowerShell: `Copy-Item .env.example .env`
3. .env의 DB_PASSWORD를 실제 MySQL 비밀번호로, ADMIN_PASSWORD와 SESSION_SECRET을 원하는 안전한 값으로 변경.
4. `npm install`
5. `npm run db:init` (이미 6개 테이블이 있으면 생략 가능)
6. `npm start` → http://localhost:3000

관리자: /admin, 공식 전시품 등록 및 게시글 삭제. 공식 전시품 데이터는 별도 등록 필요. 기존 이미지 보존. 폰트 파일은 원본에 없으므로 시스템 폰트 사용. EC2에서는 환경변수와 방화벽 설정 필요. HTTPS 환경에서 COOKIE_SECURE=true 설정. 공개 배포 전 CSRF, 업로드 검증, 세션 저장소 등 보안 보강 필요.
