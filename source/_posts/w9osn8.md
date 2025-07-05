---
title: SpringBoot 오라클 클라우드 자율데이터 베이스 연동 초간단 게시판 만들기
date: 2025-07-05 18:40:47
tags: [Blog]
categories: [Blog]
toc: true
---

# {% fa database %} 연동 이미지
아래와 같이 https://goodsaem.github.io로 접속하면 오라클 클라우드에 접속하여 데이터를 불러오는 구성을 만들어 보자. 블로그에서
동적 컨텐츠를 제공하기 위함 이며 하나씩 만들어가면서 블로그도 업그레이드 예정이다.

{% callout type:"info" title:"오라클 클라우드 springboot 연동" %}
gpt한테도 물어보고 인터넷검색도 해봤는데 잘 동작하는 예제가 없어 springboot 최신 버전으로 연동하는 서비스를 만들어 보고자 한다.
{% endcallout %}

{% draw "/drawio/spring-oracle-cloud.drawio" %}

## 동작
- 아래와 같은 형태로 동작한다.

![](../../images/cj6o8k.jpg)


## 전자지갑 다운로드
- 데이터 베이스 접속 버튼을 클릭한후 > 전자지갑 다운로드 > 비밀번호 입력 > 다운로드 버튼을 클릭하면 > Wallet_goodsaem.zip 파일이 다운로드 된다.

![](../../images/e1q172.jpg)

## springboot 프로젝트 생성
https://start.spring.io/ 여기에서 springboot 프로젝트를 생성한다.

1. Project : Gradle - Groovy
2. Language : Java
3. Spring Boot : 3.5.3
4. Project Metadata
```sql
Group : io.github.goodsaem
Aritifact: oracle
Name : oracle
Description : oracle
Package name : io.github.goodsaem.oracle
Packaing : jar
```
5. Dependencies
```sql
Lombok
Spring Data Jpa
Spring Web
Thymeleaf
Oracle Driver
```

Generate 버튼을 클릭하여 프로젝트 파일을 다운로드 한다.

![](../../images/wvcnil.jpg)

## gradle 다운로드
https://gradle.org/releases/ 사이트 에서 binary 파일을 다운로드 한다.
https://gradle.org/next-steps/?version=8.14.3&format=bin

![](../../images/jq4b7w.jpg)

## 프로젝트 셋팅
C:\sample 폴더에 다운로드 받은 전자지갑과 프로젝트 파일 gradle 파일 압축을 푼다. 디렉토리 구조는 아래와 같다.
```bash
c:\sample
├─gradle-8.14.3
│  ├─bin
│  ├─init.d
│  └─lib
│      ├─agents
│      └─plugins
├─oracle
│  ├─.gradle
│  │  ├─8.14.2
│  │  │  ├─checksums
│  │  │  ├─expanded
│  │  │  ├─fileChanges
│  │  │  ├─fileHashes
│  │  │  └─vcsMetadata
│  │  ├─buildOutputCleanup
│  │  └─vcs-1
│  ├─.idea
│  ├─build
│  │  └─reports
│  │      └─problems
│  ├─gradle
│  │  └─wrapper
│  └─src
│      ├─main
│      │  ├─java
│      │  │  └─io
│      │  │      └─github
│      │  │          └─goodsaem
│      │  │              └─oracle
│      │  └─resources
│      │      ├─static
│      │      └─templates
│      └─test
│          └─java
│              └─io
│                  └─github
│                      └─goodsaem
│                          └─oracle
└─Wallet_goodsaem
```

## 인텔리제이 셋팅
인텔리제이에서 oracle 프로젝트를 오픈한다.

- Setting > Build,Execution, Deployment > Build Tools > Gradle 메뉴에서 Gradle user Home 디렉토리를 C:\sample\gradle-8.14.3 로 설정한고 Gradle JVM 17로 맞춘다.

![](../../images/g09mnb.jpg)

- build.gradle 파일에서 아래 내용을 추가하고 reload gradle 아이콘을 클릭한다.

