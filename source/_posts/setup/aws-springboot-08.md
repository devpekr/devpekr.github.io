---
title: 8/13 무료 aws + springboot 서버 구축
date: 2023-03-25 20:08:00
tags: [SPRINGBOOT,AWS]
category: [설치,SPRINGBOOT]
toc: true
---
{% asset_img aws_springboot-008.png %}

# <i class="fas fa-server"></i> 8. Openjdk 1.8 설치
aws + ubuntu 18 linux 서버에 open jdk 설치 하는 방법입니다.

## 1. 설치
백엔드 서비스는 springboot에서 모두 처리할 예정입니다. springboot을 기동하기 위해 open jdk를 설치합니다.

```shell
ubuntu@goodsaem:~$ sudo apt install openjdk-8-jdk
```

## 2. jdk 버전확인
설치가 완료되었다면 jdk 버전을 확인합니다.

```shell{1}
ubuntu@goodsaem:~$ java -version
openjdk version "1.8.0_282"
OpenJDK Runtime Environment (build 1.8.0_282-8u282-b08-0ubuntu1~18.04-b08)
OpenJDK 64-Bit Server VM (build 25.282-b08, mixed mode)
```
