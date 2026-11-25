# 작업 규칙

- 서버·애플리케이션은 기본적으로 에이전트가 임의로 시작·중지·재시작하지 않는다.
- 사용자가 시작, 실행, 중지 또는 재시작을 명시적으로 요청한 경우 해당 요청 범위에서 에이전트가 수행할 수 있다.
- 실행에 필요한 코드 변경, 의존성 설치, 설정 및 빌드는 수행할 수 있다.
- Git 커밋·푸시 및 원격 저장소(GitHub/GitLab) 작업 시 프로젝트 루트의 `.env` 파일에 정의된 토큰(`GH_TOKEN`, `GITLAB_TOKEN` 등)을 로드해 인증에 사용한다. (토큰 값은 출력하거나 커밋하지 않으며, 푸시 시 `credential.helper`를 재정의해 `.env` 토큰으로 인증한다.)
  - **원격 저장소 / 브랜치**: `github-pages` / `main`
  - **커밋 및 푸시 명령** (기존 시스템 `credential.helper` 충돌 방지를 위해 `-c credential.helper=`로 초기화 후 주입):
    ```bash
    git status -sb
    git add -A && git commit -m "feat: 변경 내용 요약"
    TOKEN="$(sed -n 's/^GH_TOKEN=//p' .env | tr -d '\r' | sed -e 's/^["'\'']//;s/["'\'']$//')"
    GIT_PUSH_TOKEN="$TOKEN" git -c credential.helper= -c 'credential.helper=!f() { echo "username=x-access-token"; echo "password=$GIT_PUSH_TOKEN"; }; f' push github-pages main
    ```
