---
title: Github Page 생성방법
date: 2023-03-04 00:30:33
tags: [github]
category: [블로그,hexo]
toc: true
---
{% asset_img github-page1.png github으로 나만의 페이지 만들기 %}

# 개요
goodsaem.github.io 사이트를 어떻게 만들었는지 기록을 남긴다.
GitHub Pages는 GitHub 에서 제공해주는 정적 웹 사이트 서비스다.

이 서비스를 사용하면 개발자는 GitHub 저장소에서 HTML,CSS 및 JavaScript 파일과 같은 정적 파일을 
업로드하여 웹페이지를 만들수 있다. 가장 큰장점은 무료로 웹사이트를 만들 수 있다는 부분이며, 개발자가
손쉽게 git 명령어를 통해 페이지를 등록/수정/삭제를 할수 있다는 점이다. 

아직 github 계정이 없다면 아래링크를 클릭하여 Github 계정 생성부터 진행 한다.
[Github 계정생성](/2023/03/02/blog/github-regist "Github 계정생성")


# 생성순서
계정생성이 다 끝난상태에서 아래 순서되로 github page 생성을 진행한다.
> 본글에서는 coffeeman4 라는 github 계정을 만들어서 github page 만드는 작업을 진행했다.

- '+' 아이콘을 클릭하여 New repository 메뉴를 선택
  {% asset_img github_create_repository.png newRepository %}

## 아래 순서대로 repository 생성 진행
1. Repository name 에 계정이름과 동일한 아래 그림에서는 계정이 coffeeman4 이므로 'coffeeman4.github.io' 입력
2. Add a README file 에 체크
3. Create repository 버튼을 클릭하여 repository 생성
   {% asset_img github17.png 생성방법 %}

# 정리
여기까지 진행하면 아래와 같은 내용을 확인할수 있다. 아직 coffeman4.github.io로 접속하면 
404 에러가 발생하는데 아래 링크를 통해 hexo로 블로그 만드는 방법에 대해서 확인해 보자.

[Github 계정생성](/2023/03/02/blog/github-regist "무료로 hexo 블로그 만들기")

{% asset_img github18.png newRepository %}
