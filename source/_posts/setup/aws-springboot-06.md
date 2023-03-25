---
title: 6/13 무료 aws + springboot 서버 구축
date: 2023-03-25 20:06:00
tags: [SPRINGBOOT,AWS]
category: [설치,SPRINGBOOT]
toc: true
---
{% asset_img aws_springboot-006.png %}
# <i class="fas fa-server"></i> 6. Nginx 설치

aws freetier linux + Nginx + MariaDB + SpringBoot 조합으로 설치를 진행하겠습니다. 
그 첫번째로 Nginx 설치를 진행하겠습니다.

## 1. 개요

[https://news.netcraft.com/archives/category/web-server-survey/](https://news.netcraft.com/archives/category/web-server-survey/)
netcrat의 21년 웹서버 점유율을 보면 아래와 같습니다. 비동기로 동작하는 nginx 는 apache 보다 가볍고 속도도 더 빠르다고 합니다.
아래 데이터를 보더라도 nginx 가 apache 를 앞지르고 있는것으로 보입니다. 그래서 저도 nginx 로 설정하겠습니다.

{% asset_img 1.jpg %}

|Developer|December 2020|Percent|January 2021|Percent|Change
|:---:|:---:|:---:|:---:|:---:|:---:
|nginx|411,191,213|33.48%|399,330,927|33.33%|-0.15
|Apache|332,420,092|27.07%|316,046,149|26.38%|-0.69
|Microsoft|97,532,495|7.94%|89,781,136|7.49%|-0.45
|Google|46,924,883|3.82%|46,190,660|3.86%|0

## 2. Nginx 버전
Nginx는 MainLine 버전과 stable 버전 2가지가 존재 합니다. 메인라이는 새로운 기능 및 업데이트 및 버그 패치가 동시에 진행되고 stable 은
메인라인에서 버그패치만 진행하는 버전입니다. 메이저 버전을 올리고 싶지 않고 사용하고 싶다면 stable 버전이 좋겠지만 전 최신 기능과 update
및 버그 픽스가 동시에 이루어지는 mainline으로 설치를 진행하겠습니다.

{% asset_img 2.jpeg %}

## 3. Nginx 설치

Nginx 설치를 위해 의존성 있는 패키지 설치를 진행합니다.

```shell
ubuntu@goodsaem:~$ sudo apt install curl gnupg2 ca-certificates lsb-release -y
```

메인라인 패키지 리스트를 추가 합니다.

```shell{1}
ubuntu@goodsaem:~$ sudo echo "deb http://nginx.org/packages/mainline/ubuntu `lsb_release -cs` nginx" | sudo tee /etc/apt/sources.list.d/nginx.list
deb http://nginx.org/packages/mainline/ubuntu bionic nginx
```

패키지를 업데이트 합니다.
```shell
ubuntu@goodsaem:~$ sudo apt update
```

업데이트시 아래와 같이 NO_PUBKEY **ABF5BD827BD9BF62** 에러가 발생한다면 키를 업데이트 합니다.

<<< @/freetier/z106/1.sh{1,5}

1번 라인과 같이 키를 업데이트 합니다.

<<< @/freetier/z106/2.sh{1}

패키지 업데이트를 재시도 합니다.

```shell
ubuntu@goodsaem:~$ sudo apt update
```

nginx 를 설치합니다.
```shell
ubuntu@goodsaem:~$ sudo apt install nginx
```
설치된 버전을 확인 합니다. 1.19.8 최신 버전으로 설치 되었습니다.

```shell{1}
ubuntu@goodsaem:~$ nginx -V
nginx version: nginx/1.19.8
built by gcc 7.5.0 (Ubuntu 7.5.0-3ubuntu1~18.04) 
built with OpenSSL 1.1.1  11 Sep 2018
TLS SNI support enabled
configure arguments: --prefix=/etc/nginx --sbin-path=/usr/sbin/nginx --modules-path=/usr/lib/nginx/modules --conf-path=/etc/nginx/nginx.conf --error-log-path=/var/log/nginx/error.log --http-log-path=/var/log/nginx/access.log --pid-path=/var/run/nginx.pid --lock-path=/var/run/nginx.lock --http-client-body-temp-path=/var/cache/nginx/client_temp --http-proxy-temp-path=/var/cache/nginx/proxy_temp --http-fastcgi-temp-path=/var/cache/nginx/fastcgi_temp --http-uwsgi-temp-path=/var/cache/nginx/uwsgi_temp --http-scgi-temp-path=/var/cache/nginx/scgi_temp --user=nginx --group=nginx --with-compat --with-file-aio --with-threads --with-http_addition_module --with-http_auth_request_module --with-http_dav_module --with-http_flv_module --with-http_gunzip_module --with-http_gzip_static_module --with-http_mp4_module --with-http_random_index_module --with-http_realip_module --with-http_secure_link_module --with-http_slice_module --with-http_ssl_module --with-http_stub_status_module --with-http_sub_module --with-http_v2_module --with-mail --with-mail_ssl_module --with-stream --with-stream_realip_module --with-stream_ssl_module --with-stream_ssl_preread_module --with-cc-opt='-g -O2 -fdebug-prefix-map=/data/builder/debuild/nginx-1.19.8/debian/debuild-base/nginx-1.19.8=. -fstack-protector-strong -Wformat -Werror=format-security -Wp,-D_FORTIFY_SOURCE=2 -fPIC' --with-ld-opt='-Wl,-Bsymbolic-functions -Wl,-z,relro -Wl,-z,now -Wl,--as-needed -pie'
```

## 4. AWS 보안설정 변경

http 및 https 로 접속하기 위해서는 aws에 인바운드 (들어오는쪽)에 방화벽 설정을 해주셔야 됩니다.
아래와 같이 aws 콘솔에서 EC2 > 인스턴스 > 인스터스 명을 클릭하시고 *보안* 탭에서  보안그룹의 보안
그룹번호를 클릭합니다.

{% asset_img 31.jpg %}

인바운드 규칙 변경을 통해 아래와 같이 http , https 에대한 규칙을 추가합니다.

{% asset_img 33.jpg %}

규칙 추가는 인바운드 규칙 편집 버튼을 클릭하여 아래와 같이 http,https 위치무관이라고 선택하고 저장하시면 됩니다.

{% asset_img 32.jpg %}


## 5. Nginx 시작

아래 명령어를 입력하여 nginx 를 시작합니다.
```shell
ubuntu@goodsaem:~$ sudo systemctl start nginx
```
웹브라우저에서 [http://goodsaem.ml](http://goodsaem.ml) 접속해서 아래와 같은 화면이 나오면 설정 완료 입니다.

{% asset_img 4.jpg %}

