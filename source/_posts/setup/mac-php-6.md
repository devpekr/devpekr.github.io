---
title: 6/8 mac+php+mariadb+nginx+ssl 설정
date: 2023-03-25 12:05:00
tags: [PHP,MAC]
category: [설치,PHP]
toc: true
---

{% asset_img mac-php-6.png %}

# <i class="fas fa-server"></i> 6. Nginx 설정
php 와 nginx 상세설정 내용입니다.

## 1. nginx.conf 변경
아래 명령어로 nginx 의 전반적인 설정(로그나 worker 수등)을 진행합니다.
```shell
 sudo vi /etc/nginx/nginx.conf
```

전체 설정한 내용은 아래와 같습니다.

```shell 1,2,3,5,9,17-19,22,24,25,26,31,49 라인 수정
user  nginx;
worker_processes  4;
worker_rlimit_nofile 30000;

error_log  /var/log/nginx/error.log notice;
pid        /var/run/nginx.pid;

events {
    worker_connections  1024;
}


http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    log_not_found off;
    index index.php index.htm index.html;

    gzip on;
    gzip_disable "msie6";
    gzip_comp_level 6;
    gzip_min_length 500;
    gzip_buffers 16 8k;
    gzip_proxied any;
    gzip_vary on;
    gzip_types text/plain text/css text/js text/xml text/javascript application/javascript application/x-javascript application/json application/xml application/rss+xml image/svg+xml image/png;

    keepalive_timeout 65;
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    aio on;
    sendfile_max_chunk 512k;
    directio 4m;
    server_tokens off;
    client_max_body_size 50M;
    proxy_buffer_size 128k;
    proxy_buffers 4 256k;
    proxy_busy_buffers_size 256k;
    fastcgi_buffer_size 128k;
    fastcgi_buffers 256 16k;
    http2_max_concurrent_streams 512;

    access_log  /var/log/nginx/access.log  main;
    error_log /var/log/nginx/error.log notice;

    include /etc/nginx/conf.d/*.conf;
}
```

주요한 부분에 대해서 라인번호 별로 설명을 진행하겠습니다.
- *1* : nginx 에서 사용할 os 유저 입니다. nginx 로 지정해 줍니다.
- *2* : 접속을 받고 처리하는 worker process 수를 뜻하며 해당 프로세스 만큼 프로세스가 생성됩니다.
- *3* : work process가 사용할수 있는 최대 파일수 입니다.
- *5* : nginx 기동시 로그를 받을수 있도록 *notice* 로 설정합니다.
- *9* : worker_connections 은 워커당 접속수를 나타내며 위에서 프로세스를 4개로 지정했으므로 최대 4096개의 접속이 가능합니다.
- *17-19* : 로그 포멧을 지정합니다.
- *22* : 디렉토리 인덱스 파일에 php를 추가합니다.
- *24* : gzip을 사용하겠다는 의미 입니다.
- *25* : gzip을 지원하지 않는 ie6 에서는 동작하지 않겠다는 의미 입니다.
- *26* : 압축의 정도를 나타내는 수치로 이 수치가 높으면 cpu 사용율이 높아집니다. cpu 사용율을 보면서 적절히 조정합니다.
- *31* : gzip을 수행할 파일종류를 지정합니다.
- *49* : 19라인에서 지정한 *main* 포멧되로 로그를 남깁니다. access_log  /var/log/nginx/access.log  *main*;
  ::: tip gzip
  gzip on 이 설정되어 있으면 웹서버가 응답할때 gzip으로 압축해서 내용을 전달하고 http 헤더 쪽에 압축된 gzip 파일이라는 정보를 같이
  전달합니다. 그럼 웹브라우저는 이 내용이 압축이 되었다고 판단하고 자동으로 압축을 풀어서 화면을 랜더링 합니다. 이렇게 압축된 gzip파일을
  받으면 시스템 속도가 빠르다는 장점이 있습니다. 하지만 너무 과도하게 사용하면 cpu 사용율 상승문제가 발생할수 있습니다.

  그래서 프로그래밍으로 js 나 json 파일을 압축시켜 놓고 특정 디렉토리의 js나 json은 압축된 파일이라는 헤더정보를 전달해서
  웹서버가 cpu를 과도하게 사용하지 않도록 설정합니다.
  :::

## 2. default.conf

서버 설정파일을 수정하겠습니다. 먼저 수정하기 전에 아래 명령어를 실행하여 설정파일을 백업해 둡니다.

```shell
goodsaem@goodsaem:~$ sudo cp -rp /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf.bak
```

설정 파일을 수정합니다.
```shell
goodsaem@goodsaem:~$ sudo vi /etc/nginx/conf.d/default.conf
```

아래 강조된 부분을 추가 또는 수정했습니다.

```shell 2,4-7,13,15,19-29
server {
    listen       80;
    server_name  localhost;
    charset utf-8;
    access_log  /var/log/nginx/localhost.access.log  main;
    error_log /var/log/nginx/localhost.error.log;
    root /usr/share/nginx/html;

    location / {
        try_files $uri $uri/ /index.php?$args;
    }
    
    error_page 405 =200 $uri;
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
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

}
```

- *2* : 리스턴 포트를 지정합니다.
- *4* : 서버이름 및 인코딩을 설정합니다.
- *5-6* : 로그 파일 정보 입니다.
- *7* : root 디렉토리를 지정합니다.
- *10* : try_files 를 설정합니다.
- *13* : **error_page 405 =200 $uri; 이설정이 없으면 nginx 에서 php rest api post 호출시 오류가 발생합니다. post 방식으로 요청이 올때 오류가
  발생하지 않게 하기 위해 추가한 설정입니다.** 관련내용은 [https://stackoverflow.com/questions/51613180/nginx-post-method-does-not-work](https://stackoverflow.com/questions/51613180/nginx-post-method-does-not-work)
  참고 하시기 바랍니다.
- *15* : 50x 오류 발생시 사용하 페이지를 지정합니다.
- *19~29* : nginx 에서 php-fpm 이 동작하기 위해서 아래와 같이 수정하셔야 됩니다. *fastcgi_pass 127.0.0.1:9000;* 이부분은 소켓을 사용하지 않고 cgi 형태로 실행하겠다는 의미 입니다.
  php 설정시에 추가한 listen과 동일한값 127.0.0.1:9000 로 설정해 줍니다.

php가 정상동작하는지 확인하기 위한 코드를 작성하겠습니다.

```shell
goodsaem@goodsaem:~$ sudo vi /usr/share/nginx/html/phpinfo.php
```

## 3. 테스트
아래와 php 코드를 작성합니다.
```php
<?php
phpinfo();
?>
```
nginx가 실행할수 있도록 소유권을 변경합니다.
```shell
goodsaem@goodsaem:~$ sudo chown nginx:nginx  /usr/share/nginx/html/phpinfo.php
```
여기까지 설정했다면 nginx와 php-fprm을 재시작 합니다.
```shell
goodsaem@goodsaem:~$ sudo systemctl restart php7.4-fpm
goodsaem@goodsaem:~$ sudo systemctl restart nginx
```
웹브라우저에서 [http://localhost/phpinfo.php](http://localhost/phpinfo.php) 입력하고 아래와 같이 php info 페이지가 출력되면
정상입니다.

{% asset_img 1.jpg %}
