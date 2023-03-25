---
title: 3. SpringBoot Backend 서버 구축
date: 2023-03-26 01:13:03
tags: [springboot]
category: [코딩,springboot]
toc: true
---

{% asset_img springboot-003.png %}


# <i class="fa fa-database"></i> 3. SpringBoot H2DB 연동
h2 db 와 spring boot 를 연결하는 방법에 대해서 알아보겠습니다. h2 db 설치하는 방법은 Setup 부분을 확인하세요

## 1. 디렉토리 구조
디레토리 구조는 아래와 같으며 3개 파일을 추가할 예정입니다. 미리 파일을 만들어 주세요
```{9,12,14}
build.gradle
src
└── main
    ├── java
    │   └── io.github.goodsaem.api
    │           ├── ApiApplication.java
    │           ├── controller
    │           │    │   └── v1
    │           │    │        └── MemoController.java    
    │           │    └── MyController.java
    │           ├── entity
    │           │    └── Memo.java
    │           └── repo
    │                └── MemoJpaRepo.java
    └── resources
        ├── application.yml
        ├── banner.txt
        └── templates            
            └── goodsaem.ftlh
```


## 2. h2 db 실행 
h2 db 가 설치된 디렉토리의 bin 디렉토리로 이동하여 아래 명령어를 실행합니다.
```shell
sh h2.sh
```

## 3. application.yml 수정
**application.yml** 에 h2 db 연결 정보를 입력합니다.
- **6 line** : h2 db 파일 위치를 지정합니다.
- **7 line** : db 접속용 driver 는 h2 driver 를 지정합니다.
- **8,9 line** : db 생성시 입력했던 아이디 패스워드를 입력합니다.
- **12 line** : application 이 시작할때 자바 객체와 db 테이블을 비교하여 필요한 테이블이나 칼럼이 없을때 자바 객체에 맞춰 DB 스키마를 변경하라는 의미입니다.
- **13 line** : jpa 가 실행한 쿼리를 콘솔 로그로 출력하라는 의미 입니다.


```yaml
server:
  port: 9090

spring:
  datasource:
    url : jdbc:h2:/Users/goodsaem/goodsaem/api/goodsaem
    driver-class-name: org.h2.Driver
    username: goodsaem
    password: xxxxxxxxxxxx
  jpa:
    database-platform: org.hibernate.dialect.H2Dialect
    properties.hibernate.hbm2ddl.auto: update
    showSql: true
```

:::tip ORM,JPA
ORM(Object Relational Mapping) 은 객체와 관계형 데이터 베이스 Mapping, 객체와 DB 테이블이 매핑을 이루는것을 말합니다. 객체가 테이블이 되도록
매핑시켜주는 프레임워크라고 생각하시면 됩니다. 이렇게 객체와 테이블을 연결해 놓으면 프로그램 복잡도 줄어 들고 자바 객체와 쿼리를 분리 할수 있어 트랜잭션
처리나 데이터 베이스 관련작업을 손쉽게 할수 있다는 장점이 있습니다. Memo 테이블의 데이터를 가져오기 위해서는 **SELECT * FROM MEMO** 이런씩으로
쿼리를 작성해서 가져왔는데요 ORM 에서는 Memo.findAll() 이라는 메소드를 호출 하여 데이터 조회가 가능합니다.

JPA(Java Persistence API) 는 자바 ORM 기술에 대한 API 표준 명세서 입니다. ORM 을 사용하기 위한 인터페이스를 모두 가지고 있으며 자바 어플리
케이션에서 관계형 데이터베이스(RDB)를 사용하는 방식을 정의한 Interface 입니다. 그래서 본 예제에서는 jpa 를 이용하여 쿼리 없이 insert select
를 구현했습니다.
:::

