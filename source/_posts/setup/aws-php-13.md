---
title: 13/13 무료로 aws + php 서버 구축
date: 2023-03-25 16:20:00
tags: [PHP,AWS]
category: [설치,PHP]
toc: true
---
![13/13 무료로 aws + php 서버 구축](/img/aws_php-013.png)
# <i class="fas fa-server"></i> 13. 테스트
Vue 로 간단하게 title 과 status , priority 를 입력 받아 저장하고 조회하는 화면을 만들어 보았습니다.

<php-GetJson />

```vue
<template>
  <div>
    <ul>
      <li>
        <el-input placeholder="please input title" v-model="model.title"></el-input>
      </li>
      <li>
        <el-input placeholder="please input status" v-model="model.status"></el-input>
      </li>
      <li>
        <el-input placeholder="please input priority" v-model="model.priority"></el-input>
      </li>
      <li>
        <el-input placeholder="please input description" v-model="model.description"></el-input>
      </li>
      <li>
        <el-button type="primary" @click="create">db에 값 저장 하기</el-button>
        <el-button type="primary" @click="search">db에 값 조회 하기</el-button>
      </li>
    </ul>
    <el-table
        :data="tasks"
        border
        style="width: 100%">
      <el-table-column
          prop="task_id"
          label="Task ID"
          width="180">
      </el-table-column>
      <el-table-column
          prop="title"
          label="Title"
          width="180">
      </el-table-column>
      <el-table-column
          prop="start_date"
          label="Start Date">
      </el-table-column>
      <el-table-column
          prop="due_date"
          label="Due Date">
      </el-table-column>
      <el-table-column
          prop="status"
          label="Status">
      </el-table-column>
      <el-table-column
          prop="priority"
          label="Priority">
      </el-table-column>
      <el-table-column
          prop="description"
          label="Description">
      </el-table-column>
      <el-table-column
          prop="created_at"
          label="Create Date">
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: "GetJson",
  created() {
  },
  data() {
    return {
      model : {
        title : '제목',
        status : '1',
        priority : '1',
        description: '내용',
      },
      tasks : [],
    }
  },
  methods: {
    create() {
      if(this.model.title != '' &&
          this.model.status != '' &&
          this.model.priority != '' &&
          this.model.description != '') {
        this.$http.post('https://goodsaem.ml/tasks',[this.model]).then((response) => {
          this.$message('정상적으로 저장되었습니다.');
        }).catch((err) =>{
          this.$message(err);
        });
      }
    },
    search() {
      this.$http.get('https://goodsaem.ml/tasks').then((response) => {
        this.tasks = response.data;
      })
    }
  }
}
</script>

<style scoped>

</style>
```

local에서 테스트 하면 아래와 같이 cors 오류가 발생합니다.

![error](/img/44.jpg)

https://goodsaem.github.io에서 테스트 하면 정상 동작 합니다.  cors 설정도 정상적으로 이루어 졌네요.
nginx 에는 cors 설정읋 하지 않았고 php쪽에만 cors 설정을 했습니다. 아래 코드를 참고하세요
php slime frame work요[/php/restfull/setup.html](/php/restfull/setup.html) 사용하는 부분도 참고하세요

```php{12-18}
<?php
declare(strict_types=1);

use App\Application\Actions\User\ListUsersAction;
use App\Application\Actions\User\ViewUserAction;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\App;
use Slim\Interfaces\RouteCollectorProxyInterface as Group;

return function (App $app) {
    $app->add(new Tuupola\Middleware\CorsMiddleware([
        "origin" => ["https://goodsaem.github.io","goodsaem.ml","goodsaem.ml","localhost"],
        "methods" => ["GET", "POST", "PUT", "PATCH", "DELETE","OPTIONS"],
        "headers.allow" => [],
        "headers.expose" => [],
        "credentials" => true,
        "cache" => 0,
    ]));


    $app->get('/', function (Request $request, Response $response) {
        $response->getBody()->write('Hello world!');
        return $response;
    });


    $app->group('/users', function (Group $group) {
        $group->get('', ListUsersAction::class);
        $group->get('/{id}', ViewUserAction::class);
    });

    $app->get('/api/customers' , function(Request $request , Response $response){
       $response->getBody()->write('CUSTOMERS!');
         return $response;
    });

    $app->get('/tasks', function (Request $request, Response $response) {
        $db = $this->get(PDO::class);
        $sth = $db->prepare("SELECT * FROM tasks ORDER BY task_id");
        $sth->execute();
        $data = $sth->fetchAll(PDO::FETCH_ASSOC);
        $payload = json_encode($data);
        $response->getBody()->write($payload);
        return $response->withHeader('Content-Type', 'application/json');
    });

    $app->post('/tasks', function (Request $request, Response $response) {
        $db = $this->get(PDO::class);
        $contents = json_decode(file_get_contents('php://input'), true);

        foreach ($contents as $item) {
            $sth = $db->prepare("
            INSERT INTO `tasks` (
                `title`, `start_date`, `due_date`, 
                `status`, `priority`,  `description`, 
                `created_at`
            ) VALUES (
                 :title,  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 
                 :status, :priority,         :description, 
                 CURRENT_TIMESTAMP
            )");

            $sth->bindParam(':title', $item['title']);
            $sth->bindParam(':status', $item['status']);
            $sth->bindParam(':priority', $item['priority']);
            $sth->bindParam(':description', $item['description']);
            $sth->execute();
        }

        $response->getBody()->write( json_encode($contents));
        return $response->withHeader('Content-Type', 'application/json');
    });
};

```

## 마무리
무료로 프리티어 서버로 ssl 서버를 구축하는 방법에 대해서 알아보았습니다. 긴글 읽어주셔서 감사합니다.
