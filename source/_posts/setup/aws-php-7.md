---
title: 7/13 무료로 aws + php 서버 구축
date: 2023-03-25 15:20:00
tags: [PHP,AWS]
category: [설치,PHP]
toc: true
---
![7/13 무료로 aws + php 서버 구축](/img/aws_php-007.png)
# <i class="fas fa-server"></i> 7. MariaDB 설치
mariadb 설치를 진행하겠습니다.

우선 repository 부터 아래와 같이 설정합니다.
```shell
ubuntu@goodsaem:~$ sudo apt-get install software-properties-common
ubuntu@goodsaem:~$ sudo apt-key adv --fetch-keys 'https://mariadb.org/mariadb_release_signing_key.asc'
ubuntu@goodsaem:~$ sudo add-apt-repository 'deb [arch=amd64,arm64,ppc64el] https://mirror.yongbok.net/mariadb/repo/10.5/ubuntu bionic main'
```
패키지를 업데이트한후 mariadb 설치를 진행합니다.
```shell
ubuntu@goodsaem:~$ sudo apt update
ubuntu@goodsaem:~$ sudo apt install mariadb-server -y
```
#### mariadb 보안설정
마리아 db를 설치하고 나면 디비 보안 관련 설정을 진행해야 합니다.
```shell
ubuntu@goodsaem:~$ sudo mysql_secure_installation
```

중간에 불필요한 부분은 삭제 했습니다.
- **1 라인** root 유저가 사용할 패스워드를 입력합니다.
- **4 라인** unix socket 인증방식 사용여부는 n 으로 지정해 주세요(root 쉘인증이 기본 사용됩니다.)
- **8,9,10 라인** root passwor를 변경합니다.
- **15 라인** 익명 사용자를 삭제 합니다.
- **17 라인** root의 원격접속을 막습니다. root 는 항상 로컬에서만 접속 가능합니다.
- **19 라인** test 데이터 베이스를 삭제 합니다.
- **25 라인** 권한에 대한 리로드를 진행합니다. y를 입력해주세요
```shell
Enter current password for root (enter for none):
OK, successfully used password, moving on…
...
You already have your root account protected, so you can safely answer 'n'.
...
Switch to unix_socket authentication [Y/n] n
...
Change the root password? [Y/n] y
New password:
Re-enter new password:
Password updated successfully!
Reloading privilege tables..
… Success!
...
Remove anonymous users? [Y/n] y
...
Disallow root login remotely? [Y/n] y
...
Remove test database and access to it? [Y/n] y
- Dropping test database…
  … Success!
- Removing privileges on test database…
  … Success!
...  
Reload privilege tables now? [Y/n] y
… Success!
```
#### mariadb 접속
아래 명령어를 입력하여 mariadb 에 접속합니다. 성공적으로 접속되었습니다.
```shell
ubuntu@goodsaem:~$ sudo mysql
```

```shell
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 156
Server version: 10.5.9-MariaDB-1:10.5.9+maria~bionic-log mariadb.org binary distribution

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [(none)]> 
```

#### mariadb 설정
마리아 db 설정을 진행하겠습니다. 마리아 디비 설정 파일이 있는곳으로 이동하여 설정 파일을 수정합니다.

```shell
ubuntu@goodsaem:~$ cd /etc/mysql/mariadb.conf.d
ubuntu@goodsaem:~$ sudo vi 50-server.cnf
```
아래 설정을 추가합니다.
```shell
...
server-id=1
log_bin = binlog
expire_logs_days=10
innodb_buffer_pool_size = 384M
innodb_file_per_table=TRUE
character-set-client-handshake=OFF
skip-character-set-client-handshake
max_allowed_packet=500M
init_connect=SET collation_connection = utf8mb4_general_ci
init_connect=SET NAMES utf8mb4
character-set-server = utf8mb4
collation-server = utf8mb4_general_ci
...
```

설정된 값이 적용되도록 마리아 디비를 재시작 합니다.
```shell
ubuntu@goodsaem:/etc/mysql/mariadb.conf.d$ sudo systemctl restart mysql
```
