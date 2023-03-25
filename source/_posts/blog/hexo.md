---
title: 무료로 hexo 블로그 만들기
date: 2023-03-01 23:11:03
tags: [blog]
category: [블로그,hexo]
toc: true
---
{% asset_img img1.png hex이미지 %}

## 개요

정적 웹사이트 생성기 hexo를 이용해서 블로그를 만든후 github page까지 반영하는 방법에 대해서 알아보자.
굳쌤 블로그를 만들면서 작업했던 내용들을 정리했고. 차근차근 따라서 진행하면 goodsaem.github.io와
같은 멋진 블로그를 무료를 만들수 있다.

## 사전준비사항
준비사항은 아래와 같으며 본 블로그에 1,2,3 단계에 대해서 모두 정리해 두었으니 링크를 통해 사전준비를 끝내자.
1. [github 계정](/2023/03/02/blog/github-regist/)
2. [github page 생성](/2023/03/04/github-page1/)
3. [github ssh 연결](/2023/03/04/github-page2/)

## hexo 설치

아래 명령어를 입력하여 전역으로 hexo-cli 설치
```shell
npm install hexo-cli -g
```

아래 명령어를 입력하여 hexo blog를 생성한다.
```shell
hexo init blog
```

아래 명령어를 입력하여 hexo server 실행
```shell
cd blog
npm install
hexo server
```

http://localhost:4000/ 접속해서 아래와 같은 화면이 나오면 설치 완료

{% asset_img img.png hex설치완료 %}

## hexo 테마 적용하기

https://hexo.io/themes/ 에서 hexo 다양한 테마를 다운로드 받을수 있다.
본 블로그에서 사용하는 theme은 https://github.com/ppoffice/hexo-theme-hueman 은 이용했고 23년 3월10일 현재
가장 최근 버전은  2020년 6월 21일 릴리즈된 0.5.0 버전이다.

### 설치
설치는 https://github.com/ppoffice/hexo-theme-hueman/wiki/Installation 문서를 보고 참고함

먼저 프로젝트를 blog 폴더 아래에 themes/hueman 로 복제함
```shell
cd blog
git clone https://github.com/ppoffice/hexo-theme-hueman.git themes/hueman
```

실행결과
```shell
Cloning into 'themes/hueman'...
remote: Enumerating objects: 2277, done.
remote: Counting objects: 100% (16/16), done.
remote: Compressing objects: 100% (14/14), done.
remote: Total 2277 (delta 3), reused 11 (delta 2), pack-reused 2261
Receiving objects: 100% (2277/2277), 5.77 MiB | 6.42 MiB/s, done.
Resolving deltas: 100% (1218/1218), done.
```

blog 폴더의 _confi.yml파일에서 theme을 파일을 열어서 아래와 같이 설치한 theme명으로 수정한다

~~theme: landscape~~
```shell
... 중략 ...
# Extensions
## Plugins: https://hexo.io/plugins/
## Themes: https://hexo.io/themes/
theme: hueman
... 중략 ...
```
themes\hueman 디렉토리로 이동한후 _config.yml.example 파일일 _config.yml로 수정한다.
```shell
cd cd themes/hueman
mv _config.yml.example _config.yml
```

### 실행
상위 디렉토리로 이동한후 hexo 서버를 구동시킨다.
```shell
cd ..
cd ..
hexo server
```

실행결과
```shell
INFO  Validating config
INFO  Start processing
INFO  Hexo is running at http://localhost:4000/ . Press Ctrl+C to stop.
```
웹브라우저에서 url http://localhost:4000/ 를 입력하고 아래와 같은 그림이 나오면 성공 

{% asset_img hexo1122.png hexo테마적용완료 %}

## hexo 환경설정
블로그 환경설정을 위해  blog/_config.xml 파일을 아래와 같이 수정함.

### 사이트및 url 정보
```properties
# Site
title: 굳쌤4
subtitle: 굳쌤4번째 블로그 입니다.
description: 블로그 테스트를 위해서 환경설정한 내용입니다.
keywords:
author: coffeeman
language: ko
timezone: asia/seoul

# URL
## Set your site url here. For example, if you use GitHub Page, set url as 'https://username.github.io/project'
url: http://coffeeman4.github.io
```
### github 에 배포를 위한 deploy 정보
```properties
# Deployment
## Docs: https://hexo.io/docs/one-command-deployment
deploy:
  type: git
  repo: git@github.com:coffeeman4/coffeeman4.github.io.git
  branch: main
```

## 배포하기

