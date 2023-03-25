---
title: 8/13 무료로 aws + php 서버 구축
date: 2023-03-25 15:30:00
tags: [PHP,AWS]
category: [설치,PHP]
toc: true
---
![8/13 무료로 aws + php 서버 구축](/img/aws_php-008.png)
# <i class="fas fa-server"></i> 8. PHP 설치

최신 버전의 php를 설치하기 위해 저장소를 등록합니다.

```shell
ubuntu@goodsaem:~$ sudo apt -y install software-properties-common
```
아래 명령어를 입력하고 중간에 엔터를 입력하는 부분에서 엔터를 입력합니다.
```shell{1,26}
ubuntu@goodsaem:~$ sudo add-apt-repository ppa:ondrej/php
Co-installable PHP versions: PHP 5.6, PHP 7.x and most requested extensions are included. Only Supported Versions of PHP (http://php.net/supported-versions.php) for Supported Ubuntu Releases (https://wiki.ubuntu.com/Releases) are provided. Don't ask for end-of-life PHP versions or Ubuntu release, they won't be provided.

Debian oldstable and stable packages are provided as well: https://deb.sury.org/#debian-dpa

You can get more information about the packages at https://deb.sury.org

IMPORTANT: The <foo>-backports is now required on older Ubuntu releases.

BUGS&FEATURES: This PPA now has a issue tracker:
https://deb.sury.org/#bug-reporting

CAVEATS:
1. If you are using php-gearman, you need to add ppa:ondrej/pkg-gearman
2. If you are using apache2, you are advised to add ppa:ondrej/apache2
3. If you are using nginx, you are advised to add ppa:ondrej/nginx-mainline
   or ppa:ondrej/nginx

PLEASE READ: If you like my work and want to give me a little motivation, please consider donating regularly: https://donate.sury.org/

WARNING: add-apt-repository is broken with non-UTF-8 locales, see
https://github.com/oerdnj/deb.sury.org/issues/56 for workaround:

# LC_ALL=C.UTF-8 add-apt-repository ppa:ondrej/php
More info: https://launchpad.net/~ondrej/+archive/ubuntu/php
Press [ENTER] to continue or Ctrl-c to cancel adding it.

Hit:1 http://ap-northeast-2.ec2.archive.ubuntu.com/ubuntu bionic InRelease
Get:2 http://ap-northeast-2.ec2.archive.ubuntu.com/ubuntu bionic-updates InRelease [88.7 kB]                                     
Get:3 http://ap-northeast-2.ec2.archive.ubuntu.com/ubuntu bionic-backports InRelease [74.6 kB]                                                                                   
Hit:4 https://mirror.yongbok.net/mariadb/repo/10.5/ubuntu bionic InRelease                                                                                                                   
Get:5 http://ap-northeast-2.ec2.archive.ubuntu.com/ubuntu bionic-updates/main amd64 Packages [1912 kB]                                                                                            
Hit:6 http://ppa.launchpad.net/certbot/certbot/ubuntu bionic InRelease                                                                                                                                      
Get:7 http://security.ubuntu.com/ubuntu bionic-security InRelease [88.7 kB]                                                                      
Hit:8 http://nginx.org/packages/mainline/ubuntu bionic InRelease                                                                                             
Hit:9 http://ppa.launchpad.net/ondrej/php/ubuntu bionic InRelease                                                                                           
Fetched 2164 kB in 1s (1891 kB/s)                              
Reading package lists... Done
```

php 7.4 버전을 설치합니다.
```shell
ubuntu@goodsaem:~$ sudo apt install php7.4 php7.4-cli php7.4-fpm \
php7.4-bcmath php7.4-bz2 php7.4-common php7.4-curl \
php7.4-dba php7.4-gd php7.4-json php7.4-mbstring php7.4-opcache \
php7.4-readline php7.4-soap php7.4-xml php7.4-xmlrpc php7.4-zip \
php7.4-ctype php7.4-pdo php7.4-redis php7.4-mysql php7.4-imagick \
php7.4-intl php7.4-mysqlnd php7.4-gmp php7.4-geoip php7.4-dev -y
```