{% callout type:"warning" title:"의존성 패지지" %}
버전을 명시하지 않으면 오류가 발생한다. 2025-07-05 20:11:12 시점기준 최신 라이브러리로 버전을 명시했다.
{% endcallout %}

```
implementation 'com.oracle.database.jdbc:ojdbc17:23.8.0.25.04'
implementation 'com.oracle.database.security:oraclepki:23.8.0.25.04'
implementation 'com.oracle.database.security:osdt_cert:21.18.0.0'
implementation 'com.oracle.database.security:osdt_core:21
```


![](../../images/y8bc87.jpg)

- application.properties 파일은 삭제하고 application.yml 파일을 아래와 같이 작성한다.

{% callout type:"warning" title:"application.yml" %}
TNS_ADMIN=C:/sample/Wallet_goodsaem 은 각자 디렉토리 구조에 맞게 설정 하고 password는 전자지갑 다운로드 받을때 입력한 암호를 입력한다.
{% endcallout %}

```yaml
spring:
  datasource:
    url: jdbc:oracle:thin:@goodsaem_high?TNS_ADMIN=C:/sample/Wallet_goodsaem
    username: admin
    password: XXXXXXXXXXXX
    driver-class-name: oracle.jdbc.OracleDriver

  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
```

## 실행
- templates 디렉토리에 index.html을 아래와 같이 작성한다.
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>goodsaem</title>
</head>
<body>
<h1>Goodsaem</h1>
</body>
</html>
```

![](../../images/xe0x0r.jpg)

- OracleApplication 에서 ▶ 아이콘을 클릭하여 application 를 실행한다 정상적으로 실행되면 아래와 같이 에러없이 수행된다.

![](../../images/e60kma.jpg)

- 웹브라우저로 http://localhost:8080 접속했을때 아래와 같이 나오면 정상 

![](../../images/se67dl.jpg)

## 게시판 소스 생성
- controller,domain,repository,service 디렉토리 및 templates/board 디렉토리를 생성하고 BoardController.java,Board.java,BoardRepository.java , detail.html , form.html ,  list.html  파일을 생성한다.
```bash
├─main
  ├─java
│  │  └─io
│  │      └─github
│  │          └─goodsaem
│  │              └─oracle
│  │                  │  OracleApplication.java
│  │                  │
│  │                  ├─controller
│  │                  │      BoardController.java
│  │                  │
│  │                  ├─domain
│  │                  │      Board.java
│  │                  │
│  │                  ├─repository
│  │                  │      BoardRepository.java
│  │                  │
│  │                  └─service
│  └─resources
│      │  application.yml
│      │
│      ├─static
│      └─templates
│          │  index.html
│          │
│          └─boards
│                  detail.html
│                  form.html
│                  list.html

```
## 아래와 같이 코딩한다.

### BoardController.java
```java
package io.github.goodsaem.oracle.controller;

import io.github.goodsaem.oracle.domain.Board;
import io.github.goodsaem.oracle.repository.BoardRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
@RequestMapping("/boards")
public class BoardController {

    private final BoardRepository boardRepository;

    public BoardController(BoardRepository boardRepository) {
        this.boardRepository = boardRepository;
    }

    // 게시글 목록 화면
    @GetMapping
    public String list(Model model) {
        List<Board> boards = boardRepository.findAll();
        model.addAttribute("boards", boards);
        return "boards/list";
    }

    // 새 글 작성 화면
    @GetMapping("/new")
    public String createForm(Model model) {
        model.addAttribute("board", new Board());
        return "boards/form";
    }

    // 글 등록 처리
    @PostMapping
    public String create(Board board) {
        boardRepository.save(board);
        return "redirect:/boards";
    }

    // 글 상세 화면
    @GetMapping("/{id}")
    public String detail(@PathVariable Long id, Model model) {
        Board board = boardRepository.findById(id).orElseThrow(() -> new RuntimeException("글이 없습니다."));
        model.addAttribute("board", board);
        return "boards/detail";
    }