### 준비물
배포를 위해 hexo-deployer-git 플러그인을 설치한다. 설치명령어는 아래와 같다.
```shell
npm install hexo-deployer-git --save
```
### 배포순서
배포는 먼저 정적인 페이지(html)를 만들고 github page 쪽으로 deploy 하는 형태로 진행한다.
```flow
st=>start: 시작
e=>end: 종료
op1=>operation: 정적인 페이지만들기
op2=>operation: 배포하기
st(right)->op1(right)->op2(right)->e(right)
```

### 정적 페이지 만들기

먼저 배포될 디렉토릴 파일을 깨끗히 정리한다.
```shell
hexo clean
```
실행결과

```shell
INFO  Validating config
INFO  Deleted database.
INFO  Deleted public folder.
```

아래 명령어를 입력하여 정적 페이지를 생성한다.
```shell
hexo generate
```
정상적으로 실행되면 아래와 같이 public 디렉토리에 블로그 구성을 필요한 파일들이 생성됨을 확인할수 있다.
```shell
INFO  Validating config
INFO  Start processing
INFO  Files loaded in 110 ms
INFO  Generated: archives/2023/index.html
INFO  Generated: archives/index.html
INFO  Generated: index.html
INFO  Generated: css/fonts/fontawesome-webfont.woff2
INFO  Generated: js/script.js
INFO  Generated: fancybox/jquery.fancybox.min.css
INFO  Generated: archives/2023/03/index.html
INFO  Generated: libs/justified-gallery/justifiedGallery.min.css
INFO  Generated: libs/font-awesome/css/font-awesome.css
INFO  Generated: css/images/logo-header.png
INFO  Generated: css/fonts/fontawesome-webfont.woff
INFO  Generated: libs/font-awesome/fonts/fontawesome-webfont.ttf
INFO  Generated: libs/titillium-web/fonts/7XUFZ5tgS-tD6QamInJTcSo_WB_cotcEMUw1LsIE8mM.woff2
INFO  Generated: libs/source-code-pro/styles.css
INFO  Generated: js/main.js
INFO  Generated: libs/source-code-pro/fonts/mrl8jkM18OlOQN8JLgasD9V_2ngZ8dMf8fLgjYEouxg.woff2
INFO  Generated: js/insight.js
INFO  Generated: libs/titillium-web/styles.css
INFO  Generated: fancybox/jquery.fancybox.min.js
INFO  Generated: css/style.css
INFO  Generated: libs/justified-gallery/jquery.justifiedGallery.min.js
INFO  Generated: css/fonts/fontawesome-webfont.eot
INFO  Generated: libs/font-awesome/css/font-awesome.min.css
INFO  Generated: js/jquery-3.4.1.min.js
INFO  Generated: css/fonts/FontAwesome.otf
INFO  Generated: css/fonts/fontawesome-webfont.ttf
INFO  Generated: css/images/opacity-10.png
INFO  Generated: css/images/s-left.png
INFO  Generated: css/images/thumb-default-small.png
INFO  Generated: libs/font-awesome/fonts/FontAwesome.otf
INFO  Generated: css/images/thumb-default.png
INFO  Generated: libs/jquery/3.5.0/jquery.min.js
INFO  Generated: libs/lightgallery/fonts/lg.svg
INFO  Generated: css/images/banner.jpg
INFO  Generated: libs/source-code-pro/fonts/mrl8jkM18OlOQN8JLgasDy2Q8seG17bfDXYR_jUsrzg.woff2
INFO  Generated: libs/titillium-web/fonts/anMUvcNT0H1YN4FII8wpr4-67659ICLY8bMrYhtePPA.woff2
INFO  Generated: libs/titillium-web/fonts/anMUvcNT0H1YN4FII8wpr9INifKjd1RJ3NxxEi9Cy2w.woff2
INFO  Generated: libs/font-awesome/fonts/fontawesome-webfont.woff
INFO  Generated: libs/font-awesome/fonts/fontawesome-webfont.eot
INFO  Generated: 2023/03/09/hello-world/index.html
INFO  Generated: libs/titillium-web/fonts/anMUvcNT0H1YN4FII8wpr46gJz9aNFrmnwBdd69aqzY.woff2
INFO  Generated: libs/lightgallery/css/lg-fb-comment-box.css
INFO  Generated: libs/titillium-web/fonts/anMUvcNT0H1YN4FII8wpr_SNRT0fZ5CX-AqRkMYgJJo.woff2
INFO  Generated: libs/lightgallery/js/lg-autoplay.js
INFO  Generated: libs/titillium-web/fonts/7XUFZ5tgS-tD6QamInJTcZSnX671uNZIV63UdXh3Mg0.woff2
INFO  Generated: libs/font-awesome/fonts/fontawesome-webfont.woff2
INFO  Generated: libs/lightgallery/img/loading.gif
INFO  Generated: libs/lightgallery/css/lg-fb-comment-box.min.css
INFO  Generated: libs/lightgallery/js/lg-fullscreen.min.js
INFO  Generated: libs/lightgallery/js/lg-pager.js
INFO  Generated: libs/lightgallery/js/lg-video.min.js
INFO  Generated: libs/lightgallery/js/lg-share.js
INFO  Generated: libs/lightgallery/js/lg-pager.min.js
INFO  Generated: libs/lightgallery/js/lg-share.min.js
INFO  Generated: libs/lightgallery/js/lg-hash.js
INFO  Generated: libs/lightgallery/js/lg-thumbnail.min.js
INFO  Generated: libs/lightgallery/js/lg-fullscreen.js
INFO  Generated: libs/lightgallery/js/lg-autoplay.min.js
INFO  Generated: libs/lightgallery/js/lg-video.js
INFO  Generated: libs/lightgallery/css/lightgallery.css
INFO  Generated: libs/lightgallery/js/lg-thumbnail.js
INFO  Generated: libs/lightgallery/js/lightgallery.js
INFO  Generated: libs/lightgallery/css/lightgallery.min.css
INFO  Generated: libs/lightgallery/js/lightgallery.min.js
INFO  Generated: libs/font-awesome/fonts/fontawesome-webfont.svg
INFO  Generated: libs/lightgallery/js/lg-zoom.min.js
INFO  Generated: libs/lightgallery/js/lg-zoom.js
INFO  Generated: libs/lightgallery/fonts/lg.ttf
INFO  Generated: libs/lightgallery/css/lg-transitions.css
INFO  Generated: libs/lightgallery/js/lg-hash.min.js
INFO  Generated: libs/lightgallery/fonts/lg.woff
INFO  Generated: libs/lightgallery/img/youtube-play.png
INFO  Generated: libs/lightgallery/img/vimeo-play.png
INFO  Generated: libs/lightgallery/css/lg-transitions.css.map
INFO  Generated: libs/lightgallery/fonts/lg.eot
INFO  Generated: libs/lightgallery/css/lg-fb-comment-box.css.map
INFO  Generated: libs/lightgallery/css/lightgallery.css.map
INFO  Generated: libs/lightgallery/img/video-play.png
INFO  Generated: libs/lightgallery/css/lg-transitions.min.css
INFO  Generated: css/fonts/fontawesome-webfont.svg
INFO  80 files generated in 314 ms
```

