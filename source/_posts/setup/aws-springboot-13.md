---
title: 13/13 무료 aws + springboot 서버 구축
date: 2023-03-25 20:13:00
tags: [SPRINGBOOT,AWS]
category: [설치,SPRINGBOOT]
toc: true
---
{% asset_img aws_springboot-013.png %}
# <i class="fas fa-server"></i> 13. vue용 메모앱

aws 에 프리티어 서버를 만들고 도메인을 발급받고 jdk 를 설치하고 springboot app 까지 만든이유는 결국 vue.js로
화면을 만들기 위함 입니다. 초간단 메모 app을 만들어 보겠습니다.

## 1. 화면디자인

만들화면에 대해서 대략적인 화면설계를 해보았습니다. 

- 제목 내용에 해당하는 메모를 검색합니다.
- 체크박스 체크된 메모를 선택하고 삭제버튼을 클릭하면 체크된 메모를 삭제합니다.
- 등록 버튼을 클릭하면 우측의 등록 화면의 제목쪽으로 포커스를 이동합니다.
- 등록 버튼을 클릭하면 메모가 등록되고 좌측에 메모가 하나 추가 됩니다.
- 페이지 번호를 클릭하면 해당 페이지에 속하는 메모가 리스트업 됩니다.
- 좌측 메모리스트에서 row를 클릭하면 우측에 제목과 내용이 보이고 수정모드로 변합니다.
- 수정모드에서 수정 버튼을 클릭하면 메모가 수정되고 수정된 내용이 좌측 리스트에 반영됩니다.

{% asset_img 1.jpg %}

## 2. 화면개발

위 화면 설계서 되로 아래와 같이 화면을 개발해 보았습니다.
개발하다가 조금더 욕심이 생겨 전체 갯수도 표시하고 한페이지당 보여줄 갯수도 변경했습니다.
등록/검색 버튼을 클릭하여 app 이 제되로 동작하는 확인해 보세요. 참고로 아래 ui 컴포넌트는 element ui를
이용하여 개발 했습니다.

***

<vue-Exam5 />

## 3. backend 서비스 수정
위 화면에서 사용하는 backend 관련 수정파일은 아래와 같습니다.  [12. springboot application 만들기](/setup/freetier/z112.md)
해당 강좌에서 아래 4개 파일만 수정하시고 수정되면 동일한 요령으로 build 해서 서버에 배포 하고 서비스를 재시작 합니다.

15,19,21,22 라인
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

## 4. MemoController.java

메모 검색 및 페이징 처리를 위해서 아래와 같이 /memo/search 컨트롤러를 추가했습니다. pageable jpa에서 지원해주는 객체로 페이징 처리를 위해
필요한 값 페이지당 보여줄 row 수와 현재페이지 정보를 넘겨주면 알아서 가져올 데이터량을 줄여 줍니다. 즉 query에 offset 과 limit 문장이
추가됩니다.

눈여겨 보아야 되는 부분은 **다건 삭제** 부분입니다. 삭제 기능은 여러건을 넘겨서 일괄 삭제하는데 pathVariable 로 /spring/v1/memo/1,2,3
이런씩으로 넘기면 이를 List로 받아서 for문을 돌리면서 하나씩 삭제 하는 부분입니다.

51-56 라인
```java
package io.github.goodsaem.api.controller.v1;

import io.github.goodsaem.api.entity.Memo;
import io.github.goodsaem.api.service.IMemoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping(value = "/v1")
@Slf4j
public class MemoController {
    private final IMemoService iMemoService;

    @GetMapping(value = "/memo/search")
    public Page<Memo> searchMemo(@RequestParam String keyword, @PageableDefault(size=3,sort="id") Pageable pageable) {
        return iMemoService.searchMemo(keyword,pageable);
    }

    @GetMapping(value = "/memos")
    public List<Memo> readMemos() {
        return iMemoService.readMemos();
    }

    @GetMapping(value = "/memo/{id}")
    public Memo readMemo(@PathVariable long id) {
        return iMemoService.readMemo(id);
    }

    @PostMapping(value = "/memo")
    public Memo createMemo(@RequestBody Memo memo) {
        return iMemoService.createMemo(memo.getTitle(), memo.getContents());
    }

    @PutMapping(value = "/memo")
    public Memo updateMemo(@RequestBody Memo memo) {
        return iMemoService.updateMemo(memo.getId(), memo.getTitle(), memo.getContents());
    }

    @DeleteMapping(value = "/memo/{id}")
    public void deleteMemo(@PathVariable long id) {
        iMemoService.deleteMemo(id);
    }

    @DeleteMapping(value = "/memos/{ids}")
    public void deleteMemos(@PathVariable("ids") List<Long> ids) {
        for(Long id:ids) {
            iMemoService.deleteMemo(id);
        }
    }
}
```

