---
title: 5. SpringBoot Backend 서버 구축
date: 2023-03-26 01:15:03
tags: [springboot]
category: [코딩,springboot]
toc: true
---

{% asset_img springboot-005.png %}

# <i class="fa fa-database"></i> 5. Springboot Mariadb 설정
h2 db 경우에는 간단한 application 만들때는 좋지만 규모가 있는 application 만들때는 문제가 있습니다. springboot + h2 db를 탑재한 상태에서 
dbeaver 를 통해 h2 db 에 접속하면 lock 상태로 접속할수 없다는 오류가 발생했습니다. 방법을 찾을수 있겠지만 과감히 버리고 mariadb 로 변경했습니다.
우선 mac 에 maria db 설치하는 방법은 [/setup/mariadb/z101-install_mac_mariadb.html](/setup/mariadb/z101-install_mac_mariadb.html)
링크에 정리 했습니다.

## 1. directory 구조
디렉토리 구조는 아래와 같습니다. builde.gradle 은 수정 되고 7개 파일은 추가할 예정 입니다. 디렉토리가 없으면 생성하고
내용이 없는 클래스 파일을 우선 작성해 주세요
```shell line 1,7,11,15,18,19,21,27
build.gradle
src
└── main
    ├── java
    │   └── io.github.goodsaem.api
    │           ├── config
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
    │           └── repo
    │                ├── HCodeRepo.java
    │                └── MemoJpaRepo.java
    └── resources
        ├── application.yml
        ├── banner.txt
        └── templates            
            ├── hcode.ftlh
            └── goodsaem.ftlh
```

## 2. build.gradle

- 이글을 쓰는 시점에 spring boot 2.4.3 안정화 버전이 나와서 버전을 올렸습니다.
- 이정도 개발했으면 1.1 버전은 된다고 생각하여  버전을 1.1로 올렸습니다.
- spring 설정을 위해 implementation 'org.springframework.boot:spring-boot-autoconfigure' 를 추가했습니다.
- mariadb 연결을 위해 드라이버를 추가했습니다. implementation("org.mariadb.jdbc:mariadb-java-client")
- 그리고 사용하지 않는 라이브러리는 삭제했습니다.

```shell
buildscript {
	ext {
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
	implementation 'org.springframework.boot:spring-boot-starter-freemarker'
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

## 3. WebConfig.java
- 인증된 서버(https://goodsaem.github.io) 에서만 데이터 요청이 가능하도록 cors 설정을 아래와 같이 진행합니다.
- 허용할 메소드들에 대해서도 정의 합니다.("GET", "POST", "PUT", "PATCH", "DELETE","OPTIONS")
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
                .allowedOrigins("https://goodsaem.github.io")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE","OPTIONS");
    }
}
```

## 4. HCode.java
행정코드 Entity를 생성합니다. spring boot + mariadb 행 + mavaen 으로 연동하는 부분에도 같은 내용이 있으니 참고하세요
[spring/springboot/z102-springboot-with-mariadb.html](spring/springboot/z102-springboot-with-mariadb.html)

@Getter @Setter @ToString @EqualsAndHashCode 이부분은 이름에서 알수 있듯이 lombok을 통해 해당 메소드들을
자동으로 생성해 주는 부분 입니다. @Entity @Table(name = "hcode") 어노테이션 정보를 주어 테이블을 생성합니다. 테이블 자동 생성시에는
자동으로 생성하는 @Id 속성을 가진 칼럼이 반드시 존재해야 하므로 강조한 라인처럼 id 부분을 정의합니다. 
```java{17,18,19}1
package io.github.goodsaem.api.entity;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import javax.persistence.*;

@Getter
@Setter
@ToString
@EqualsAndHashCode
@Entity
@Table(name = "hcode")
public class HCode {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String lcode;
    private String lname;
    private String mcode;
    private String mname;
    private String scode;
    private String sname;
}
```

## 5. HCodeRepo.java
기본적인 curd가 동작하도록 CrudRepository를 상속받은 HCodeRepo 인터페이스를 아래와 같이 작성합니다.
```java
package io.github.goodsaem.api.repo;

import io.github.goodsaem.api.entity.HCode;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HCodeRepo extends CrudRepository<HCode,Long> {
}
```

## 6. IHCodeService.java
행정코드 데이터를 가져올 인터페이스를 아래와 같이 작성합니다.
findall 메소드는 데이터 전체를 가져오는 부분이며 getHCodeMap은 지금은 사용하지
않지만 다음시간에 ignite 연동하는 부분에서 사용할 예정입니다. 미리 만들어 두세요..
```java
package io.github.goodsaem.api.service;

import io.github.goodsaem.api.entity.HCode;

import java.util.List;
import java.util.Map;

public interface IHCodeService {
    List<HCode> findAll();
    Map<String, List<HCode>> getHCodeMap();
}
```

