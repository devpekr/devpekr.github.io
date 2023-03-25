---
title: 9/13 무료 aws + springboot 서버 구축
date: 2023-03-25 20:09:00
tags: [SPRINGBOOT,AWS]
category: [설치,SPRINGBOOT]
toc: true
---
{% asset_img aws_springboot-009.png %}

# <i class="fas fa-server"></i> 9. Springboot 프로젝트

aws freetier 리눅스 서버 구축 목적은 restapi 서버 역할입니다. 간단한 springboot 프로젝트를
생성 build 하여  war 파일을 만든다음 war 파일을 ec2 서버에 업로드 하는 부분까지 진행하겠습니다.

## 1. 프로젝트 파일생성

[https://start.spring.io/](https://start.spring.io/) 사이트에 접속하여 아래와 같이 입력합니다.

1. project 는 Gradle Project
1. Language 는 Java
1. Spring Boot 는 2.4.4
1. Group 은 goodsaem.github.io
1. Artifact 는 hello
1. Name 은  hello
1. Packaging 은 War 선택
1. Java 는 8 버전을 선택합니다.
1. 그리고 나서 Generate 버튼을 클릭합니다.
1. 파일을 다운로드 받고 적당한 위치에 압축을 푼후 해당 디렉토리로 이동합니다.

{% asset_img 1.jpg %}

## 2. 디렉토리 구
압축을 풀고 나서 해당 디렉토리 구조를 확인하면 아래와 같습니다.
아래 강조된 부분의 파일을 우선 작성합니다.

11,14 라인
```shell
.
├── build.gradle
└── src
    ├── main
    │  ├── java
    │  │  └── goodsaem
    │  │      └── github
    │  │          └── io
    │  │              └── hello
    │  │                  ├── HelloApplication.java
    │  │                  ├── HelloController.java
    │  │                  └── ServletInitializer.java
    │  └── resources
    │      ├── application.yml
    │      ├── static
    │      └── templates
    └── test
        └── java
            └── goodsaem
                └── github
                    └── io
                        └── hello
                            └── HelloApplicationTests.java
```

## 3. HelloController.java

goodsaem/string url로 접속하면 "안녕하세요 좋은 선생님 goodsaem! 입니다." 라고 출력하는
간단한 컨트롤러 입니다.
```java
package goodsaem.github.io.hello;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class HelloController {

    private final String MSG="안녕하세요 좋은 선생님 goodsaem! 입니다.";

    @GetMapping(value = "/goodsaem/string")
    @ResponseBody
    public String getString() {
        return MSG;
    }
}
```


## 4. application.yml

서비스 포트를 9090 로 변경했고 context-path를 spring으로 지정하여 /spring으로 오는 요청은 모두
springboot에서 처리하게 만듭니다.

```yaml
server:
  port: 9090
  servlet:
    context-path: /spring
    session:
      timeout: 60
      tomcat:
        uri-encoding: UTF-8
```

## 5. war파일 만들기

프로젝트 root 디렉토리에서 아래 명령어를 입력하면 war파일이 생성됩니다.
```shell
sh gradlew build
```

위 명령어를 실행하면 아래 위치에 hello-0.0.1-SNAPSHOT.war 파일이 생성됩니다.

```shell
.
└── build
      └── libs
            └── hello-0.0.1-SNAPSHOT.war
```

## 6. aws 에 파일업로드

파일 업로드는 파일 질라를 이용하서 진행하겠습니다.

1. 호스트는 goodsaem.ml 이라고 입력합니다.
1. 사용자는 ubuntu라고 입력합니다.
1. 키파일은 aws ec2 서버 생성할때 만든 goodsaem.pem 파일을 선택합니다.
1. 연결하기 버튼을 클릭하면 ec2 서버에 접속이 이루어 집니다.

{% asset_img 2.jpg %}

libs 디렉토리에 hello-0.0.1-SNAPSHOT.war 파일을 사용자 home 디렉토리로 업로드 합니다.

{% asset_img 3.jpg %}
