---
title: Mac 에 Maria DB 설치
date: 2023-03-25 08:13:32
tags: [MARIADB]
category: [설치,MARIADB]
toc: true
---

{% asset_img maria-001.png %}

# {% fa server %} Mac에 MariaDB 설치
mac에 mariadb 를 설치하는 방법입니다.

## 1. brew install

```shell
brew install mariadb
```

::: spoiler 상세 설치 로그 보기 more...

```shell
Updating Homebrew...
==> Auto-updated Homebrew!
Updated 3 taps (heroku/brew, homebrew/core and homebrew/cask).
==> New Formulae
as-tree                 cyrus-sasl              geph4                   iconsur                 latino                  openmodelica            pyqt-3d                 pyqt@5                  qt-libiodbc             qt-percona-server       snowpack                wllvm
bas55                   delve                   glibc                   klee                    libpipeline             oras                    pyqt-builder            pyside@2                qt-mariadb              qt-postgresql           sqlancer                xray
crispy-doom             enzyme                  gopass-jsonapi          kotlin-language-server  openmama                projectm                pyqt-networkauth        python-tabulate         qt-mysql                qt-unixodbc             tomcat@9
==> Updated Formulae
Updated 949 formulae.
==> Renamed Formulae
qt5 -> qt@5
==> Deleted Formulae
geant4
==> New Casks
atomic-wallet                clicker-for-youtube          daedalus-testnet             evkey                        kyokan-bob                   micro-sniff                  n1ghtshade                   rhino                        skychart                     veepn
banksiagui                   code-composer-studio         devbook                      goldenpassport               mailtrackerblocker           mouse-fix                    neat-reader                  simplelink-msp432-sdk        the-archive                  zecwallet-lite
clicker-for-netflix          cog                          devutils                     jandi-statusbar              megax                        mxsrvs                       nuage                        simplelink-msp432e4-sdk      uniflash                     zulufx
==> Updated Casks
Updated 473 casks.
==> Deleted Casks
ableton-live                        daedalus-catalyst                   insomnia-designer                   kode54-cog                          mega                                pins                                protonmail-unofficial               rhinoceros

==> Downloading https://homebrew.bintray.com/bottles/mecab-0.996.big_sur.bottle.3.tar.gz
==> Downloading from https://d29vzk4ow07wi7.cloudfront.net/53efb8669f932aac26f4669db62eb858e6e31860923460a6c4e74d84685e8146?response-content-disposition=attachment%3Bfilename%3D%22mecab-0.996.big_sur.bottle.3.tar.gz%22&Policy=eyJTdGF0ZW1lbnQiOiBbeyJSZXNvdXJjZSI6Imh0dHAqOi8vZDI5dnprNG93MDd3aTc
######################################################################## 100.0%
==> Downloading https://homebrew.bintray.com/bottles/mecab-ipadic-2.7.0-20070801.big_sur.bottle.tar.gz
==> Downloading from https://d29vzk4ow07wi7.cloudfront.net/4fc2878d95314057c5d0f726cc1dacf2ce110c7e84b77806e958970f9b34ccc5?response-content-disposition=attachment%3Bfilename%3D%22mecab-ipadic-2.7.0-20070801.big_sur.bottle.tar.gz%22&Policy=eyJTdGF0ZW1lbnQiOiBbeyJSZXNvdXJjZSI6Imh0dHAqOi8vZDI5d
######################################################################## 100.0%
==> Downloading https://homebrew.bintray.com/bottles/msgpack-3.3.0.big_sur.bottle.tar.gz
==> Downloading from https://d29vzk4ow07wi7.cloudfront.net/434fdf5aea4bdee584755531889cbbe40a093a4a85dbb993dcca60516a6aaeab?response-content-disposition=attachment%3Bfilename%3D%22msgpack-3.3.0.big_sur.bottle.tar.gz%22&Policy=eyJTdGF0ZW1lbnQiOiBbeyJSZXNvdXJjZSI6Imh0dHAqOi8vZDI5dnprNG93MDd3aTc
######################################################################## 100.0%
==> Downloading https://homebrew.bintray.com/bottles/groonga-11.0.0.big_sur.bottle.tar.gz
==> Downloading from https://d29vzk4ow07wi7.cloudfront.net/dc6597d2ebfe1227fa22b2fe648cd34078856b580ce4bcf2cf1ecc754c32fe9a?response-content-disposition=attachment%3Bfilename%3D%22groonga-11.0.0.big_sur.bottle.tar.gz%22&Policy=eyJTdGF0ZW1lbnQiOiBbeyJSZXNvdXJjZSI6Imh0dHAqOi8vZDI5dnprNG93MDd3aT
######################################################################## 100.0%
==> Downloading https://homebrew.bintray.com/bottles/mariadb-10.5.9.big_sur.bottle.tar.gz
==> Downloading from https://d29vzk4ow07wi7.cloudfront.net/a976c60a001d2dacd4a9106a667cdcc0292a78da794d39e81cf86944c4f8010b?response-content-disposition=attachment%3Bfilename%3D%22mariadb-10.5.9.big_sur.bottle.tar.gz%22&Policy=eyJTdGF0ZW1lbnQiOiBbeyJSZXNvdXJjZSI6Imh0dHAqOi8vZDI5dnprNG93MDd3aT
######################################################################## 100.0%
==> Installing dependencies for mariadb: mecab, mecab-ipadic, msgpack and groonga
==> Installing mariadb dependency: mecab
==> Pouring mecab-0.996.big_sur.bottle.3.tar.gz
🍺  /usr/local/Cellar/mecab/0.996: 20 files, 4.4MB
==> Installing mariadb dependency: mecab-ipadic
==> Pouring mecab-ipadic-2.7.0-20070801.big_sur.bottle.tar.gz
==> Caveats
To enable mecab-ipadic dictionary, add to /usr/local/etc/mecabrc:
  dicdir = /usr/local/lib/mecab/dic/ipadic
==> Summary
🍺  /usr/local/Cellar/mecab-ipadic/2.7.0-20070801: 16 files, 50.6MB
==> Installing mariadb dependency: msgpack
==> Pouring msgpack-3.3.0.big_sur.bottle.tar.gz
🍺  /usr/local/Cellar/msgpack/3.3.0: 757 files, 5.3MB
==> Installing mariadb dependency: groonga
==> Pouring groonga-11.0.0.big_sur.bottle.tar.gz
🍺  /usr/local/Cellar/groonga/11.0.0: 924 files, 45.2MB
==> Installing mariadb
==> Pouring mariadb-10.5.9.big_sur.bottle.tar.gz
==> /usr/local/Cellar/mariadb/10.5.9/bin/mysql_install_db --verbose --user=goodsaem --basedir=/usr/local/Cellar/mariadb/10.5.9 --datadir=/usr/local/var/mysql --tmpdir=/tmp
==> Caveats
A "/etc/my.cnf" from another install may interfere with a Homebrew-built
server starting up correctly.

MySQL is configured to only allow connections from localhost by default

To have launchd start mariadb now and restart at login:
  brew services start mariadb
Or, if you don't want/need a background service you can just run:
  mysql.server start
==> Summary
🍺  /usr/local/Cellar/mariadb/10.5.9: 782 files, 182.2MB
==> Caveats
==> mecab-ipadic
To enable mecab-ipadic dictionary, add to /usr/local/etc/mecabrc:
  dicdir = /usr/local/lib/mecab/dic/ipadic
==> mariadb
A "/etc/my.cnf" from another install may interfere with a Homebrew-built
server starting up correctly.

MySQL is configured to only allow connections from localhost by default

To have launchd start mariadb now and restart at login:
  brew services start mariadb
Or, if you don't want/need a background service you can just run:
  mysql.server start

```
:::

