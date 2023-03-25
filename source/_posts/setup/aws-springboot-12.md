---
title: 12/13 무료 aws + springboot 서버 구축
date: 2023-03-25 20:12:00
tags: [SPRINGBOOT,AWS]
category: [설치,SPRINGBOOT]
toc: true
---
{% asset_img aws_springboot-012.png %}

# <i class="fas fa-server"></i> 12. 메모앱 만들기

지금까지 구축한 aws 서버위에 간단한 메모 application을 만들어서 배포 하겠습니다.

## 1. 테이블 생성 및 초기데이터 적재

테이블을 생성하고 초기 데이터를 인서트 합니다.

아래 스크립트는 aws 의 mariadb 에서 실행합니다.

먼저 메모 테이블을 생성합니다.

```sql
CREATE TABLE `memo` (
  `id` bigint(20) NOT NULL,
  `contents` varchar(4000) NOT NULL,
  `title` varchar(200) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

자동증가 시쿼스 테이블을 만듭니다.

```sql
CREATE TABLE `hibernate_sequence` (
  `next_val` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

초기 데이터를 생성합니다.

```sql
INSERT INTO memo (id, contents, title) VALUES(1, '내용1', '제목1');
INSERT INTO memo (id, contents, title) VALUES(2, '내용2', '제목2');
INSERT INTO memo (id, contents, title) VALUES(3, '내용3', '제목3');

INSERT INTO hibernate_sequence (next_val) VALUES(4);

```


## 2. 앱구조

springboot application 구조는 아래와 같습니다.

```shell
.
├── build.gradle
└── src
    └── main
        ├── java
        │ └── io
        │     └── github
        │         └── goodsaem
        │             └── api
        │                 ├── ApiApplication.java
        │                 ├── config
        │                 │ └── WebConfig.java
        │                 ├── controller
        │                 │ └── v1
        │                 │     └── MemoController.java
        │                 ├── entity
        │                 │ └── Memo.java
        │                 ├── repo
        │                 │ └── MemoJpaRepo.java
        │                 └── service
        │                     ├── IMemoService.java
        │                     └── MemoService.java
        └── resources
            ├── application.yml
            ├── banner.txt
            └── templates
```

## 3. build.gradle

특별한 내용은 없고 springboot 2.4.4 버전 사용 및 mariadb 와 jpa 라이브러리 추가및 lombok 플러그인을 추가했습니다. 

```shell
buildscript {
	ext {
		springBootVersion = '2.4.4'
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
version = '1.1'

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
	implementation 'org.springframework.boot:spring-boot-starter-web'
	implementation 'org.springframework.boot:spring-boot-autoconfigure'
	implementation("org.mariadb.jdbc:mariadb-java-client")

	compileOnly 'org.projectlombok:lombok'
	annotationProcessor 'org.projectlombok:lombok'
	testImplementation 'org.springframework.boot:spring-boot-starter-test'
}

test {
	useJUnitPlatform()
}
```

## 4. ApiApplication.java

springboot 시작 파일 입니다.

```java
package io.github.goodsaem.api;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(ApiApplication.class, args);
	}
}
```

## 5. WebConfig.java

CORS 설정 파일입니다. 허용할 도메인에 대해서 아래와 같이 정의 합니다.

```java
package io.github.goodsaem.api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("https://goodsaem.github.io","http://localhost:8080")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE","OPTIONS");
    }
}

```

## 6. MemoController.java

restapi controller 입니다. 메모의 crud url 을 호출하면 해당 요청에 맞는 서비스를 호출하여 db 작업을 수행합니다

```java
package io.github.goodsaem.api.controller.v1;

import io.github.goodsaem.api.entity.Memo;
import io.github.goodsaem.api.service.IMemoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping(value = "/v1")
public class MemoController {
    private final IMemoService iMemoService;

    @GetMapping(value = "/memos")
    public List<Memo> readMemos() {
        return iMemoService.readMemos();
    }

    @GetMapping(value = "/memo/{id}")
    public Memo readMemo( @PathVariable long id) {
        return iMemoService.readMemo(id);
    }

    @PostMapping(value = "/memo")
    public Memo createMemo(@RequestParam String title,String contents) {
        return iMemoService.createMemo(title,contents);
    }

    @PutMapping(value = "/memo")
    public Memo updateMemo(@RequestParam long id, @RequestParam String title,String contents) {
        return iMemoService.updateMemo(id,title,contents);
    }

    @DeleteMapping(value="/memo/{id}")
    public void deleteMemo(@PathVariable long id) {
        iMemoService.deleteMemo(id);
    }

    @DeleteMapping(value="/memos")
    public void deleteMemos() {
        iMemoService.deleteMemos();
    }
}
```
## 7. Memo.java

memo entity 입니다.

```java
package io.github.goodsaem.api.entity;

import lombok.*;
import javax.persistence.*;

@Builder
@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Table(name="memo")
public class Memo {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    @Column(nullable = false, length = 30)
    private String title;

    @Column(nullable = false, length = 4000)
    private String contents;
}
```

## 8. MemoJpaRepo.java

jpa를 사용하기 위해 jparepository를 상속 받습니다.

```java
package io.github.goodsaem.api.repo;

import io.github.goodsaem.api.entity.Memo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemoJpaRepo extends JpaRepository<Memo, Long> {
}

```

## 9. IMemoService.java

서비스 인터페이스 입니다.

```java
package io.github.goodsaem.api.service;
import io.github.goodsaem.api.entity.Memo;
import java.util.List;
public interface IMemoService {
    List<Memo> readMemos();
    Memo readMemo(long id);
    Memo createMemo(String title,String contents);
    Memo updateMemo(long id,String title,String contents);
    void deleteMemo(long id);
    void deleteMemos();
}
```

## 10. MemoService.java

jpaRepo로 실제 crud 작업을 수행합니다.

```java
package io.github.goodsaem.api.service;

import io.github.goodsaem.api.entity.Memo;
import io.github.goodsaem.api.repo.MemoJpaRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MemoService implements IMemoService {
    private final MemoJpaRepo memoJpaRepo;

    @Override
    public List<Memo> readMemos() {
        return memoJpaRepo.findAll();
    }

    @Override
    public Memo readMemo(long id) {
        return memoJpaRepo.findById(id).orElse(null);
    }

    @Override
    public Memo createMemo(String title, String contents) {
        Memo memo = Memo.builder()
                .title(title)
                .contents(contents)
                .build();

        return memoJpaRepo.save(memo);
    }

    @Override
    public Memo updateMemo(long id, String title, String contents) {

        Memo memo = Memo.builder()
                .id(id)
                .title(title)
                .contents(contents)
                .build();

        return memoJpaRepo.save(memo);
    }

    @Override
    public void deleteMemo(long id) {
        memoJpaRepo.deleteById(id);
    }

    @Override
    public void deleteMemos() {
        memoJpaRepo.deleteAll();
    }
}
```

## 11. application.yml

appplication 설정 내용으로 mariadb 연결정보와 서비스 포트 context path 설정정보를 가지고 있습니다.

```yaml
server:
  port: 9090
  servlet:
    context-path: /spring
    session:
      timeout: 60
      tomcat:
        uri-encoding: UTF-8

spring:
  datasource:
    driver-class-name: org.mariadb.jdbc.Driver
    url: jdbc:mariadb://localhost:3306/goodsaem?useSSL=false&serverTimezone=KST
    username: goodsaem
    password: xxxxxxxxxx
  jpa:
    database-platform: org.hibernate.dialect.MariaDBDialect
    properties.hibernate.hbm2ddl.auto: none
    showSql: true
```

## 12. banner.txt

spring boot 시작시 사용할 배너 입니다.

```text
 ██████╗  ██████╗  ██████╗ ██████╗ ███████╗ █████╗ ███████╗███╗   ███╗
██╔════╝ ██╔═══██╗██╔═══██╗██╔══██╗██╔════╝██╔══██╗██╔════╝████╗ ████║
██║  ███╗██║   ██║██║   ██║██║  ██║███████╗███████║█████╗  ██╔████╔██║
██║   ██║██║   ██║██║   ██║██║  ██║╚════██║██╔══██║██╔══╝  ██║╚██╔╝██║
╚██████╔╝╚██████╔╝╚██████╔╝██████╔╝███████║██║  ██║███████╗██║ ╚═╝ ██║
 ╚═════╝  ╚═════╝  ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝
:: Spring Boot ::                         ver : ${spring-boot.version}
```

## 13. api-1.1.war 파일 만들기

프로젝트 시작 home 디렉토리에서 아래 명령어를 입력하여 war 파일을 만듭니다.

```shell
sh gradlew build
```

## 14. war file 업로드

aws 서버에 api-1.1.war 파일을 업로드 합니다.

## 15. springboot 재시작

aws 서버에 접속한후 아래 명령어를 입력합니다.

서비스 중지
```shell
ubuntu@goodsaem:~$ ./stop.sh
=====spring is running at 5808 Shutdown spring now
```

서비스 시작
```shell
ubuntu@goodsaem:~$ ./start.sh;./log.sh
```

시작 로그

```shell
 ██████╗  ██████╗  ██████╗ ██████╗ ███████╗ █████╗ ███████╗███╗   ███╗
██╔════╝ ██╔═══██╗██╔═══██╗██╔══██╗██╔════╝██╔══██╗██╔════╝████╗ ████║
██║  ███╗██║   ██║██║   ██║██║  ██║███████╗███████║█████╗  ██╔████╔██║
██║   ██║██║   ██║██║   ██║██║  ██║╚════██║██╔══██║██╔══╝  ██║╚██╔╝██║
╚██████╔╝╚██████╔╝╚██████╔╝██████╔╝███████║██║  ██║███████╗██║ ╚═╝ ██║
 ╚═════╝  ╚═════╝  ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝
:: Spring Boot ::                         ver : 2.4.4
2021-03-27 17:10:46.869  INFO 7734 --- [           main] io.github.goodsaem.api.ApiApplication    : Starting ApiApplication using Java 1.8.0_282 on goodsaem with PID 7734 (/home/ubuntu/api-1.1.war started by ubuntu in /home/ubuntu)
2021-03-27 17:10:46.874  INFO 7734 --- [           main] io.github.goodsaem.api.ApiApplication    : No active profile set, falling back to default profiles: default
2021-03-27 17:10:48.714  INFO 7734 --- [           main] .s.d.r.c.RepositoryConfigurationDelegate : Bootstrapping Spring Data JPA repositories in DEFAULT mode.
2021-03-27 17:10:48.852  INFO 7734 --- [           main] .s.d.r.c.RepositoryConfigurationDelegate : Finished Spring Data repository scanning in 121 ms. Found 1 JPA repository interfaces.
2021-03-27 17:10:50.415  INFO 7734 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat initialized with port(s): 9090 (http)
2021-03-27 17:10:50.442  INFO 7734 --- [           main] o.apache.catalina.core.StandardService   : Starting service [Tomcat]
2021-03-27 17:10:50.446  INFO 7734 --- [           main] org.apache.catalina.core.StandardEngine  : Starting Servlet engine: [Apache Tomcat/9.0.44]
2021-03-27 17:10:51.931  INFO 7734 --- [           main] o.a.c.c.C.[.[localhost].[/spring]        : Initializing Spring embedded WebApplicationContext
2021-03-27 17:10:51.932  INFO 7734 --- [           main] w.s.c.ServletWebServerApplicationContext : Root WebApplicationContext: initialization completed in 4908 ms
2021-03-27 17:10:52.874  INFO 7734 --- [           main] o.hibernate.jpa.internal.util.LogHelper  : HHH000204: Processing PersistenceUnitInfo [name: default]
2021-03-27 17:10:52.986  INFO 7734 --- [           main] org.hibernate.Version                    : HHH000412: Hibernate ORM core version 5.4.29.Final
2021-03-27 17:10:53.296  INFO 7734 --- [           main] o.hibernate.annotations.common.Version   : HCANN000001: Hibernate Commons Annotations {5.1.2.Final}
2021-03-27 17:10:53.661  INFO 7734 --- [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Starting...
2021-03-27 17:10:53.804  INFO 7734 --- [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Start completed.
2021-03-27 17:10:53.848  INFO 7734 --- [           main] org.hibernate.dialect.Dialect            : HHH000400: Using dialect: org.hibernate.dialect.MariaDBDialect
2021-03-27 17:10:54.767  INFO 7734 --- [           main] o.h.e.t.j.p.i.JtaPlatformInitiator       : HHH000490: Using JtaPlatform implementation: [org.hibernate.engine.transaction.jta.platform.internal.NoJtaPlatform]
2021-03-27 17:10:54.779  INFO 7734 --- [           main] j.LocalContainerEntityManagerFactoryBean : Initialized JPA EntityManagerFactory for persistence unit 'default'
2021-03-27 17:10:55.548  WARN 7734 --- [           main] JpaBaseConfiguration$JpaWebConfiguration : spring.jpa.open-in-view is enabled by default. Therefore, database queries may be performed during view rendering. Explicitly configure spring.jpa.open-in-view to disable this warning
2021-03-27 17:10:55.822  INFO 7734 --- [           main] o.s.s.concurrent.ThreadPoolTaskExecutor  : Initializing ExecutorService 'applicationTaskExecutor'
2021-03-27 17:10:56.395  INFO 7734 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port(s): 9090 (http) with context path '/spring'
2021-03-27 17:10:56.413  INFO 7734 --- [           main] io.github.goodsaem.api.ApiApplication    : Started ApiApplication in 10.795 seconds (JVM running for 11.987)
```

## 16. 웹브라우저에서 확인

[https://goodsaem.ml/spring/v1/memos](https://goodsaem.ml/spring/v1/memos) url 접근했을때 아래와
같은 문자열이 출력되면 정상입니다.

```json
[
  {
    "id": 1,
    "title": "제목1",
    "contents": "내용1"
  },
  {
    "id": 2,
    "title": "제목2",
    "contents": "내용2"
  },
  {
    "id": 3,
    "title": "제목3",
    "contents": "내용3"
  }
]
```

## 17. 전체소스 다운로드
지금까지 만든 소스는 아래 링크를 통해서 다운로드 가능합니다.

[소스 다운 로드](/down/api2.zip)
