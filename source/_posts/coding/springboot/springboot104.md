---
title: 4. SpringBoot Backend 서버 구축
date: 2023-03-26 01:14:03
tags: [springboot]
category: [Coding,springboot]
toc: true
---

{% asset_img springboot-004.png %}

# <i class="fas fa-server"></i> 4. Aws 배포
지금까지 만든 springboot 프로그램을 war 파일로 만든다음 aws에 배포하여 특정디렉토리로 요청이왔을때는 springboot가 응답하도록 설정해보겠습니다.
aws에 서버 구축과 php + mariadb 연동 + ssl 설정하는방법은 아래 url 참고하세요
- [/setup/aws/z101-freetier.html](/setup/local/z101-freetier.html)

## 1. build.gradle 
war 파일로 build하기 위해 build.gradle 파일을 아래와 같이 수정했습니다. 아래 강조된 색상 부분만 참고하시면 되구요 간단히 설명드리면
spring boot 버전을 2.4.2 로 명시했구요 spring-boot-gradle-plugin 의존성을 추가한후 apply plugin war 등의 정보를
추가했습니다.

```editorconfig{1-18}
buildscript {
	ext {
		springBootVersion = '2.4.2'
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
version = '0.0.1-SNAPSHOT'

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
	compileOnly 'org.projectlombok:lombok'
	runtimeOnly 'com.h2database:h2'
	runtimeOnly 'mysql:mysql-connector-java'
	annotationProcessor 'org.projectlombok:lombok'
	testImplementation 'org.springframework.boot:spring-boot-starter-test'
}

test {
	useJUnitPlatform()
}

```
## 2. 시작디렉토리 변경 및 cors설정
nginx 가 설치되어 있는 https를 지원해주는 서버에 ( 설정은 위에 url 참고하세요) /spring 이라는 요청이 오면 springboot 쪽으로 전달하여
springboot가 처리하도록 하기 위해 context-path 에 spring 이라고 추가를 해줍니다. 세션타임아웃 시간등을 정해주시구요 
h2 db 파일을 springboot가 실행되는 디렉토리에서 찾기위해 ./goodsaem이라고 설정을 변경했습니다.

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
    url : jdbc:h2:./goodsaem
    driver-class-name: org.h2.Driver
    username: goodsaem
    password: xxxxxxxx
  jpa:
    database-platform: org.hibernate.dialect.H2Dialect
    properties.hibernate.hbm2ddl.auto: update
    showSql: true