설치후 php 버전을 확인합니다. 정상 설치되었네요
```shell
ubuntu@goodsaem:~$ php -v
PHP 7.4.15 (cli) (built: Feb 23 2021 15:12:05) ( NTS )
Copyright (c) The PHP Group
Zend Engine v3.4.0, Copyright (c) Zend Technologies
    with Zend OPcache v7.4.15, Copyright (c), by Zend Technologies
```

php 기본설정을 진행합니다.
```shell
ubuntu@goodsaem:~$ sudo vi /etc/php/7.4/fpm/php.ini
```

아래 부분을 찾아서 하나씩 변경합니다. 업로드 최대 크기와 최대 파일 사이즈 메모리 제한은 구축하고자 하는 어플리케이션 환경에 맞게 설정 바랍니다.
```shell
...
date.timezone = Asia/Seoul
expose_php = Off
post_max_size = 30M
upload_max_filesize = 30M
memory_limit = 128M
```

#### php-fpm 설정
apahce php 조합일때는 mod_php란 모듈을 이용해서 연결을 시켰는데 Nginx와 연동을 위해서는 PHP-FPM 이라는 Fast-Cgi 기능을 설정해야 됩니다.

:::tip PHP-FPM
FastCGI Process Manager
:::

설정 파일을 수정합니다. error_log 위치만 아래와 같이 변경하겠습니다.
```shell
ubuntu@goodsaem:~$ sudo vi /etc/php/7.4/fpm/php-fpm.conf
...
error_log = /var/log/php7.4-fpm.log
...
```

#### php pool 설정
php www 관련 설정을 진행하겠습니다. 먼저 설정파일을 백업 합니다.
```shell
ubuntu$ sudo cp -rp /etc/php/7.4/fpm/pool.d/www.conf /etc/php/7.4/fpm/pool.d/www.conf.back
```

설정 파일을 수정합니다.
```shell
ubuntu@goodsaem:~$ sudo vi /etc/php/7.4/fpm/pool.d/www.conf
```
아래와 같은 설정 내용등을 찾아서 변경해 주세요.

- *listen* : Nginx 와 php 연동을 위해 리스턴 하는 아이피 포트를 127.0.0.1:9000 으로 지정했습니다. 웹에서 php에 대한 요청이 들어오면 해당
  포트로 보내서 php가 처리를 하도록 리스턴 아이피 포트를 지정합니다.
  :::tip listen = /run/php/php7.4-fpm.sock (소켓연결)
  소켓으로 연결 할수 있습니다. 하지만 무슨 이유인지 연결이 되지 않아 아이피 포트로 지정했습니다.
  :::
- *pm.max_children* : PHP Pool(www) 내에서 가동할 수 있는 최대 자식 프로세스 수를 의미 합니다
- *pm.start_servers* : php-fpm 을 실행할 때 초기에 생성하는 자식 프로세스의 개수입니다
- *pm.min_spare_servers* :idle 상태의 자식 프로세스 개수가 이 개수보다 작으면 자식 프로세스를 생성합니다
- *pm.max_spare_servers*: idle 상태의 자식 프로세스의 최대 개수를 의미 합니다.
- *pm.max_requests* : 최대 request를 처리 수 입니다. 500 으로 설정되어 있다면 500번 request 후 프로세스를 다시 생성 하며
  프로세스가 점진적인 메모리 증가에 대한부분을 방지 할 수 있습니다.


```shell
user = nginx
group = nginx
listen.owner = nginx
listen.group = nginx
listen.mode = 0660
listen = 127.0.0.1:9000
pm = dynamic
pm.max_children = 50
pm.start_servers = 5
pm.min_spare_servers = 5
pm.max_spare_servers = 40
pm.max_requests = 500
access.log = /var/log/php-fpm-$pool.access.log
access.format = "%R - %u %t \"%m %r%Q%q\" %s %f %{mili}d %{kilo}M %C%%"
slowlog = /var/log/php-fpm-$pool.log.slow
request_slowlog_timeout = 5
php_admin_value[error_log] = /var/log/fpm-php.$pool.error.log
php_admin_flag[log_errors] = on
```
