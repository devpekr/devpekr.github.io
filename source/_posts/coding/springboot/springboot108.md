---
title: 8. SpringBoot Backend 서버 구축
date: 2023-03-26 01:18:03
tags: [springboot]
category: [코딩,springboot]
toc: true
---
{% asset_img springboot-008.png %}

# <i class="fa fa-database"></i> 8. RESTful API  디자인 원칙

제가 생각하고 만들려고 하는 서비스는 frontend와 backend 서버가 별도로 구분되어 운영됩니다. backend 부분은 springboot 에서 restapi 형태로 데이터를
제공합니다. 데이터를 어떻게 리턴할지 정리해 보겠습니다. 대부분 아래와 유사하게 작성할것 같은데요 만들어 보면서 정리해보겠습니다. 

## 1. 메소드분리
사용목적에 맞게 메소드를 분리합니다.

http 프로토콜은 아래와 같은 http method을 제공합니다. 보통 get 과 post는 많이 사용햤는데 아래 put 과 delete도 사용할수 있으니
용도에 맞게 사용하시기 바랍니다.

|메소드|구분|설명|
|:---:|:---:|:---:|
| GET | read | 데이터를 읽어서 표시할때 사용합니다.
| POST | create | 데이터를 저장할때 사용합니다.
| PUT | update | 데이터를 수정할때 사용합니다.
| DELETE | delete | 데이터를 삭제 할때 사용합니다.

## 2. api 규칙

위에 규칙으로 지금까지 만든 memo app 의 rest api 구성을 해보겠습니다.

|메소드|url|설명|
|:---:|:---:|:---:|
| GET | /v1/memo/{idx}| memo id 에 맞는 데이터를 조회합나다.
| GET | /v1/memos | 모든 메모를 조회합니다.
| POST | /v1/memo | 신규 메모를 등록합니다.
| PUT | /v1/memo | 기존 메모를 수정합니다.
| DELETE | /v1/memo/{id} | memo id 에 맞는 메모를 삭제합니다.
| DELETE | /v1/memos | 모든 메모를 삭제 합니다.

## 3. 서비스 재시작 방법
위에 url로 데이터를 요청할때 return 되는 구조를 정형화 하겠습니다. api 결과 에러발생시 에러코드 정보를 리턴하고 
데이터 리턴 하는 구조도 정형화 하겠습니다. 추가할 파일은 22, 27 라인이고 나머지는 위 구조에 맞게 수정 하겠습니다.

*line 14,18,22,27*
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
    │           │    ├── IHCodeService.java
    │           │    └── ResponseService.java
    │           ├── repo
    │           |     ├── HCodeRepo.java
    │           |     └── MemoJpaRepo.java
    │           ├── response
    │           |     └── Response.java
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

## 4. Response.java

restapi 실행결과를 리턴하는 공통 모델 입니다.

```java
package io.github.goodsaem.api.response;

import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Response<T> {
    @ApiModelProperty(value = "요청 처리 결과 : true or false")
    private boolean result;

    @ApiModelProperty(value ="요청 처리 코드 0 성공 , -1 오류")
    private int resultCode;

    @ApiModelProperty(value ="결과 메시지")
    private String message;

    @ApiModelProperty(value ="리턴 데이터")
    private T data;
}
```

## 5. ResponseService.java

api 요청 결과에 따라 sucess 와 fail 을 리턴할 enum type 의 ReturnResponse를 선언하고 api 처리결과 성공 실패를 리턴하는
메소드를 하기와 같이 생성 합니다. 32번라인 key 값이 없다면 즉 결과가 한건이면 obj 값을 리턴하도록 하고 그외 경우는 key 값에 해당
하는 리턴하는 형태로 구현했습니다. 자세한건 실행결과를 보면서 다시 설명하겠습니다.

