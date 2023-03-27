---
title: 1. JHipster 설치
date: 2023-03-27 22:00:00
tags: [JHipster]
category: [코딩,JHipster]
toc: true
---

{% asset_img jhipster-001.png %}


### {% fa cloud %} 개요
springboot 로 restapi 를 만들일이 생겼다. 처음부터 끝까지 다만들려고 하니 시간이 너무 많이 걸릴것 같고
잘 만들어진 오픈소스가 있을것 같아 구글링하다가 jhipster (제이 힙스터) 라는 개발 플랫폼을 알게되었고,
정리가 잘되어 있는 사이트가 없어 정리한다.

### JHipster 란?
"Hipster"는 미국에서 시작된 문화 용어로, 모던하고 일렉트로닉한 음악, 예술, 
패션 등을 즐기는 청년층을 지칭하는 말이다. 

또한 이들이 추구하는 것들을 "Hip"하다고 표현한다. 일반적으로 힙하다는건은 쿨하고 
멋진것으로 생각되고,현대적이고 트렌디한 것을 의미하기도 한다.  
JHipster는 이러한 Hipster 문화에서 영감을 받아 "Java Hipster"라는 이름으로
만들어졌다. Java 개발자들이 모던한 기술과 개발 방법론을 적극적으로 적용하여 개발을 
할 수 있도록 지원하는 도구를 만드는걸 지향하는듯 한다. 
"힙"한 자바 개발자가 되고 싶다면 한번 도전해 보시길...

*아래와 같은 느낌이다.(픽사베이 무료이미지)*
{% asset_img traveler-gf77d137f1_1920.jpg %}

### 바로 설치
우선 어떤 녀석인지 설치를 해보자. 필자는 mac 환경에서 설치를 진행했다.

#### 사전 준비물
- java
- git
- node.js
- mariadb

설치 방법은 본 블로그에 정리해 두었다. 

*git 설치 방법*
```shell
brew install git
==> Downloading https://formulae.brew.sh/api/formula.jws.json
######################################################################## 100.0%
==> Downloading https://formulae.brew.sh/api/cask.jws.json
######################################################################## 100.0%
Warning: git 2.40.0 is already installed and up-to-date.
```

##### java  버전확인
```shell
java --version
openjdk 18.0.2 2022-07-19
OpenJDK Runtime Environment (build 18.0.2+9-61)
OpenJDK 64-Bit Server VM (build 18.0.2+9-61, mixed mode, sharing)
```
##### git  버전확인
```shell
git --version
git version 2.40.0
```
##### node  버전확인
```shell
node --version
v16.14.0
```
##### mariadb  버전확인
```shell
mariadb --version
mariadb  Ver 15.1 Distrib 10.11.2-MariaDB, for osx10.18 (x86_64) using  EditLine wrapper
```

### JHipster 설치
```shell
npm install -g generator-jhipster
```

#### JHipster 버전확인
```shell
jhipster --version
INFO! Using bundled JHipster
7.9.3
```