## 5. MemoJpaRepo.java

검색조건을 가져오는 부분을 아래와 같이 @Query를 통해서 작성해 보았습니다. 이렇게 진행하지 않고 세련되게 작성하는 방법도 있을것 같은데 아직
jpa에 익숙하지 않아 내공이 쌓이면 따로 정리하겠습니다. 화면에서 검색어 keyword가 전달되면 제목 및 내용에서 찾는 간단한 sql 입니다.
정렬은 가장 마지막에 등록한 메모가 보이게 했구요 countQuery도 같이 작성하여 페이징 처리시 참고 합니다.

```java
package io.github.goodsaem.api.repo;

import io.github.goodsaem.api.entity.Memo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface MemoJpaRepo extends JpaRepository<Memo, Long> {
    Page<Memo> findAll(Pageable pageable);

    @Query(
        value = "SELECT m FROM Memo m WHERE m.title LIKE %:keyword% OR m.contents LIKE %:keyword% ORDER BY m.id DESC",
        countQuery = "SELECT COUNT(m.id) FROM Memo m WHERE m.title LIKE %:keyword% OR m.contents LIKE %:keyword%"
    )
    Page<Memo> findAllSearch(String keyword,Pageable pageable);
}
```

## 6. IMemoService.java
메모 검색을 사용하기 위한 searchMemo 메소드를 추가했습니다.

```java
package io.github.goodsaem.api.service;
import io.github.goodsaem.api.entity.Memo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
public interface IMemoService {
    List<Memo> readMemos();
    Page<Memo> searchMemo(String keyword, Pageable pageable);
    Memo readMemo(long id);
    Memo createMemo(String title,String contents);
    Memo updateMemo(long id,String title,String contents);
    void deleteMemo(long id);
}
```

## 7. MemoService.java
메모 서비스에서 메모를 검색하는 부분을 구현했습니다.

```java
package io.github.goodsaem.api.service;

import io.github.goodsaem.api.entity.Memo;
import io.github.goodsaem.api.repo.MemoJpaRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    public Page<Memo> searchMemo(String keyword, Pageable pageable) {
        Page<Memo> memo = memoJpaRepo.findAllSearch(keyword,pageable);
        return memo;
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
}
```

## 8. FrontEnd Source Description

<vue-Exam5 />

### MemoCreate.vue
위 화면중 우측 부분 내용으로 메모를 등록하는 폼은 다른 화면에서 사용할수 있을것 같아 별도의 컴포넌트로 분리했습니다. MemoCreate를 호출하는
부모 컨포넌트는 memo 모델을 넘겨줍니다. 그럼 memo 모델의 값을 복제해서 화면에서 활용하고 데이터 수정이 끝나고 저장 버튼을 누르면
상위 컴포넌트에게 **save** 되었다고 알려(emit) 줍니다. 자세한 내용은 vue 강좌 때 다시 설명하겠습니다.

```html
<template>
  <div style="margin-top: 10px">
    <el-row>
      <el-col :span="4" align="center">
        제목
      </el-col>
      <el-col :span="20">
        <el-input ref="title" placeholder="메모 제목을 입력하세요" v-model="memo.title"></el-input>
      </el-col>
    </el-row>
    <el-row style="margin-top: 10px">
      <el-col :span="4" align="center">
        내용
      </el-col>
      <el-col :span="20">
        <el-input
            type="textarea"
            :rows="7"
            placeholder="Please input"
            v-model="memo.contents">
        </el-input>
      </el-col>
    </el-row>
    <el-row style="margin-top: 10px">
      <el-col :span="24" align="center">
        <el-button type="primary" @click="saveMemo">저장</el-button>
      </el-col>
    </el-row>
  </div>
</template>
<script>
export default {
  name: "MemoCreate",
  props : {
    model : {
      type : Object,
    }
  },
  created() {
  },
  data() {
    return {
      memo : {
        id : -1,
        title : '',
        contents : '',
      },
    }
  },
  methods: {
    create() {
    },
    saveMemo() {
      this.$emit("save",this.memo)
    }
  },
  watch: {
    model(model)  {
      this.memo = Object.assign({},model);
      this.$refs.title.focus();
    }
  }
}
</script>
<style scoped></style>
```

<vue-Exam5 />

### Exam5.vue
검색 및 결과를 출력하는 컴포넌트 입니다. 화면을 그리는 부분 빼고 실제 코딩은 많지 않습니다. data 값만 잘 주고 받ㅇ면 화면은
잘 표현되니까 자세한 내용은 역시 다음 시간으로 돌리겠습니다. 

