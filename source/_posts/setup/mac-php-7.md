---
title: 7/8 mac+php+mariadb+nginx+ssl 설정
date: 2023-03-25 12:15:00
tags: [PHP,MAC]
category: [설치,PHP]
toc: true
---
{% asset_img mac-php-7.png %}

# <i class="fas fa-server"></i> 7. 무료 도메인 발급

요즘 대부분의 웹서버는 https 통신을 합니다. 이제는 선택이 아닌 필수 인것 같네요 제가 서버를 구축하게 된 직접적인 원인도 https
설정을 하기 위함입니다. nginx 에 https 서비스를 구성하기 위해서는 도메인이 필요합니다. 도메인이 준비되면 certbot을 통해서 
무료 ssl 인증서 적용 및 http/2 적용이 가능한데요 무료 도메인 가입부터 nginx 에 셋팅하는 부분까지 진행해 보겠습니다.

## 1. 무료 도메인
[https://www.freenom.com/en/index.html?lang=en](https://www.freenom.com/en/index.html?lang=en) freenom 이란
사이트에서 무료 도메인을 발급 받을수 있습니다. 회원가입을 후 도메인 등록을 진행합니다.

- 로그인 후 원하는 도메인을 입력하고 엔터키를 클릭한후 사용하고자 하는 도메인에서 Get it now! 버튼을 클릭하여 선택합니다.
   그리고 나서 **Checkout** 버튼을 클릭합니다.
  
  {% asset_img 35.jpg %}

- Use DNS 버튼을 클릭하고 Use Freenom DNS Service를 선택한후 aws free tier의 퍼블릭 ipv4 주소를 입력하고 Continue 버튼을 클릭합니다.
   
  {% asset_img 36.jpg %}

- 도메인 주문이 완료되었습니다.
  
  {% asset_img 38.jpg %}

- My Domain 에서 주문한 도메인 확인이 가능합니다.
   ::: tip goodsaem.ml
   무료 도메인을 2개 신청했는데 2번째꺼는 어떤이유인지 mydomain에 추가 되지 않아 goodsaem.ml로 셋팅 진행하겠습니다.
   :::
  
   {% asset_img 39.jpg %}

## 2. Diffie-Hellman 키생성
https 인증서를 받기 위해서는 키가 필요합니다. 이 키 생성은 디피와 헬만이 1976년도에 발표한 비밀키 교환 방식의 알고리즘을
이용하여 생성합니다.이 알고리즘을 이용하여 4096 bit의 키를 생성하겠습니다. 아래 명령어로 키를 생성하는데 대략 10분정도 소요 되었습니다. 
이키를 이용해서 https에서 비밀키를 교환하여 안정한 https 통신을 할수 있으므로 반드시 진행해야 되는 사항입니다.

```shell
goodsaem@goodsaem:~$ sudo openssl dhparam -out /etc/nginx/conf.d/ssl-dhparams.pem 4096
```

```shell
enerating DH parameters, 4096 bit long safe prime, generator 2
This is going to take a long time
...............................................................
```

## 3. 무료인증
Let's Encrypt 는 사용자에게 무료로 SSL/TLS 인증서를 발급해 주는 기관 입니다. 한번 발급 받으면 90일간 사용이 가능하며
만료 30일전에 메일로 내용을 통보하면 그때 다시 갱신이 가능합니다. 인증서 발급은 certbot certbot-auto 를 이용하여
발급 및 갱신합니다.

certbot 등록을 위해 repository 등록을 진행합니다.
```shell
goodsaem@goodsaem:~$ sudo apt-get update
goodsaem@goodsaem:~$ sudo apt-get install software-properties-common
goodsaem@goodsaem:~$ sudo add-apt-repository universe
goodsaem@goodsaem:~$ sudo add-apt-repository ppa:certbot/certbot
goodsaem@goodsaem:~$ sudo apt-get update
```
certbot을 설치합니다.
```shell
goodsaem@goodsaem:~$ sudo apt-get install certbot
```

certbot nginx 플러그인을 설치 합니다.
```shell
goodsaem@goodsaem:~$ sudo apt-get install python-certbot-nginx
```

nginx에 서버 이름을 변경하기 위해 아래와 같이 입력합니다.
```shell
goodsaem@goodsaem:~$ sudo vi /etc/nginx/conf.d/default.conf
```
서버 네임을 freenom에서 발급받은 도메인으로 지정해 줍니다.

```shell 3번라인
server {
    listen       80;
    server_name  goodsaem.ml;
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
이제 아래 certbot 명령어를 통해서 ssl 인증서를 발급받습니다. 인증서 발급시
사용할 admin email 주소와 이용약관 동의 옵션을 지정하여 인증서 발급을 받겠습니다.
```shell
goodsaem@goodsaem:~$ sudo certbot --nginx --email goodsaem@protonmail.com --agree-tos
```

위에 명령어를 입력하면 아래와 같은 형태로 진행되는데요 중요한 부분만 설명하겠습니다.
- ***6*** 라인에 추가할 https 도메인이 보입니다.
- ***9*** 라인에서 엔터를 입력합니다.
- ***24*** 라인에서 2을 입력합니다. (http로 요청이 들어오면 https 로 redirect 하겠다는 의미 입니다.)


```shell 6,9,24 라인
Saving debug log to /var/log/letsencrypt/letsencrypt.log
Plugins selected: Authenticator nginx, Installer nginx

Which names would you like to activate HTTPS for?
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
1: goodsaem.ml
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Select the appropriate numbers separated by commas and/or spaces, or leave input
blank to select all options shown (Enter 'c' to cancel):
Obtaining a new certificate
Performing the following challenges:
http-01 challenge for goodsaem.ml
Waiting for verification...
Cleaning up challenges
Deploying Certificate to VirtualHost /etc/nginx/conf.d/default.conf

Please choose whether or not to redirect HTTP traffic to HTTPS, removing HTTP access.
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
1: No redirect - Make no further changes to the webserver configuration.
2: Redirect - Make all requests redirect to secure HTTPS access. Choose this for
new sites, or if you're confident your site works on HTTPS. You can undo this
change by editing your web server's configuration.
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Select the appropriate number [1-2] then [enter] (press 'c' to cancel): 1

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Congratulations! You have successfully enabled https://goodsaem.ml

You should test your configuration at:
https://www.ssllabs.com/ssltest/analyze.html?d=goodsaem.ml
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

IMPORTANT NOTES:
 - Congratulations! Your certificate and chain have been saved at:
   /etc/letsencrypt/live/goodsaem.ml/fullchain.pem
   Your key file has been saved at:
   /etc/letsencrypt/live/goodsaem.ml/privkey.pem
   Your cert will expire on 2021-06-23. To obtain a new or tweaked
   version of this certificate in the future, simply run certbot again
   with the "certonly" option. To non-interactively renew *all* of
   your certificates, run "certbot renew"
 - If you like Certbot, please consider supporting our work by:

   Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
   Donating to EFF:                    https://eff.org/donate-le
```

제되로 인증서 발급이 되었는지 확인해 보겠습니다.
domain에 보시면 goodsaem.ml 도메인이 등록되어 있습니다. 또한 8,9 라인에
fullchain.pem 키와 privkey.pem 파일이 정상 생성되었음을 확인할수 있습니다.

```shell 6,8,9 라인
Saving debug log to /var/log/letsencrypt/letsencrypt.log

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Found the following certs:
  Certificate Name: goodsaem.ml
    Domains: goodsaem.ml
    Expiry Date: 2021-06-23 13:15:17+00:00 (VALID: 89 days)
    Certificate Path: /etc/letsencrypt/live/goodsaem.ml/fullchain.pem
    Private Key Path: /etc/letsencrypt/live/goodsaem.ml/privkey.pem
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
```

nginx에 ssl 관련 설정이 등록되었는지 default.conf 내용을 확인해 보겠습니다.
40번라인부터 57번 라인까지 ssl 관련 설정이 자동으로 추가되었습니다.

```shell 40-57 라인
server {
    server_name  goodsaem.ml;
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


letsencrypt 에 있는 Diffie-Hellman Key 를 아래와 같은 이름으로 백업합니다.
```shell
goodsaem@goodsaem:~$ cd /etc/letsencrypt/
goodsaem@goodsaem:~$  sudo mv ssl-dhparams.pem  ssl-dhparams.pem.backup
```
생성한 키 파일을 /etc/letsencrypt 로 복사합니다.
```shell
goodsaem@goodsaem:~$  sudo cp -rp /etc/nginx/conf.d/ssl-dhparams.pem /etc/letsencrypt/
```
nginx 를 재시작 합니다.
```shell
goodsaem@goodsaem:~$ sudo systemctl restart nginx
```

## 4. SSL 점검
SSL이 제되로 생성되었는지 [https://www.ssllabs.com/ssltest/analyze.html](https://www.ssllabs.com/ssltest/analyze.html) 사이트에 접속하여
아래와 같이 도메인을 입력하고 점검을 수행합니다.

{% asset_img 40.jpg %}

A 라고 연두색으로 나오는것 보니 제되로 설정이 된것 같습니다.
{% asset_img 41.jpg %}

이제 실제로 https 로 접속을 시도해 보겠습니다. [https://goodsaem.ml/info.php](https://goodsaem.ml/info.php) https 프로토콜을 이용하여
설정한 도메인으로 접속하니 아래 그림과 같이 정상적으로 화면이 나왔습니다. 보안 오류 같은거 없이 ^^ 대 성공입니다. 자물쇠 모양을 더블클릭하세요

{% asset_img 42.jpg %}

아래와 같이 보안 연결이 사용되었다는 내용이 확인되며 인증서도 유효 하다고 하네요.

{% asset_img 43.jpg %}