```

Cors 설정을 위해 프로젝트 / 아래에 config 디렉토리를 만들고 아래와 같이 WebConfig를 생성합니다.
아래 설정이 누락되면 동일출처오류 cors 오류가 발생합니다. 
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


## 3. intellij build

intellij 에서 Gradle 을 클릭하고 Taks를 펼쳐 build 아래의 build를 더블 클릭합니다. 이렇게 진행하면 war파일이 생성됩니다. 

{% asset_img 1.jpg %}

좌측의 프로젝트 디렉토리에서 build > libs > api-0.0.1-SNAPSHOT.war 파일 확인이 가능합니다.

{% asset_img 2.jpg %}

## 4. war 파일 업로드
db파일과 war파일을 서버에 업로드 합니다.

파일질라를 통해 프로젝트 홈 디렉토리에 있는 goodsaem.mv.db 파일과 war파일을 업로드 합니다.

{% asset_img 3.jpg %}

## 5. nginx 설정
nginx 설정을 변경합니다.

aws ssh shell에서 아래와 같이 입력합니다.

```shell
ubuntu@goodsaem:~$ sudo vi /etc/nginx/conf.d/default.conf
```
아래와 같이 context path 의 spring 디렉토리의 요청이 오면 12~15 라인 설정에 따라 springboot로 보내는 설정입니다.
그외 전체 nginx 설정이 있으니 참고 하시기 바랍니다.
[https://goodsaem.ml/spring/v1/memo](https://goodsaem.ml/spring/v1/memo)
```shell{9-12}
server {
    server_name  goodsaem.ml;
    charset utf-8;
    access_log  /var/log/nginx/localhost.access.log  main;
    error_log /var/log/nginx/localhost.error.log;
    root /home/ubuntu/phprest/public;
    
    location /spring {
        proxy_pass http://localhost:9090/spring;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
    }
    location / {
        try_files $uri $uri/ /index.php?$args;
    }
    error_page 405 =200 $uri;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
    
    location ~ \.php$ {
        proxy_pass   http://127.0.0.1;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;

        fastcgi_pass 127.0.0.1:9000;
        proxy_redirect off;
        fastcgi_intercept_errors on;
        fastcgi_read_timeout 300;
        fastcgi_send_timeout 300;
    }

    location ~ /\.ht {
        deny  all;
    }
    location = /xmlrpc.php {
        deny all;
        error_page 403 = /403.html;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/goodsaem.ml/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/goodsaem.ml/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}
server {
    if ($host = goodsaem.ml) {
        return 301 https://$host$request_uri;
    } # managed by Certbot
    server_name  goodsaem.ml;
    return 404; # managed by Certbot

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/goodsaem.ml/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/goodsaem.ml/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = goodsaem.ml) {
        return 301 https://$host$request_uri;
    } # managed by Certbot
    
    listen       80;
    server_name  goodsaem.ml;
    return 404; # managed by Certbot
}        
```

## 6. nginx springboot 시작
아래 명령어로 nginx 를 재시작합니다.
```shell
ubuntu@goodsaem:~$ sudo service nginx restart
```

업로드한 jar 파일을 아래 명령어로 실행합니다.
```shell{1}
ubuntu@goodsaem:~/api$ java -jar api*.war
 ██████╗  ██████╗  ██████╗ ██████╗ ███████╗ █████╗ ███████╗███╗   ███╗
██╔════╝ ██╔═══██╗██╔═══██╗██╔══██╗██╔════╝██╔══██╗██╔════╝████╗ ████║
██║  ███╗██║   ██║██║   ██║██║  ██║███████╗███████║█████╗  ██╔████╔██║
██║   ██║██║   ██║██║   ██║██║  ██║╚════██║██╔══██║██╔══╝  ██║╚██╔╝██║
╚██████╔╝╚██████╔╝╚██████╔╝██████╔╝███████║██║  ██║███████╗██║ ╚═╝ ██║
 ╚═════╝  ╚═════╝  ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝
