---
title: H2DB 설치
date: 2023-03-24 23:55:32
tags: [h2db]
category: [설치,H2DB]
toc: true
---

# <i class="fa fa-tools"></i> H2 DB 설치
H2 DB 는 Java 로 만들어진 관계형 데이터 베이스(rdb) 입니다. 일반적으로 Java application 에 임베디드 되어
많이 사용됩니다. 클라이언트 및 서버 모두 실행되며 배포가 쉽고 설치시 필요한 용량이 적게 드는 경량 db 입니다.
H2 DB 설치하는 방법 및 H2 DB에 연결하여 테이블을 생성하고 insert delete update select 등의 문장을
실행해 보겠습니다.

## 1. 설치
최신 버전 설치를 진행해주세요
1. 아래 다운로드 경로에서 각각의 os에 맞는 파일을 다운로드 합니다. 전 사용하는 pc가 mac 이라 Platform-independent 버전을 다운로드 받았습니다.
    - [https://www.h2database.com/html/download.html](https://www.h2database.com/html/download.html)
    - {% asset_img download.jpg %}

1. 적당한 위치에 압축을 풀어 주시면 설치 완료되었습니다.

## 2. 데이터 베이스 생성

1. 압축을 푼 디렉토리의 bin 디렉토리로 이동합니다.
    - cd /Users/goodsaem/goodsaem/**h2**/**bin**
1. **1번** 라인 명령어를 실행하여 h2 shell 로 접속합니다.
1. **7번** 라인 처럼 jdbc url을 지정합니다. (/Users/goodsaem/goodsaem/api/ 디렉토리
   아래에 **goodsaem**  이라는 db 를 생성하겠다는 의미 입니다.)
    - h2 db 는 메모리에 데이터를 저장하는 방식과 파일로 저장하는 방식 2가지가 있습니다. 메모리 저장 방식을 사용하면 서비스 재시작 시 모든 데이터가 삭제 되므로 파일에 저장하는 방식으로 파이이 저장되는 디렉토리를 지정했습니다.
    - **메모리** jdbc:h2:mem:2
    - **파일** jdbc:h2:./path/to/database
1. **11번** 라인에 데이터베이스 사용자명을 입력합니다.
1. **12-14번** 라인처럼 패스워드를 입력합니다. 그렇게 하면 신규 db 생성이 완료됩니다.
1. **24번** 라인 quit 명령어를 입력하여 데이터 베이스 생성을 완료합니다.


```shell
java -cp h2-*.jar org.h2.tools.Shell


Welcome to H2 Shell 1.4.199 (2019-03-13)
Exit with Ctrl+C
[Enter]   jdbc:h2:tcp://localhost/~/test
URL       jdbc:h2:/Users/goodsaem/goodsaem/api/goodsaem
[Enter]   org.h2.Driver
Driver    
[Enter]   sa
User      goodsaem
Password  
Type the same password again to confirm database creation.
Password  
Connected
Commands are case insensitive; SQL statements end with ';'
help or ?      Display this help
list           Toggle result list / stack trace mode
maxwidth       Set maximum column width (default is 100)
autocommit     Enable or disable autocommit
history        Show the last 20 statements
quit or exit   Close the connection and exit

sql> quit
Connection closed
```

해당 디렉토리에 db 파일이 제대로 생성되었는지 확인 하겠습니다. 아래 디렉토리에서 확인을 해보면 12번라인 처럼 goodsaem.mv.db가 정상적으로 생성되었음을
알수 있습니다.
```shell{12}
cd /Users/goodsaem/goodsaem/api
ls -al
total 96
drwxr-xr-x@ 14 goodsaem  staff    448  2 20 11:09 .
drwxr-xr-x  22 goodsaem  staff    704  2 17 22:59 ..
-rw-r--r--@  1 goodsaem  staff    444  2 10 12:57 .gitignore
drwxr-xr-x   7 goodsaem  staff    224  2 10 22:33 .gradle
drwxr-xr-x  10 goodsaem  staff    320  2 20 10:58 .idea
-rw-r--r--@  1 goodsaem  staff    937  2 10 12:57 HELP.md
drwxr-xr-x   6 goodsaem  staff    192  2 11 01:50 build
-rw-r--r--@  1 goodsaem  staff    819  2 10 22:38 build.gradle
-rw-r--r--   1 goodsaem  staff  20480  2 20 11:31 goodsaem.mv.db
drwxr-xr-x@  3 goodsaem  staff     96  2 10 12:57 gradle
-rwxr-xr-x@  1 goodsaem  staff   5766  2 10 12:57 gradlew
-rw-r--r--@  1 goodsaem  staff   2763  2 10 12:57 gradlew.bat
-rw-r--r--@  1 goodsaem  staff     25  2 10 12:57 settings.gradle
drwxr-xr-x@  4 goodsaem  staff    128  2 10 12:57 src
```

## 3.실행
아래와 같은 명령어를 입력합니다.
```shell
cd /Users/goodsaem/goodsaem/h2/bin
java -cp h2*.jar org.h2.tools.Server
```
그리고 나 웹브라우저에 [http://localhost:8082/](http://localhost:8082/) 접속하면 아래와 같이 h2 db 로그인 하는 화면이 나옵니다.

{% asset_img login.jpg %}

db 생성시 입력했던 사용자명과 비밀번호를 입력하고 연결 버튼을 클릭합니다. 정상적으로 로그인 되면
아래와 같은 화면을 볼수 있습니다.

{% asset_img conok.jpg %}

태이블을 생성하고 insert select update delete 를 진행해 보겠습니다.
1. 샘플 SQL  스크립트 를 클릭합니다.
1. 스크립트가 복사 됩니다.
1. 실행 버튼을 클릭합니다.

{% asset_img crud.jpg %}

정상적으로 실행하면 아래와 같은 결과 화면을 확인할수 있습니다.

{% asset_img select.jpg %}

## 4. DBeaver 이용방법

전용 ide 툴 DBeaver 연결해 보겠습니다.

:::tip DBeaver
제가 자주 사용하는 무료 Database Tool 입니다 거의 모든 DB에 연결해서 사용할수 있습니다. **H2**, MySQL, PostgreSQL, SQLite, Oracle, DB2,
SQL Server, Sybase, MS Access, Teradata, Firebird, Apache Hive, Phoenix, Presto, etc.

{% asset_img beaver-head.png %}
:::

1. [https://dbeaver.io/download/](https://dbeaver.io/download/) OS 맞는 파일을 다운로드 받습니다.
    - {% asset_img dbeaver_download.jpg %}
1. 다운로드 받은 파일을 더블클릭하여 설치를 진행합니다. 아이콘을 드래그 하여 Applications 폴더로 이동합니다.
    - {% asset_img dbeaver_install.jpg %}
1. 실행중인 h2 db 프로세스가 있다면 종료 합니다. (h2 실행중일때는 dbeaver로 연결할수 없습니다. lock 이 걸려 있다는 메시지와 함께 실행이 되지 않습니다.)
    - {% asset_img stop.jpg %}
1. 응용 프로그램에서 DBeaver 아이콘을 클릭하여 실행합니다.
    - {% asset_img dbeaver_exec.jpg %}
1. 실행후 플러그 아이콘을 클릭하여 새로운 연결을 진행합니다. 여러 db중 h2 db embeded 아이콘을 선택합니다.
    - {% asset_img new_conn.jpg %}
1. Browse 버튼을 클릭하여 db 파일 goodsaem.mv.db 파일을 선택합니다. username password에 db 생성시 입력한 값을 넣고 확인 버튼을 클리하여
   db에 연결합니다.
    - {% asset_img conn_complete.jpg %}
1. 좌측에 연결된 db에서 마우스 오른쪽 버튼을 클릭하여 sql 편집기 sql 편집기를 클릭합니다.
    - {% asset_img sql_edit.jpg %}
1. sql 편집기에 select * from test 라고 쿼리를 입력한후 좌측에 <i class="fa fa-play"></i> 아이콘을 클릭하여 실행하면 아래와 같은 결과를
   확인할수 있습니다.
    - {% asset_img sql.jpg %}

## 마무리
h2 db 설치 방법 및 신규 데이터베이스를 생성하고  웹브라우저를 통해 쿼리를 실행하는 방법과 전용 브라우저를 통해서 실행하는 방법에 대해서 알아 보았습니다.
좌측 메뉴중 spring > rest api 서버 > 3. h2 db 파트에서 생성한 db 에 연결하여 사용하는 방법에 대해서 보다 자세히 알아 보겠습니다.
긴글 읽어 주셔서 진심으로 감사합니다.
