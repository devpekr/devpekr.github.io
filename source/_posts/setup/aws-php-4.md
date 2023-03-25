---
title: 4/13 무료로 aws + php 서버 구축
date: 2023-03-25 14:50:00
tags: [PHP,AWS]
category: [설치,PHP]
toc: true
---
![4/13 무료로 aws + php 서버 구축](/img/aws_php-004.png)

# <i class="fas fa-server"></i> 4.서버연결

먼저 서버에 접속 하는 방법 부터 알려드릴께요..

1. 인스턴스 아이디 아래 부분의 인스턴스를 클릭합니다.
1. 연결 버튼을 클릭합니다.
1. SSH 클라이언트 탭을 클릭합니다.
1. SSH 클라이언트 아래의 텍스트를 복사합니다.
   - *ssh -i "goodsaem.pem" ubuntu@ec2-13-209-42-88.ap-northeast-2.compute.amazonaws.com*

![problem](/img/20.jpg)

프리티어 서버생성할때 키를 생성했었습니다. 키 생성한 곳으로 이동하여 붙여 넣기 하고 엔터를 입력하면 아래와 같이 서버에 접속합니다.
제 pc 가 mac 이라 이런 방법으로 접속 했구요 putty 로 접속 가능합니다.

### 맥에서 연결
```shell{1}
goodsaem@goodsaemui-iMac goodsaem % ssh -i "goodsaem.pem" ubuntu@ec2-13-209-42-88.ap-northeast-2.compute.amazonaws.com
Welcome to Ubuntu 18.04.5 LTS (GNU/Linux 5.4.0-1037-aws x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

  System information as of Wed Mar  3 22:43:18 KST 2021

  System load:  0.0               Processes:           120
  Usage of /:   8.3% of 29.02GB   Users logged in:     0
  Memory usage: 39%               IP address for eth0: 172.31.47.167
  Swap usage:   0%

 * Introducing self-healing high availability clusters in MicroK8s.
   Simple, hardened, Kubernetes for production, from RaspberryPi to DC.

     https://microk8s.io/high-availability

 * Canonical Livepatch is available for installation.
   - Reduce system reboots and improve kernel security. Activate at:
     https://ubuntu.com/livepatch

18 packages can be updated.
0 of these updates are security updates.
To see these additional updates run: apt list --upgradable


*** System restart required ***
Last login: Mon Mar  1 23:55:26 2021 from 1.247.71.18
ubuntu@ip-172-31-47-167:~$ 

```

### 윈도우에서 연결
윈도우에서 putty 설치하는 방법 및 ec2 서버에 putty 를 통해서 접속하는 방법 입니다.

[https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html](https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html) 설치파일을
다운로드 받고 설치를 진행합니다. default 로 다음 다음 하셔서 설치를 완료해 주세요..

![21](/img/21.jpg)

putty gen 을 실행 합니다.

![21](/img/22.jpg)

load 버튼을 클릭합니다. 모든 파일을 *.* 선택하고 goodsaem.pem 파일을 불러 옵니다.

![21](/img/23.jpg)

Save private key 버튼을 클릭합니다.

![21](/img/24.jpg)

goodsaem.ppk 파일로 적당한 위치에 저장합니다.

![21](/img/25.jpg)


- putty 를 실행하고 위에서 ubuntu@ 뒤쪽에 있는 문자를 복사해서 호스트에 붙여 넣기 합니다. **ec2-13-209-42-88.ap-northeast-2.compute.amazonaws.com**
- ssh 메뉴 아래 Auth를 클릭합니다.

![21](/img/26.jpg)

Browse 버튼을 클릭하여 goodsaem.ppk 파일을 불러 옵니다.

![img](/img/27.jpg)

파일을 불러 왔으면 Open 버튼을 클릭 합니다.

![img](/img/28.jpg)

login 부분에 **ubuntu** 라고 입력하고 엔터를 클릭하면 아래와 같이 서버에 접속이 정상 완료됩니다.

![img](/img/28.jpg)
