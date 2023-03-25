---
title: 2. SpringBoot Backend 서버 구축
date: 2023-03-26 01:09:03
tags: [springboot]
category: [코딩,springboot]
toc: true
---

{% asset_img springboot-002.png %}

# <i class="fa fa-road"></i> 2. SpringBoot 첫 예제

rest api 만들기 2번째 시간입니다. 오늘은 새로운 언어를 배울때 항상 제일 먼저 나오는 hello 출력을 진행하겠습니다. rest api 니 ur l을
호출하면 hello goodsaem! 을 출력하는 api를 만들어 보겠습니다.

[[toc]]

## 1. 디렉토리 구조
프로젝트 생성이 정상적으로 진행되었다면 아래와 그림과 같은 디렉토리 구조를 가집니다.
{% asset_img directory.jpg %}

아래 3개 폴더를 만들어 주세요.

- <i class="fa fa-folder-open"></i> controller 폴더
- <i class="fa fa-folder-open"></i> template 폴더


::: tip 폴더생성방법
io.github.goodsaem.api 패키지에서 마우스 오른쪽 버튼을 클릭하여 New Package 를 선택하여 controller 라고 입력하면
controller 폴더가 생성됩니다. 동일한 형태로 각각의 폴더를 만들어 주세요.

{% asset_img newpackage.jpg %}
:::

다만들고 나면 아래와 같은 구조가 됩니다.

```{5,7,10}
build.gradle
src
└── main
    ├── java
    │   └── io.github.goodsaem.api
    │           ├── ApiApplication.java
    │           └── controller
    └── resources
        ├── application.yml
        └── templates
```

## 2. file 추가


<i class="fa fa-folder-open"></i> controller 폴더
 - MyController.java 파일을 생성합니다.

<i class="fa fa-folder-open"></i> resources 폴더
 - application.properties 파일을 삭제합니다.
 - application.yml 파일을 생성합니다.
 - banner.txt 파일을 생성합니다.

<i class="fa fa-folder-open"></i> templates 폴더
 - goodaem.ftlh 파일을 생성합니다.

```{8}
build.gradle
src
└── main
    ├── java
    │   └── io.github.goodsaem.api
    │           ├── ApiApplication.java
    │           └── controller
    │              └── MyController.java
    └── resources
        ├── application.yml
        ├── banner.txt
        └── templates            
            └── goodsaem.ftlh
```

## 3. 코딩

### 3.1 banner.txt
spring boot 시작할때 콘솔창을 보면 텍스트 이모티콘으로 spring boot 라는 글자가 보이는데요
이걸 아래와 같은 텍스트로 변경해 보겠습니다. 아래 사이트 들어가서 원하는 글자를 만든 후 텍스트를 복새하세요
그리고 나서 추가한 banner.txt 파일에  붙여 넣기를 합니다.

[텍스트를 입력하면 이모티콘으로 변경해주는 사이트](http://patorjk.com/software/taag/#p=display&h=0&v=0&f=ANSI%20Shadow&t=goodsaem)

```text
  ██████╗  ██████╗  ██████╗ ██████╗ ███████╗ █████╗ ███████╗███╗   ███╗
██╔════╝ ██╔═══██╗██╔═══██╗██╔══██╗██╔════╝██╔══██╗██╔════╝████╗ ████║
██║  ███╗██║   ██║██║   ██║██║  ██║███████╗███████║█████╗  ██╔████╔██║
██║   ██║██║   ██║██║   ██║██║  ██║╚════██║██╔══██║██╔══╝  ██║╚██╔╝██║
╚██████╔╝╚██████╔╝╚██████╔╝██████╔╝███████║██║  ██║███████╗██║ ╚═╝ ██║
 ╚═════╝  ╚═════╝  ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝
:: Spring Boot ::                             (v2.4.2)
```
그럼 시작 할때 아래와 같은 배너를 확인할수 있습니다.
{% asset_img banner.jpg %}

### 3.2 application.yml
spring boot 서비스 port 를 9090 서비스 포트에서 서비스 하기 위해 아래 내용을 추가합니다.
```yaml
server:
  port: 9090
```

### 3.3 MyController.java
간단히 코드 설명을 하면...
- 20 라인 : string 형태로 출을 합니다.
- 28 라인 : json 형태로 출력 합니다.
- 35 라인 : freemaker template 엔진을 이용하여 html page 형태로 출력합니다.

```java
package io.github.goodsaem.api.controller;

import lombok.Getter;
import lombok.Setter;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class MyController {

    private final String MSG="안녕하세요 좋은 선생님 goodsaem! 입니다.";

    @Setter
    @Getter
    public static class JsonObj {
        private String msg;
    }

    @GetMapping(value = "/goodsaem/string")
    @ResponseBody
    public String getString() {
        return MSG;
    }

    @GetMapping(value = "/goodsaem/json")
    @ResponseBody
    public JsonObj getJson() {
        JsonObj obj = new JsonObj();
        obj.msg  = MSG;
        return obj;
    }

    @GetMapping(value = "/goodsaem/page")
    public String helloworld() {
        return "goodsaem";
    }
}
```
### 3.4 goodsaem.**ftlh**
free maker template 페이지 입니다.
::: danger .ftlh
최근 freemaker 확장자가 변경되었습니다.fth 였는데 .fthl 로 변경되었습니다. 이걸 몰라서 한참을 구글링 했습니다.
:::

```html
<!DOCTYPE html>
<html>
<head>
    <title>goodsaem</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body>
안녕하세요 좋은 선생님 goodsaem! 입니다.
</body>

</html>
```

## 4. 실행
Intellij 우측 상단의 실행 아이콘을 클릭하여 application 을 가동합니다.
{% asset_img exec.jpg %}

정상적으로 실행되면 콘솔창에 아래와 같이 출력 됩니다.

{% asset_img banner.jpg %}

## 5. 테스트

- [string](http://127.0.0.1:9090/goodsaem/string)
  - {% asset_img string.jpg %}
- [json](http://127.0.0.1:9090/goodsaem/json)
  - {% asset_img json.jpg %}
- [page](http://127.0.0.1:9090/goodsaem/page)
  - {% asset_img page.jpg %}

## 마무리
어렵지 않은 내용인데 .fthl 에서 시간을 많이 낭비 했습니다. 프로그램을 작성하다 보면 이건 왜 안되지 이건 왜 되지 ?
이런 일들의 연속인데요 그런데 다 이유가 있더라구요 뭔가 안된다면 의심을 하시구요 내가 생각한게 틀릴수도 있다는 유연한
생각을 가지고 문제를 하나씩 풀어가다 보면 해결될거라 생각합니다. 긴글 읽어주셔서 감사합니다. 보다 좋은글로 보답하겠습니다.
