---
title: 11/13 무료로 aws + php 서버 구축
date: 2023-03-25 16:00:00
tags: [PHP,AWS]
category: [설치,PHP]
toc: true
---
![11/13 무료로 aws + php 서버 구축](/img/aws_php-011.png)
# <i class="fas fa-server"></i> 11. 무료 도메인 발급

nginx 에 https 서비스를 구성하기 위해서는 도메인이 필요합니다. 도메인이 준비되면 certbot을 통해서 무료 ssl 인증서 적용 및 http/2 적용이
가능한데요 무료 도메인 가입부터 nginx 에 셋팅하는 부분까지 진행해 보겠습니다.

### 도메인 등록
[https://www.freenom.com/en/index.html?lang=en](https://www.freenom.com/en/index.html?lang=en) freenom 이란
사이트에 회원가입을 한후 도메인 등록을 진행합니다.

1. 로그인 후 원하는 도메인을 입력하고 엔터키를 클릭한후 사용하고자 하는 도메인에서 Get it now! 버튼을 클릭하여 선택합니다.
   그리고 나서 **Checkout** 버튼을 클릭합니다.
    - ![img](/img/35.jpg)

1. Use DNS 버튼을 클릭하고 Use Freenom DNS Service를 선택한후 aws free tier의 퍼블릭 ipv4 주소를 입력하고 Continue 버튼을 클릭합니다.
    - ![img](/img/36.jpg)

1. 도메인 주문이 완료되었습니다.
    - ![img](/img/38.jpg)

1. My Domain 에서 주문한 도메인 확인이 가능합니다.
   ::: tip goodsaem.ml
   무료 도메인을 2개 신청했는데 2번째꺼는 어떤이유인지 mydomain에 추가 되지 않아 goodsaem.ml로 셋팅 진행하겠습니다.
   :::
    - ![img](/img/39.jpg)

### Diffie-Hellman 키생성
디피와 헬만이 1976년도에 발표한 비밀키 교환 방식의 알고리즘 입니다. 이를 이용하여 4096 bit의 키를 생성하겠습니다.
아래 명령어로 키를 생성하는데 대략 10분정도 소요 되었습니다. 이키를 이용해서 https에서 비밀키를 교환하여 안정한
https 통신을 할수 있으므로 반드시 진행해야 되는 사항입니다.

```shell
ubuntu@goodsaem:~$ sudo openssl dhparam -out /etc/nginx/conf.d/ssl-dhparams.pem 4096
```

### Let's Encrypt && Certbot 으로 인증서 발급
Let's Encrypt 는 사용자에게 무료로 SSL/TLS 인증서를 발급해 주는 기관 입니다. 한번 발급 받으면 90일간 사용이 가능하며
만료 30일전에 메일로 내용을 통보하면 그때 다시 갱신이 가능합니다. 인증서 발급은 certbot certbot-auto 를 이용하여
발급 및 갱신합니다.

certbot 등록을 위해 repository 등록을 진행합니다.
```shell
ubuntu@goodsaem:~$ sudo apt-get update
ubuntu@goodsaem:~$ sudo apt-get install software-properties-common
ubuntu@goodsaem:~$ sudo add-apt-repository universe
ubuntu@goodsaem:~$ sudo add-apt-repository ppa:certbot/certbot
ubuntu@goodsaem:~$ sudo apt-get update
```
certbot을 설치합니다.
```shell
ubuntu@goodsaem:~$ sudo apt-get install certbot
```

certbot nginx 플러그인을 설치 합니다.
```shell
ubuntu@goodsaem:~$ sudo apt-get install python-certbot-nginx
```

nginx에 서버 이름을 변경하기 위해 아래와 같이 입력합니다.
```shell
ubuntu@goodsaem:~$ sudo vi /etc/nginx/conf.d/default.conf
```
서버 네임을 freenom에서 발급받은 도메인으로 지정해 줍니다.
```shell
server_name  goodsaem.ml;
```

이제 아래 certbot 명령어를 통해서 ssl 인증서를 발급받습니다. 인증서 발급시
사용할 admin email 주소와 이용약관 동의 옵션을 지정하여 인증서 발급을 받겠습니다.
```shell
ubuntu@goodsaem:~$ sudo certbot --nginx --email goodsaem@protonmail.com --agree-tos
```

위에 명령어를 입력하면 아래와 같은 형태로 진행되는데요 중요한 부분만 설명하겠습니다.
- ***7*** 라인에 추가할 https 도메인이 보입니다.
- ***10*** 라인에서 엔터를 입력합니다.
- ***24*** 라인에서 e를 입력합니다.(제가 기존에 등록한 도메인이 있어 추가할거라고 물어보는데 추가한다고 하고 진행합니다.)
- ***37,41*** 라인 보시면 http로 요청이 오면 https로 리다이렉트 할것인지 물어보는데 전 2번을 선택하여 리다이렉트를 진행합니다.
```shell{7,10,24,37,41}
Saving debug log to /var/log/letsencrypt/letsencrypt.log
Plugins selected: Authenticator nginx, Installer nginx

Which names would you like to activate HTTPS for?
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
1: goodsaem.ml
2: goodsaem.ml
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Select the appropriate numbers separated by commas and/or spaces, or leave input
blank to select all options shown (Enter 'c' to cancel): 

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
You have an existing certificate that contains a portion of the domains you
requested (ref: /etc/letsencrypt/renewal/goodsaem.ml.conf)

It contains these names: goodsaem.ml

You requested these names for the new certificate: goodsaem.ml,
goodsaem.ml.

Do you want to expand and replace this existing certificate with the new
certificate?
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
(E)xpand/(C)ancel:e  
Renewing an existing certificate
Performing the following challenges:
http-01 challenge for goodsaem.ml
Using default address 80 for authentication.
Waiting for verification...
Cleaning up challenges
Deploying Certificate to VirtualHost /etc/nginx/conf.d/default.conf
Deploying Certificate to VirtualHost /etc/nginx/conf.d/default.conf

Please choose whether or not to redirect HTTP traffic to HTTPS, removing HTTP access.
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
1: No redirect - Make no further changes to the webserver configuration.
2: Redirect - Make all requests redirect to secure HTTPS access. Choose this for
new sites, or if you're confident your site works on HTTPS. You can undo this
change by editing your web server's configuration.
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Select the appropriate number [1-2] then [enter] (press 'c' to cancel): 2
Redirecting all traffic on port 80 to ssl in /etc/nginx/conf.d/default.conf
No matching insecure server blocks listening on port 80 found.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Your existing certificate has been successfully renewed, and the new certificate
has been installed.

The new certificate covers the following domains: https://goodsaem.ml
and https://goodsaem.ml

You should test your configuration at:
https://www.ssllabs.com/ssltest/analyze.html?d=goodsaem.ml
https://www.ssllabs.com/ssltest/analyze.html?d=goodsaem.ml
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

IMPORTANT NOTES:
 - Congratulations! Your certificate and chain have been saved at:
   /etc/letsencrypt/live/goodsaem.ml/fullchain.pem
   Your key file has been saved at:
   /etc/letsencrypt/live/goodsaem.ml/privkey.pem
   Your cert will expire on 2021-06-03. To obtain a new or tweaked
   version of this certificate in the future, simply run certbot again
   with the "certonly" option. To non-interactively renew *all* of
   your certificates, run "certbot renew"
 - If you like Certbot, please consider supporting our work by:

   Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
   Donating to EFF:                    https://eff.org/donate-le
```

제되로 인증서 발급이 되었는지 확인해 보겠습니다.
domain에 보시면 goodsaem.ml와 goodsaem.ml 도메인이 등록되어 있습니다. 또한 9,10 라인에
fullchain.pem 키와 privkey.pem 파일이 정상 생성되었음을 확인할수 있습니다.
```shell{7,9,10}
ubuntu@goodsaem:~$ sudo certbot certificates
Saving debug log to /var/log/letsencrypt/letsencrypt.log

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Found the following certs:
  Certificate Name: goodsaem.ml
    Domains: goodsaem.ml goodsaem.ml
    Expiry Date: 2021-06-03 13:54:40+00:00 (VALID: 89 days)
    Certificate Path: /etc/letsencrypt/live/goodsaem.ml/fullchain.pem
    Private Key Path: /etc/letsencrypt/live/goodsaem.ml/privkey.pem
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
```

nginx에 ssl 관련 설정이 등록되었는지 default.conf 내용을 확인해 보겠습니다.
74번라인부터 114번 라인까지 ssl 관련 설정이 추가되었습니다.
```shell{74-114}
ubuntu@goodsaem:~$ cat /etc/nginx/conf.d/default.conf

server {
    server_name  goodsaem.ml;

    charset utf-8;
    access_log  /var/log/nginx/localhost.access.log  main;
    error_log /var/log/nginx/localhost.error.log;

    #root /usr/share/nginx/html;
    root /home/ubuntu/phprest/public;

    location / {
        #root   /usr/share/nginx/html;
        #index  index index.php index.html index.htm;
        try_files $uri $uri/ /index.php?$args;
        #error_page 405 =200 $uri;
    }

    error_page 405 =200 $uri;

   
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }


    #error_page  404              /404.html;

    # redirect server error pages to the static page /50x.html
    #
    #error_page   500 502 503 504  /50x.html;
    #location = /50x.html {
    #    root   /usr/share/nginx/html;
    #}

    # proxy the PHP scripts to Apache listening on 127.0.0.1:80
    #
    location ~ \.php$ {
        #fastcgi_pass unix:/run/php/php-fpm.sock;
        proxy_pass   http://127.0.0.1;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;

        fastcgi_pass 127.0.0.1:9000;
        proxy_redirect off;
        fastcgi_intercept_errors on;
        fastcgi_read_timeout 300;
        fastcgi_send_timeout 300;
    }

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

letsencrypt 에 있는 Diffie-Hellman Key 를 아래와 같은 이름으로 백업합니다.
```shell
ubuntu@goodsaem:~$ cd /etc/letsencrypt/
ubuntu@goodsaem:~$  sudo mv ssl-dhparams.pem  ssl-dhparams.pem.backup
```
생성한 키 파일을 /etc/letsencrypt 로 복사합니다.
```shell
ubuntu@goodsaem:~$  sudo cp -rp /etc/nginx/conf.d/ssl-dhparams.pem /etc/letsencrypt/
```
nginx 를 재시작 합니다.
```shell
ubuntu@goodsaem:~$ sudo systemctl restart nginx
```
