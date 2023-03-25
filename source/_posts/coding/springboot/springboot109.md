---
title: 9. SpringBoot Backend 서버 구축
date: 2023-03-26 01:19:03
tags: [springboot]
category: [코딩,springboot]
toc: true
---
{% asset_img springboot-009.png %}

# <i class="fa fa-city"></i> SpringBoot Freemarket 설정

spring boot 와 freemarker 템플릿 엔진 h2 db를 이용하여 간단한 app 을 만들어 보겠습니다.

*기능설명*
1. 엑셀파일을 서버에 업로드하면 apache poi 라이브러리를 이용하여 엑셀 데이터를 읽은 다음 h2 db 에 업로드 합니다. 또한 업로드한 엑셀 데이터도 같이 표시 합니다.
1. h2 db 의 hcode 테이블 데이터를 읽어 화면에 표시 합니다.
  - {% asset_img d3.jpg %}

::: tip H2DB
H2 DB 는 Java 로 만들어진 관계형 데이터 베이스(rdb) 입니다. 보통 Java application 에 임베디드 되어 사용되고
클라이언트 및 서버 모두 실행되며 배포가 쉽고 설치시 필요한 용량이 적게 드는 경량 db 입니다.  application 초기 서비스시 에는 
h2 db 같은걸로 가볍게 서비스를 하다가 규모가 커지고 h2 db로 관리가 힘들다고 생각되면 mariadb 나 postgre sql 같은
걸로 갈아 타는걸 추천 드립니다.

{% asset_img 2-logo.png %}

:::

## 1. FreeMarker ?