:: Spring Boot ::                             (v2.4.2)
2021-03-10 00:36:10.524  INFO 17286 --- [           main] io.github.goodsaem.api.ApiApplication    : Starting ApiApplication using Java 1.8.0_282 on goodsaem with PID 17286 (/home/ubuntu/api/api-0.0.1-SNAPSHOT.war started by ubuntu in /home/ubuntu/api)
2021-03-10 00:36:10.535  INFO 17286 --- [           main] io.github.goodsaem.api.ApiApplication    : No active profile set, falling back to default profiles: default
2021-03-10 00:36:12.405  INFO 17286 --- [           main] .s.d.r.c.RepositoryConfigurationDelegate : Bootstrapping Spring Data JPA repositories in DEFAULT mode.
2021-03-10 00:36:12.545  INFO 17286 --- [           main] .s.d.r.c.RepositoryConfigurationDelegate : Finished Spring Data repository scanning in 114 ms. Found 1 JPA repository interfaces.
2021-03-10 00:36:14.131  INFO 17286 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat initialized with port(s): 9090 (http)
2021-03-10 00:36:14.167  INFO 17286 --- [           main] o.apache.catalina.core.StandardService   : Starting service [Tomcat]
2021-03-10 00:36:14.167  INFO 17286 --- [           main] org.apache.catalina.core.StandardEngine  : Starting Servlet engine: [Apache Tomcat/9.0.41]
2021-03-10 00:36:15.970  INFO 17286 --- [           main] o.a.c.c.C.[.[localhost].[/spring]        : Initializing Spring embedded WebApplicationContext
2021-03-10 00:36:15.970  INFO 17286 --- [           main] w.s.c.ServletWebServerApplicationContext : Root WebApplicationContext: initialization completed in 5303 ms
2021-03-10 00:36:16.857  INFO 17286 --- [           main] o.hibernate.jpa.internal.util.LogHelper  : HHH000204: Processing PersistenceUnitInfo [name: default]
2021-03-10 00:36:16.990  INFO 17286 --- [           main] org.hibernate.Version                    : HHH000412: Hibernate ORM core version 5.4.27.Final
2021-03-10 00:36:17.253  INFO 17286 --- [           main] o.hibernate.annotations.common.Version   : HCANN000001: Hibernate Commons Annotations {5.1.2.Final}
2021-03-10 00:36:17.487  INFO 17286 --- [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Starting...
2021-03-10 00:36:17.958  INFO 17286 --- [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Start completed.
2021-03-10 00:36:17.979  INFO 17286 --- [           main] org.hibernate.dialect.Dialect            : HHH000400: Using dialect: org.hibernate.dialect.H2Dialect
2021-03-10 00:36:19.285  INFO 17286 --- [           main] o.h.e.t.j.p.i.JtaPlatformInitiator       : HHH000490: Using JtaPlatform implementation: [org.hibernate.engine.transaction.jta.platform.internal.NoJtaPlatform]
2021-03-10 00:36:19.303  INFO 17286 --- [           main] j.LocalContainerEntityManagerFactoryBean : Initialized JPA EntityManagerFactory for persistence unit 'default'
2021-03-10 00:36:20.086  WARN 17286 --- [           main] JpaBaseConfiguration$JpaWebConfiguration : spring.jpa.open-in-view is enabled by default. Therefore, database queries may be performed during view rendering. Explicitly configure spring.jpa.open-in-view to disable this warning
2021-03-10 00:36:20.370  INFO 17286 --- [           main] o.s.s.concurrent.ThreadPoolTaskExecutor  : Initializing ExecutorService 'applicationTaskExecutor'
2021-03-10 00:36:21.187  INFO 17286 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port(s): 9090 (http) with context path '/spring'
2021-03-10 00:36:21.210  INFO 17286 --- [           main] io.github.goodsaem.api.ApiApplication    : Started ApiApplication in 11.982 seconds (JVM running for 13.126)
2021-03-10 00:36:37.301  INFO 17286 --- [nio-9090-exec-1] o.apache.coyote.http11.Http11Processor   : Error parsing HTTP request header
```

:::tip open jdk 1.8 설치
만약 openjdk 1.8이 설치되어 있지 않다면 아래 명령어로 설치해 주시기 바랍니다.

```shell{1,22}
ubuntu@goodsaem:~/api$ sudo apt install openjdk-8-jdk
Reading package lists... Done
Building dependency tree       
Reading state information... Done
The following additional packages will be installed:
  adwaita-icon-theme at-spi2-core ca-certificates-java fontconfig fonts-dejavu-extra gtk-update-icon-cache hicolor-icon-theme humanity-icon-theme java-common libasound2 libasound2-data libasyncns0 libatk-bridge2.0-0 libatk-wrapper-java libatk-wrapper-java-jni libatk1.0-0 libatk1.0-data libatspi2.0-0 libcairo2 libdatrie1 libdrm-amdgpu1 libdrm-intel1
  libdrm-nouveau2 libdrm-radeon1 libflac8 libfontenc1 libgail-common libgail18 libgdk-pixbuf2.0-0 libgdk-pixbuf2.0-bin libgdk-pixbuf2.0-common libgif7 libgl1 libgl1-mesa-dri libgl1-mesa-glx libglapi-mesa libglvnd0 libglx-mesa0 libglx0 libgraphite2-3 libgtk2.0-0 libgtk2.0-bin libgtk2.0-common libharfbuzz0b libice-dev libice6 libllvm10 libnspr4 libnss3 libogg0
  libpango-1.0-0 libpangocairo-1.0-0 libpangoft2-1.0-0 libpciaccess0 libpcsclite1 libpixman-1-0 libpthread-stubs0-dev libpulse0 librsvg2-2 librsvg2-common libsensors4 libsm-dev libsm6 libsndfile1 libthai-data libthai0 libvorbis0a libvorbisenc2 libx11-dev libx11-doc libx11-xcb1 libxau-dev libxaw7 libxcb-dri2-0 libxcb-dri3-0 libxcb-glx0 libxcb-present0
  libxcb-render0 libxcb-shape0 libxcb-shm0 libxcb-sync1 libxcb1-dev libxcomposite1 libxcursor1 libxdamage1 libxdmcp-dev libxfixes3 libxft2 libxi6 libxinerama1 libxmu6 libxrandr2 libxrender1 libxshmfence1 libxt-dev libxt6 libxtst6 libxv1 libxxf86dga1 libxxf86vm1 openjdk-8-jdk-headless openjdk-8-jre openjdk-8-jre-headless ubuntu-mono x11-common x11-utils
  x11proto-core-dev x11proto-dev xorg-sgml-doctools xtrans-dev
Suggested packages:
  default-jre libasound2-plugins alsa-utils gvfs libice-doc pcscd pulseaudio librsvg2-bin lm-sensors libsm-doc libxcb-doc libxt-doc openjdk-8-demo openjdk-8-source visualvm icedtea-8-plugin libnss-mdns fonts-ipafont-gothic fonts-ipafont-mincho fonts-wqy-microhei fonts-wqy-zenhei fonts-indic mesa-utils
The following NEW packages will be installed:
  adwaita-icon-theme at-spi2-core ca-certificates-java fontconfig fonts-dejavu-extra gtk-update-icon-cache hicolor-icon-theme humanity-icon-theme java-common libasound2 libasound2-data libasyncns0 libatk-bridge2.0-0 libatk-wrapper-java libatk-wrapper-java-jni libatk1.0-0 libatk1.0-data libatspi2.0-0 libcairo2 libdatrie1 libdrm-amdgpu1 libdrm-intel1
  libdrm-nouveau2 libdrm-radeon1 libflac8 libfontenc1 libgail-common libgail18 libgdk-pixbuf2.0-0 libgdk-pixbuf2.0-bin libgdk-pixbuf2.0-common libgif7 libgl1 libgl1-mesa-dri libgl1-mesa-glx libglapi-mesa libglvnd0 libglx-mesa0 libglx0 libgraphite2-3 libgtk2.0-0 libgtk2.0-bin libgtk2.0-common libharfbuzz0b libice-dev libice6 libllvm10 libnspr4 libnss3 libogg0
  libpango-1.0-0 libpangocairo-1.0-0 libpangoft2-1.0-0 libpciaccess0 libpcsclite1 libpixman-1-0 libpthread-stubs0-dev libpulse0 librsvg2-2 librsvg2-common libsensors4 libsm-dev libsm6 libsndfile1 libthai-data libthai0 libvorbis0a libvorbisenc2 libx11-dev libx11-doc libx11-xcb1 libxau-dev libxaw7 libxcb-dri2-0 libxcb-dri3-0 libxcb-glx0 libxcb-present0
  libxcb-render0 libxcb-shape0 libxcb-shm0 libxcb-sync1 libxcb1-dev libxcomposite1 libxcursor1 libxdamage1 libxdmcp-dev libxfixes3 libxft2 libxi6 libxinerama1 libxmu6 libxrandr2 libxrender1 libxshmfence1 libxt-dev libxt6 libxtst6 libxv1 libxxf86dga1 libxxf86vm1 openjdk-8-jdk openjdk-8-jdk-headless openjdk-8-jre openjdk-8-jre-headless ubuntu-mono x11-common
  x11-utils x11proto-core-dev x11proto-dev xorg-sgml-doctools xtrans-dev
0 upgraded, 111 newly installed, 0 to remove and 42 not upgraded.
Need to get 81.6 MB of archives.
After this operation, 556 MB of additional disk space will be used.
Do you want to continue? [Y/n] y
```

정상적으로 설치되었는지 확인합니다.
```shell{1}
ubuntu@goodsaem:~/api$ java -version
openjdk version "1.8.0_282"
OpenJDK Runtime Environment (build 1.8.0_282-8u282-b08-0ubuntu1~18.04-b08)
OpenJDK 64-Bit Server VM (build 25.282-b08, mixed mode)
```
:::

## 7. 테스트
아래 url 에 접속합니다.

- [https://goodsaem.ml/spring/v1/memo](https://goodsaem.ml/spring/v1/memo)

아래와 같이 json 문자열이 브라우저에 출력 된다면 ok 입니다.
```json
[ {"idx":1,"title":"memo title1","contents":"memo content1"},
  {"idx":2,"title":"memo title2","contents":"memo content2"},
  {"idx":3,"title":"memo title3","contents":"memo content3"},
  {"idx":4,"title":"memo title4","contents":"memo content4"},
  {"idx":6,"title":"memo title5","contents":"memo content5"},
  {"idx":7,"title":"memo title7","contents":"memo content7"}]
```

<vue-Exam4 />

메모를 등록하면 post로 등록 api를 호출하여 db에 내용을 저장하고 조회 api 를 호출하여 데이터를 받아서 grid에 표현합니다.
```html
<template>
  <div>
    <el-row>
      <el-col :span="8" style="padding-right: 10px;">
        <el-input placeholder="메모 제목을 입력하세요" v-model="memo.title"></el-input>
      </el-col>
      <el-col :span="8">
        <el-input placeholder="메모 내용을 입력하세요" v-model="memo.contents"></el-input>
      </el-col>
      <el-col :span="8" style="padding-left: 10px;">
        <el-button type="primary" @click="saveMemo">메모등록</el-button>
        <el-button type="primary" @click="searchMemo">메모검색</el-button>
      </el-col>
    </el-row>
    <el-row>
      <el-col>
        <i class="fas fa-smile"></i> Element Ui로 데이터 표현하기
      </el-col>
    </el-row>
    <el-row>
      <el-table v-if="gridData.length >= 0"
                :data="gridData"
                style="width: 100%">
        <el-table-column
            prop="idx"
            label="번호"
            width="180">
        </el-table-column>
        <el-table-column
            prop="title"
            label="제목"
            width="180">
        </el-table-column>
        <el-table-column
            prop="contents"
            label="내용">
        </el-table-column>
      </el-table>
    </el-row>
    <el-row>
      <el-col>
        <i class="fas fa-angry"></i> Tui Grid 로 데이터 표현하기
      </el-col>
    </el-row>
    <el-row>
      <el-col>
        <grid v-if="loadData === true"
              ref="tuiGrid"
              :data="gridData"
              :columns="columns"
              :scrollX="scrollX"
              :scrollY="scrollY"
        ></grid>
      </el-col>
    </el-row>
  </div>
</template>
<script>
const URL = "https://goodsaem.ml";
//const URL = "http://localhost:9090";
export default {
  name: "Exam4",
  created() {
  },
  data() {
    return {
      memo : {
        title : '',
        contents : '',
      },
      loadData: true,
      gridData: [],
      columns: [
        {
          header: '번호',
          name: 'idx'
        },
        {
          header: '메모',
          name: 'title'
        },
        {
          header: '메모내용',
          name: 'contents'
        },
      ],
      scrollX: false,
      scrollY: false,
    }
  },
  methods: {
    create() {
    },
    saveMemo() {
      this.$http.post(URL + '/spring/v1/memo',this.memo).then((response) => {
        this.searchMemo();
      })
    },
    searchMemo() {
      this.loadData = false;
      this.$http.get(URL + '/spring/v1/memo')
          .then((response) => {
            this.gridData = response.data
            this.loadData = true;
          })
    }
  }
}
</script>
<style scoped></style>
```

## 8. 참고
위에 spring boot는 ctrl+c 를 누르거나 ssh 를 종료하면 서비스가 종료 됩니다. 서비스가 백그라운드에서 실행되도록하고
프로세스를 죽이지 않도록 설정하겠습니다.

start.sh 파일을 만듭니다.
```shell
ubuntu@goodsaem:~/api$ vi start.sh
```

nohup 은 프로세스를 죽이지 않겠다는 의미이고 & 은 백그라운드에서 실행하겠다는 의미 입니다.
이렇게 실행하면 로그가 보이지 않습니다. 
```shell
nohup java -jar api*.war > api.log &
```

아래 명령어를 입력하여 로그를 확인합니다.
```shell{1}
ubuntu@goodsaem:~/api$ tail -f api.log
Hibernate: select memo0_.idx as idx1_0_, memo0_.contents as contents2_0_, memo0_.title as title3_0_ from memo memo0_
Hibernate: select memo0_.idx as idx1_0_, memo0_.contents as contents2_0_, memo0_.title as title3_0_ from memo memo0_
Hibernate: select memo0_.idx as idx1_0_, memo0_.contents as contents2_0_, memo0_.title as title3_0_ from memo memo0_
Hibernate: select memo0_.idx as idx1_0_, memo0_.contents as contents2_0_, memo0_.title as title3_0_ from memo memo0_
Hibernate: select memo0_.idx as idx1_0_, memo0_.contents as contents2_0_, memo0_.title as title3_0_ from memo memo0_
Hibernate: select memo0_.idx as idx1_0_, memo0_.contents as contents2_0_, memo0_.title as title3_0_ from memo memo0_
Hibernate: select memo0_.idx as idx1_0_, memo0_.contents as contents2_0_, memo0_.title as title3_0_ from memo memo0_
Hibernate: select memo0_.idx as idx1_0_, memo0_.contents as contents2_0_, memo0_.title as title3_0_ from memo memo0_
Hibernate: select memo0_.idx as idx1_0_, memo0_.contents as contents2_0_, memo0_.title as title3_0_ from memo memo0_
Hibernate: select memo0_.idx as idx1_0_, memo0_.contents as contents2_0_, memo0_.title as title3_0_ from memo memo0_
Hibernate: select memo0_.idx as idx1_0_, memo0_.contents as contents2_0_, memo0_.title as title3_0_ from memo memo0_
Hibernate: select memo0_.idx as idx1_0_, memo0_.contents as contents2_0_, memo0_.title as title3_0_ from memo memo0_
Hibernate: select memo0_.idx as idx1_0_, memo0_.contents as contents2_0_, memo0_.title as title3_0_ from memo memo0_
Hibernate: select memo0_.idx as idx1_0_, memo0_.contents as contents2_0_, memo0_.title as title3_0_ from memo memo0_

```

프로세스 종료는 아래와 같이 java 프로세스가 올라가 있는걸 확인하고 kill 명령어로 종료합니다.
kill 되고 나서 프로세스가 살아있는지 한번더 프로세를 확인 합니다.
```shell{1,4,5}
ubuntu@goodsaem:~/api$ ps -ef | grep java
ubuntu   17700     1  4 01:40 ?        00:00:15 java -jar api-0.0.1-SNAPSHOT.war
ubuntu   17870 17842  0 01:46 pts/0    00:00:00 grep --color=auto java
ubuntu@goodsaem:~/api$ kill -9 17700
ubuntu@goodsaem:~/api$ ps -ef | grep java
ubuntu   17872 17842  0 01:46 pts/0    00:00:00 grep --color=auto java
```