## 4. Memo.java
자바 객체 Model 과 DB 테이블 매핑을 위해 JPA 가 사용할수 있는 Model 을 entity 폴더에 만듭니다. Lombok 어노테이션을 사용하여 불필요한 코딩을
줄였습니다.
- *6 라인* : builder 를 사용하기 위한 어노테이션 입니다.
- *7 라인* : JPA Entity 라는 의미 입니다.
- *8,9 라인* : setter,getter 를 자동으로 생성합니다.
- *10 라인* : 인자없는 생성자를 자동 생성합니다.
- *11 라인* : 인자를 모두 갖춘 생성자를 자동 생성합니다.
- *12 라인* : memo 테이블과 매핑됨을 명시합니다.
- *14 라인* : primary key 를 선언합니다.
- *15 라인* : auto increment 칼럼을 의미 합니다.
- *18,21 라인* : 제목과 내용을 정의하고 각각의 길이를 정의합니다.
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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long idx;

    @Column(nullable = false, length = 30)
    private String title;

    @Column(nullable = false, length = 4000)
    private String contents;
}
```

::: tip JPA Primary Key 지정방법
- 직접 지정 : *@Id* 어노테이션으로 필드와 매핑합니다. 자바 기본형,래퍼형,String,Date,BigDecimal,BigInteger 타입이 가능합니다.
- IDENTITY : *@GeneratedValue(strategy = GenerationType.IDENTITY)* 를 사용하며 키 생성을 데이터베이스에 위임합니다. auto increment
와 같은 기능을 사용할때 사용합니다. IDENTITY 를 사용하면 데이터를 insert 한 후 기본 키 값을 가져오기 위한 조회 문장을 실행합니다.
- SEQUENCE : 시퀀스를 사용해서 기본키를 생성성합니다. *@SequenceGenerator* name 식별자 생성기 이름을 지정해주고 sequenceName 에 db 에 등록
되어 있는 시퀀스 정보를 입력합니다. initialValue 는 초기값을 지정하고 allocationSize 는 시퀀스가 증가하는 수 여기서는 1씩 증가합니다. 저장할때
DB 시쿼스를 가져오기 insert 를 수행합니다. 
```java
@Entity
@SequenceGenerator(name = "SEQ_MEMO_GENERATOR", sequnceName = "SEQ_MEMO"
                  initialValue = 1, allocationSize = 1)
public class Memo {
  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SEQ_MEMO_GENERATOR")
  private Long idx;
}
```
- TABLE : 키 생성 전용 테이블을 하나 만들어 기본키를 생성하는 방법입니다. *@TableGenerator* 어노테이션을 사용하며 여기에 지정된 테이블과 pk 칼럼과
증가하는 사이즈를 이용하여 기본키를 생성합니다.
```java
@Entity
@TableGenerator(name = "SEQ_MEMO_GENERATOR", table = "SEQUNCE_MEMO"
                 pkColumnValue = "SEQ_MEMO", allocationSize = 1)
public class Memo {
@Id
@GeneratedValue(strategy = GenerationType.TABLE, generator = "SEQ_MEMO_GENERATOR")
private Long idx;
}
```  
:::

## 5. MemoJpaRepo.java
JPA 에서 제공해주는 API 를 이용하여 테이블에 질의하기 위한 Repository 를 생성합니다.
```java
package io.github.goodsaem.api.repo;

import io.github.goodsaem.api.entity.Memo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemoJpaRepo extends JpaRepository<Memo, Long> {
}
```

## 6. MemoController.java
사용자 요청에 따라 위에서 생성한 MemoJpaRepo 를 이용하여 테이블에 insert select 를 수행하고 결과를 리턴하는 역할을 수행합니다. 

- *10 라인* : memoJpaRepo 객체를 Constructor Injection 작업을 수행하기 위해 사용합니다. 
- *11 라인* : 결과값을 json 형태로 리턴합니다.
- *12 라인* : api resource 를 버전별로 관리하기 위해서 사용하는 방법으로 보통 v1 v2 v3 이런씩으로 번호를 올려가면서 관리합니다.
- *16 라인* : get 방식으로 /memo 를 호출하면 findAll 메소드를 이용하여 memo 테이블에 있는 모든 데이터르 보여줍니다. 즉 select * from memo 한 
             결과를 리턴합니다. 
- *21 라인* : post 방식으로 /memo 를 호출하면 save 메소드를 이용하여 memo 데이터를 디비에 인서트 합니다. 
             insert into memo (idx,title,contents) values (null,?,?) 한결과와 동일합니다.
```java
package io.github.goodsaem.api.controller.v1;