[Apache FreeMarker ™](https://freemarker.apache.org/)는 템플릿 엔진으로 개발자가 템플릿 언어 FTL template 파일을
작성해 놓고 controller 에서 서비스를 호출하여 db 에서 데이터를 불러온 후 controller 에게 데이터를 전달하면 이를 FreeMarker
엔진에게 template 파일과 데이터를 같이 전달하여 화면을 표시하는 형태 입니다.  템플릿에서는 데이터를 표시하는 방법에 집중합니다.
보통 ${model.name} 이런씩으로 해서 데이터를 화면에 표시합니다. 이를 그림으로 나타내면 아래와 같습니다.

{% asset_img freemarker_apache.png %}

::: warning 참고
최근에 spring boot 에서 기본 FreeMarker 기본확장자를 .ftl 에서 .ftlh 로 변경했습니다. .ftl로 작성하시면 404 오류가 발생합니다.
반드시 **.fthl**로 생성하시기 바랍니다.
:::

## 2. 프로젝트 생성

### 2.1 법정코드 다운로드
엑셀업로드 할때 사용할 행정구역 코드 엑셀 파일을 다운로드 받습니다. 
[행정지역코드 받기](https://sgis.kostat.go.kr/view/board/faqView?post_no=11)

{% asset_img hcode.jpg %}

엑셀파일을 열어보면 2020년6월 행정구역 코드 라고 되어 있는 행이 있는데요 첫번째 행은 삭제해주세요
{% asset_img excel1.jpg %}
첫번째행을 삭제하면 아래그림과 같이나오고 엑셀은 헤더부분을 제외하고 1번째 row부터 읽습니다.
{% asset_img excel2.jpg %}

### 2.2 spring 시작
[spring start](https://start.spring.io/) 사이트에서 프로젝트에 필요한 파일을 생성합니다.
아래와 같이 선택한후 generate 버튼을 클릭하면 압축 파일이 다운로드 됩니다.

::: tip 프로젝트 생성
생성하는 부분에 보다 자세한 정보를 원하시면 [프로젝트 생성](/spring/restapi/) 페이지를 참고하세요.
:::


{% asset_img freemarker1.jpg %}

### 2.3 directory 구조
다운로드 받은 프로젝트 파일의 압축을 풀고 Intellij 에서 폴더를 불러면 아래와 같은 디렉토리 구조가 생성됩니다.

{% asset_img freemarker2.jpg %}

아래에서 색상 강조한 부분이 수정 및 추가해야 될 파일 항목 입니다.
```shell line 1,7,9,11,13,14,16,19,21-24
build.gradle
src
└── main
    ├── java
    │   └── io
    │        └── github.goodsaem.freemarker
    │           ├── Application.java
    │           ├── model
    │           │   └── City.java
    │           ├── controller
    │           │   └── MyController.java
    │           └── service
    │               ├── CityService.java
    │               └── ICityService.java
    └── resources
            ├── application.properties
            ├── static
            │   └── css
            │       └── style.css
            └── templates
                    ├── excel.ftlh
                    ├── excelList.ftlh
                    ├── index.ftlh
                    └── showCities.ftlh
```
## 3. 코딩

### 3.1 build.gradle 수정
apache poi 를 통해서 엑셀 업로드를 진행하고 file io와 관련된 라이브러리를 사용 하므로 아래와 같이 수정하교 Reload all gradle project 를
수행합니다.
```yaml line 26-28
plugins {
	id 'org.springframework.boot' version '2.4.2'
	id 'io.spring.dependency-management' version '1.0.11.RELEASE'
	id 'java'
	id 'war'
}

group = 'io.github.goodsaem.freemarker'
version = '0.0.1-SNAPSHOT'
sourceCompatibility = '11'

configurations {
	compileOnly {
		extendsFrom annotationProcessor
	}
}

repositories {
	mavenCentral()
}

dependencies {
	implementation 'org.springframework.boot:spring-boot-starter-freemarker'
	implementation 'org.springframework.boot:spring-boot-starter-jdbc'
	implementation 'org.springframework.boot:spring-boot-starter-web'
	implementation group: 'org.apache.poi', name: 'poi', version: '5.0.0'
	implementation group: 'org.apache.poi', name: 'poi-ooxml', version: '5.0.0'
	implementation group: 'commons-io', name: 'commons-io', version: '2.8.0'
	compileOnly 'org.projectlombok:lombok'
	runtimeOnly 'com.h2database:h2'
	annotationProcessor 'org.projectlombok:lombok'
	providedRuntime 'org.springframework.boot:spring-boot-starter-tomcat'
	testImplementation 'org.springframework.boot:spring-boot-starter-test'
}

test {
	useJUnitPlatform()
}
```
### 3.2 application.properties
아래 내용을 추가 해주세요
```.properties
spring.main.banner-mode=off
spring.datasource.platform=h2
spring.datasource.url=jdbc:h2:file:~/h2test
spring.datasource.username=sa
spring.datasource.password=
spring.datasource.driver-class-name=org.h2.Driver
server.port=9090
spring.servlet.multipart.max-file-size=100MB
spring.servlet.multipart.max-request-size=100MB
```
1. 시작할때 배너를 보지 않겠다는 의미 입니다.
1. h2 db 플랫폼을 사용합니다.
1. h2 db는 default 저장소는 메모리입니다. 메모리는 서비스를 중단하면 데이터가 삭제됩니다.
   그래서  메모리 대신 파일을 사용하고 ~ 사용자 home 디렉토리 밑에 h2test 파일을 만들겠다는 의미 입니다.
1. h2 db 계정명 입니다.
1. h2 db 패스워드 입니다.
1. h2 db 연결을 위한 h2 driver 를 설정합니다.
1. 오픈할 서비스 포트 입니다. [http://127.0.0.1:9090 ](http://127.0.0.1:9090)
1. 엑셀파일 용량을 감안하여 한번에 올릴수 있는 파일 사이즈를 100M로 지정합니다.
1. 한번에 요청할수 있는 request 사이즈를  100M로 지정합니다.

### 3.3 City.java
행정코드 정보를 저장할 City bean 클래스를 생성합니다. lombok 을 사용하므로 아래와 같이 @Getter @Setter @ToString
어노테이션을 사용하여 setter getter tostring 코드를 자동으로 완성했습니다.
```java
package io.github.goodsaem.freemarker.model;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class City {
    private String lcode;
    private String lname;
    private String mcode;
    private String mname;
    private String scode;
    private String sname;
}
```
### 3.4 ICityService
h2 db에 저장된 모든 데이터를 가져오는 fintAll 매소드와 엑셀파일을 읽고 난후 db에 저장하는
createCode mehtod를 가진 인터페이스를 생성합니다.
```java
package io.github.goodsaem.freemarker.service;

import io.github.goodsaem.freemarker.model.City;
import java.util.List;

public interface ICityService {
    List<City> findAll();
    Boolean createCode(String lcode,String lname,String mcode,
                       String mname,String scode,String sname);
    void createTable();
}
```
### 3.5 CityService
CityService 를 실제로 구현합니다. h2 db 데이터저장 데이터 읽기를 위해 16-17 라인처럼 JdbcTemplte 의존성을 주입합니다. findAll 메소드
에서는 hcode 테이블 데이터를 전체 읽어 오는 query를 작성했고 createCode 메소드에서는 입력받은 값을 db 에 insert 하도록 구현했습니다.
그리고 테이블이 생성되어 있지 않으면 생성하고 이미 생성되어 있으면 drop 하는 코드를 추가했습니다. 실제 서비스 할때는 drop 이나 create 는
별도로 구현하시기 바랍니다.
소스코드는 크게 어려운 부분이 없어 설명은 skip 하겠습니다. 
```java line 16-17
package io.github.goodsaem.freemarker.service;

import io.github.goodsaem.freemarker.model.City;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.PreparedStatementCallback;
import org.springframework.stereotype.Service;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.List;

@Service
public class CityService implements ICityService {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public List<City> findAll() {
        var sql = "SELECT * FROM hcode";
        return jdbcTemplate.query(sql,new BeanPropertyRowMapper<>(City.class));
    }

    @Override
    public Boolean createCode(String lcode, String lname, String mcode, String mname, String scode, String sname) {
        var sql = "insert into hcode(lcode,lname,mcode,mname,scode,sname) values (?,?,?,?,?,?)";
        return jdbcTemplate.execute(sql, new PreparedStatementCallback<Boolean>() {
            @Override
            public Boolean doInPreparedStatement(PreparedStatement ps) throws SQLException, DataAccessException {
                ps.setString(1,lcode);
                ps.setString(2,lname);
                ps.setString(3,mcode);
                ps.setString(4,mname);
                ps.setString(5,scode);
                ps.setString(6,sname);
                return ps.execute();
            }
        });
    }

    @Override
    public void createTable() {
        var sql = "DROP TABLE IF EXISTS HCODE";
        jdbcTemplate.execute(sql);

        sql =
        "CREATE TABLE IF NOT EXISTS HCODE ( "+
        "        LCODE VARCHAR(2), "+
        "        LNAME VARCHAR(255), "+
        "        MCODE VARCHAR(5), "+
        "        MNAME VARCHAR(255), "+
        "        SCODE VARCHAR(7) PRIMARY KEY, "+
        "       SNAME VARCHAR(255) "+
        ") ";
        jdbcTemplate.execute(sql);
    }
}
```

### 3.6 MyController.java
request 를 처리하는 컨트롤러는 아래와 같은 기능을 수행합니다.
- / : 브라우저를 통해 최초로 접근하는 index 화면에 대한 제어를 담당합니다.
- /cities : db에 등록되어 있는 행정코드를 읽어 화면에 표시합니다.
- /excel : 엑셀파일을 선택해서 업로드 하는 화면을 호출합니다.
- /uploadExcel : 업로드된 엑셀파일을 받아서 db에 저장하고 엑셀 내용을 역할을 담당합니다.
  - 49 : 테이블이 있다면 drop 하고 없다면 생성합니다.
  - 52-55 : 파일 확장자 xls xlsx 즉 액샐 파일 인지 체크 하여 아니면 오류를 발생합니다.
  - 58-64 : 확장자에 맞는 workbook 을 선택한후 첫번째시트(0번째)를 불러옵니다. worksheet
  - 67-83 : 엑셀 행수,칼럼수 만큼 돌면서 데이터를 추출하여 db 에 insert 합니다.
  - 87 : 추출한 엑셀 내용을 datas list에 저장하여 excelList.ftlh view로 데이터를 전달합니다.
```java line 49,52-55,58-64,67-83,87
package io.github.goodsaem.freemarker.controller;

import io.github.goodsaem.freemarker.service.ICityService;
import org.apache.commons.io.FilenameUtils;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.ModelAndView;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;

@Controller
public class MyController {
    @Autowired
    private ICityService cityService;

    @GetMapping(value = "/")
    public String index(Model model){
        return "index";
    }

    @GetMapping(value="/cities")
    public ModelAndView showCities() {
        var cities = cityService.findAll();
        var params = new HashMap<String,Object>();

        params.put("cities",cities);

        return new ModelAndView("showCities",params);

    }
    @GetMapping(value = "/excel")
    public String excel(Model model){
        return "excel";
    }

    @PostMapping(value = "/uploadExcel")
    public ModelAndView uploadExcel(@RequestParam("file")MultipartFile file) throws IOException {
        cityService.createTable();

        var dataList = new ArrayList<>();
        String extension = FilenameUtils.getExtension(file.getOriginalFilename());
        if(!extension.equals("xlsx") && !extension.equals("xls")) {
            throw new IOException("only excel file!!");
        }

        Workbook workbook = null;
        if(extension.equals("xlsx")) {
            workbook = new XSSFWorkbook(file.getInputStream());
        } else if(extension.equals("xls")) {
            workbook = new HSSFWorkbook(file.getInputStream());
        }

        Sheet worksheet = workbook.getSheetAt(0);

        int k=0;
        for(int rowIndex=1; rowIndex<worksheet.getPhysicalNumberOfRows(); rowIndex++) {
            Row row = worksheet.getRow(rowIndex);
            if(row != null) {
                int cells = row.getPhysicalNumberOfCells();
                var hashMap = new HashMap();
                for(int columnIndex=0; columnIndex<= cells; columnIndex++) {
                    hashMap.put("col"+columnIndex,row.getCell(columnIndex) + "");
                }
                dataList.add(hashMap);
                cityService.createCode((String)hashMap.get("col0"),
                        (String)hashMap.get("col1"),
                        (String)hashMap.get("col2"),
                        (String)hashMap.get("col3"),
                        (String)hashMap.get("col4"),
                        (String)hashMap.get("col5"));
            }
        }

        var params = new HashMap<String,Object>();
        params.put("datas",dataList);
        return new ModelAndView("excelList",params);
    }
}
```
### 3.7 .ftlh files

- index.ftlh
```html
<!DOCTYPE html>
<html>
<head>
    <title>행정코드관리</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body>
<a href="cities">행정코드보기</a>
<a href="excel">엑셀 업로드</a>
</body>

</html>
```
- excel.ftlh
```html
<!DOCTYPE html>
<html>
<head>
    <title>엑셀업로드</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body>
<form action="/uploadExcel" method="POST" enctype="multipart/form-data">
    <input type="file" name="file">
    <input type="submit" value="엑셀업로드" />
</form>
</body>
</html>
```
- excelList.ftlh
```html
<!DOCTYPE html>
<html>
<head>
    <title>행정구역코드</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
<h2>행정구역 코드</h2>

<table border="1">
    <tr>
        <th>시도코드</th>
        <th>시도명칭</th>
        <th>시군구코드</th>
        <th>시군구명칭</th>
        <th>읍면동코드</th>
        <th>읍면동명칭</th>
    </tr>
    <#list datas as data>
    <tr>
        <td>${data["col0"]}</td>
        <td>${data["col1"]}</td>
        <td>${data["col2"]}</td>
        <td>${data["col3"]}</td>
        <td>${data["col4"]}</td>
        <td>${data["col5"]}</td>
    </tr>
</#list>
</table>

</body>
</html>
```  
- showCities.ftlh
```html
<!DOCTYPE html>
<html>
<head>
    <title>Cities</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
<h2>행정코드 리스트</h2>
<table border="1">
    <tr>
        <th>시도코드</th>
        <th>시도명칭</th>
        <th>시군구코드</th>
        <th>시군구명칭</th>
        <th>읍면동코드</th>
        <th>읍면동명칭</th>
    </tr>
    <#list cities as city>
    <tr>
        <td>${city.lcode}</td>
        <td>${city.lname}</td>
        <td>${city.mcode}</td>
        <td>${city.mname}</td>
        <td>${city.scode}</td>
        <td>${city.sname}</td>
    </tr>
</#list>
</table>

</body>
</html>
```

## 4. 테스트
FreemarkerApplication.java 파일에서 마우스 오른쪽 버튼을 클릭하여 Run 메뉴를 실행합니다.
{% asset_img execute.jpg)

[http://127.0.0.1:9090/](http://127.0.0.1:9090/) 페이지에 접속하면 아래와 같은 페이지에 접속하고 
정상 실행됨을 확인할수 있습니다.

{% asset_img test1.jpg %}
{% asset_img test2.jpg %}
{% asset_img test3.jpg %}

## 마무리
처음에는 간단히 정리할려고 했는데 만들어가다 보니 욕심히 생겨서 이런 저런 기능을 추가 해서 코드가 길어 졌네요. 소스 코드가 필요하신분은
아래 파일을 다운로드 받으셔서 실행해 보세요..

- [예제에서 사용한 엑셀파일](/down/excel.xls)
- [소스다운로드](/down/freemarker.zip)
