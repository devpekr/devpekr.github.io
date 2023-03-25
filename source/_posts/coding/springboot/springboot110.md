---
title: 10. SpringBoot Backend 서버 구축
date: 2023-03-26 01:20:03
tags: [springboot]
category: [코딩,springboot]
toc: true
---
{% asset_img springboot-010.png %}

# <i class="fas fa-database"></i> SpringBoot Mariadb 설정

spring boot 에 mariadb(mysql) 연결하는 방법에 대해서 알아보겠습니다.

## 1. mariadb user 생성

전 사용하는 pc가 mac 이라 mac 에 설치를 진행했고 자세한 설치 방법은 아래 url을 참고하세요

[/setup/mariadb/z101-install_mac_mariadb.html](/setup/mariadb/z101-install_mac_mariadb.html)

## 2. 법정코드 테이블 생성
아래 sql 문장을 실행하여 테이블을 생성합니다. 아래 테이블은 [/spring/springboot/z101-freemarker.html](/spring/springboot/z101-freemarker.html)
에서 사용한 테이블 입니다. 이를 동일하게 mariadb에서 생성해 보겠습니다.

```sql
CREATE TABLE HCODE (
    id INT PRIMARY KEY AUTO_INCREMENT,
	LCODE VARCHAR(2),
	LNAME VARCHAR(255),
	MCODE VARCHAR(5),
	MNAME VARCHAR(255),
	SCODE VARCHAR(7) NOT NULL,
	SNAME VARCHAR(255)
);
```

아래 파일을 다운로드 받아 insert 문장을 실행합니다.

[inser sql](/down/HCODE_202103142256.sql.zip)

## 3. spring start 에서 프로젝트 구조 잡기
아래 url 을 클릭하여 spring 프로젝트 구조를 잡고 파일을 다운로드 한후
적당한 위치에 압축을 풀어 주세요

