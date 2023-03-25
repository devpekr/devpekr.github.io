---
title: 6/13 무료로 aws + php 서버 구축
date: 2023-03-25 15:10:00
tags: [PHP,AWS]
category: [설치,PHP]
toc: true
---
![6/13 무료로 aws + php 서버 구축](/img/aws_php-006.png)
# <i class="fas fa-server"></i> 6. Nginx 설치
aws freetier linux + Nginx + MariaDB + SpringBoot 조합으로 설치를 진행하겠습니다. 
그 첫번째로 Nginx 설치를 진행하겠습니다.

## Nginx 설치
Nginx는 MainLine 버전과 stable 버전 2가지가 존재 합니다. 메인라이는 새로운 기능 및 업데이트 및 버그 패치가 동시에 진행되고 stable 은 메인라인에서
버그패치만 진행하는 버전입니다. 메이저 버전을 올리고 싶지 않고 사용하고 싶다면 stable 버전이 좋겠지만 전 최신 기능과 update 및 버그 픽스가 동시에
이루어지는 mainline으로 설치를 진행하겠습니다.

![img](/img/30.jpg)

#### nginx 의존성 패키지 설치
```shell
ubuntu@goodsaem:~$ sudo apt install curl gnupg2 ca-certificates lsb-release -y
```

#### nginx mainline 패키지 추가
메인라인 패키지 리스트를 추가해 줍니다.
```shell
ubuntu@goodsaem:~$ sudo echo "deb http://nginx.org/packages/mainline/ubuntu `lsb_release -cs` nginx" | sudo tee /etc/apt/sources.list.d/nginx.list
```
패키지를 업데이트 합니다.
```shell
ubuntu@goodsaem:~$ sudo apt update
```
nginx 를 설치합니다.
```shell
ubuntu@goodsaem:~$ sudo apt install nginx
```
설치된 버전을 확인 합니다.
```shell
ubuntu@goodsaem:~$ nginx -V
nginx version: nginx/1.19.7
built by gcc 7.5.0 (Ubuntu 7.5.0-3ubuntu1~18.04)
built with OpenSSL 1.1.1  11 Sep 2018 (running with OpenSSL 1.1.1j  16 Feb 2021)
TLS SNI support enabled
```
