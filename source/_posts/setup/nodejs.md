---
title: mac 환경에서 node.js 설치하기 
date: 2023-03-27 20:34:00
tags: [node.js]
category: [설치,node.js]
toc: true
---

{% asset_img nodejs-001.png %}

### {% fa cloud %} Mac에서 Node.js를 설치하는 방법
1. Node.js 공식 웹사이트(nodejs.org)에 접속한다.
2. "Downloads" 메뉴를 클릭한다.
3. 현재 버전의 Node.js 설치 파일을 다운로드한다. (macOS용 다운로드 링크: https://nodejs.org/en/download/)
4. 다운로드 받은 설치 파일을 더블클릭하여 설치를 시작
5. 설치 과정에서 라이선스 동의, 설치 경로 선택 등의 항목을 설정함
6. 설치가 완료되면 터미널을 열어 node -v 명령어를 입력하여 Node.js가 정상적으로 설치되었는지 확인함.

Node.js를 설치할 때 함께 설치되는 npm(Node Package Manager)은 Node.js 패키지를 관리하는 도구임.
따라서 Node.js를 설치하면 npm도 함께 설치됨.


```shell
node -v
v16.14.0
```

