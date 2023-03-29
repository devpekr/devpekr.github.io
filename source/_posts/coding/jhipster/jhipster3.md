---
title: 3. JHipster rest api 테스트
date: 2023-03-29 08:38:00
tags: [JHipster]
category: [코딩,JHipster]
toc: true
---

{% asset_img jhipster-003.png %}

### {% fa cloud %} 개요
만들어진 rest api 를 보면서 힙스터가 어떻게 동작하는지 확인해 보자. rest api 테스트는
postman 을 통해서 진행할 예정이다. postman 설치방법은 아래 링크에 정리해 두었다.

[postman.com](postman.com)



### mariadb 데이터베이스 생성 및 계정생성
아래 링크를 클릭하여 디비 생성 및 사용자 생성을 먼저 진행한다.
[jhipster db 생성 및 사용자 생성 ](/2023/03/27/coding/mariadb/mariadb-create-user/)

### db 연결정보 변경

jhipster 프로젝트를 인텔리제이에서 오픈한후 아래 dev 설정파일의 db username 과 비밀번호를 변경한다.

수정파일 : **jhipster/src/main/resources/config/application_dev.yml**

```yaml
  datasource:
    type: com.zaxxer.hikari.HikariDataSource
    url: jdbc:mariadb://localhost:3306/jhipster?useLegacyDatetimeCode=false&serverTimezone=UTC
    username: jhipster
    password: jhipseter
```

{% asset_img j2-1.png %}