설치된 mariadb 버전을 확인합니다.
```shell
mariadb -V      
mariadb  Ver 15.1 Distrib 10.5.9-MariaDB, for osx10.16 (x86_64) using readline 5.1
```


## 2. mariadb 시작
아래 명령어로 mariadb를 시작합니다.
```shell
brew services start mariadb
==> Successfully started `mariadb` (label: homebrew.mxcl.mariadb)
```

## 3. mariadb root 암호변경
아래 명령어로 mariadb에 접속합니다.
```shell
mariadb
```

::: spoiler 접속로그 more...
```shell
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 19
Server version: 10.5.9-MariaDB Homebrew

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
```
:::

root 패스워드를 변경합니다.
```shell
MariaDB [none]> alter use 'root'@'localhost' identified by '변경할암호';
Query OK, 0 rows affected (0.012 sec)
```

변경된 내용을 적용합니다.
```shell
MariaDB [none]> flush privileges;
Query OK, 0 rows affected (0.000 sec)
```

## 4. 신규 데이터 베이스 생성

아래 명령어로 데이터 베이스를 생성합니다.
```shell
MariaDB [(none)]> create database goodsaem;
Query OK, 1 row affected (0.001 sec)
```

생성된 데이터 베이스를 확인합니다.
```shell
MariaDB [(none)]> show databases;
+--------------------+
| Database           |
+--------------------+
| goodsaem           |
| information_schema |
| mysql              |
| performance_schema |
| test               |
+--------------------+
5 rows in set (0.000 sec)
```

## 5. 사용자 추가 및 권한부여
생성한 데이터베이스를 사용할 유저를 생성합니다.
```shell
MariaDB [(none)]> CREATE USER  goodsaem@localhost identified by 'xxxxxxxxx';
Query OK, 0 rows affected (0.009 sec)
```

생성한 유저에게 신규 데이터베이스의 모든 권한을 부여 합니다.
```shell
MariaDB [(none)]> grant all privileges on goodsaem.* to 'goodsaem'@'localhost';
Query OK, 0 rows affected (0.012 sec)
```

변경된 내용을 적용합니다.
```shell
MariaDB [none]> flush privileges;
Query OK, 0 rows affected (0.000 sec)
```