[spring start](https://start.spring.io/#!type=maven-project&language=java&platformVersion=2.4.3.RELEASE&packaging=jar&jvmVersion=1.8&groupId=io.github.com.mariadb&artifactId=mariadb&name=mariadb&description=springboot%20with%20mariadb&packageName=io.github.com.mariadb&dependencies=mariadb,web,freemarker,data-jpa,lombok)

{% asset_img 1.jpg %}

완성된 폴더 및 파일 구조는 아래와 같습니다.

```shell
pom.xml
src
└── main
    ├── java
    │   └── com
    │       └── io.github.goodsaem.mariadb
    │           ├── MariadbApplication.java
    │           ├── model
    │           │   └── HCode.java
    │           ├── controller
    │           │   └── HCodeController.java
    │           ├── repository
    │           │   └── HCodeRepository.java
    │           └── service
    │               ├── HCodeService.java
    │               └── IHCodeService.java
    └── resources
        ├── application.properties
        ├── static
        │   └── index.html
        └── templates
            └── showHCodes.ftlh
```

## 4. pom.xml
pom.xml은 아래와 같으며 spring start 에서 만든내용에서 변경된 사항은 없습니다.

**Spring Boot starter** 를 이용하여 spring boot 를 쉽게 설정할수 있습니다.

- spring-boot-starter-web은 Spring MVC를 사용하는 RESTful 애플리케이션을 포함한 웹 구축을위한 스타터입니다. 
- spring-boot-starter-freemarker는 Freemarker 뷰(html template)를 사용하여 MVC 웹 애플리케이션을 구축하기위한 스타터입니다. 
- spring-boot-starter-data-jpa는 Hibernate에서 SpringData JPA를 사용하기위한 스타터입니다.



```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>2.4.3</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>
	<groupId>io.github.goodsaem.mariadb</groupId>
	<artifactId>mariadb</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<name>mariadb</name>
	<description>springboot with mariadb</description>
	<properties>
		<java.version>1.8</java.version>
	</properties>
	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-data-jpa</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-freemarker</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>

		<dependency>
			<groupId>org.mariadb.jdbc</groupId>
			<artifactId>mariadb-java-client</artifactId>
			<scope>runtime</scope>
		</dependency>
		<dependency>
			<groupId>org.projectlombok</groupId>
			<artifactId>lombok</artifactId>
			<optional>true</optional>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
		</dependency>
	</dependencies>

	<build>
		<plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
				<configuration>
					<excludes>
						<exclude>
							<groupId>org.projectlombok</groupId>
							<artifactId>lombok</artifactId>
						</exclude>
					</excludes>
				</configuration>
			</plugin>
		</plugins>
	</build>

</project>
```

## 5. application.properties
처음시작 할때 spring boot 배너를 삭제하고 mariadb의 드라이버 및 접속 정보를 아래와 같이 생성합니다.

```editorconfig
spring.main.banner-mode=off
logging.level.org.springframework=ERROR

spring.datasource.driverClassName=org.mariadb.jdbc.Driver
spring.datasource.url=jdbc:mariadb://localhost:3306/goodsaem?useSSL=false&serverTimezone=KST
spring.datasource.username=goodsaem
spring.datasource.password=xxxxxxxx
```
## 6. HCode.java
HCode 엔티티입니다. @Entity 및 @Id 어노테이션은 필수로 지정되어 있어야 됩니다. 그리고 getter 와 setter를 만들어야 되는데
편하게 lombok을 이용하여 자동 구성 했습니다. 그리고 @GeneratedValue(strategy = GenerationType.AUTO) 을 이용하여 id 키가
자동 채번되도록 설정했습니다.

```java
package io.github.goodsaem.mariadb.model;

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

## 7. HCodeRepository.java

Spring CrudRepository를 상속받습니다. 해당 객체를 상속받으면 findAll ()을 포함하여 이미 구현 된 데이터 저장소에 대한 메소드들을 활용할수 있습니다.

```java
package io.github.goodsaem.mariadb.repository;

import io.github.goodsaem.mariadb.model.HCode;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HCodeRepository extends CrudRepository<HCode,Long> {
}
```

## 8. IHCodeService.java
데이터를 가져오기 위한 인터페이스를 선언합니다.

```java
package io.github.goodsaem.mariadb.service;

import io.github.goodsaem.mariadb.model.HCode;

import java.util.List;

public interface IHCodeService {
    List<HCode> findAll();
}
```

## 9. HCodeService.java
실제 데이터를 가져오는 findAll 메소드를 구현합니다.

```java
package io.github.goodsaem.mariadb.service;

import io.github.goodsaem.mariadb.model.HCode;
import io.github.goodsaem.mariadb.repository.HCodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HCodeService implements  IHCodeService{
    @Autowired
    private HCodeRepository hCodeRepository;

    @Override
    public List<HCode> findAll() {
        return (List<HCode>) hCodeRepository.findAll();
    }
}

```

## 10. HCodeController.java
/hcodes 페이지에 접속하면 데이터베이스의 행정코드 전체를 가져와서 showHCodes.ftlh에서
출력하는 컨트롤러를 작성합니다.

```java
package io.github.goodsaem.mariadb.controller;

import io.github.goodsaem.mariadb.model.HCode;
import io.github.goodsaem.mariadb.service.IHCodeService;
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

        return "showHCodes";
    }
}

```

## 11. showHCodes.ftlh
컨틀롤러에서 받은 데이터를 표현하는 템플릿 파일 입니다.

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

## 12. index.html
최초 접속시 행정코드 전체 데이터를 불러오는 페이지 입니다. 

```html
<!DOCTYPE html>
<html>
<head>
    <title>행정코드</title>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body>
<a href="hcodes">행정코드 확인하기</a>
</body>
</html>
```

## 13. MariadbApplication.java
스프링 부트 시작 java 파일 입니다.
```java
package io.github.goodsaem.mariadb;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MariadbApplication {

	public static void main(String[] args) {
		SpringApplication.run(MariadbApplication.class, args);
	}

}
```

## 14. 테스트
application 을 실행하면 아래와 같은 페이지를 확인할수 있습니다.

1. [http://localhost:8080/](http://localhost:8080/) 아래 링크를 클릭하면 전체 행정코드를 출력하는 화면으로 이동합니다.
```html
행정코드 확인하기
```

2. [http://localhost:8080/hcodes](http://localhost:8080/hcodes) 여기에서 데이터를 확인할수 있습니다.

{% asset_img 2.jpg %}
