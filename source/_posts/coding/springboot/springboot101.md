---
title: 1. SpringBoot Backend 서버 구축
date: 2023-03-26 01:08:03
tags: [springboot]
category: [코딩,springboot]
toc: true
---

{% asset_img springboot-001.png %}

### {% fa cloud %} 개요
인텔리제이 springboot 개발환경을 구축하여 backend 프레임워크 구성을 진행 하고자 한다.
본 기술블로그에서 vue 관련 내용들을 정리 예정인데 backend framework는 springboot를 
사용할 예정이다. jpa swagger mybatis 등 실무에서 사용하는 기술들에 대해 정리 예정이다.

### {% fa download %}인텔리제이 설치
먼저 아래 사이트에서 인텔리제이 커뮤니티를 다운로드한다. 참고로 굳쎔은 Ultimate 버전을
구매해서 사용중이다. 나중에 vue.js를 코딩을 할때 ultimate 버전을 가지고 있다고 백엔드와
프론트 모두 한가지 ide로 할수 있어 여러모로 편리하다.

[인텔리제이 다운로드](https://www.jetbrains.com/ko-kr/idea/download/)

### {% fa book %} springboot project 생성

[spring starter](https://start.spring.io/) 사이트에서 spring 프로젝트를 생성함. 
아래와 같이 설정을하고 GENERATE 버튼을 클릭하면 해당 설정되로 압축 파일이 생성 및 다운로드됨.
다운로드후 압축 파일 풀어서 적당한 위치에 옮겨 해당 디렉토리를 불러오면 설정완료

|구분|설정|비고|
|:---:|:---:|:---:|
| Project | Gradle Project 선택 |
| Language | Java 선택 |
| Spring Boot | 3.0.5 선택 |
| Group | io.github.goodsaem |  GroupId는 프로젝트를 식별해 주는 고유값. <br/> 각자의 도메인으로 설정함 |
| Artifact | api | war 나 jar 파일을 만들때 사용되며 버전정보를 제외한 파일이름 |
| Name | api |
| Description | rest api |
| Package name | io.github.goodsaem.api | 각자 맞게 설정 |
| Packaging | war |
| Java | 17 | 안정버전을 선택 |
| Dependencies | Lombok | getter 나 setter 등을 자동완성할때 사용 |
| | H2 Database | H2 db 사용 |
| | MariaDB Driver | maria db 연결 |
| | Spring JPA | Java Persistence API 로 객체 지향적으로 데이터를 관리 |

{% asset_img springboot101-28.png springstarter %}

openjdk 최신버전 설치방법은 아래 링크 참고할것
[mac에 oepnjdk 19.0.1 버전 설치방법](/2023/03/24/coding/java/openjdk/)

### {% fa coffee %} 인텔리제이에서 프로젝트 오픈
압축 푼 디렉토리를 인테리제이에서 Open 한다.
오픈 후 먼저 프로젝트 SDK 선택및 프로젝트에서 컴파일할 java 버전을 지정한다.

폴더에서 우클릭 하여 아래 그림과 같이 Open Moudule Setttings 메뉴를 클릭한다.
{% asset_img boot1.png %}

---
1. SDKS 메뉴를 클릭한다.
2. +아이콘을 클릭한다.
3. open jdk 19 를 선택한다.
{% asset_img boot4.png %}
---
1. 프로젝트 메뉴를 선택한다.
2. jdk를 선택한다.
3. 프로젝트 언어 레벨을 17로 맞춘다.
{% asset_img boot5.png %}
---
해당 과정이 끝나고 나면 build.gradle 에 정의되어 있는 라이브러리를 자동으로 불러 온다.
만약 라이브러리를 제되로 불러오지 않는다면 Gradle 메뉴를 클릭하고 <i class="fa-solid fa-rotate"></i> 아이콘을
클릭하여 필요한 모듈을 다시 불러온다.
{% asset_img springboot2.png 인텔리제이에서 프로젝트 오픈 %}

### <i class="fa-solid fa-clover"></i> 마무리
여기까지 springboot + 인텔리제이 개발 환경을 셋팅했다. 이제 실제 springboot 를 통한 예제를 하나씩
실습해보면서 spring boot를 마스터 해보자.