### 배포하기
아래 명령어를 입력하여 github page 에 배포한다.

```shell
hexo deploy
```

실행결과
```shell
INFO  Validating config
INFO  Deploying: git
INFO  Clearing .deploy_git folder...
INFO  Copying files from public folder...
INFO  Copying files from extend dirs...
[main 1ca47fb] Site updated: 2023-03-10 23:41:16
 12 files changed, 1 insertion(+), 2826 deletions(-)
 delete mode 100644 css/fonts/FontAwesome.otf
 delete mode 100644 css/fonts/fontawesome-webfont.eot
 delete mode 100644 css/fonts/fontawesome-webfont.svg
 delete mode 100644 css/fonts/fontawesome-webfont.ttf
 delete mode 100644 css/fonts/fontawesome-webfont.woff
 delete mode 100644 css/fonts/fontawesome-webfont.woff2
 delete mode 100644 css/images/banner.jpg
 delete mode 100644 fancybox/jquery.fancybox.min.css
 delete mode 100644 fancybox/jquery.fancybox.min.js
 delete mode 100644 js/jquery-3.4.1.min.js
 delete mode 100644 js/script.js
Enumerating objects: 19, done.
Counting objects: 100% (19/19), done.
Delta compression using up to 6 threads
Compressing objects: 100% (6/6), done.
Writing objects: 100% (10/10), 831 bytes | 831.00 KiB/s, done.
Total 10 (delta 2), reused 0 (delta 0), pack-reused 0
remote: Resolving deltas: 100% (2/2), completed with 2 local objects.
To github.com:coffeeman4/coffeeman4.github.io.git
   a0701c1..1ca47fb  HEAD -> main
branch 'main' set up to track 'git@github.com:coffeeman4/coffeeman4.github.io.git/main'.
INFO  Deploy done: git
```

## Github page 확인하기
여기까지 진행했다면 https://coffeeman4.github.io/ 사이트에 접속하면 아래와 같은 화면을 확인할수 있다.

{% asset_img i4.png coffeeman4.github.io %}

# 정리
좀더 좋은 컨텐츠를 만들기 노력하는 굳쌤이 되자~
