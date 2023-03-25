---
title: 4/13 무료 aws + springboot 서버 구축
date: 2023-03-25 20:04:00
tags: [SPRINGBOOT,AWS]
category: [설치,SPRINGBOOT]
toc: true
---
{% asset_img aws_springboot-004.png %}

# <i class="fas fa-server"></i> 4.AWS 서버접속

mac , windows pc에서 생성한 프리티어 서버에 접속하는 방법입니다.

## 1. 연결정보 확인

연결할 서버 접속 정보를 확인합니다.

1. 인스턴스 아이디 아래 부분의 인스턴스를 클릭합니다.
1. 연결 버튼을 클릭합니다.
1. SSH 클라이언트 탭을 클릭합니다.
1. SSH 클라이언트 아래의 텍스트를 복사합니다.
    - *ssh -i "goodsaem.pem" ubuntu@ec2-13-209-42-88.ap-northeast-2.compute.amazonaws.com*

{% asset_img 20.jpg %}

프리티어 서버생성할때 키를 생성했었습니다. 키 생성한 곳으로 이동하여 붙여 넣기 하고 엔터를 입력하면 아래와 같이 서버에 접속합니다.
제 pc 가 mac 이라 이런 방법으로 접속 했구요 putty로도 접속 가능합니다.

## 2. 맥에서 연결하기

Mac 에서 aws 서버 접속하는 방법입니다.

위에 복사한 문자열을 터미널에서 입력하고 엔터를 입력하면 아래와 같이 프리티어 서버로 접속됩니다.

<<< @/freetier/z104/1.sh{1}

## 3. 윈도우에서 연결하기

윈도우에서는  putty 로 접속하며 해당 sw 설치하는 방법 과 ec2 서버에 접속하는 방법에 대해서 알아보겠습니다.

[https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html](https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html) 설치파일을
다운로드 받고 설치를 진행합니다. default 로 다음 다음 하셔서 설치를 완료해 주세요..

{% asset_img 21.jpg %}

putty gen 을 실행 합니다.

{% asset_img 22.jpg %}

load 버튼을 클릭합니다. 모든 파일을 *.* 선택하고 goodsaem.pem 파일을 불러 옵니다.

{% asset_img 23.jpg %}

Save private key 버튼을 클릭합니다.

{% asset_img 24.jpg %}

goodsaem.ppk 파일로 적당한 위치에 저장합니다.

{% asset_img 25.jpg %}


- putty 를 실행하고 위에서 ubuntu@ 뒤쪽에 있는 문자를 복사해서 호스트에 붙여 넣기 합니다. **ec2-13-209-42-88.ap-northeast-2.compute.amazonaws.com**
- ssh 메뉴 아래 Auth를 클릭합니다.

{% asset_img 26.jpg %}

Browse 버튼을 클릭하여 goodsaem.ppk 파일을 불러 옵니다.

{% asset_img 27.jpg %}

파일을 불러 왔으면 Open 버튼을 클릭 합니다.

{% asset_img 28.jpg %}

login 부분에 **ubuntu** 라고 입력하고 엔터를 클릭하면 아래와 같이 서버에 접속이 정상 완료됩니다.

{% asset_img 29.png)

이상 mac 및 윈도우에서 구축한 aws 프리티어 서버에 접속하는 방법에 대해서 알아 보았습니다.

다음 시간에느 실제 서버 설정을 진행하겠습니다.
