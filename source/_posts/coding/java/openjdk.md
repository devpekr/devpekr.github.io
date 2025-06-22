---
title: mac에 oepnjdk 19.0.1 버전 설치방법
date: 2023-03-24 18:40:32
tags: [openjdk]
category: [Coding,java]
toc: true
---

### mac에 oepnjdk 19.0.1 버전 설치방법
mac에서 openjdk 최신 버전 설치하는 방법에 대해서 정리한 내용이다.

#### openjdk 다운로드
아래 사이트에서 설치하고자 하는 jdk 파일을 다운로드 한다.

[https://jdk.java.net/archive/](https://jdk.java.net/archive/)

{% asset_img openjdk1.png openjdk설치방법 %}

#### 압축해제 후 파일이동
다운로드 받은 파일의 압축을 풀어준다.
압축푼 파일을  /Library/Java/JavaVirtualMachines 폴더로 이동한다.
```shell
sudo mv jdk-19* /Library/Java/JavaVirtualMachines
```
#### 확인
터미널에서 아래 명령어를 입력하여 설치된 버전을 확인한다.
```shell
java --version
```
19.0.1 최신버전의 openjdk가 설치되었다.
```shell
openjdk 19.0.1 2022-10-18
OpenJDK Runtime Environment (build 19.0.1+10-21)
OpenJDK 64-Bit Server VM (build 19.0.1+10-21, mixed mode, sharing)
```
