---
title: 10/13 무료 aws + springboot 서버 구축
date: 2023-03-25 20:10:00
tags: [SPRINGBOOT,AWS]
category: [설치,SPRINGBOOT]
toc: true
---
{% asset_img aws_springboot-010.png %}

# <i class="fas fa-server"></i> 10. Nginx Springboot 설정

[http://goodsaem.ml/spring](http://goodsaem.ml/spring) 로 접속하면 springboot가 응답하도록
nginx 설정을 변경하겠습니다.


## 1. nginx 설정파일 수정 

아래 명령어로 nginx 설정 파일을 수정 합니다.
```shell
ubuntu@goodsaem:~$ sudo vi /etc/nginx/conf.d/default.conf
```

아래와 같이 /spring 요청이 오면 13~18 라인 설정에 따라 springboot로 보내는 설정입니다. 
그외 전체 nginx 설정이 있으니 참고 하시기 바랍니다
```shell
server {
listen       80;
server_name  localhost;

    #charset koi8-r;
    #access_log  /var/log/nginx/host.access.log  main;

    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
    }

    location /spring {
        proxy_pass http://localhost:9090/spring;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
    }

    #error_page  404              /404.html;

    # redirect server error pages to the static page /50x.html
    #
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }

    # proxy the PHP scripts to Apache listening on 127.0.0.1:80
    #
    #location ~ \.php$ {
    #    proxy_pass   http://127.0.0.1;
    #}

    # pass the PHP scripts to FastCGI server listening on 127.0.0.1:9000
    #
    #location ~ \.php$ {
    #    root           html;
    #    fastcgi_pass   127.0.0.1:9000;
    #    fastcgi_index  index.php;
    #    fastcgi_param  SCRIPT_FILENAME  /scripts$fastcgi_script_name;
    #    include        fastcgi_params;
    #}

    # deny access to .htaccess files, if Apache's document root
    # concurs with nginx's one
    #
    #location ~ /\.ht {
    #    deny  all;
    #}
}
```

## 2. nginx 서비스 재시작
```shell
ubuntu@goodsaem:~$ sudo service nginx restart
```

## 3. springboot 시작
업로드한 hello*.war 파일을 아래 명령어로 시작합니다.

```shell
ubuntu@goodsaem:~$ java -jar hello-0.0.1-SNAPSHOT.war

.   ____          _            __ _ _
/\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
\\/  ___)| |_)| | | | | || (_| |  ) ) ) )
'  |____| .__|_| |_|_| |_\__, | / / / /
=========|_|==============|___/=/_/_/_/
:: Spring Boot ::                (v2.4.4)

2021-03-26 23:47:09.084  INFO 819 --- [           main] g.github.io.hello.HelloApplication       : Starting HelloApplication using Java 1.8.0_282 on goodsaem with PID 819 (/home/ubuntu/hello-0.0.1-SNAPSHOT.war started by ubuntu in /home/ubuntu)
2021-03-26 23:47:09.095  INFO 819 --- [           main] g.github.io.hello.HelloApplication       : No active profile set, falling back to default profiles: default
2021-03-26 23:47:11.586  INFO 819 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat initialized with port(s): 9090 (http)
2021-03-26 23:47:11.617  INFO 819 --- [           main] o.apache.catalina.core.StandardService   : Starting service [Tomcat]
2021-03-26 23:47:11.617  INFO 819 --- [           main] org.apache.catalina.core.StandardEngine  : Starting Servlet engine: [Apache Tomcat/9.0.44]
2021-03-26 23:47:12.505  INFO 819 --- [           main] o.a.c.c.C.[.[localhost].[/spring]        : Initializing Spring embedded WebApplicationContext
2021-03-26 23:47:12.505  INFO 819 --- [           main] w.s.c.ServletWebServerApplicationContext : Root WebApplicationContext: initialization completed in 3273 ms
2021-03-26 23:47:13.495  INFO 819 --- [           main] o.s.s.concurrent.ThreadPoolTaskExecutor  : Initializing ExecutorService 'applicationTaskExecutor'
2021-03-26 23:47:13.927  INFO 819 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port(s): 9090 (http) with context path '/spring'
2021-03-26 23:47:13.955  INFO 819 --- [           main] g.github.io.hello.HelloApplication       : Started HelloApplication in 6.085 seconds (JVM running for 7.154)
```

## 4. springboot 테스트

[http://goodsaem.ml/spring/goodsaem/string](http://goodsaem.ml/spring/goodsaem/string) url 로 접속하여
아래와 같은 화면이 출력되면 nginx + springboot 연동 성공입니다.

```html
안녕하세요 좋은 선생님 goodsaem! 입니다.
```