import io.github.goodsaem.api.entity.Memo;
import io.github.goodsaem.api.repo.MemoJpaRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping(value = "/v1")
public class MemoController {
private final MemoJpaRepo memoJpaRepo;

    @GetMapping(value = "/memo")
    public List<Memo> findAllUser() {
        return memoJpaRepo.findAll();
    }

    @PostMapping(value = "/memo")
    public Memo save(@RequestBody Memo memo) {
        return memoJpaRepo.save(memo);
    }
}
```
:::tip 생성자 주입 방식(Constructor Injection)
생성자 주입을 사용하는 이유는 아래 링크를 참고해 주세요
[Constructor-주입을-사용하자](https://velog.io/@dahye4321/Constructor-%EC%A3%BC%EC%9E%85%EC%9D%84-%EC%82%AC%EC%9A%A9%ED%95%98%EC%9E%90)
:::

## 7. 테스트
테스트는 postman 을 사용해서 진행하겠습니다. [https://www.postman.com/downloads/](https://www.postman.com/downloads/) 사이트에서 Download the App
버튼을 클릭하여 설치를 진행해 주세요
{% asset_img postman.jpg %}

- http 전송방식은 POST 로 지정을 하시고 url 은 [http://localhost:9090/v1/memo](http://localhost:9090/v1/memo) 를 지정하고 Headers Contents-Type
  을 application/json 으로 지정합니다.
  - {% asset_img pman1.jpg %}
- body 부분은 아래와 같이 입력하고 post 버튼을 클릭합니다.
  - {% asset_img pman2.jpg %}
```json
{    
    "title" : "memo title1",
    "contents" : "memo content1"
}
```
- 동일한 url 을 사용하고 http 방식만 get 방식으로 변경하고 send 버튼을 클릭하면 아래와 같이 등록한 데이터를 리스트업 되는걸 확인할수 있습니다.
  - {% asset_img pman3.jpg %}

## 8. application.yml 수정
properties.hibernate.hbm2ddl.auto: update 속성 값에 따라 테이블이 자동 생성 또는 수정되었습니다. 개발 모드에서는 이렇게 사용해도 되는데 운영
환경에서는 이렇게 지정하면 원하지 않는 디비 변경이 발생하여 문제가 될수 있습니다. 아래와 같이 none 으로 변경합니다.

```yaml{12}
server:
  port: 9090

spring:
  datasource:
    url : jdbc:h2:/Users/goodsaem/goodsaem/api/goodsaem
    driver-class-name: org.h2.Driver
    username: goodsaem
    password: xxxxxxxxxxxx
  jpa:
    database-platform: org.hibernate.dialect.H2Dialect
    properties.hibernate.hbm2ddl.auto: none
    showSql: true
```

*properties.hibernate.hbm2ddl.auto* 값 설명
|구분|설명|
|:---:|:---:|
|create|application 이 시작할때 모든 테이블을 생성합니다.|
|create-drop|application 이 시작할때 테이블을 생성하고 종료할때는 테이블을 drop 합니다.|
|update|application 시작 시 Entity 와 테이블을 비교하여 변경된 내용을 반영합니다. 테이블이 없으면 생성하고 칼럼이 없으면 추가합니다.|
|validate|application 시작시 Entity 와 테이블을 비교하여 동일하지 않으면 application 을 종료합니다.|
|none|아무런 처리를 하지 않습니다.|

## 마무리
대충 보고 넘어갔던 내용들을 글로 적으니 하나씩 그 의미를 찾아보게 되네요 제가 글을 써가면서 제 실력이 향상된다고 믿으며 오늘도 긴글 끝까지 읽어주신
분들에게 고마운 마음을 전합니다. 감사합니다.
