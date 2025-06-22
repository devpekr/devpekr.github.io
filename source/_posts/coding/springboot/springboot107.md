---
title: 7. SpringBoot Backend 서버 구축
date: 2023-03-26 01:17:03
tags: [springboot]
category: [Coding,springboot]
toc: true
---

{% asset_img springboot-007.png %}


# <i class="fa fa-database"></i> 7. Swagger 3.x 설치

프로젝트를 진행할때 frontend와 backend 개발자가 다른경우가 많습니다. 이때 백엔드 개발자가 만든 api 사용법에 대해서 알려주어야
되는데 보통 엑셀 같은걸로 정리해서 보내주는데 그런 문서 작업하는것도 공수가 많이 들어가죠 이때 유용하게 사용할수 있는게 swagger 입니다.
swagger 들어가서 보시구요~ 거기서 테스트도 가능합니다. 라고 하면 불필요하게 문서 만들필요도 없고 바로바로 테스트 해볼수 있는 장점이 있고
백엔드 개발자도 자신이 만든 코드가 제되로 동작하는지 바로 확인이 가능합니다.

## 1. Directory 구조와 파일
디렉토리 구조 및 추가할 파일 들입니다.

build.gradle 파일에 swagger 관련 라이브러리를 추가하고 config에 swagger 3.0 기준의 설정파일을 추가합니다.

*line 1,8*
```shell
build.gradle
src
└── main
    ├── java
    │   └── io.github.goodsaem.api
    │           ├── config
    │           |    ├── IgniteConfig.java
    │           |    └── SwaggerUiWebMvcConfigurer.java
    │           |    └── WebConfig.java
    │           ├── ApiApplication.java
    │           ├── controller
    │           │    │   └── v1
    │           │    │        ├── HCodeController.java
    │           │    │        └── MemoController.java
    │           │    └── MyController.java
    │           ├── entity
    │           │    ├── HCode.java
    │           │    └── Memo.java
    │           ├── service
    │           │    ├── HCodeService.java
    │           │    └── IHCodeService.java
    │           ├── repo
    │           |     ├── HCodeRepo.java
    │           |     └── MemoJpaRepo.java
    │           |
    │           └── store
    │                 └── DataStore.java
    └── resources
        ├── application.yml
        ├── banner.txt
        └── templates
            ├── hcode.ftlh
            └── goodsaem.ftlh
```

## 2. 적용
적용은 간단합니다. build.gradle 아래 2줄을 추가 합니다.

*line 42,43*
```shell
buildscript {
	ext {
		apacheIgniteVersion = '2.9.1'
		springBootVersion = '2.4.3'
	}
	repositories {
		mavenCentral()
	}
	dependencies {
		classpath(
				"org.springframework.boot:spring-boot-gradle-plugin:${springBootVersion}")
	}
}

apply plugin: 'org.springframework.boot'
apply plugin: 'war'
apply plugin: 'io.spring.dependency-management'
sourceCompatibility = '1.8'
targetCompatibility = '1.8'


group = 'io.github.goodsaem'
version = '0.0.1-SNAPSHOT'

configurations {
	compileOnly {
		extendsFrom annotationProcessor
	}
}

repositories {
	mavenCentral()
}

dependencies {
	implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
	implementation 'org.springframework.boot:spring-boot-starter-freemarker'
	implementation 'org.springframework.boot:spring-boot-starter-web'
	implementation 'org.springframework.boot:spring-boot-autoconfigure'
	implementation("org.mariadb.jdbc:mariadb-java-client")
	implementation group: 'com.h2database', name: 'h2', version: '1.4.196'
	implementation "io.springfox:springfox-boot-starter:3.0.0"
	implementation "io.springfox:springfox-swagger-ui:3.0.0"

	compile "org.apache.ignite:ignite-core:$apacheIgniteVersion",
			"org.apache.ignite:ignite-slf4j:$apacheIgniteVersion",
			"org.apache.ignite:ignite-spring:$apacheIgniteVersion"
			"org.apache.ignite:ignite-rest-http:$apacheIgniteVersion"

	compileOnly 'org.projectlombok:lombok'
	annotationProcessor 'org.projectlombok:lombok'
	testImplementation 'org.springframework.boot:spring-boot-starter-test'
}

test {
	useJUnitPlatform()
}
```

그리고 나서 config 디렉토리에 아래 설정파일을 생성합니다. 여기까지 하면 설정은 끝납니다.


```java
package io.github.goodsaem.api.config;

import org.springframework.util.StringUtils;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

public class SwaggerUiWebMvcConfigurer implements WebMvcConfigurer {
    private final String baseUrl;

    public SwaggerUiWebMvcConfigurer(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String baseUrl = StringUtils.trimTrailingCharacter(this.baseUrl, '/');
        registry.
                addResourceHandler(baseUrl + "/swagger-ui/**")
                .addResourceLocations("classpath:/META-INF/resources/webjars/springfox-swagger-ui/")
                .resourceChain(false);
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController(baseUrl + "/swagger-ui/")
                .setViewName("forward:" + baseUrl + "/swagger-ui/index.html");
    }
}
```

## 3. ui 사용법
[http://localhost:9090/spring/swagger-ui/](http://localhost:9090/spring/swagger-ui/) 로 접속합니다.
아래와 같은 ui 화면을 확인할수 있습니다. 메모 컨트롤러 중 메모 등록 api를 클릭합니다.

{% asset_img 1.jpg %}

Try it out 버튼을 클릭하고 등록할 메모 정보를 json 형태로 작성합니다. 그리고 나서 Execute 버튼을 클릭하여 메모를 생성합니다.
아래 그림결과를 보면 200 즉 정상 생성되었다는 메시지를 받았습니다.

{% asset_img 2.jpg %}

메모조회 api 를 클릭하여 제되로 등록되었는지 확인합니다. server respose body 부분 확인하면 위에서 생성한 메모를 확인할수 있습니다.

{% asset_img 3.jpg %}

## end
api 문서도 만들어 주고 api 테스트도 해볼수 있는 유용한 tool이네요 사용해야 겠죠. 글 읽어 주셔서 감사합니다.