### 백엔드 서버 실행
아래 명령어 입력을 통해 백엔드 서버를 실행한다.
```shell
./mvnw
```
실행중 별다른 오류가 없다면 아래와 같은 화면을 확인할수 있다.
```shell
[INFO] Scanning for projects...
[INFO] 
[INFO] ------------------< io.github.goodsaem.api:jhipster >-------------------
[INFO] Building JHipster 0.0.1-SNAPSHOT
[INFO] --------------------------------[ jar ]---------------------------------
[INFO] 
[INFO] >>> spring-boot-maven-plugin:2.7.3:run (default-cli) > test-compile @ jhipster >>>
[INFO] 
[INFO] --- maven-resources-plugin:3.3.0:copy-resources (default-resources) @ jhipster ---
[INFO] Copying 6 resources
[INFO] Copying 15 resources
[INFO] 
[INFO] --- maven-resources-plugin:3.3.0:resources (default-resources) @ jhipster ---
[INFO] Copying 6 resources
[INFO] Copying 15 resources
[INFO] 
[INFO] --- maven-enforcer-plugin:3.1.0:enforce (enforce-versions) @ jhipster ---
[INFO] 
[INFO] --- maven-enforcer-plugin:3.1.0:enforce (enforce-dependencyConvergence) @ jhipster ---
[WARNING] 
Dependency convergence error for org.apiguardian:apiguardian-api:jar:1.1.2:compile paths to dependency are:
+-io.github.goodsaem.api:jhipster:jar:0.0.1-SNAPSHOT
  +-org.zalando:problem-spring-web:jar:0.27.0:compile
    +-org.zalando:problem-violations:jar:0.27.0:compile
      +-org.apiguardian:apiguardian-api:jar:1.1.2:compile
and
+-io.github.goodsaem.api:jhipster:jar:0.0.1-SNAPSHOT
  +-org.zalando:problem-spring-web:jar:0.27.0:compile
    +-org.zalando:problem-spring-common:jar:0.27.0:compile
      +-org.apiguardian:apiguardian-api:jar:1.1.2:compile
and
+-io.github.goodsaem.api:jhipster:jar:0.0.1-SNAPSHOT
  +-org.zalando:problem-spring-web:jar:0.27.0:compile
    +-org.apiguardian:apiguardian-api:jar:1.1.2:compile
and
+-io.github.goodsaem.api:jhipster:jar:0.0.1-SNAPSHOT
  +-org.zalando:problem-spring-web:jar:0.27.0:compile
    +-org.zalando:faux-pas:jar:0.9.0:compile
      +-org.apiguardian:apiguardian-api:jar:1.1.1:compile

[WARNING] Rule 0: org.apache.maven.plugins.enforcer.DependencyConvergence failed with message:
Failed while enforcing releasability. See above detailed error message.
[INFO] 
[INFO] --- jacoco-maven-plugin:0.8.8:prepare-agent (pre-unit-tests) @ jhipster ---
[INFO] argLine set to -javaagent:/Users/gosu/.m2/repository/org/jacoco/org.jacoco.agent/0.8.8/org.jacoco.agent-0.8.8-runtime.jar=destfile=/Users/gosu/jhipster/target/jacoco.exec -Djava.security.egd=file:/dev/./urandom -Xmx1G
[INFO] 
[INFO] --- properties-maven-plugin:1.1.0:read-project-properties (default) @ jhipster ---
[INFO] 
[INFO] --- checksum-maven-plugin:1.11:files (create-pre-compiled-webapp-checksum) @ jhipster ---
[INFO] 
[INFO] --- maven-antrun-plugin:3.1.0:run (eval-frontend-checksum) @ jhipster ---
[INFO] Executing tasks
[INFO] Executed tasks
[INFO] 
[INFO] --- frontend-maven-plugin:1.12.1:install-node-and-npm (install-node-and-npm) @ jhipster ---
[INFO] Node v16.17.0 is already installed.
[INFO] NPM 8.19.1 is already installed.
[INFO] 
[INFO] --- frontend-maven-plugin:1.12.1:npm (npm install) @ jhipster ---
[INFO] Skipping execution.
[INFO] 
[INFO] --- frontend-maven-plugin:1.12.1:npm (webapp build dev) @ jhipster ---
[INFO] Skipping execution.
[INFO] 
[INFO] --- maven-compiler-plugin:3.10.1:compile (default-compile) @ jhipster ---
[INFO] Nothing to compile - all classes are up to date
[INFO] 
[INFO] --- checksum-maven-plugin:1.11:files (create-compiled-webapp-checksum) @ jhipster ---
[INFO] 
[INFO] --- maven-resources-plugin:3.3.0:testResources (default-testResources) @ jhipster ---
[INFO] Copying 15 resources
[INFO] 
[INFO] --- maven-compiler-plugin:3.10.1:testCompile (default-testCompile) @ jhipster ---
[INFO] Nothing to compile - all classes are up to date
[INFO] 
[INFO] <<< spring-boot-maven-plugin:2.7.3:run (default-cli) < test-compile @ jhipster <<<
[INFO] 
[INFO] 
[INFO] --- spring-boot-maven-plugin:2.7.3:run (default-cli) @ jhipster ---
[INFO] Attaching agents: []
22:53:58.895 [Thread-0] DEBUG org.springframework.boot.devtools.restart.classloader.RestartClassLoader - Created RestartClassLoader org.springframework.boot.devtools.restart.classloader.RestartClassLoader@2158b81d

       ██╗ ██╗   ██╗ ████████╗ ███████╗   ██████╗ ████████╗ ████████╗ ███████╗
       ██║ ██║   ██║ ╚══██╔══╝ ██╔═══██╗ ██╔════╝ ╚══██╔══╝ ██╔═════╝ ██╔═══██╗
       ██║ ████████║    ██║    ███████╔╝ ╚█████╗     ██║    ██████╗   ███████╔╝
 ██╗   ██║ ██╔═══██║    ██║    ██╔════╝   ╚═══██╗    ██║    ██╔═══╝   ██╔══██║
 ╚██████╔╝ ██║   ██║ ████████╗ ██║       ██████╔╝    ██║    ████████╗ ██║  ╚██╗
  ╚═════╝  ╚═╝   ╚═╝ ╚═══════╝ ╚═╝       ╚═════╝     ╚═╝    ╚═══════╝ ╚═╝   ╚═╝

:: JHipster 🤓  :: Running Spring Boot 2.7.3 ::
:: https://www.jhipster.tech ::

2023-03-27T22:53:59.219+09:00 DEBUG 16737 --- [kground-preinit] org.jboss.logging                        : Logging Provider: org.jboss.logging.Log4j2LoggerProvider 
2023-03-27T22:53:59.235+09:00  INFO 16737 --- [  restartedMain] io.github.goodsaem.api.JhipsterApp       : Starting JhipsterApp using Java 18.0.2 on gosuui-iMac.local with PID 16737 (/Users/gosu/jhipster/target/classes started by gosu in /Users/gosu/jhipster) 
2023-03-27T22:53:59.236+09:00 DEBUG 16737 --- [  restartedMain] io.github.goodsaem.api.JhipsterApp       : Running with Spring Boot v2.7.3, Spring v5.3.22 
2023-03-27T22:53:59.236+09:00  INFO 16737 --- [  restartedMain] io.github.goodsaem.api.JhipsterApp       : The following 2 profiles are active: "dev", "api-docs" 
2023-03-27T22:54:00.441+09:00 DEBUG 16737 --- [  restartedMain] i.m.c.u.i.logging.InternalLoggerFactory  : Using SLF4J as the default logging framework 
2023-03-27T22:54:00.542+09:00 DEBUG 16737 --- [  restartedMain] i.g.goodsaem.api.config.WebConfigurer    : Registering CORS filter 
2023-03-27T22:54:00.561+09:00  INFO 16737 --- [  restartedMain] i.g.goodsaem.api.config.WebConfigurer    : Web application configuration, using profiles: dev 
2023-03-27T22:54:00.562+09:00  INFO 16737 --- [  restartedMain] i.g.goodsaem.api.config.WebConfigurer    : Web application fully configured 
2023-03-27T22:54:00.699+09:00 DEBUG 16737 --- [  restartedMain] c.ehcache.core.Ehcache-usersByLogin      : Initialize successful. 
2023-03-27T22:54:00.710+09:00 DEBUG 16737 --- [  restartedMain] c.ehcache.core.Ehcache-usersByEmail      : Initialize successful. 
2023-03-27T22:54:00.712+09:00 DEBUG 16737 --- [  restartedMain] c.e.c.E.github.goodsaem.api.domain.User  : Initialize successful. 
2023-03-27T22:54:00.714+09:00 DEBUG 16737 --- [  restartedMain] c.e.c.E.g.goodsaem.api.domain.Authority  : Initialize successful. 
2023-03-27T22:54:00.716+09:00 DEBUG 16737 --- [  restartedMain] c.e.c.E.g.g.api.domain.User.authorities  : Initialize successful. 
2023-03-27T22:54:00.728+09:00 DEBUG 16737 --- [  restartedMain] i.g.g.api.config.AsyncConfiguration      : Creating Async Task Executor 
2023-03-27T22:54:00.753+09:00 DEBUG 16737 --- [  restartedMain] i.g.g.api.config.LiquibaseConfiguration  : Configuring Liquibase 
2023-03-27T22:54:00.798+09:00 DEBUG 16737 --- [  restartedMain] o.m.jdbc.client.impl.StandardClient      : execute query: set autocommit=0 
2023-03-27T22:54:00.799+09:00 DEBUG 16737 --- [  restartedMain] o.mariadb.jdbc.message.server.OkPacket   : System variable change:  autocommit = OFF 
2023-03-27T22:54:00.801+09:00 DEBUG 16737 --- [  restartedMain] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT @@tx_isolation 
2023-03-27T22:54:00.809+09:00  WARN 16737 --- [jhipster-task-1] t.j.c.liquibase.AsyncSpringLiquibase     : Starting Liquibase asynchronously, your database might not be ready at startup! 
2023-03-27T22:54:00.814+09:00 DEBUG 16737 --- [onnection adder] o.m.jdbc.client.impl.StandardClient      : execute query: set autocommit=0 
2023-03-27T22:54:00.814+09:00 DEBUG 16737 --- [onnection adder] o.mariadb.jdbc.message.server.OkPacket   : System variable change:  autocommit = OFF 
2023-03-27T22:54:00.895+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT COUNT(*) FROM jhipster.DATABASECHANGELOGLOCK 
2023-03-27T22:54:00.896+09:00  WARN 16737 --- [jhipster-task-1] o.m.jdbc.message.server.ErrorPacket      : Error: 1146-42S02: Table 'jhipster.databasechangeloglock' doesn't exist 
2023-03-27T22:54:00.907+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: CREATE TABLE jhipster.DATABASECHANGELOGLOCK (ID INT NOT NULL, `LOCKED` BIT(1) NOT NULL, LOCKGRANTED datetime NULL, LOCKEDBY VARCHAR(255) NULL, CONSTRAINT PK_DATABASECHANGELOGLOCK PRIMARY KEY (ID)) 
2023-03-27T22:54:00.909+09:00 DEBUG 16737 --- [onnection adder] o.m.jdbc.client.impl.StandardClient      : execute query: set autocommit=0 
2023-03-27T22:54:00.909+09:00 DEBUG 16737 --- [onnection adder] o.mariadb.jdbc.message.server.OkPacket   : System variable change:  autocommit = OFF 
2023-03-27T22:54:00.912+09:00 DEBUG 16737 --- [onnection adder] o.m.jdbc.client.impl.StandardClient      : execute query: set autocommit=0 
2023-03-27T22:54:00.912+09:00 DEBUG 16737 --- [onnection adder] o.mariadb.jdbc.message.server.OkPacket   : System variable change:  autocommit = OFF 
2023-03-27T22:54:00.914+09:00 DEBUG 16737 --- [onnection adder] o.m.jdbc.client.impl.StandardClient      : execute query: set autocommit=0 
2023-03-27T22:54:00.914+09:00 DEBUG 16737 --- [onnection adder] o.mariadb.jdbc.message.server.OkPacket   : System variable change:  autocommit = OFF 
2023-03-27T22:54:00.915+09:00 DEBUG 16737 --- [onnection adder] o.m.jdbc.client.impl.StandardClient      : execute query: set autocommit=0 
2023-03-27T22:54:00.917+09:00 DEBUG 16737 --- [onnection adder] o.mariadb.jdbc.message.server.OkPacket   : System variable change:  autocommit = OFF 
2023-03-27T22:54:00.918+09:00 DEBUG 16737 --- [onnection adder] o.m.jdbc.client.impl.StandardClient      : execute query: set autocommit=0 
2023-03-27T22:54:00.919+09:00 DEBUG 16737 --- [onnection adder] o.mariadb.jdbc.message.server.OkPacket   : System variable change:  autocommit = OFF 
2023-03-27T22:54:00.921+09:00 DEBUG 16737 --- [onnection adder] o.m.jdbc.client.impl.StandardClient      : execute query: set autocommit=0 
2023-03-27T22:54:00.921+09:00 DEBUG 16737 --- [onnection adder] o.mariadb.jdbc.message.server.OkPacket   : System variable change:  autocommit = OFF 
2023-03-27T22:54:00.922+09:00 DEBUG 16737 --- [onnection adder] o.m.jdbc.client.impl.StandardClient      : execute query: set autocommit=0 
2023-03-27T22:54:00.922+09:00 DEBUG 16737 --- [onnection adder] o.mariadb.jdbc.message.server.OkPacket   : System variable change:  autocommit = OFF 
2023-03-27T22:54:00.923+09:00 DEBUG 16737 --- [onnection adder] o.m.jdbc.client.impl.StandardClient      : execute query: set autocommit=0 
2023-03-27T22:54:00.925+09:00 DEBUG 16737 --- [onnection adder] o.mariadb.jdbc.message.server.OkPacket   : System variable change:  autocommit = OFF 
2023-03-27T22:54:00.944+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT COUNT(*) FROM jhipster.DATABASECHANGELOGLOCK 
2023-03-27T22:54:00.948+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: DELETE FROM jhipster.DATABASECHANGELOGLOCK 
2023-03-27T22:54:00.949+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: INSERT INTO jhipster.DATABASECHANGELOGLOCK (ID, `LOCKED`) VALUES (1, 0) 
2023-03-27T22:54:00.949+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: COMMIT 
2023-03-27T22:54:00.950+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT COUNT(*) FROM jhipster.DATABASECHANGELOGLOCK 
2023-03-27T22:54:00.950+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT COUNT(*) FROM jhipster.DATABASECHANGELOGLOCK 
2023-03-27T22:54:00.951+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT COUNT(*) FROM jhipster.DATABASECHANGELOGLOCK 
2023-03-27T22:54:00.951+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT COUNT(*) FROM jhipster.DATABASECHANGELOGLOCK 
2023-03-27T22:54:00.952+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT COUNT(*) FROM jhipster.DATABASECHANGELOGLOCK 
2023-03-27T22:54:00.952+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT COUNT(*) FROM jhipster.DATABASECHANGELOGLOCK 
2023-03-27T22:54:00.953+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT COUNT(*) FROM jhipster.DATABASECHANGELOGLOCK 
2023-03-27T22:54:00.953+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT COUNT(*) FROM jhipster.DATABASECHANGELOGLOCK 
2023-03-27T22:54:00.954+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT COUNT(*) FROM jhipster.DATABASECHANGELOGLOCK 
2023-03-27T22:54:00.954+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT COUNT(*) FROM jhipster.DATABASECHANGELOGLOCK 
2023-03-27T22:54:00.955+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT COUNT(*) FROM jhipster.DATABASECHANGELOGLOCK 
2023-03-27T22:54:00.955+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT COUNT(*) FROM jhipster.DATABASECHANGELOGLOCK 
2023-03-27T22:54:00.955+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT COUNT(*) FROM jhipster.DATABASECHANGELOGLOCK 
2023-03-27T22:54:00.956+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT COUNT(*) FROM jhipster.DATABASECHANGELOGLOCK 
2023-03-27T22:54:00.956+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT COUNT(*) FROM jhipster.DATABASECHANGELOGLOCK 
2023-03-27T22:54:00.956+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT COUNT(*) FROM jhipster.DATABASECHANGELOGLOCK 
2023-03-27T22:54:00.957+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT COUNT(*) FROM jhipster.DATABASECHANGELOGLOCK 
2023-03-27T22:54:00.957+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT COUNT(*) FROM jhipster.DATABASECHANGELOGLOCK 
2023-03-27T22:54:00.958+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT `LOCKED` FROM jhipster.DATABASECHANGELOGLOCK WHERE ID=1 
2023-03-27T22:54:00.961+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: UPDATE jhipster.DATABASECHANGELOGLOCK SET `LOCKED` = 1, LOCKEDBY = '192.168.0.15 (192.168.0.15)', LOCKGRANTED = NOW() WHERE ID = 1 AND `LOCKED` = 0 
2023-03-27T22:54:00.961+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: COMMIT 
2023-03-27T22:54:01.064+09:00 DEBUG 16737 --- [  restartedMain] o.m.jdbc.client.impl.StandardClient      : execute query: select @@lower_case_table_names 
2023-03-27T22:54:01.108+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: select @@lower_case_table_names 
2023-03-27T22:54:01.109+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT TABLE_SCHEMA TABLE_CAT, NULL  TABLE_SCHEM,  TABLE_NAME, IF(TABLE_TYPE='BASE TABLE' or TABLE_TYPE='SYSTEM VERSIONED', 'TABLE', TABLE_TYPE) as TABLE_TYPE, TABLE_COMMENT REMARKS, NULL TYPE_CAT, NULL TYPE_SCHEM, NULL TYPE_NAME, NULL SELF_REFERENCING_COL_NAME,  NULL REF_GENERATION FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='jhipster' AND TABLE_NAME='DATABASECHANGELOG' AND  TABLE_TYPE IN ('BASE TABLE','SYSTEM VERSIONED') ORDER BY TABLE_TYPE, TABLE_SCHEMA, TABLE_NAME 
2023-03-27T22:54:01.111+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: CREATE TABLE jhipster.DATABASECHANGELOG (ID VARCHAR(255) NOT NULL, AUTHOR VARCHAR(255) NOT NULL, FILENAME VARCHAR(255) NOT NULL, DATEEXECUTED datetime NOT NULL, ORDEREXECUTED INT NOT NULL, EXECTYPE VARCHAR(10) NOT NULL, MD5SUM VARCHAR(35) NULL, `DESCRIPTION` VARCHAR(255) NULL, COMMENTS VARCHAR(255) NULL, TAG VARCHAR(255) NULL, LIQUIBASE VARCHAR(20) NULL, CONTEXTS VARCHAR(255) NULL, LABELS VARCHAR(255) NULL, DEPLOYMENT_ID VARCHAR(10) NULL) 
2023-03-27T22:54:01.151+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT COUNT(*) FROM jhipster.DATABASECHANGELOG 
2023-03-27T22:54:01.152+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT * FROM jhipster.DATABASECHANGELOG ORDER BY DATEEXECUTED ASC, ORDEREXECUTED ASC 
2023-03-27T22:54:01.153+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: COMMIT 
2023-03-27T22:54:01.153+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT COUNT(*) FROM jhipster.DATABASECHANGELOGLOCK 
2023-03-27T22:54:01.153+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT COUNT(*) FROM jhipster.DATABASECHANGELOGLOCK 
2023-03-27T22:54:01.154+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT COUNT(*) FROM jhipster.DATABASECHANGELOGLOCK 
2023-03-27T22:54:01.154+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT COUNT(*) FROM jhipster.DATABASECHANGELOGLOCK 
2023-03-27T22:54:01.155+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT COUNT(*) FROM jhipster.DATABASECHANGELOGLOCK 
2023-03-27T22:54:01.155+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT COUNT(*) FROM jhipster.DATABASECHANGELOGLOCK 
2023-03-27T22:54:01.155+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT COUNT(*) FROM jhipster.DATABASECHANGELOGLOCK 
2023-03-27T22:54:01.155+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT COUNT(*) FROM jhipster.DATABASECHANGELOGLOCK 
2023-03-27T22:54:01.156+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT COUNT(*) FROM jhipster.DATABASECHANGELOGLOCK 
2023-03-27T22:54:01.156+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT COUNT(*) FROM jhipster.DATABASECHANGELOGLOCK 
2023-03-27T22:54:01.156+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT COUNT(*) FROM jhipster.DATABASECHANGELOGLOCK 
2023-03-27T22:54:01.157+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT COUNT(*) FROM jhipster.DATABASECHANGELOGLOCK 
2023-03-27T22:54:01.157+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT COUNT(*) FROM jhipster.DATABASECHANGELOGLOCK 
2023-03-27T22:54:01.157+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT COUNT(*) FROM jhipster.DATABASECHANGELOGLOCK 
2023-03-27T22:54:01.158+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT COUNT(*) FROM jhipster.DATABASECHANGELOGLOCK 
2023-03-27T22:54:01.158+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT COUNT(*) FROM jhipster.DATABASECHANGELOGLOCK 
2023-03-27T22:54:01.158+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT COUNT(*) FROM jhipster.DATABASECHANGELOGLOCK 
2023-03-27T22:54:01.159+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT COUNT(*) FROM jhipster.DATABASECHANGELOGLOCK 
2023-03-27T22:54:01.159+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT COUNT(*) FROM jhipster.DATABASECHANGELOGLOCK 
2023-03-27T22:54:01.159+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT COUNT(*) FROM jhipster.DATABASECHANGELOGLOCK 
2023-03-27T22:54:01.161+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: ROLLBACK 
2023-03-27T22:54:01.163+09:00 DEBUG 16737 --- [  restartedMain] o.m.jdbc.client.impl.StandardClient      : execute query: PREPARE select table_name from information_schema.tables where table_schema = database() and table_type = 'SEQUENCE' 
2023-03-27T22:54:01.164+09:00 DEBUG 16737 --- [  restartedMain] o.m.jdbc.client.impl.StandardClient      : execute query: EXECUTE select table_name from information_schema.tables where table_schema = database() and table_type = 'SEQUENCE' 
2023-03-27T22:54:01.236+09:00  WARN 16737 --- [jhipster-task-1] liquibase.changelog                      : Due to mariadb SQL limitations, setNullable will lose primary key/autoincrement/not null/comment settings explicitly redefined in the change. Use <sql> or <modifySql> to re-specify all configuration if this is the case 
Running Changeset: config/liquibase/changelog/00000000000000_initial_schema.xml::00000000000000::jhipster
2023-03-27T22:54:01.246+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: CREATE SEQUENCE jhipster.sequence_generator INCREMENT BY 50 START WITH 1050 
2023-03-27T22:54:01.277+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT MAX(ORDEREXECUTED) FROM jhipster.DATABASECHANGELOG 
2023-03-27T22:54:01.278+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: INSERT INTO jhipster.DATABASECHANGELOG (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, `DESCRIPTION`, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('00000000000000', 'jhipster', 'config/liquibase/changelog/00000000000000_initial_schema.xml', NOW(), 1, '8:b8c27d9dc8db18b5de87cdb8c38a416b', 'createSequence sequenceName=sequence_generator', '', 'EXECUTED', NULL, NULL, '4.15.0', '9925241159') 
2023-03-27T22:54:01.279+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: COMMIT 
Running Changeset: config/liquibase/changelog/00000000000000_initial_schema.xml::00000000000001::jhipster
2023-03-27T22:54:01.282+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: CREATE TABLE jhipster.jhi_user (id BIGINT NOT NULL, login VARCHAR(50) NOT NULL, password_hash VARCHAR(60) NULL, first_name VARCHAR(50) NULL, last_name VARCHAR(50) NULL, email VARCHAR(191) NULL, image_url VARCHAR(256) NULL, activated BIT(1) NOT NULL, lang_key VARCHAR(10) NULL, activation_key VARCHAR(20) NULL, reset_key VARCHAR(20) NULL, created_by VARCHAR(50) NOT NULL, created_date timestamp NULL, reset_date timestamp NULL, last_modified_by VARCHAR(50) NULL, last_modified_date timestamp NULL, CONSTRAINT PK_JHI_USER PRIMARY KEY (id), CONSTRAINT ux_user_login UNIQUE (login), CONSTRAINT ux_user_email UNIQUE (email)) 
2023-03-27T22:54:01.308+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: CREATE TABLE jhipster.jhi_authority (name VARCHAR(50) NOT NULL, CONSTRAINT PK_JHI_AUTHORITY PRIMARY KEY (name)) 
2023-03-27T22:54:01.335+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: CREATE TABLE jhipster.jhi_user_authority (user_id BIGINT NOT NULL, authority_name VARCHAR(50) NOT NULL) 
2023-03-27T22:54:01.362+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: ALTER TABLE jhipster.jhi_user_authority ADD PRIMARY KEY (user_id, authority_name) 
2023-03-27T22:54:01.429+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: ALTER TABLE jhipster.jhi_user_authority ADD CONSTRAINT fk_authority_name FOREIGN KEY (authority_name) REFERENCES jhipster.jhi_authority (name) 
2023-03-27T22:54:01.491+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: ALTER TABLE jhipster.jhi_user_authority ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES jhipster.jhi_user (id) 
2023-03-27T22:54:01.545+09:00 DEBUG 16737 --- [  restartedMain] i.g.g.api.security.jwt.TokenProvider     : Using a Base64-encoded JWT secret key 
2023-03-27T22:54:01.546+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: ALTER TABLE jhipster.jhi_user MODIFY password_hash VARCHAR(60) NOT NULL 
2023-03-27T22:54:01.614+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT TABLE_SCHEMA TABLE_CAT, NULL  TABLE_SCHEM,  TABLE_NAME, IF(TABLE_TYPE='BASE TABLE' or TABLE_TYPE='SYSTEM VERSIONED', 'TABLE', TABLE_TYPE) as TABLE_TYPE, TABLE_COMMENT REMARKS, NULL TYPE_CAT, NULL TYPE_SCHEM, NULL TYPE_NAME, NULL SELF_REFERENCING_COL_NAME,  NULL REF_GENERATION FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='jhipster' AND TABLE_NAME LIKE 'jhi\\_user' AND  TABLE_TYPE IN ('BASE TABLE','SYSTEM VERSIONED') ORDER BY TABLE_TYPE, TABLE_SCHEMA, TABLE_NAME 
2023-03-27T22:54:01.616+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT TABLE_SCHEMA TABLE_CAT, NULL TABLE_SCHEM, TABLE_NAME, COLUMN_NAME, CASE data_type WHEN 'bit' THEN -7 WHEN 'tinyblob' THEN -3 WHEN 'mediumblob' THEN -4 WHEN 'longblob' THEN -4 WHEN 'blob' THEN -4 WHEN 'tinytext' THEN 12 WHEN 'mediumtext' THEN -1 WHEN 'longtext' THEN -1 WHEN 'text' THEN -1 WHEN 'date' THEN 91 WHEN 'datetime' THEN 93 WHEN 'decimal' THEN 3 WHEN 'double' THEN 8 WHEN 'enum' THEN 12 WHEN 'float' THEN 7 WHEN 'int' THEN IF( COLUMN_TYPE like '%unsigned%', 4,4) WHEN 'bigint' THEN -5 WHEN 'mediumint' THEN 4 WHEN 'null' THEN 0 WHEN 'set' THEN 12 WHEN 'smallint' THEN IF( COLUMN_TYPE like '%unsigned%', 5,5) WHEN 'varchar' THEN 12 WHEN 'varbinary' THEN -3 WHEN 'char' THEN 1 WHEN 'binary' THEN -2 WHEN 'time' THEN 92 WHEN 'timestamp' THEN 93 WHEN 'tinyint' THEN IF(COLUMN_TYPE like 'tinyint(1)%',-7,-6)  WHEN 'year' THEN 91 ELSE 1111 END  DATA_TYPE, IF(COLUMN_TYPE like 'tinyint(1)%', 'BIT',  UCASE(IF( COLUMN_TYPE LIKE '%(%)%', CONCAT(SUBSTRING( COLUMN_TYPE,1, LOCATE('(',COLUMN_TYPE) - 1 ), SUBSTRING(COLUMN_TYPE ,1+locate(')', COLUMN_TYPE))), COLUMN_TYPE))) TYPE_NAME,  CASE DATA_TYPE  WHEN 'time' THEN IF(DATETIME_PRECISION = 0, 10, CAST(11 + DATETIME_PRECISION as signed integer))  WHEN 'date' THEN 10  WHEN 'datetime' THEN IF(DATETIME_PRECISION = 0, 19, CAST(20 + DATETIME_PRECISION as signed integer))  WHEN 'timestamp' THEN IF(DATETIME_PRECISION = 0, 19, CAST(20 + DATETIME_PRECISION as signed integer))  ELSE   IF(NUMERIC_PRECISION IS NULL, LEAST(CHARACTER_MAXIMUM_LENGTH,2147483647), NUMERIC_PRECISION)  END COLUMN_SIZE, 65535 BUFFER_LENGTH,  CONVERT (CASE DATA_TYPE WHEN 'year' THEN NUMERIC_SCALE WHEN 'tinyint' THEN 0 ELSE NUMERIC_SCALE END, UNSIGNED INTEGER) DECIMAL_DIGITS, 10 NUM_PREC_RADIX, IF(IS_NULLABLE = 'yes',1,0) NULLABLE,COLUMN_COMMENT REMARKS, COLUMN_DEFAULT COLUMN_DEF, 0 SQL_DATA_TYPE, 0 SQL_DATETIME_SUB,   LEAST(CHARACTER_OCTET_LENGTH,2147483647) CHAR_OCTET_LENGTH, ORDINAL_POSITION, IS_NULLABLE, NULL SCOPE_CATALOG, NULL SCOPE_SCHEMA, NULL SCOPE_TABLE, NULL SOURCE_DATA_TYPE, IF(EXTRA = 'auto_increment','YES','NO') IS_AUTOINCREMENT,  IF(EXTRA in ('VIRTUAL', 'PERSISTENT', 'VIRTUAL GENERATED', 'STORED GENERATED') ,'YES','NO') IS_GENERATEDCOLUMN  FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='jhipster' ORDER BY TABLE_CAT, TABLE_SCHEM, TABLE_NAME, ORDINAL_POSITION 
2023-03-27T22:54:01.620+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'jhipster' 
2023-03-27T22:54:01.636+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: PREPARE INSERT INTO jhipster.jhi_user(id, login, password_hash, first_name, last_name, email, image_url, activated, lang_key, created_by, last_modified_by) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
2023-03-27T22:54:01.636+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: EXECUTE INSERT INTO jhipster.jhi_user(id, login, password_hash, first_name, last_name, email, image_url, activated, lang_key, created_by, last_modified_by) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
2023-03-27T22:54:01.637+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: EXECUTE INSERT INTO jhipster.jhi_user(id, login, password_hash, first_name, last_name, email, image_url, activated, lang_key, created_by, last_modified_by) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
2023-03-27T22:54:01.637+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: ALTER TABLE jhipster.jhi_user ALTER created_date DROP DEFAULT 
2023-03-27T22:54:01.694+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: PREPARE INSERT INTO jhipster.jhi_authority(name) VALUES(?) 
2023-03-27T22:54:01.694+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: EXECUTE INSERT INTO jhipster.jhi_authority(name) VALUES(?) 
2023-03-27T22:54:01.695+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: EXECUTE INSERT INTO jhipster.jhi_authority(name) VALUES(?) 
2023-03-27T22:54:01.695+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT TABLE_SCHEMA TABLE_CAT, NULL  TABLE_SCHEM,  TABLE_NAME, IF(TABLE_TYPE='BASE TABLE' or TABLE_TYPE='SYSTEM VERSIONED', 'TABLE', TABLE_TYPE) as TABLE_TYPE, TABLE_COMMENT REMARKS, NULL TYPE_CAT, NULL TYPE_SCHEM, NULL TYPE_NAME, NULL SELF_REFERENCING_COL_NAME,  NULL REF_GENERATION FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='jhipster' AND TABLE_NAME LIKE 'jhi\\_user\\_authority' AND  TABLE_TYPE IN ('BASE TABLE','SYSTEM VERSIONED') ORDER BY TABLE_TYPE, TABLE_SCHEMA, TABLE_NAME 
2023-03-27T22:54:01.696+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT TABLE_SCHEMA TABLE_CAT, NULL TABLE_SCHEM, TABLE_NAME, COLUMN_NAME, CASE data_type WHEN 'bit' THEN -7 WHEN 'tinyblob' THEN -3 WHEN 'mediumblob' THEN -4 WHEN 'longblob' THEN -4 WHEN 'blob' THEN -4 WHEN 'tinytext' THEN 12 WHEN 'mediumtext' THEN -1 WHEN 'longtext' THEN -1 WHEN 'text' THEN -1 WHEN 'date' THEN 91 WHEN 'datetime' THEN 93 WHEN 'decimal' THEN 3 WHEN 'double' THEN 8 WHEN 'enum' THEN 12 WHEN 'float' THEN 7 WHEN 'int' THEN IF( COLUMN_TYPE like '%unsigned%', 4,4) WHEN 'bigint' THEN -5 WHEN 'mediumint' THEN 4 WHEN 'null' THEN 0 WHEN 'set' THEN 12 WHEN 'smallint' THEN IF( COLUMN_TYPE like '%unsigned%', 5,5) WHEN 'varchar' THEN 12 WHEN 'varbinary' THEN -3 WHEN 'char' THEN 1 WHEN 'binary' THEN -2 WHEN 'time' THEN 92 WHEN 'timestamp' THEN 93 WHEN 'tinyint' THEN IF(COLUMN_TYPE like 'tinyint(1)%',-7,-6)  WHEN 'year' THEN 91 ELSE 1111 END  DATA_TYPE, IF(COLUMN_TYPE like 'tinyint(1)%', 'BIT',  UCASE(IF( COLUMN_TYPE LIKE '%(%)%', CONCAT(SUBSTRING( COLUMN_TYPE,1, LOCATE('(',COLUMN_TYPE) - 1 ), SUBSTRING(COLUMN_TYPE ,1+locate(')', COLUMN_TYPE))), COLUMN_TYPE))) TYPE_NAME,  CASE DATA_TYPE  WHEN 'time' THEN IF(DATETIME_PRECISION = 0, 10, CAST(11 + DATETIME_PRECISION as signed integer))  WHEN 'date' THEN 10  WHEN 'datetime' THEN IF(DATETIME_PRECISION = 0, 19, CAST(20 + DATETIME_PRECISION as signed integer))  WHEN 'timestamp' THEN IF(DATETIME_PRECISION = 0, 19, CAST(20 + DATETIME_PRECISION as signed integer))  ELSE   IF(NUMERIC_PRECISION IS NULL, LEAST(CHARACTER_MAXIMUM_LENGTH,2147483647), NUMERIC_PRECISION)  END COLUMN_SIZE, 65535 BUFFER_LENGTH,  CONVERT (CASE DATA_TYPE WHEN 'year' THEN NUMERIC_SCALE WHEN 'tinyint' THEN 0 ELSE NUMERIC_SCALE END, UNSIGNED INTEGER) DECIMAL_DIGITS, 10 NUM_PREC_RADIX, IF(IS_NULLABLE = 'yes',1,0) NULLABLE,COLUMN_COMMENT REMARKS, COLUMN_DEFAULT COLUMN_DEF, 0 SQL_DATA_TYPE, 0 SQL_DATETIME_SUB,   LEAST(CHARACTER_OCTET_LENGTH,2147483647) CHAR_OCTET_LENGTH, ORDINAL_POSITION, IS_NULLABLE, NULL SCOPE_CATALOG, NULL SCOPE_SCHEMA, NULL SCOPE_TABLE, NULL SOURCE_DATA_TYPE, IF(EXTRA = 'auto_increment','YES','NO') IS_AUTOINCREMENT,  IF(EXTRA in ('VIRTUAL', 'PERSISTENT', 'VIRTUAL GENERATED', 'STORED GENERATED') ,'YES','NO') IS_GENERATEDCOLUMN  FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='jhipster' ORDER BY TABLE_CAT, TABLE_SCHEM, TABLE_NAME, ORDINAL_POSITION 
2023-03-27T22:54:01.698+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: SELECT TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'jhipster' 
2023-03-27T22:54:01.701+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: PREPARE INSERT INTO jhipster.jhi_user_authority(user_id, authority_name) VALUES(?, ?) 
2023-03-27T22:54:01.701+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: EXECUTE INSERT INTO jhipster.jhi_user_authority(user_id, authority_name) VALUES(?, ?) 
2023-03-27T22:54:01.702+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: EXECUTE INSERT INTO jhipster.jhi_user_authority(user_id, authority_name) VALUES(?, ?) 
2023-03-27T22:54:01.702+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: EXECUTE INSERT INTO jhipster.jhi_user_authority(user_id, authority_name) VALUES(?, ?) 
2023-03-27T22:54:01.702+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: COMMIT 
2023-03-27T22:54:01.703+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: INSERT INTO jhipster.DATABASECHANGELOG (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, `DESCRIPTION`, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('00000000000001', 'jhipster', 'config/liquibase/changelog/00000000000000_initial_schema.xml', NOW(), 2, '8:bfcfe797a737c34ed3179d416d50be6f', 'createTable tableName=jhi_user; createTable tableName=jhi_authority; createTable tableName=jhi_user_authority; addPrimaryKey tableName=jhi_user_authority; addForeignKeyConstraint baseTableName=jhi_user_authority, constraintName=fk_authority_name, ...', '', 'EXECUTED', NULL, NULL, '4.15.0', '9925241159') 
2023-03-27T22:54:01.704+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: COMMIT 
2023-03-27T22:54:01.705+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: UPDATE jhipster.DATABASECHANGELOGLOCK SET `LOCKED` = 0, LOCKEDBY = NULL, LOCKGRANTED = NULL WHERE ID = 1 
2023-03-27T22:54:01.705+09:00 DEBUG 16737 --- [jhipster-task-1] o.m.jdbc.client.impl.StandardClient      : execute query: COMMIT 
2023-03-27T22:54:01.706+09:00 DEBUG 16737 --- [jhipster-task-1] t.j.c.liquibase.AsyncSpringLiquibase     : Liquibase has updated your database in 896 ms 
2023-03-27T22:54:02.438+09:00 DEBUG 16737 --- [  restartedMain] c.a.JHipsterSpringDocGroupsConfiguration : Initializing JHipster OpenApi customizer 
2023-03-27T22:54:02.442+09:00 DEBUG 16737 --- [  restartedMain] c.a.JHipsterSpringDocGroupsConfiguration : Initializing JHipster OpenApi default group 
2023-03-27T22:54:02.445+09:00 DEBUG 16737 --- [  restartedMain] c.a.JHipsterSpringDocGroupsConfiguration : Initializing JHipster OpenApi management group 
2023-03-27T22:54:02.768+09:00  INFO 16737 --- [  restartedMain] org.jboss.threads                        : JBoss Threads version 3.1.0.Final 
2023-03-27T22:54:02.802+09:00  INFO 16737 --- [  restartedMain] io.github.goodsaem.api.JhipsterApp       : Started JhipsterApp in 3.901 seconds (JVM running for 4.157) 
2023-03-27T22:54:02.806+09:00  INFO 16737 --- [  restartedMain] io.github.goodsaem.api.JhipsterApp       : 
----------------------------------------------------------
	Application 'jhipster' is running! Access URLs:
	Local: 		http://localhost:8080/
	External: 	http://218.38.137.27:8080/
	Profile(s): 	[dev, api-docs]
---------------------------------------------------------- 
```
### 프론트 서버 실행
```shell
npm run start
```
실행로그
```shell
> jhipster@0.0.0 start
> npm run webapp:dev --


> jhipster@0.0.0 webapp:dev
> npm run webpack-dev-server -- --mode development --env stats=normal


> jhipster@0.0.0 webpack-dev-server
> webpack serve --config webpack/webpack.common.js "--mode" "development" "--env" "stats=normal"

<i> [webpack-dev-server] [HPM] Proxy created: /api,/services,/management,/v3/api-docs,/h2-console,/auth  -> http://localhost:8080
<i> [webpack-dev-server] Project is running at:
<i> [webpack-dev-server] Loopback: http://localhost:9060/
<i> [webpack-dev-server] On Your Network (IPv4): http://192.168.0.15:9060/
<i> [webpack-dev-server] On Your Network (IPv6): http://[fe80::1]:9060/
<i> [webpack-dev-server] Content not from webpack is served from './target/classes/static/' directory
<i> [webpack-dev-server] 404s will fallback to '/index.html'
assets by path content/ 444 KiB 25 assets
assets by info 4.48 MiB [immutable]
  assets by path app/*.js 4.46 MiB 20 assets
  assets by chunk 19.2 KiB (auxiliary name: app)
    asset dd126cd23626f52c9123.svg 18.7 KiB [emitted] [immutable] [from: src/main/webapp/content/images/jhipster_family_member_3.svg] (auxiliary name: app)
    asset cfd81fbabebba3d187b7.png 605 bytes [emitted] [immutable] [from: src/main/webapp/content/images/logo-jhipster.png] (auxiliary name: app)
assets by path swagger-ui/ 3.08 MiB 16 assets
assets by path ./i18n/*.json 23.2 KiB
  asset ./i18n/ko.json 11.9 KiB [emitted]
  asset ./i18n/en.json 11.4 KiB [emitted]
asset index.html 5.78 KiB [emitted]
asset favicon.ico 1.54 KiB [emitted] [from: src/main/webapp/favicon.ico] [copied]
asset manifest.webapp 751 bytes [emitted] [from: src/main/webapp/manifest.webapp] [copied]
asset robots.txt 216 bytes [emitted] [from: src/main/webapp/robots.txt] [copied]
cached modules 4.23 MiB (javascript) 19.2 KiB (asset) [cached] 629 modules
runtime modules 32.1 KiB 14 modules
cacheable modules 166 KiB
  modules by path ./node_modules/webpack-dev-server/client/ 55.8 KiB 12 modules
  modules by path ./node_modules/webpack/ 18.8 KiB
    ./node_modules/webpack/hot/dev-server.js 1.59 KiB [built] [code generated]
    ./node_modules/webpack/hot/log.js 1.34 KiB [built] [code generated]
    + 3 modules
  modules by path ./node_modules/html-entities/lib/*.js 81.3 KiB
    ./node_modules/html-entities/lib/index.js 7.74 KiB [built] [code generated]
    ./node_modules/html-entities/lib/named-references.js 72.7 KiB [built] [code generated]
    + 2 modules
  ./node_modules/ansi-html-community/index.js 4.16 KiB [built] [code generated]
  ./node_modules/ts-loader/index.js??clonedRuleSet-1.use[0]!./src/main/webapp/app/core/jhi-navbar/jhi-navbar.component.ts?vue&type=script&lang=ts& 5.6 KiB [built] [code generated]
webpack 5.74.0 compiled successfully in 1343 ms
[Browsersync] Proxying: http://localhost:9060
[Browsersync] Access URLs:
 -------------------------------------
       Local: http://localhost:9000
    External: http://192.168.0.15:9000
 -------------------------------------
          UI: http://localhost:3001
 UI External: http://localhost:3001
 -------------------------------------
```
정상적으로 실행되면 웹브라우저가 열리면서 아래와 같은 화면을 볼수 있다.

{% asset_img j2-2.png %}

### 관리자페이지 확인하기
가장 우측의 계정의 인증 메뉴를 클릭해서 admin/admin으로 로그인한다.

메뉴좌측 부터 오른쪽으로 메뉴 하나씩 하나씩 캡처한 내용이다. 
### 홈
{% asset_img jhipster9.png %}
### Entities
아직은 비워있는데 모델을 추가하면 이곳에 엔티티가 추가된다.
{% asset_img jhipster10.png %}
### 관리자 > 사용자관리
{% asset_img jhipster11.png %}
### 관리자 > 메트릭스
{% asset_img jhipster12.png %}
### 관리자 > 상태확인
{% asset_img jhipster13.png %}
### 관리자 > 설정
{% asset_img jhipster14.png %}
### 관리자 > 로그
{% asset_img jhipster15.png %}
### 관리자 > API
{% asset_img jhipster16.png %}
### 언어 > 언어변경
{% asset_img jhipster17.png %}