## 7. HCodeService.java
IHCodeService 를 상속받은 HCodeService를 생성합니다.
특별한 내용은 없고 crudRepository를 상속받은 hCodeRepo를 통해 전체데이터를
가져오는 부분이 있습니다. getHCodeMap은 전체 가져온 데이터를 맵형태로 리턴하는
단순한 코드 입니다.
```java
package io.github.goodsaem.api.service;

import io.github.goodsaem.api.entity.HCode;
import io.github.goodsaem.api.repo.HCodeRepo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class HCodeService implements  IHCodeService{
    @Autowired
    private HCodeRepo hCodeRepo;

    @Override
    public List<HCode> findAll() {
        return (List<HCode>) hCodeRepo.findAll();
    }

    @Override
    public Map<String, List<HCode>> getHCodeMap() {
        Map hash = new HashMap();
        hash.put("hCodeCache",hCodeRepo.findAll());
        Map<String, List<HCode>>  hCodeMap =hash;
        return hCodeMap;
    }
}
```

## 8. HCodeController.java
url /hcodes 로 접속하면 전체 데이터를 불러와서 모델의 hcodes 속성에 저장하고
hcode.ftlh 파일을 읽어 불러온 데이터를 전달합니다.

```java
package io.github.goodsaem.api.controller.v1;

import io.github.goodsaem.api.entity.HCode;
import io.github.goodsaem.api.service.IHCodeService;
import lombok.var;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Controller
public class HCodeController {
    @Autowired
    private IHCodeService ihCodeService;

    @GetMapping("/hcodes")
    public String findHcodes(Model model) {
        var hcodes = (List<HCode>) ihCodeService.findAll();
        model.addAttribute("hcodes",hcodes);

        return "hcode";
    }
}
```
## 9. hcode.ftlh
controller 에서 주입한 hcodes list 아래와 같이 반복문을 실행하면서 전체 데이터를 출력합니다.
테이블은 application.yml 파일의 설정으로 자동으로 만들어 집니다. 

```html
<!DOCTYPE html>
<html>
<head>
    <title>HCodes</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
<h2>행정구역 코드</h2>

<table border="1">
    <tr>
        <th>고유번호</th>
        <th>시도코드</th>
        <th>시도명칭</th>
        <th>시군구코드</th>
        <th>시군구명칭</th>
        <th>읍면동코드</th>
        <th>읍면동명칭</th>
    </tr>
    <#list hcodes as hcode>
    <tr>
        <td>${hcode.id}</td>
        <td>${hcode.lcode}</td>
        <td>${hcode.lname}</td>
        <td>${hcode.mcode}</td>
        <td>${hcode.mname}</td>
        <td>${hcode.scode}</td>
        <td>${hcode.sname}</td>
    </tr>
</#list>
</table>
</body>
</html>
```

## 10. application.yml
datasource 설정은 아래와 같이 설정합니다. driver 는 mariadb로 잡아주시고
url은 localhost:3306 username password 는 각각의 환경에 맞게 설정해주세요
그리고 jba 을 아래와 같이 mariadb로 설정하고  properties.hibernate.hbm2ddl.auto 부분이
none 이라고 되어있는데 application **테이블 생성이 필요하면 create** 로 하여 테이블을 생성해주시고
테이블이 생성되고 나면 다시 이값을 **none** 으로 변경하여 테이블 생성을 하지 않습니다.

::: tip hibernate hbm2ddl.auto 설정값
1. create : SessionFactory 시작시 스키마를 삭제하고 다시 생성합니다.
1. create-drop : SessionFactory 종료시 스키마를 삭제합니다.
1. update : SessionFactory 시작시 객체 구성와 스키마를 비교하여 컬럼 추가/삭제 작업을 진행하고  기존의 스키마를 삭제하지 않고 유지합니다.
1. validate : SessionFactory 시작시 객체구성과 스키마가 다르다면 예외 발생시킵니다.
1. none : 해당 값으로 설정시 아무 동작도 하지 않습니다.
:::
```
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
    password: xxxxxxxxxxxx
  jpa:
    database-platform: org.hibernate.dialect.MariaDBDialect
    properties.hibernate.hbm2ddl.auto: none
    showSql: true
```
테이블 생성이 끝났다면  아래 파일을 다운로드 받아 insert 문장을 실행합니다.
[inser sql](/down/HCODE_202103142256.sql.zip)

## 11. 테스트
http://localhost:9090/spring/hcodes 에 접속하시면 아래와 같은 화면을 확인할수 있습니다.  
{% asset_img 1.jpg %}

## 마무리
내용을 정리할려고 하니 잘 모르는 부분을 찾아서 정리를 하고 나서 다음 단계로 넘어가서 생각보다 빨리 진행되지 않네요
그래도 매일 글을 작성한다고 생각하고 노력 하겠습니다. 긴글 읽어 주셔서 감사합니다.