    // 글 수정 화면
    @GetMapping("/{id}/edit")
    public String editForm(@PathVariable Long id, Model model) {
        Board board = boardRepository.findById(id).orElseThrow(() -> new RuntimeException("글이 없습니다."));
        model.addAttribute("board", board);
        return "boards/form";
    }

    // 글 수정 처리
    @PostMapping("/{id}/edit")
    public String edit(@PathVariable Long id, Board board) {
        Board existing = boardRepository.findById(id).orElseThrow(() -> new RuntimeException("글이 없습니다."));
        existing.setTitle(board.getTitle());
        existing.setContent(board.getContent());
        boardRepository.save(existing);
        return "redirect:/boards";
    }

    // 글 삭제 처리
    @PostMapping("/{id}/delete")
    public String delete(@PathVariable Long id) {
        boardRepository.deleteById(id);
        return "redirect:/boards";
    }
}
```
### Board.java
```java
package io.github.goodsaem.oracle.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class Board {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String content;
}
```
### BoardRepository.java
```java
package io.github.goodsaem.oracle.repository;

import io.github.goodsaem.oracle.domain.Board;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BoardRepository extends JpaRepository<Board, Long> {
}
```
### detail.html
```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8" />
    <title>게시글 상세</title>
</head>
<body>
<h1>게시글 상세</h1>
<p><strong>번호:</strong> <span th:text="${board.id}"></span></p>
<p><strong>제목:</strong> <span th:text="${board.title}"></span></p>
<p><strong>내용:</strong> <span th:text="${board.content}"></span></p>

<a th:href="@{/boards/{id}/edit(id=${board.id})}">수정</a> |
<a href="/boards">목록으로</a>
</body>
</html>
```
### form.html
```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8" />
    <title>게시글 작성/수정</title>
</head>
<body>
<h1 th:text="${board.id == null} ? '새 글 작성' : '글 수정'">게시글 작성/수정</h1>

<form th:action="${board.id == null} ? @{/boards} : @{/boards/{id}/edit(id=${board.id})}" method="post">
    <label>제목: <input type="text" name="title" th:value="${board.title}" required/></label><br/><br/>
    <label>내용: <textarea name="content" rows="5" cols="50" required
                         th:text="${board.content}"></textarea></label><br/><br/>
    <button type="submit">저장</button>
    <a href="/boards">취소</a>
</form>

</body>
</html>
```
### list.html
```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8" />
    <title>게시판 목록</title>
</head>
<body>
<h1>게시판 목록</h1>
<a href="/boards/new">새 글 작성</a>
<table border="1" cellpadding="5" cellspacing="0">
    <thead>
    <tr>
        <th>번호</th>
        <th>제목</th>
        <th>내용</th>
        <th>상세보기</th>
        <th>삭제</th>
    </tr>
    </thead>
    <tbody>
    <tr th:each="board : ${boards}">
        <td th:text="${board.id}">1</td>
        <td th:text="${board.title}">제목</td>
        <td th:text="${board.content}">내용</td>
        <td><a th:href="@{/boards/{id}(id=${board.id})}">보기</a></td>
        <td>
            <form th:action="@{/boards/{id}/delete(id=${board.id})}" method="post"
                  onsubmit="return confirm('삭제하시겠습니까?');">
                <button type="submit">삭제</button>
            </form>
        </td>
    </tr>
    </tbody>
</table>
</body>
</html>
```

## 기능테스트
- springboot를 재시작 한후 기능점검

- 목록  http://localhost:8080/boards

![](../../images/ivb1hz.jpg)

- 새글작성 http://localhost:8080/boards/new

![](../../images/qw839p.jpg)

- 보기 http://localhost:8080/boards/4

![](../../images/mtgsu0.jpg)

- 글 수정

![](../../images/xb7yzy.jpg)

- 글 삭제

![](../../images/iqaz94.jpg)


