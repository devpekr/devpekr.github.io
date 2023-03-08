---
title: 무료로 hexo 블로그 만들기
date: 2023-03-01 23:11:03
tags: [blog]
category: [blog]
---
{% asset_img img1.png hex이미지 %}

## 개요

정적 웹사이트 생성기 hexo를 이용해서 블로그를 만든후 github page까지 반영하는 방법에 대해서 알아보자.
커피맨 블로그를 만들면서 작업했던 내용들을 정리했고. 차근차근 따라서 진행하면 coffeeman1.github.io와
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

## 블로그 꾸미기