```java
package io.github.goodsaem.api.service;

import io.github.goodsaem.api.response.Response;
import lombok.Getter;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class ResponseService {

    @Getter
    public enum ReturnResponse {
        SUCCESS(0, "Success."),
        FAIL(-1, "Fail.");

        int returnCode;
        String returnMessage;

        ReturnResponse(int returnCode, String returnMessage) {
            this.returnCode = returnCode;
            this.returnMessage = returnMessage;
        }
    }

    public <T> Response<T> getResult(String key, Object obj) {
        Response<T> result = new Response<>();
        Map<String,Object> map = new HashMap<>();
        map.put(key,obj);

        if("".equals(key)) {
            result.setData((T) obj);
        } else {
            result.setData((T) map);
        }

        result.setResult(true);
        result.setResultCode(ReturnResponse.SUCCESS.getReturnCode());
        result.setMessage(ReturnResponse.SUCCESS.getReturnMessage());

        return result;
    }

    public Response getSuccessResult() {
        Response result = new Response();
        result.setResult(true);
        result.setResultCode(ReturnResponse.SUCCESS.getReturnCode());
        result.setMessage(ReturnResponse.SUCCESS.getReturnMessage());
        return result;
    }

    public Response getFailResult(String message) {
        Response result = new Response();
        result.setResult(false);
        result.setResultCode(ReturnResponse.FAIL.getReturnCode());
        result.setMessage(ReturnResponse.FAIL.getReturnMessage() + " : " + message);
        return result;
    }
}
```

## 6. Memo.java

Memo 모델을 아래와 같이 수정합니다. 특별히 달라진점은 없고 @ApiModelProperty 로 칼럼에 대해서 상세하게 기술했습니다.

```java
package io.github.goodsaem.api.entity;

import io.swagger.annotations.ApiModelProperty;
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
    @ApiModelProperty(value = "메모번호" , notes = "메모 고유 번호", example = "1")
    private long id;

    @Column(nullable = false, length = 30)
    @ApiModelProperty(required = true, value = "제목", notes = "메모 제목" , example = "중요한 메모")
    private String title;

    @Column(nullable = false, length = 4000)
    @ApiModelProperty(required = true, value="내용", notes = "메모 내용" , example = "내용을 등록해 봅니다.")
    private String contents;
}
```

## 7. MemoController.java

메모 컨트롤러에 단건 조회, 삭제 , 여러건 삭제 등을 추가하고 swagger 문서에 표시할 내용을 아래와 같이 추가했습니다.

```java
package io.github.goodsaem.api.controller.v1;

import io.github.goodsaem.api.entity.Memo;
import io.github.goodsaem.api.repo.MemoJpaRepo;
import io.github.goodsaem.api.response.Response;
import io.github.goodsaem.api.service.ResponseService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Api(tags = {"1. Memo"})
@RequiredArgsConstructor
@RestController
@RequestMapping(value = "/v1")
public class MemoController {
    private final MemoJpaRepo memoJpaRepo;
    private final ResponseService responseService;

    @ApiOperation(value = "메모 전체 조회", notes = "모든 메모를 조회합니다.")
    @GetMapping(value = "/memos")
    public Response<Memo> readMemos() {
        return responseService.getResult("list",memoJpaRepo.findAll());
    }

    @ApiOperation(value = "메모 한건 조회", notes = "memo id 로 메모를 조회합니다.")
    @GetMapping(value = "/memo/{id}")
    public Response<Memo> readMemo(@ApiParam(value = "memo id", required = true) @PathVariable long id) {
        return responseService.getResult("",memoJpaRepo.findById(id).orElse(null));
    }

    @ApiOperation(value = "메모 등록", notes = "메모를 등록합니다.")
    @PostMapping(value = "/memo")
    public Response<Memo> createMemo(@ApiParam(value = "제목", required = true) @RequestParam String title,
                                     @ApiParam(value = "내용", required = true) @RequestParam String contents
    ) {
        if(title.length() > 200) {
            return (Response<Memo>) responseService.getFailResult("제목 길이가 200보다 큽니다.");
        }

        if(contents.length() > 4000) {
            return (Response<Memo>) responseService.getFailResult("제목 길이가 4000보다 큽니다.");
        }

        Memo memo = Memo.builder()
                .title(title)
                .contents(contents)
                .build();

        return responseService.getResult("",memoJpaRepo.save(memo));
    }

    @ApiOperation(value = "메모 수정", notes = "메모를 수정합니다.")
    @PutMapping(value = "/memo")
    public Response<Memo> updateMemo(@ApiParam(value = "메모번호", required = true) @RequestParam long id,
                                     @ApiParam(value = "제목", required = true) @RequestParam String title,
                                     @ApiParam(value = "내용", required = true) @RequestParam String contents
                                      ) {
        Memo memo = Memo.builder()
                .id(id)
                .title(title)
                .contents(contents)
                .build();
        return responseService.getResult("",memoJpaRepo.save(memo));
    }

    @ApiOperation(value = "메모 삭제", notes = "메모 번호로 메모를 삭제합니다.")
    @DeleteMapping(value = "/memo")
    public Response deleteMemo(@ApiParam(value = "메모번호", required = true) @RequestParam long id
    ) {
        memoJpaRepo.deleteById(id);
        return responseService.getSuccessResult();
    }

    @ApiOperation(value = "메모 젠체 삭제", notes = "메모 전체를 삭제합니다.")
    @DeleteMapping(value = "/memos")
    public Response deleteMemos() {
        memoJpaRepo.deleteAll();
        return responseService.getSuccessResult();
    }
}
```


