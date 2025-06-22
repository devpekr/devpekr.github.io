---
title: mac에서 mariadb 계정생성
date: 2023-03-27 00:01:03
tags: [mariadb]
category: [Coding,mariadb]
toc: true
---

{% asset_img mariadb1-001.png %}

### {% fa cloud %} 개요

mac 에서 maria db 접속 및 데이터베이스 생성 사용자 생성방법에 대해서 정리한 내용이다.

### db 접속

터미널을 하나 열어서 아래 명령어를 입력한다.
```shell
mariadb
```

### database 생성
create database **생성할 데이터 베이스명**
```sql
create database jhipster;
```

### db 사용자 생성
create user '**생성할유저**'@'**접속할아이피**' identified by '**비밀번호**';
```sql
create user 'jhipster'@'127.0.0.1' identified by 'jhipster';
```

### database에 모든 권한 주기
grant all privileges on **권한줄db명**.**권한명** to '**유저명**'@'**접속아이피**';
아래 예제는 jhipster 데이터베이스의 모든권한(*)을 127.0.0.1에서 접속하는 jhipster 란 유저에게 주겠다는 의미. 
```sql
grant all privileges on jhipster.* to 'jhipster'@'127.0.0.1';
```

### db 갱신
db 정보를 갱신함
```sql
flush privileges;
```
