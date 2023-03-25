---
title: Windows + Vue.js 개발환경 구성
date: 2023-03-25 08:13:32
tags: [VUE]
category: [설치,VUE]
toc: true
---
# {% fa server %} vue.js 개발환경
Vue.Js Frontend 개발을 위한 환경 설정 방법에 대해서 알아 보겠습니다.

## 1. Visual Studio Code 설치
1. 설치 파일을 다운로드 합니다.
    - [https://code.visualstudio.com/docs/?dv=win](https://code.visualstudio.com/docs/?dv=win)
1. 다운로드 받은 파일을 더블 클릭하여 설치를 진행합니다.
    - {% asset_img 1.png %}
1. 동의합니다를 선택하여 [다음][다음] 을 클릭하여 설치를 완료합니다.

## 2. Visual Studio Extension 설치
vscode 에서 사용하는 vue.js 관련 유용한 플러그인을 설치합니다.

1. Vetur Extension : Vetur 플러그인은  Linting , Syntax-highlighting , Formatting등을 지원해 줍니다.
    - {% asset_img 2.png %}
1. vue peek Extention : vue콤포넌트를 통해 해당 콤포넌트 파일을 열어서 바로 수정할수 있는 기능을 지원해줍니다.
    - {% asset_img 3.png %}
1. vue 2 snippets exteion : vue 코드 자동 완성 기능을 지원해줍니다.
    - {% asset_img 4.png %}

## 2. Chrome Plug-in 설
크롬 플러그인이 설치되어 있으면 Vuex 를 사용시 컴포넌트의 상태변경을 추적할수 있으면 해당 상태 변경을 임의되로 변경하여 테스트 해볼수 있습니다.
아래 url 로 접속 하여 플러그인을 설치 합니다.
- [https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd](https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
    - {% asset_img 5.png %}

## 3. node.js 설치
[https://nodejs.org/ko/](https://nodejs.org/ko/) 사이트에 접속하신후 LTS 안정버전을 다운로드 받아서 설치를 진행합니다. 다음 다음을 클릭하여 default 로 설치합니다.
- {% asset_img 6.png %}

아래 명령어로 버전이 확인되면 정상 설치 완료된 상태 입니다.
```shell
node --version
v15.3.0
```
※ windows 한글깨짐 관련 문제는 아래 url 을 참고하세요.
- [https://blog.jiniworld.me/84](https://blog.jiniworld.me/84)

vue-cli 를 설치합니다.
```shell
npm i -g vue-cli
```
- {% asset_img 7.png %}

초기 프로젝트를 생성 합니다.
```shell
vue init webpack vstart
cd vstart
npm run dev
```
프로젝트가 정상적으로 생성되면 아래와 같은 그림을 볼수 있습니다.
- {% asset_img 8.png %}

## 마무리
개발 환경만 setup 이 진행되고 나면 이제 개발하는 일만 남았네요 다음시간부터는 좀더 좋은 컨텐츠로 찾아뵙겠습니다. 글 읽어 주셔서 감사합니다. 