```html
<template>
  <div style="margin-top: 10px">
    <el-row>
      <el-col :span="12">
        <el-row>
          <el-col :span="4" style="padding-right: 10px;">
            검색어 :
          </el-col>
          <el-col :span="12" style="padding-right: 10px;">
            <el-input @change="searchMemo"  v-model="keyword"></el-input>
          </el-col>
          <el-col :span="8" style="padding-left: 10px;">
            <el-button type="primary" @click="searchMemo">메모검색</el-button>
          </el-col>
        </el-row>
        <el-row style="margin-top: 10px">
          <el-col>
            전체 : {{ total }}
            <el-button type="primary" @click="deleteMemo">삭제</el-button>
            <el-button type="primary" @click="createMemo">등록</el-button>
            <el-select v-model="size"
                       placeholder="한페이지당 row수"
                       @change="searchMemo"
            >
              <el-option
                  v-for="(row,index) in 100"
                  :key="index"
                  :label="row"
                  :value="row">
              </el-option>
            </el-select>
          </el-col>
        </el-row>
        <el-row style="margin-top: 10px">
          <el-col>
            <el-row>
              <el-table
                  ref="table"
                  v-if="gridData.length >= 0"
                  @row-click="rowClick"
                  :data="gridData"
                  style="width: 100%">
                <el-table-column
                    type="selection"
                    align="center"
                    width="55">
                </el-table-column>
                <el-table-column
                    prop="id"
                    align="center"
                    label="번호"
                    width="50">
                </el-table-column>
                <el-table-column
                    prop="title"
                    label="제목"
                    header-align="center"
                    style="width: 95%">
                </el-table-column>
              </el-table>
            </el-row>
            <el-row style="margin-top: 10px">
              <el-col>
                <el-pagination
                    background
                    layout="prev, pager, next"
                    @current-change="chgPage"
                    :current-page="page+1"
                    :page-size="size"
                    :total="total">
                </el-pagination>
              </el-col>
            </el-row>
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="12" style="border-left: 1px solid #efefef;">
        <memo-create :model="memo" @save="saveMemo"/>
      </el-col>
    </el-row>
  </div>
</template>
<script>
const URL = "https://goodsaem.ml/spring";
//const URL = "http://localhost:9090/spring";
import MemoCreate from "./MemoCreate";

export default {
  name: "Exam5",
  created() {
  },
  components: {
    MemoCreate
  },
  data() {
    return {
      page: 0,
      size : 3,
      total : 0,
      keyword: '',
      memo: {
        title: '',
        contents: '',
      },
      gridData: [],
    }
  },
  methods: {
    create() {
    },
    rowClick(v) {
      this.memo = v;
    },
    chgPage(page) {
      this.page=page-1
      this.searchMemo();
    },
    saveMemo(memo) {
      if (memo.id === -1) {
        this.$http.post(URL + '/v1/memo', memo).then((response) => {
          this.searchMemo();
        })
      } else {
        this.$http.put(URL + '/v1/memo', memo).then((response) => {
          this.searchMemo();
        })
      }
    },
    createMemo() {
      this.memo = Object.assign({
        id : -1,
        title : '',
        contents : '',
      })
    },
    deleteMemo() {
      let ids = "";
      this.$refs.table.selection.map(r => ids += r.id + ",");
      ids = ids.substring(0,ids.length-1);

      if(this.$refs.table.selection.length > 0) {
        this.$http.delete(URL + '/v1/memos/' + ids)
            .then((response) => {
              this.$message("정상적으로 삭제되었습니다.");
              this.searchMemo();
            })
      }
    },
    searchMemo() {
      this.$http.get(URL + '/v1/memo/search', {
        params: {
          keyword : this.keyword,
          page: this.page,
          size: this.size,
        }
      })
      .then((response) => {
        console.log(response)
        this.gridData = response.data.data.content;
        this.total = response.data.totalElements;
      })
    }
  }
}
</script>
<style scoped></style>
```

## 마치며
처음 vue 공부를 할때는 정말 어려웠는데 이제 정말 편할수가 없네요 아직 복잡한 화면을 안만들어봐서 그런지 springboot가 더 어렵다는 생각이 듭니다.
계속 하다보면 늘겠죠. 한걸음 한걸음씩 꾸준히 진행하겠습니다. 긴글 읽어주셔서 감사합니다.

::: tip 전체 소스
[12. springboot application 만들기](/setup/freetier/z112.md) 의 [소스다운 로드](/down/api2.zip) 하신후 위의 4개 파일만
변경하시고 build 하면 정상동작합니다.(backend)

frontend 는 시간될때 독립적으로 움직일수 있도록 vue project를 따로 만들어 배포하겠습니다.
:::