## 8. swagger test

만든 api 가 정상 동작하는지 swagger 를 통해서 확인 하겠습니다. [http://localhost:9090/spring/swagger-ui/](http://localhost:9090/spring/swagger-ui/)
에 접속합니다.


### 1. create
 1. Memo를 클릭한후 post 를 클릭한후 Try it out 버튼을 눌러 제목과 내용을 입력하고 Excute 버튼을 클릭합니다. 여러개 생성합니다.
    아래와 같이 데이터가 등록되었고 return 값도 정상으로 받았습니다. Response.java 에 정의한 형태로 리턴 되었습니다.
      
```json
{
  "result": true,
  "resultCode": 0,
  "message": "Success.",
  "data": {
    "id": 2,
    "title": "제목2",
    "contents": "내용2"
  }
}
```
    
  - {% asset_img 1.jpg %}

### 2. create fail
1. 제목을 200자 이상 입력했을경우 fail message 가 리턴되는지 확인해 보겠습니다. 결과가 fail로 예상한되로 동작합니다.

```json
{
  "result": false,
  "resultCode": -1,
  "message": "Fail. : 제목 길이가 200보다 큽니다.",
  "data": null
}
```

{% asset_img 2.jpg %}

### 3. update
PUT 메소드를 실행하여 메모를 수정합니다.

{% asset_img 3.jpg %}

### 4. all list
GET 메소드중 /spring/v1/memos 메모 전체 조회 를 클릭하여 Try it out > Execute 버튼을 클릭하여 실행하면 아래와 같은
결과를 확인 할수 있습니다.

memos 컨트롤러 부분을 확인하면 아래와 같이 key 값 list 와 findAll 메소드를 실행하여 전체 결과를 리턴합니다.
```java
@ApiOperation(value = "메모 전체 조회", notes = "모든 메모를 조회합니다.")
@GetMapping(value = "/memos")
public Response<Memo> readMemos() {
    return responseService.getResult("list",memoJpaRepo.findAll());
}
```
그럼 아래와 같이 결과가 출력됩니다. list 대신 memos 라고 하면 memos 라고 표시됩니다.

```json
{
  "result": true,
  "resultCode": 0,
  "message": "Success.",
  "data": {
    "list": [
      {
        "id": 1,
        "title": "제목 수정",
        "contents": "내용 수정"
      },
      {
        "id": 2,
        "title": "제목2",
        "contents": "내용2"
      }
    ]
  }
}
```

{% asset_img 4.jpg %}

### 5. 단건 조회 점검

GET 메소드중 /spring/v1/memo/{id} 를 실행하면 한건 데이터만 조회 됩니다.  전체 url은 아래와 같으며
http://localhost:9090/spring/v1/**memo**/**1** 위에서 설계한 되로 url 이 표시 됩니다.

{% asset_img 5.jpg %}

### 6 삭제기능 점검
같은 요령으로 삭제 및 전체 삭제를 수행하면 예상한되로 정상 동작합니다.

## 마무리
유사한 형태로 작성하는 연습을 하시면 자연스럽게 익숡해 질거라 믿습니다. 글 읽어 주셔서 감사합니다. 좀더 좋은 글로 보답하겠습니다.
