---
title: Github SSH 연결방법
date: 2023-03-04 01:14:47
tags: [github]
category: [blog]
toc: true
---

{% asset_img github-page2.png ssh연결 %}

# 개요
GitHub 로그인을 ssh 로 설정하면 매번 로그인 할 필요없이 편하게 source 를 commit 하고 push 할수 있습니다.
GitHub 에 SSH 설정하는 방법은 아래와 같습니다. Mac 기준으로 정리한 자료 입니다. window 에서도 크게
다르지 않습니다.

# 설정방법

## SSH 키 생성 후 생성된 키를 클립보드에 복사합니다.
- 터미널을 오픈한 상태에서 ssh-keygen 명령어를 실행합니다. 기본값설정을 위해 엔터 엔터를 입력합니다.
```shell
ssh-keygen -t rsa -b 2048 -f ~/.ssh/coffeeman4.github.io_key
```
```shell
Generating public/private rsa key pair.
Enter passphrase (empty for no passphrase):
Enter same passphrase again: 
Your identification has been saved in /Users/gosu/.ssh/coffeeman4.github.io_key
Your public key has been saved in /Users/gosu/.ssh/coffeeman4.github.io_key.pub
The key fingerprint is:
SHA256:wKbrNl+/z1qW+YsdfasdfpK0aONBLu3lSp6yd/jGm6PehoOKqs gosu@gosuui-iMac.local
The key's randomart image is:
+---[RSA 2048]----+
|                 |
|     .           |
|      =          |
|    ooo o + .    |
|    . . S o      |
| ooo . o = o o   |
|    o.o.B + =    |
|.  ooo=*oO.= .   |
|Eo..o==BO=O=+..  |
+----[SHA256]-----+
```
- 아래와 같이  coffeeman4.github.io_key 와 coffeeman4.github.io_key.pub 가 만들어진걸 확인할수 있습니다.
```shell
ls -al ~/.ssh
-rw-------   1 gosu  staff  1831 Mar  5 00:50 coffeeman4.github.io_key
-rw-r--r--   1 gosu  staff   404 Mar  5 00:50 coffeeman4.github.io_key.pub
```
- 아래 명령어를 입력하고 pub key 값을 클립보드로 복사합니다.
```shell
cat ~/.ssh/coffeeman4.github.io_key.pub
```
{% asset_img github-page2-2.png 키값복사 %}

## github 에 ssh 키를 등록합니다.
- 깃허브에 SSH 공개키 등록을 위해 깃허브 홈페이지에 로그인을 진행하고 아래 순서되로 키를 생성합니다.
**1** 프로젝트를 선택합니다.
**2** Settings 아이콘을 클릭합니다. 
**3** Deploy Key를 선택하합니다. 
**4** Add deploy key 아이콘을 클릭합니다.
**5** coffeeman4.github.io_pub 키와 같은형태로 키를 생성합니다.
{% asset_img github-page2-3.png 키등록 %}

# ide 툴로 실습
1. code 버튼 클릭
2. Clone에 SSH 클릭
3. 복사 아이콘 클릭
{% asset_img github-page2-4.png ssh주소복사 %}

## 인텔리제이에서 clone
1. File > New > Project from Version Control... 메뉴클릭
   {% asset_img github-page2-5.png %}
2. 클립보드에 복사한 주소를 URL에 쪽에 입력한후 Clone 버튼을 클릭합니다.
   {% asset_img github-page2-6.png %}
3. index.html 파일을 아래와 같이 생성합니다.
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
첫번째 글을 등록합니다.
새로운 글을 등록합니다.
</body>
</html>
```
4. 우측 상단의 커밋 아이콘을 클릭합니다.
{% asset_img github-page2-7.png %}
5. commit 할 파일을 선택합니다.
{% asset_img github-page2-8.png %}
6. 코멘트를 작성하고 commit and push 버튼을 클릭합니다. push 가 진행됩니다.
진행시 **별도의 아이디 패스워드를 물어보지 않습니다.** 
즉 ssh 키를 통해 정상적으로 commit & push 가 완료되었습니다.
{% asset_img github-page2-9.png %}

# github 프로젝트 소스 확인
1. 6분전에 commit 한 내용을 클릭합니다.
{% asset_img github-page2-10.png %}
2. 추가한 부분이 github 에 정상 반영되었습니다.
{% asset_img github-page2-11.png %}

# github page 접속 확인
http://coffeeman4.github.io 오픈하면 추가한 부분이 적용되었음을 알수 있습니다.
{% asset_img github-page2-12.png %}

# 정리
github 에 매번 로그인하여 소스를 commit/push 하는 부분에 대한 개선이 되었고
github page 도 정상적으로 반영되었습니다. coffeeman1.github.io 는 hexo라는
정적 사이트 생성기로 만들어 졌습니다. 다음번 블로깅 할때는 hexo 사용하는 방법에 대해서
정리해 보겠습니다.
