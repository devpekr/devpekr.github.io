---
title: Github Page 생성방법
date: 2023-03-04 00:30:33
tags: [github]
category: [blog]
toc: true
---
{% asset_img github-page1.png github으로 나만의 페이지 만들기 %}

# 개요
2023년 3월4일 기준 coffeeman1.github.io 사이트를 어떻게 만들었는지 기록 남깁니다.
GitHub Pages는 GitHub 에서 제공해주는 정적 웹 사이트 서비스입니다. 이 서비스를 사용하면 개발자는 GitHub 
저장소에서 HTML,CSS 및 JavaScript 파일과 같은 정적 파일을 업로드하여 웹페이지를 만들수 있습니다.
가장 큰장점은 무료로 웹사이트를 만들 수 있다는 부분이며, 개발자가 손쉽게 git 명령어를 통해 페이지를 
등록/수정/삭제를 할수 있습니다. 

> 도메인 주소를 coffeeman.github.io로 하고 싶었지만 누군가 사용하고 있어 coffeeman중에서는 1등이라는
> 의미로 coffeeman1.github.io 도메인을 만들었습니다.

아직 github 계정이 없다면 아래 Github 계정생성 페이지를 참고해서 계정 생성 바랍니다.
[Github 계정생성](/2023/03/02/blog/github-regist "Github 계정생성")


# 생성순서
- '+' 아이콘을 클릭하여 New repository 메뉴를 선택합니다.
  {% asset_img github_create_repository.png newRepository %}

- 아래 순서대로 repository 생성을 진행합니다.
    1. Repository name 에 계정이름과 동일한 아래 그림에서는 계정이 coffeeman4 이므로 'coffeeman4.github.io' 를 입력합니다.
    2. Add a README file 에 체크를 진행합니다.
    3. Create repository 버튼을 클릭하여 repository 생성을 완료합니다.
       {% asset_img github17.png 생성방법 %}

# 정리
여기까지 진행하시면 아래와 같은 내용을 확인하실수 있습니다. 아직 coffeman4.github.io로 접속하면 404 에러가 발생합니다.
git을 통해서 index.html을 추가하는 방법은 따로 정리하겠습니다.

{% asset_img github18.png newRepository %}
