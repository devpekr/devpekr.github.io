---
title: 2/8 mac+php+mariadb+nginx+ssl 설정
date: 2023-03-25 11:25:00
tags: [PHP,MAC]
category: [설치,PHP]
toc: true
---
{% asset_img mac-php-2.png %}

# <i class="fas fa-server"></i> 2. sever 설정 

ubuntu 서버의 설정을 진행 하겠습니다.

## 1. 버전확인
먼저 버전을 확인합니다. 다운로드 받은 파일로 설치되어 있습니다.

```shell
goodsaem@goodsaem:~$ lsb_release -a
No LSB modules are available.
Distributor ID: Ubuntu
Description:    Ubuntu 18.04.5 LTS
Release:        18.04
Codename:       bionic
```

## 2. nopasswd 설정
설치나 설정을 할때 root 권한을 획득하기 위해 sudo 명령어를 입력하는데 그때 마다 패스워드를 입력하면 힘드니
sudo 명령어 입력시 패스워드를 입력하지 않도록 설정합니다.

%sudo ALL=(ALL:ALL) ALL 이라고 된부분을 아래와 같이 %sudo ALL=(ALL:ALL) **NOPASSWD**:ALL 로 수정 합니다.

```shell 26라인
#
# This file MUST be edited with the 'visudo' command as root.
#
# Please consider adding local content in /etc/sudoers.d/ instead of
# directly modifying this file.
#
# See the man page for details on how to write a sudoers file.
#
Defaults        env_reset
Defaults        mail_badpass
Defaults        secure_path="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin"

# Host alias specification

# User alias specification

# Cmnd alias specification

# User privilege specification
root    ALL=(ALL:ALL) ALL

# Members of the admin group may gain root privileges
%admin ALL=(ALL) ALL

# Allow members of group sudo to execute any command
%sudo   ALL=(ALL:ALL) NOPASSWD:ALL

# See sudoers(5) for more information on "#include" directives:

#includedir /etc/sudoers.d

```

## 3. 패키지 update & upgrde

```shell
goodsaem@goodsaem:~$ sudo apt update
goodsaem@goodsaem:~$ sudo apt upgrade
```

## 4. timezone 설정

기본 설치하고 나면 timezone이 utc로 설정 되어 있습니다. 
타입존을 kst 로 변경합니다.

현재 타임존 확인
```shell
goodsaem@goodsaem:~$ date
Sun Mar 21 05:28:50 UTC 2021
```

kst 로 변경
```shell
goodsaem@goodsaem:~$ sudo timedatectl set-timezone 'Asia/Seoul'
goodsaem@goodsaem:~$ date
Sun Mar 21 14:30:38 KST 2021
```

## 5. hosts 설정 변경

공인 아이피 정보를 아래와 같이 설정 합니다.

```shell
goodsaem@goodsaem:~$ sudo vi /etc/hosts
```

```shell 3라인
127.0.0.1 localhost
127.0.1.1 goodsaem
1.222.222.222 goodsaem.ml

# The following lines are desirable for IPv6 capable hosts
::1     ip6-localhost ip6-loopback
fe00::0 ip6-localnet
ff00::0 ip6-mcastprefix
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters
```