### JHipster 어플리케이션 생성
디렉토리를 생성하고 3번째줄과 같이 jhipster라고 입력하면 된다.
```shell
mkdir jhipster
cd jhipster
jhipster
```
아래와 같은 내용이 나오는데 Monolithic application 을 선택하자. (23번라인)
모놀리식이란 전통적인 소프트웨어 구조로 어플리케이션 안에 모든 기능이 다 들어가는걸 말한다. 
```shell
INFO! Using bundled JHipster
(node:13189) [DEP0148] DeprecationWarning: Use of deprecated folder mapping "./lib/util/" in the "exports" field module resolution of the package at /usr/local/lib/node_modules/generator-jhipster/node_modules/yeoman-environment/package.json.
Update this package.json to use a subpath pattern like "./lib/util/*".
(Use `node --trace-deprecation ...` to show where the warning was created)

        ██╗ ██╗   ██╗ ████████╗ ███████╗   ██████╗ ████████╗ ████████╗ ███████╗
        ██║ ██║   ██║ ╚══██╔══╝ ██╔═══██╗ ██╔════╝ ╚══██╔══╝ ██╔═════╝ ██╔═══██╗
        ██║ ████████║    ██║    ███████╔╝ ╚█████╗     ██║    ██████╗   ███████╔╝
  ██╗   ██║ ██╔═══██║    ██║    ██╔════╝   ╚═══██╗    ██║    ██╔═══╝   ██╔══██║
  ╚██████╔╝ ██║   ██║ ████████╗ ██║       ██████╔╝    ██║    ████████╗ ██║  ╚██╗
   ╚═════╝  ╚═╝   ╚═╝ ╚═══════╝ ╚═╝       ╚═════╝     ╚═╝    ╚═══════╝ ╚═╝   ╚═╝
                            https://www.jhipster.tech
Welcome to JHipster v7.9.3

Application files will be generated in folder: /Users/gosu/jhipster
 _______________________________________________________________________________________________________________

  Documentation for creating an application is at https://www.jhipster.tech/creating-an-app/
  If you find JHipster useful, consider sponsoring the project at https://opencollective.com/generator-jhipster
 _______________________________________________________________________________________________________________

? Which *type* of application would you like to create? (Use arrow keys)
❯ Monolithic application (recommended for simple projects) 
  Gateway application 
  Microservice application
```
어플리케이션 이름은 jhipster 라고 입력한다.
```shell
? What is the base name of your application? (jhipster)
```
WebFlux는 리액트에서 사용하는 녀석 같은데 vue를 사용할 예정이므로 N으로 설정한다. (엔터를 입력하면 default 가 N 이므로 선택하지 않는다.)
```shell
? Do you want to make it reactive with Spring WebFlux? (y/N)
```
자바패키지명은 각자 환경에 맞게 지정해주자 io.github.goodsaem.api
```shell
? What is your default Java package name? (com.mycompany.myapp)
```
인증방식은 JWT 인증방식으로 지정
```shell
? Which *type* of authentication would you like to use? (Use arrow keys)
❯ JWT authentication (stateless, with a token) 
  OAuth 2.0 / OIDC Authentication (stateful, works with Keycloak and Okta) 
  HTTP Session Authentication (stateful, default Spring Security mechanism) 
```
데이터베이스는 마리아 디비로 선택한다. (SQL을 선택하고 두번째 MariaDB를 선택하면 된다.)
```shell
? Which *type* of database would you like to use? (Use arrow keys)
❯ SQL (H2, PostgreSQL, MySQL, MariaDB, Oracle, MSSQL) 
  MongoDB 
  Cassandra 
  [BETA] Couchbase 
  [BETA] Neo4j 
  No database 
```
개발 데이터베이스는 어떤걸 사용할건지 물어보는데 마리아 디비로 하자.
```shell
? Which *development* database would you like to use? 
  H2 with disk-based persistence 
  H2 with in-memory persistence 
❯ MariaDB
```
캐쉬를 물어보는데 Ehcache를 선택한다.
```shell
? Which cache do you want to use? (Spring cache abstraction) (Use arrow keys)
❯ Ehcache (local cache, for a single node) 
  Caffeine (local cache, for a single node) 
  Hazelcast (distributed cache, for multiple nodes, supports rate-limiting for gateway applications) 
  Infinispan (hybrid cache, for multiple nodes) 
  Memcached (distributed cache) - Warning, when using an SQL database, this will disable the Hibernate 2nd level cache! 
  Redis (distributed cache) 
  No cache - Warning, when using an SQL database, this will disable the Hibernate 2nd level cache! 
```
하이버네이트 쿼리성능향상을 위해 2차캐시를 쓸건지 물어보는데 Y라고 선택한다.
```shell
? Do you want to use Hibernate 2nd level cache? (Y/n)
```
의존성 관리 도구는 maven을 선택한다.
```shell
? Would you like to use Maven or Gradle for building the backend? (Use arrow keys)
❯ Maven 
  Gradle
```
jHipster Registry 설정여부를 물어보는데 우선 No로 선택한다.
```shell
? Do you want to use the JHipster Registry to configure, monitor and scale your application? (Use arrow keys)
❯ No 
  Yes 
```
기타 기술을 물어보는데 아무것도 선택하지 않는다.(엔터입력)
```shell
? Which other technologies would you like to use? (Press <space> to select, <a> to toggle all, <i> to invert selection, and <enter> to proceed)
❯◯ Elasticsearch as search engine
◯ WebSockets using Spring Websocket
◯ Apache Kafka as asynchronous messages broker
◯ API first development using OpenAPI-generator
```
클라이언트 프레임워크는 vue를 선택하자.
```shell
? Which *Framework* would you like to use for the client? 
  Angular 
  React 
❯ Vue 
  No client 
```
관리자 ui는 생성한다.
```shell
? Do you want to generate the admin UI? (Y/n) 
```
관리자 theme은 Default JHipster를 선택한다. 
```shell
? Would you like to use a Bootswatch theme (https://bootswatch.com/)? (Use arrow keys)
❯ Default JHipster 
  Cerulean 
  Cosmo 
  Cyborg 
  Darkly 
  Flatly 
  Journal 
```
다국어 지원을 물어보는 Y 를 선택한다.
```shell
? Would you like to enable internationalization support? (Y/n) 
```
대표언어는 Korean을 선택한다.
```shell
? Please choose the native language of the application (Use arrow keys)
❯ Korean 
  Marathi 
  Myanmar 
  Polish 
  Portuguese (Brazilian) 
  Portuguese 
  Punjabi 
```
추가언어는 English를 선택한다. (키보드 위 버튼을 눌러서 English가 나오면 스페이스 입력)
```shell
? Please choose additional languages to install (Press <space> to select, <a> to toggle all, <i> to invert selection, and <enter> to proceed)
 ◯ Danish
 ◯ Dutch
❯◉ English
 ◯ Estonian
 ◯ Farsi
 ◯ Finnish
 ◯ French
```
테스트 프레임워크를 물어보는데 선택하지 않는다.
```shell
? Besides JUnit and Jest, which testing frameworks would you like to use? 
❯◯ Cypress
 ◯ [DEPRECATED] Protractor
 ◯ Gatling
 ◯ Cucumber
```
마켓플레이스에서 추가 설치할것을 물어보는데 N을 선택한다.
```shell
? Would you like to install other generators from the JHipster Marketplace? (y/N)
```

