# 🚀 TalleMalle Docker Deployment Guide

이 문서는 TalleMalle 프로젝트를 리눅스 서버에서 Docker Compose를 사용해 쉽고 안전하게 배포하기 위한 안내서입니다.

---

## 📂 프로젝트 구조
```text
TalleMalle/
├── backend/            # Spring Boot / API 서버
├── frontend/           # React / Vite 클라이언트
└── docker/             # Docker 설정 파일 및 실행 디렉토리 (현재 위치)
    ├── docker-compose.yml
    └── .env (사용자 생성 필요)
```

---

## 🛠️ 사전 준비 (Prerequisites)
1. **Docker & Docker Compose** 설치 완료
2. **Git** 설치 완료 및 프로젝트 클론 (`git clone`)

---

## ⚙️ 환경 설정 (.env 세팅)

안정적인 실행을 위해 각 서비스에 필요한 환경 변수 파일(`.env`)을 생성해야 합니다.

### 1️⃣ Docker 전역 설정 (`docker/.env`)
`docker` 폴더 내에 `.env` 파일을 생성하고 다음 내용을 입력하세요. (서버의 실제 IP 또는 도메인을 적어주세요.)
```bash
# DB 설정
DB_ROOT_PASSWORD=your_secure_password
DB_NAME=tallemalle

# Frontend API 연결 설정 (Vite 빌드 시 사용)
# 로컬 테스트 시에는 http://localhost:8080
# 서버 배포 시에는 http://<SERVER_IP>:8080
VITE_API_BASE_URL=http://<YOUR_SERVER_IP>:8080
VITE_WS_URL=ws://<YOUR_SERVER_IP>:8080/ws
```

### 2️⃣ 백엔드 설정 (`backend/.env`)
`backend` 폴더 내에 `.env` 파일을 생성하고 애플리케이션에 필요한 환경 변수를 설정하세요.
```bash
# 예시 (프로젝트 사양에 맞게 수정)
DB_URL=jdbc:mariadb://db:3306/tallemalle
DB_USERNAME=root
DB_PASSWORD=your_secure_password
```

### 3️⃣ 프론트엔드 설정 (`frontend/.env`)
`frontend` 폴더 내에 `.env` 파일을 생성하세요. (Docker Compose 실행 시 `args`로 전달되지만, 로컬 개발 시 필요할 수 있습니다.)
```bash
VITE_API_BASE_URL=http://<YOUR_SERVER_IP>:8080
VITE_WS_URL=ws://<YOUR_SERVER_IP>:8080/ws
```

---

## 🚀 실행 방법 (How to Run)

1. **`docker` 디렉토리로 이동**
   ```bash
   cd docker
   ```

2. **컨테이너 빌드 및 실행**
   ```bash
   docker compose up -d --build
   ```

3. **상태 확인**
   ```bash
   docker compose ps
   ```

---

## 📝 주요 보안 및 개선 사항
- **보안 강화**: 비밀번호를 `docker-compose.yml`에서 직접 노출하지 않고 `.env` 파일로 관리합니다.
- **데이터 안정성**: DB 데이터를 호스트 폴더 대신 **Named Volume (`db_data`)**으로 관리하여 리눅스 권한 이슈를 방지하고 데이터를 보호합니다.
- **순차 실행 (Healthcheck)**: DB가 완전히 초기화되어 연결을 받을 준비가 된 후에 백엔드 서버가 시작되도록 로직을 개선했습니다.
- **자동 재시작**: 서버 재부팅 시에도 컨테이너가 자동으로 다시 실행되도록 `restart: always`를 적용했습니다.

---

## ⚠️ 주의 사항
- `docker/.env` 파일은 민감한 정보를 포함하고 있으므로 **절대로 Git에 커밋하지 마세요.**
- 서버 배포 시 80(Front), 8080(Back), 3306(DB) 포트가 방화벽에서 열려있는지 확인하세요.
