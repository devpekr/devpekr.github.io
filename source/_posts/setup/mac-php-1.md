---
title: 1/8 mac+php+mariadb+nginx+ssl 설정
date: 2023-03-25 11:15:00
tags: [PHP,MAC]
category: [설치,PHP]
toc: true
---

{% asset_img mac-php-1.png %}

# <i class="fas fa-server"></i> 1.  맥개발 환경

mac virtualbox 환경에 ubuntu 18.04.5 서버를 구축하겠습니다.   

## 1. 다운로드

아래 url 에서 다운로들 진행합니다.

[https://ubuntu.com/download/server](https://ubuntu.com/download/server) 

{% asset_img 1.jpg %}

## 2. virtualbox 에서 설치하기

새로 만들기를 클릭합니다.

{% asset_img 2.jpg %}

이름은 ubuntu 라고 입력합니다.

{% asset_img 3.jpg %}

메모리 크기는 적당하게 4G로 설정합니다.

{% asset_img 4.jpg %}

하드 디스크 만들기 새 하드디스크를 지정합니다.

{% asset_img 5.jpg %}

하드 디스크 종류는 vdi 를 선택합니다. 

{% asset_img 6.jpg %}

물리적 하드 드라이브에 저장은 동적 할당을 지정합니다.

{% asset_img 7.jpg %}

파일 및 크기 확인하고 디스크 용량은 30G 로 지정합니다.

{% asset_img 8.jpg %}

설정이 끝나면 시작 버튼을 눌러 시작합니다. 시작할때 다운로드 받은 iso 이미지를 선택합니다.

{% asset_img 9.jpg %}

키보드는 korean 으로 설정합니다.

{% asset_img 10.jpg %}

중간에 기본선택해서 다음단계로 넘어가다가 open ssh server 부분만 설치 체크 합니다.

{% asset_img 11.jpg %}

설치가 완료되고 나면 설정 버튼을 클릭한후 네트워크 탭을 클릭하고 포트 포워딩 버튼을 클릭합니다.

{% asset_img 12.jpg %}

이름에 ssh 라고 입력하고 호스트 게스트 포트 모두 22 로 지정합니다. 
이 설정은 22번 포트로 ssh 통해서 연결하겠다는 의미 입니다.

{% asset_img 13.jpg %}

## 3. ssh 접속

1번라인 명령어로 ssh 접속을 시도하면 2번과 같이 패스워드를 물어보는데 설치시 입력했던
비밀 번호를 입력합니다. 접속이 정상 완료되었습니다.

```shell
ssh goodsaem@127.0.0.1
goodsaem@127.0.0.1's password:
Welcome to Ubuntu 18.04.5 LTS (GNU/Linux 4.15.0-139-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

  System information as of Sun Mar 21 15:13:22 KST 2021

  System load:  0.0                Processes:             96
  Usage of /:   28.6% of 19.56GB   Users logged in:       1
  Memory usage: 4%                 IP address for enp0s3: 10.0.2.15
  Swap usage:   0%


0 packages can be updated.
0 of these updates are security updates.


*** System restart required ***
Last login: Sun Mar 21 12:16:17 2021 from 10.0.2.2
```