여기까지 선택된 내용전체는 아래와 같다.
```shell
? Which *type* of application would you like to create? Monolithic application (recommended for simple projects)
? What is the base name of your application? jhipster
? Do you want to make it reactive with Spring WebFlux? No
? What is your default Java package name? io.github.goodsaem.api
? Which *type* of authentication would you like to use? JWT authentication (stateless, with a token)
? Which *type* of database would you like to use? SQL (H2, PostgreSQL, MySQL, MariaDB, Oracle, MSSQL)
? Which *production* database would you like to use? MariaDB
? Which *development* database would you like to use? MariaDB
? Which cache do you want to use? (Spring cache abstraction) Ehcache (local cache, for a single node)
? Do you want to use Hibernate 2nd level cache? Yes
? Would you like to use Maven or Gradle for building the backend? Maven
? Do you want to use the JHipster Registry to configure, monitor and scale your application? No
? Which other technologies would you like to use? 
? Which *Framework* would you like to use for the client? Vue
? Do you want to generate the admin UI? Yes
? Would you like to use a Bootswatch theme (https://bootswatch.com/)? Default JHipster
? Would you like to enable internationalization support? Yes
? Please choose the native language of the application Korean
? Please choose additional languages to install English
? Besides JUnit and Jest, which testing frameworks would you like to use? 
? Would you like to install other generators from the JHipster Marketplace? No
```
설치가 진행되고 아래와 같은 로그를 확인할수 있다.
```shell
Generating 2,048 bit RSA key pair and self-signed certificate (SHA256withRSA) with a validity of 99,999 days
	for: CN=Java Hipster, OU=Development, O=io.github.goodsaem.api, L=, ST=, C=

KeyStore '/Users/gosu/jhipster/src/main/resources/config/tls//keystore.p12' generated successfully.

   create .prettierrc
   create .prettierignore
   create package.json
    force .yo-rc-global.json
    force .yo-rc.json
   create .gitignore
   create .gitattributes
   create .editorconfig
   create sonar-project.properties
   create .lintstagedrc.js
   create .husky/pre-commit
   create mvnw
   create mvnw.cmd
   create .mvn/jvm.config
   create .mvn/wrapper/maven-wrapper.jar
   create .mvn/wrapper/maven-wrapper.properties
   create npmw
   create npmw.cmd
   create src/main/resources/banner.txt
   create src/main/resources/config/liquibase/changelog/00000000000000_initial_schema.xml
   create src/main/resources/config/liquibase/master.xml
   create src/main/docker/jib/entrypoint.sh
   create checkstyle.xml
   create .devcontainer/Dockerfile
   create pom.xml
   create src/main/docker/app.yml
   create src/main/resources/logback-spring.xml
   create src/main/docker/zipkin.yml
   create src/main/docker/prometheus/prometheus.yml
   create src/main/resources/templates/error.html
   create src/main/docker/jhipster-control-center.yml
   create .devcontainer/devcontainer.json
   create src/main/docker/sonar.yml
   create src/main/resources/i18n/messages.properties
   create src/main/docker/monitoring.yml
   create src/main/docker/central-server-config/README.md
   create src/main/resources/config/application.yml
   create src/main/resources/config/application-dev.yml
   create src/main/docker/grafana/provisioning/dashboards/dashboard.yml
   create src/main/resources/config/application-tls.yml
   create src/main/docker/grafana/provisioning/dashboards/JVM.json
   create src/main/resources/config/application-prod.yml
   create src/main/docker/grafana/provisioning/datasources/datasource.yml
   create src/main/resources/config/bootstrap.yml
   create src/main/resources/config/bootstrap-prod.yml
   create src/main/java/io/github/goodsaem/api/security/SpringSecurityAuditorAware.java
   create src/main/java/io/github/goodsaem/api/security/jwt/JWTConfigurer.java
   create src/main/java/io/github/goodsaem/api/GeneratedByJHipster.java
   create src/main/java/io/github/goodsaem/api/config/JacksonConfiguration.java
   create src/main/java/io/github/goodsaem/api/domain/package-info.java
   create src/main/java/io/github/goodsaem/api/security/SecurityUtils.java
   create src/main/java/io/github/goodsaem/api/config/SecurityConfiguration.java
   create src/main/java/io/github/goodsaem/api/aop/logging/LoggingAspect.java
   create src/main/java/io/github/goodsaem/api/domain/AbstractAuditingEntity.java
   create src/main/java/io/github/goodsaem/api/config/LoggingAspectConfiguration.java
   create src/main/java/io/github/goodsaem/api/security/DomainUserDetailsService.java
   create src/main/java/io/github/goodsaem/api/ApplicationWebXml.java
   create src/main/java/io/github/goodsaem/api/config/package-info.java
   create src/main/java/io/github/goodsaem/api/config/WebConfigurer.java
   create src/main/java/io/github/goodsaem/api/repository/package-info.java
   create src/main/java/io/github/goodsaem/api/security/UserNotActivatedException.java
   create src/main/java/io/github/goodsaem/api/config/AsyncConfiguration.java
   create src/main/java/io/github/goodsaem/api/security/AuthoritiesConstants.java
   create src/main/java/io/github/goodsaem/api/security/package-info.java
   create src/main/java/io/github/goodsaem/api/web/rest/vm/LoginVM.java
   create src/main/java/io/github/goodsaem/api/config/CRLFLogConverter.java
   create src/main/java/io/github/goodsaem/api/config/StaticResourcesWebConfiguration.java
   create src/main/java/io/github/goodsaem/api/service/EmailAlreadyUsedException.java
   create src/main/java/io/github/goodsaem/api/web/rest/UserJWTController.java
   create src/main/java/io/github/goodsaem/api/service/InvalidPasswordException.java
   create src/main/java/io/github/goodsaem/api/security/jwt/TokenProvider.java
   create src/main/java/io/github/goodsaem/api/config/Constants.java
   create src/main/java/io/github/goodsaem/api/service/UsernameAlreadyUsedException.java
   create src/main/java/io/github/goodsaem/api/config/DateTimeFormatConfiguration.java
   create src/main/java/io/github/goodsaem/api/security/jwt/JWTFilter.java
   create src/main/java/io/github/goodsaem/api/web/rest/vm/package-info.java
   create src/main/java/io/github/goodsaem/api/config/LocaleConfiguration.java
   create src/main/java/io/github/goodsaem/api/service/package-info.java
   create src/main/java/io/github/goodsaem/api/web/rest/package-info.java
   create src/main/java/io/github/goodsaem/api/config/LoggingConfiguration.java
   create src/main/java/io/github/goodsaem/api/management/SecurityMetersService.java
   create src/main/java/io/github/goodsaem/api/config/ApplicationProperties.java
   create src/main/java/io/github/goodsaem/api/config/CacheConfiguration.java
   create src/main/java/io/github/goodsaem/api/web/rest/ClientForwardController.java
   create src/main/java/io/github/goodsaem/api/config/DatabaseConfiguration.java
   create src/main/java/io/github/goodsaem/api/web/rest/errors/package-info.java
   create src/main/java/io/github/goodsaem/api/JhipsterApp.java
   create src/main/java/io/github/goodsaem/api/web/rest/errors/BadRequestAlertException.java
   create src/main/java/io/github/goodsaem/api/web/rest/errors/ErrorConstants.java
   create src/main/java/io/github/goodsaem/api/web/rest/errors/ExceptionTranslator.java
   create src/main/java/io/github/goodsaem/api/web/rest/errors/FieldErrorVM.java
   create src/test/resources/logback.xml
   create src/main/java/io/github/goodsaem/api/web/rest/errors/EmailAlreadyUsedException.java
   create src/test/resources/junit-platform.properties
   create src/test/java/io/github/goodsaem/api/security/SecurityUtilsUnitTest.java
   create src/main/java/io/github/goodsaem/api/web/rest/errors/InvalidPasswordException.java
   create src/test/java/io/github/goodsaem/api/config/AsyncSyncConfiguration.java
   create src/main/java/io/github/goodsaem/api/web/rest/errors/LoginAlreadyUsedException.java
   create src/test/java/io/github/goodsaem/api/config/WebConfigurerTest.java
   create src/test/java/io/github/goodsaem/api/IntegrationTest.java
   create src/test/java/io/github/goodsaem/api/config/WebConfigurerTestController.java
   create src/test/java/io/github/goodsaem/api/config/StaticResourcesWebConfigurerTest.java
   create src/test/java/io/github/goodsaem/api/config/SpringBootTestClassOrderer.java
   create src/test/java/io/github/goodsaem/api/security/DomainUserDetailsServiceIT.java
   create src/main/java/io/github/goodsaem/api/domain/User.java
   create src/main/java/io/github/goodsaem/api/domain/Authority.java
   create src/main/java/io/github/goodsaem/api/repository/AuthorityRepository.java
   create src/main/resources/config/liquibase/data/user.csv
   create src/test/java/io/github/goodsaem/api/TechnicalStructureTest.java
   create src/main/resources/config/liquibase/data/authority.csv
   create src/test/java/io/github/goodsaem/api/web/rest/TestUtil.java
   create src/main/resources/config/liquibase/data/user_authority.csv
   create src/test/java/io/github/goodsaem/api/web/rest/errors/ExceptionTranslatorTestController.java
   create src/test/java/io/github/goodsaem/api/web/rest/errors/ExceptionTranslatorIT.java
   create src/test/java/io/github/goodsaem/api/web/rest/ClientForwardControllerTest.java
   create src/test/resources/config/application.yml
   create src/test/resources/config/bootstrap.yml
   create src/main/resources/templates/mail/activationEmail.html
   create src/main/resources/templates/mail/creationEmail.html
   create src/main/resources/templates/mail/passwordResetEmail.html
   create src/main/java/io/github/goodsaem/api/repository/UserRepository.java
   create src/main/java/io/github/goodsaem/api/service/UserService.java
   create src/main/java/io/github/goodsaem/api/service/MailService.java
   create src/main/java/io/github/goodsaem/api/web/rest/vm/ManagedUserVM.java
   create src/main/java/io/github/goodsaem/api/web/rest/AccountResource.java
   create src/main/java/io/github/goodsaem/api/web/rest/UserResource.java
   create src/test/resources/templates/mail/activationEmail.html
   create src/main/java/io/github/goodsaem/api/web/rest/PublicUserResource.java
   create src/main/java/io/github/goodsaem/api/web/rest/vm/KeyAndPasswordVM.java
   create src/main/java/io/github/goodsaem/api/service/dto/package-info.java
   create src/main/java/io/github/goodsaem/api/service/dto/AdminUserDTO.java
   create src/test/resources/testcontainers.properties
   create src/main/java/io/github/goodsaem/api/service/dto/UserDTO.java
   create src/test/resources/META-INF/spring.factories
   create src/test/resources/templates/mail/creationEmail.html
   create src/main/java/io/github/goodsaem/api/service/dto/PasswordChangeDTO.java
   create src/test/java/io/github/goodsaem/api/config/TestContainersSpringContextCustomizerFactory.java
   create src/test/resources/templates/mail/passwordResetEmail.html
   create src/main/java/io/github/goodsaem/api/service/mapper/package-info.java
   create src/main/java/io/github/goodsaem/api/service/mapper/UserMapper.java
   create src/test/java/io/github/goodsaem/api/web/rest/UserJWTControllerIT.java
   create src/test/resources/templates/mail/testEmail.html
   create src/test/java/io/github/goodsaem/api/management/SecurityMetersServiceTests.java
   create src/test/java/io/github/goodsaem/api/security/jwt/TokenProviderTest.java
   create src/test/java/io/github/goodsaem/api/web/rest/PublicUserResourceIT.java
   create src/test/java/io/github/goodsaem/api/web/rest/UserResourceIT.java
   create src/test/java/io/github/goodsaem/api/security/jwt/TokenProviderSecurityMetersTests.java
   create src/test/java/io/github/goodsaem/api/web/rest/AccountResourceIT.java
   create src/test/java/io/github/goodsaem/api/security/jwt/JWTFilterTest.java
   create src/test/java/io/github/goodsaem/api/web/rest/WithUnauthenticatedMockUser.java
   create src/test/resources/testcontainers/mariadb/my.cnf
   create src/test/java/io/github/goodsaem/api/service/MailServiceIT.java
   create src/main/docker/config/mariadb/my.cnf
   create src/test/java/io/github/goodsaem/api/service/UserServiceIT.java
   create src/test/java/io/github/goodsaem/api/service/mapper/UserMapperTest.java
   create src/main/java/io/github/goodsaem/api/config/LiquibaseConfiguration.java
   create src/test/java/io/github/goodsaem/api/config/timezone/HibernateTimeZoneIT.java
   create src/test/java/io/github/goodsaem/api/config/EmbeddedSQL.java
   create src/test/java/io/github/goodsaem/api/config/SqlTestContainer.java
   create src/test/resources/config/application-testdev.yml
   create src/test/resources/config/application-testprod.yml
   create src/main/docker/mariadb.yml
   create src/test/java/io/github/goodsaem/api/config/MariadbTestContainer.java
   create tsconfig.json
   create tsconfig.spec.json
   create .postcssrc.js
   create src/test/java/io/github/goodsaem/api/repository/timezone/DateTimeWrapper.java
   create .eslintrc.js
   create src/test/java/io/github/goodsaem/api/repository/timezone/DateTimeWrapperRepository.java
   create webpack/config.js
   create webpack/webpack.common.js
   create webpack/webpack.prod.js
   create webpack/vue.utils.js
   create webpack/webpack.dev.js
   create src/main/webapp/app/entities/entities.component.ts
   create src/main/webapp/app/shims-vue.d.ts
   create src/main/webapp/app/router/entities.ts
   create src/main/webapp/app/entities/entities.vue
   create src/main/webapp/app/constants.ts
   create src/main/webapp/content/scss/_bootstrap-variables.scss
   create src/main/webapp/app/entities/entities-menu.component.ts
   create src/main/webapp/app/declarations.d.ts
   create src/main/webapp/app/router/admin.ts
   create src/main/webapp/content/scss/global.scss
   create src/main/webapp/app/main.ts
   create src/main/webapp/app/router/pages.ts
   create src/main/webapp/content/scss/vendor.scss
   create src/main/webapp/app/entities/entities-menu.vue
   create src/main/webapp/app/app.vue
   create src/main/webapp/app/app.component.ts
   create src/main/webapp/app/router/index.ts
   create src/main/webapp/app/shared/alert/alert.service.ts
   create src/main/webapp/app/locale/translation.service.ts
   create src/main/webapp/app/shared/config/axios-interceptor.ts
   create src/main/webapp/app/shared/config/formatter.ts
   create src/main/webapp/app/shared/config/store/translation-store.ts
   create src/main/webapp/app/shared/config/config.ts
   create src/main/webapp/app/shared/config/config-bootstrap-vue.ts
   create src/main/webapp/app/shared/config/dayjs.ts
   create src/main/webapp/app/shared/config/store/account-store.ts
   create src/main/webapp/app/shared/security/authority.ts
   create src/main/webapp/app/core/home/home.vue
   create src/main/webapp/app/core/jhi-navbar/jhi-navbar.vue
   create src/main/webapp/app/core/jhi-navbar/jhi-navbar.component.ts
   create src/main/webapp/app/core/home/home.component.ts
   create src/main/webapp/app/core/ribbon/ribbon.vue
   create src/main/webapp/app/core/ribbon/ribbon.component.ts
   create src/main/webapp/app/shared/jhi-item-count.component.ts
   create src/main/webapp/app/shared/date/filters.ts
   create src/main/webapp/app/shared/jhi-item-count.vue
   create src/main/webapp/app/core/error/error.vue
   create src/main/webapp/app/core/error/error.component.ts
   create src/main/webapp/app/shared/sort/jhi-sort-indicator.component.ts
   create src/main/webapp/app/shared/sort/jhi-sort-indicator.vue
   create src/main/webapp/app/core/jhi-footer/jhi-footer.vue
   create src/main/webapp/app/core/jhi-footer/jhi-footer.component.ts
   create src/main/webapp/app/router/account.ts
   create src/main/webapp/app/shared/sort/sorts.ts
   create src/main/webapp/app/shared/data/data-utils.service.ts
   create src/main/webapp/app/shared/model/user.model.ts
   create src/main/webapp/app/account/account.service.ts
   create src/main/webapp/app/account/login-form/login-form.vue
   create src/main/webapp/app/account/login-form/login-form.component.ts
   create src/main/webapp/app/account/login.service.ts
   create src/main/webapp/app/account/change-password/change-password.vue
   create src/main/webapp/app/account/change-password/change-password.component.ts
   create src/main/webapp/app/account/register/register.vue
   create src/main/webapp/app/account/register/register.component.ts
   create src/main/webapp/app/account/register/register.service.ts
   create src/main/webapp/app/account/settings/settings.vue
   create src/main/webapp/app/account/settings/settings.component.ts
   create src/main/webapp/app/account/activate/activate.component.ts
   create src/main/webapp/app/account/activate/activate.service.ts
   create src/main/webapp/app/account/activate/activate.vue
   create src/main/webapp/app/account/reset-password/init/reset-password-init.vue
   create src/main/webapp/app/account/reset-password/init/reset-password-init.component.ts
   create src/main/webapp/app/account/reset-password/finish/reset-password-finish.vue
   create src/main/webapp/app/account/reset-password/finish/reset-password-finish.component.ts
   create src/main/webapp/app/admin/docs/docs.vue
   create src/main/webapp/app/admin/health/health-modal.vue
   create src/main/webapp/app/admin/docs/docs.component.ts
   create src/main/webapp/app/admin/health/health-modal.component.ts
   create src/main/webapp/app/admin/health/health.service.ts
   create src/main/webapp/app/admin/logs/logs.vue
   create src/main/webapp/app/admin/logs/logs.component.ts
   create src/main/webapp/app/admin/logs/logs.service.ts
   create src/main/webapp/app/admin/configuration/configuration.vue
   create src/main/webapp/app/admin/metrics/metrics.vue
   create src/main/webapp/app/admin/configuration/configuration.component.ts
   create src/main/webapp/app/admin/metrics/metrics.component.ts
   create src/main/webapp/app/admin/configuration/configuration.service.ts
   create src/main/webapp/app/admin/health/health.vue
   create src/main/webapp/app/admin/metrics/metrics.service.ts
   create src/main/webapp/app/admin/health/health.component.ts
   create src/main/webapp/app/admin/metrics/metrics-modal.vue
   create src/main/webapp/app/admin/metrics/metrics-modal.component.ts
   create src/main/webapp/app/admin/user-management/user-management.vue
   create src/main/webapp/app/admin/user-management/user-management.component.ts
   create src/main/webapp/app/admin/user-management/user-management-view.vue
   create src/main/webapp/app/admin/user-management/user-management-view.component.ts
   create src/main/webapp/app/admin/user-management/user-management-edit.vue
   create src/main/webapp/app/admin/user-management/user-management-edit.component.ts
   create src/main/webapp/app/admin/user-management/user-management.service.ts
   create src/main/webapp/app/entities/user/user.service.ts
   create src/test/javascript/jest.conf.js
   create src/test/javascript/spec/app/account/account.service.spec.ts
   create src/test/javascript/spec/app/admin/health/health-modal.component.spec.ts
   create src/test/javascript/spec/app/account/settings/settings.component.spec.ts
   create src/test/javascript/spec/app/core/home/home.component.spec.ts
   create src/test/javascript/spec/app/admin/health/health.service.spec.ts
   create src/main/webapp/content/images/jhipster_family_member_0.svg
   create src/test/javascript/spec/app/core/error/error.component.spec.ts
   create src/test/javascript/spec/app/admin/logs/logs.component.spec.ts
   create src/test/javascript/spec/app/core/jhi-navbar/jhi-navbar.component.spec.ts
   create src/test/javascript/spec/app/admin/metrics/metrics.component.spec.ts
   create src/test/javascript/spec/app/account/activate/activate.component.spec.ts
   create src/main/webapp/content/images/jhipster_family_member_0_head-192.png
   create src/test/javascript/spec/app/core/ribbon/ribbon.component.spec.ts
   create src/test/javascript/spec/app/admin/metrics/metrics-modal.component.spec.ts
   create src/test/javascript/spec/app/admin/user-management/user-management.component.spec.ts
   create src/test/javascript/spec/app/shared/alert/alert.service.spec.ts
   create src/test/javascript/spec/app/shared/config/formatter.spec.ts
   create src/main/webapp/content/images/jhipster_family_member_0_head-256.png
   create src/test/javascript/spec/app/shared/config/axios-interceptor.spec.ts
   create src/test/javascript/spec/app/account/login-form/login-form.component.spec.ts
   create src/test/javascript/spec/app/shared/data/data-utils.service.spec.ts
   create src/test/javascript/spec/app/account/change-password/change-password.component.spec.ts
   create src/test/javascript/spec/app/admin/user-management/user-management-view.component.spec.ts
   create src/main/webapp/content/images/jhipster_family_member_0_head-384.png
   create src/test/javascript/spec/app/shared/sort/sorts.spec.ts
   create src/test/javascript/spec/app/account/register/register.component.spec.ts
   create src/test/javascript/spec/app/admin/configuration/configuration.component.spec.ts
   create src/test/javascript/spec/app/account/reset-password/init/reset-password-init.component.spec.ts
   create src/main/webapp/content/images/jhipster_family_member_0_head-512.png
   create src/test/javascript/spec/app/admin/health/health.component.spec.ts
   create src/test/javascript/spec/app/admin/user-management/user-management-edit.component.spec.ts
   create src/test/javascript/spec/app/account/reset-password/finish/reset-password-finish.component.spec.ts
   create src/main/webapp/content/images/jhipster_family_member_1.svg
   create src/main/webapp/content/images/jhipster_family_member_1_head-192.png
   create src/main/webapp/content/images/jhipster_family_member_1_head-256.png
   create src/main/webapp/content/images/jhipster_family_member_1_head-384.png
   create src/main/webapp/content/images/jhipster_family_member_1_head-512.png
   create src/main/webapp/content/images/jhipster_family_member_2.svg
   create src/main/webapp/content/images/jhipster_family_member_2_head-192.png
   create src/main/webapp/content/images/jhipster_family_member_2_head-256.png
   create src/main/webapp/content/images/jhipster_family_member_2_head-384.png
   create src/main/webapp/content/images/jhipster_family_member_2_head-512.png
   create src/main/webapp/content/images/jhipster_family_member_3.svg
   create src/main/webapp/content/images/jhipster_family_member_3_head-192.png
   create src/main/webapp/content/images/jhipster_family_member_3_head-256.png
   create src/main/webapp/content/images/jhipster_family_member_3_head-384.png
   create src/main/webapp/content/images/jhipster_family_member_3_head-512.png
   create src/main/webapp/content/images/logo-jhipster.png
   create src/main/webapp/favicon.ico
   create src/main/webapp/swagger-ui/dist/images/throbber.gif
   create .eslintignore
   create src/main/webapp/manifest.webapp
   create src/main/webapp/WEB-INF/web.xml
   create src/main/webapp/robots.txt
   create src/main/webapp/content/css/loading.css
   create src/main/webapp/404.html
   create src/main/webapp/index.html
   create src/main/webapp/swagger-ui/index.html
   create src/main/webapp/i18n/ko/error.json
   create src/main/webapp/i18n/ko/activate.json
   create src/main/webapp/i18n/ko/login.json
   create src/main/webapp/i18n/ko/home.json
   create src/main/webapp/i18n/ko/global.json
   create src/main/webapp/i18n/ko/password.json
   create src/main/webapp/i18n/ko/register.json
   create src/main/webapp/i18n/ko/sessions.json
   create src/main/webapp/i18n/ko/settings.json
   create src/main/webapp/i18n/ko/reset.json
   create src/main/webapp/i18n/ko/user-management.json
   create src/main/webapp/i18n/ko/configuration.json
   create src/main/webapp/i18n/ko/health.json
   create src/main/webapp/i18n/en/error.json
   create src/main/webapp/i18n/en/logs.json
   create src/main/webapp/i18n/ko/logs.json
   create src/main/webapp/i18n/en/metrics.json
   create src/main/webapp/i18n/ko/metrics.json
   create src/main/webapp/i18n/en/activate.json
   create src/main/webapp/i18n/en/login.json
   create src/main/webapp/i18n/en/global.json
   create src/main/webapp/i18n/en/home.json
   create src/main/webapp/i18n/en/reset.json
   create src/main/webapp/i18n/en/password.json
   create src/main/webapp/i18n/en/health.json
   create src/main/resources/i18n/messages_ko.properties
   create src/main/webapp/i18n/en/register.json
   create src/test/resources/i18n/messages_ko.properties
   create src/main/webapp/i18n/en/sessions.json
   create src/main/resources/i18n/messages_en.properties
   create src/main/webapp/i18n/en/settings.json
   create src/test/resources/i18n/messages_en.properties
   create src/main/webapp/i18n/en/user-management.json
   create src/main/webapp/i18n/en/configuration.json
   create README.md
    force .yo-rc.json
Git repository initialized.

Changes to package.json were detected.
[INFO] Scanning for projects...
[WARNING] 
[WARNING] Some problems were encountered while building the effective model for io.github.goodsaem.api:jhipster:jar:0.0.1-SNAPSHOT
[WARNING] 'build.plugins.plugin.version' for org.apache.maven.plugins:maven-failsafe-plugin is missing. @ line 323, column 21
[WARNING] 
[WARNING] It is highly recommended to fix these problems because they threaten the stability of your build.
[WARNING] 
[WARNING] For this reason, future Maven versions might no longer support building such malformed projects.
[WARNING] 
[INFO] 
[INFO] ------------------< io.github.goodsaem.api:jhipster >-------------------
[INFO] Building JHipster 0.0.1-SNAPSHOT
[INFO] --------------------------------[ jar ]---------------------------------
[INFO] 
[INFO] --- frontend-maven-plugin:1.12.1:install-node-and-npm (install-node-and-npm) @ jhipster ---
[INFO] Installing node version v16.17.0
[INFO] Unpacking /Users/gosu/.m2/repository/com/github/eirslett/node/16.17.0/node-16.17.0-darwin-x64.tar.gz into /Users/gosu/jhipster/target/node/tmp
[INFO] Copying node binary from /Users/gosu/jhipster/target/node/tmp/node-v16.17.0-darwin-x64/bin/node to /Users/gosu/jhipster/target/node/node
[INFO] Installed node locally.
[INFO] Installing npm version 8.19.1
[INFO] Unpacking /Users/gosu/.m2/repository/com/github/eirslett/npm/8.19.1/npm-8.19.1.tar.gz into /Users/gosu/jhipster/target/node/node_modules
[INFO] Installed npm locally.
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  2.645 s
[INFO] Finished at: 2023-03-27T21:53:26+09:00
[INFO] ------------------------------------------------------------------------
Using node installed locally v16.17.0
Using npm installed locally 8.19.1
npm WARN deprecated readdir-scoped-modules@1.1.0: This functionality has been moved to @npmcli/fs
npm WARN deprecated @npmcli/move-file@1.1.2: This functionality has been moved to @npmcli/fs
npm WARN deprecated source-map-url@0.4.1: See https://github.com/lydell/source-map-url#deprecated
npm WARN deprecated stable@0.1.8: Modern JS already guarantees Array#sort() is a stable sort, so this library is deprecated. See the compatibility table on MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#browser_compatibility
npm WARN deprecated @npmcli/move-file@2.0.1: This functionality has been moved to @npmcli/fs
npm WARN deprecated rollup-plugin-terser@7.0.2: This package has been deprecated and is no longer maintained. Please use @rollup/plugin-terser
npm WARN deprecated urix@0.1.0: Please see https://github.com/lydell/urix#deprecated
npm WARN deprecated har-validator@5.1.5: this library is no longer supported
npm WARN deprecated resolve-url@0.2.1: https://github.com/lydell/resolve-url#deprecated
npm WARN deprecated source-map-resolve@0.5.3: See https://github.com/lydell/source-map-resolve#deprecated
npm WARN deprecated w3c-hr-time@1.0.2: Use your platform's native performance.now() and performance.timeOrigin.
npm WARN deprecated sourcemap-codec@1.4.8: Please use @jridgewell/sourcemap-codec instead
npm WARN deprecated querystring@0.2.0: The querystring API is considered Legacy. new code should use the URLSearchParams API instead.
npm WARN deprecated uuid@3.4.0: Please upgrade  to version 7 or higher.  Older versions may use Math.random() in certain circumstances, which is known to be problematic.  See https://v8.dev/blog/math-random for details.
npm WARN deprecated request@2.88.2: request has been deprecated, see https://github.com/request/request/issues/3142
npm WARN deprecated popper.js@1.16.1: You can find the new Popper v2 at @popperjs/core, this package is dedicated to the legacy v1
npm WARN deprecated core-js@2.6.12: core-js@<3.23.3 is no longer maintained and not recommended for usage due to the number of issues. Because of the V8 engine whims, feature detection in old core-js versions could cause a slowdown up to 100x even if nothing is polyfilled. Some versions have web compatibility issues. Please, upgrade your dependencies to the actual version of core-js.

> jhipster@0.0.0 prepare
> husky install

husky - Git hooks installed

added 2016 packages, and audited 2017 packages in 2m

214 packages are looking for funding
  run `npm fund` for details

10 vulnerabilities (2 moderate, 7 high, 1 critical)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
Application successfully committed to Git from /Users/gosu/jhipster.

If you find JHipster useful consider sponsoring the project https://www.jhipster.tech/sponsors/

Server application generated successfully.

Run your Spring Boot application:
./mvnw

Client application generated successfully.

Start your Webpack development server with:
 npm start


> jhipster@0.0.0 clean-www
> rimraf target/classes/static/app/{src,target/}

Congratulations, JHipster execution is complete!
```
가장 마지막줄 보면 성공적으로 설치가 되었다
