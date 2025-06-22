---
title: 6. SpringBoot Backend 서버 구축
date: 2023-03-26 01:16:03
tags: [springboot]
category: [Coding,springboot]
toc: true
---

{% asset_img springboot-006.png %}


# <i class="fas fa-server"></i> 6. SpringBoot Ignite 캐쉬설정
프로젝트를 진행하다 보면 캐쉬를 사용해야 하는 경우가 있습니다. 실시간으로 변하는 dash board를 구축해달라고 할때 전 주로 캐쉬를 이용해서 문제를 
해결합니다. 대쉬보드를 사용하는 사용자가 천명 이라고 가정하고 대시보드는 5초마다 한번씩 변경되어 되고 한번에 불러오는 데이터량은 1만건 정도 된다고
가정하겠습니다. 이걸 그냥 query 날려서 데이터를 가져온다고 가정하면 10,000 * 1,000 = 10,000,000 5초마다 천만건의 데이터를 가져오게 되는
거죠 db에도 부하가 많이가고 응답속도도 느려지고 메모리가 꽉 차서 코아 덤프떨어지고 서비스는 100% 중단됩니다. 이럴때 캐쉬를 사용하면 좋은데요
redis는 참 좋은데 설치를 해야 되는 문제가 있습니다. unix에서는 설치도 안되고 패쇄망에 있는 리눅스에서 설치도 쉬운 문제가 아니죠..
이때 ignite를 이용하면 쉽게 문제를 풀수 있습니다.

## 1. 아키텍처  (springboot , ignite , spring scheduler)
구상하고 있는 구조는 아래와 같습니다. 스프링 스케쥴러를 이용하여 5초마다 한번씩 디비에 데이터를 읽어서 ignite 캐쉬에 json 형태로 데이터를
담아 놓습니다. 1,000 명의 사용자가 5초마다 데이터를 요청하더라도 이미 가져온 캐쉬의 json 데이터를 가져와서 보여주기에 5초당 1만건 데이터를
불러오는 부하만 걸리게 됩니다. 부하가 1/1000 로 줄어 들게 됩니다.

{% asset_img 1.jpg %}

최종 생각하는 모습은 위에 그림과 같으나 오늘 시간은 지금까지 만든 데이터를 ignite 캐쉬에 올려 보겠습니다. 사실 이부분 진행하면서 설정하는
부분 때문에 시간을 많이 소비했는데 실패했던 부분도 정리해 두겠습니다. 유사한 설정 진행시 참고 하시기 바랍니다.

## 2. Directory 구조
디렉토리 구조는 아래와 같습니다. builde.gradle 과 HCodeControll은 수정 되고 2개 파일은 추가할 예정 입니다. 디렉토리가 없으면 생성하고
내용이 없는 클래스 파일을 우선 작성해 주세요

*line 1,7,12,26*
```shell
build.gradle
src
└── main
├── java
│   └── io.github.goodsaem.api
│           ├── config
│           |    ├── IgniteConfig.java
│           |    └── WebConfig.java
│           ├── ApiApplication.java
│           ├── controller
│           │    │   └── v1
│           │    │        ├── HCodeController.java
│           │    │        └── MemoController.java
│           │    └── MyController.java
│           ├── entity
│           │    ├── HCode.java
│           │    └── Memo.java
│           ├── service
│           │    ├── HCodeService.java
│           │    └── IHCodeService.java
│           ├── repo
│           |     ├── HCodeRepo.java
│           |     └── MemoJpaRepo.java
│           |
│           └── store
│                 └── DataStore.java
└── resources
├── application.yml
├── banner.txt
└── templates
├── hcode.ftlh
└── goodsaem.ftlh
```


## 3. builde.gradle
ignite 사용을 위한 설정을 아래와 같이 추가합니다.

*line 3,42-45*
```shell
buildscript {
	ext {
		apacheIgniteVersion = '2.9.1'
		springBootVersion = '2.4.3'
	}
	repositories {
		mavenCentral()
	}
	dependencies {
		classpath(
				"org.springframework.boot:spring-boot-gradle-plugin:${springBootVersion}")
	}
}

apply plugin: 'org.springframework.boot'
apply plugin: 'war'
apply plugin: 'io.spring.dependency-management'
sourceCompatibility = '1.8'
targetCompatibility = '1.8'


group = 'io.github.goodsaem'
version = '0.0.1-SNAPSHOT'

configurations {
	compileOnly {
		extendsFrom annotationProcessor
	}
}

repositories {
	mavenCentral()
}

dependencies {
	implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
	implementation 'org.springframework.boot:spring-boot-starter-freemarker'
	implementation 'org.springframework.boot:spring-boot-starter-web'
	implementation 'org.springframework.boot:spring-boot-autoconfigure'
	implementation("org.mariadb.jdbc:mariadb-java-client")

	compile "org.apache.ignite:ignite-core:$apacheIgniteVersion",
			"org.apache.ignite:ignite-slf4j:$apacheIgniteVersion",
			"org.apache.ignite:ignite-spring:$apacheIgniteVersion"
			"org.apache.ignite:ignite-rest-http:$apacheIgniteVersion"

	compileOnly 'org.projectlombok:lombok'
	annotationProcessor 'org.projectlombok:lombok'
	testImplementation 'org.springframework.boot:spring-boot-starter-test'
}

test {
	useJUnitPlatform()
}
```


## 4. IgniteConfig.java
복잡한 설정을 진행하는데요 자세한 내용은 [https://ignite.apache.org/docs/latest/extensions-and-integrations/spring/spring-boot](https://ignite.apache.org/docs/latest/extensions-and-integrations/spring/spring-boot)
여기를 참조 하시고 간단히 설명 드리면 서비스할 포트 지정하고 grid 명을 지정하는데 이부분은 여러개의 캐쉬 서버를 운영할때 서로 동기화 할수 있는 역할을
담당하게 됩니다. 만약 사용자 로그인을 하고 세션정보를 서버1,서버2에 모두 저장 즉 클러스터링 하고 싶다면 ignite 를 통해 가능하고 서버1과 서버2를
식별할수 있는 역할을 담당하게 됩니다. 그리고 thread pool 사이즈 같은 설정값이 있는데 이부분은 운영하면서 조정이 가능할것 같네요..

그냥 쉽게 ignite 설정이구나 생각하시고 동일하게 설정해도 크게 문제 없다고 생각합니다(단 단독 서버인경우)

```java
package io.github.goodsaem.api.config;

import lombok.extern.slf4j.Slf4j;
import org.apache.ignite.Ignite;
import org.apache.ignite.IgniteException;
import org.apache.ignite.IgniteLogger;
import org.apache.ignite.Ignition;
import org.apache.ignite.configuration.BinaryConfiguration;
import org.apache.ignite.configuration.ConnectorConfiguration;
import org.apache.ignite.configuration.IgniteConfiguration;
import org.apache.ignite.logger.slf4j.Slf4jLogger;
import org.apache.ignite.spi.discovery.tcp.TcpDiscoverySpi;
import org.apache.ignite.spi.discovery.tcp.ipfinder.vm.TcpDiscoveryVmIpFinder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.Collections;

@Configuration
@Slf4j
public class IgniteConfig {
    @Bean
    public IgniteConfiguration igniteConfiguration() {
        System.setProperty("IGNITE_JETTY_PORT","8888");
        IgniteConfiguration igniteConfiguration = new IgniteConfiguration();
        igniteConfiguration.setClientMode(false);
        ConnectorConfiguration connectorConfiguration = new ConnectorConfiguration();
        connectorConfiguration.setPort(47500);
        igniteConfiguration.setMetricsLogFrequency(60000);
        igniteConfiguration.setQueryThreadPoolSize(2);
        igniteConfiguration.setDataStreamerThreadPoolSize(1);
        igniteConfiguration.setManagementThreadPoolSize(2);
        igniteConfiguration.setRebalanceThreadPoolSize(1);
        igniteConfiguration.setAsyncCallbackPoolSize(2);
        igniteConfiguration.setPeerClassLoadingEnabled(false);
        IgniteLogger log = new Slf4jLogger();
        igniteConfiguration.setGridLogger(log);
        igniteConfiguration.setIgniteInstanceName("GoodSaem-Grid");
        BinaryConfiguration binaryConfiguration = new BinaryConfiguration();
        binaryConfiguration.setCompactFooter(false);
        igniteConfiguration.setBinaryConfiguration(binaryConfiguration);
        TcpDiscoverySpi tcpDiscoverySpi = new TcpDiscoverySpi();
        TcpDiscoveryVmIpFinder tcpDiscoveryVmIpFinder = new TcpDiscoveryVmIpFinder();
        tcpDiscoveryVmIpFinder.setAddresses(Collections.singletonList("127.0.0.1:47500..47509"));
        tcpDiscoverySpi.setIpFinder(tcpDiscoveryVmIpFinder);
        igniteConfiguration.setDiscoverySpi(tcpDiscoverySpi);
        return igniteConfiguration;
    }

    @Bean(destroyMethod = "close", name="ignite")
    public Ignite ignite(IgniteConfiguration igniteConfiguration) throws IgniteException{
        Ignite ignite = Ignition.start(igniteConfiguration);
        ignite.cluster().active(true);
        return ignite;
    }
}
```

## 5. DataStore.java
데이터를 저장하는 공간을 만들고 최초 어플리케이션이 시작되면 hCodeStore에 키값으로 hCodeCache 란 이름으로 db에서 불러온
행정코드를 메모리를 올리는 역할을 담당합니다. 이렇게 캐쉬에 올려놓으면 다음번 사용자가 데이터를 요청할때는 db에서 가져오지 않고
캐쉬에 데이터를 통해서 가져올수 있습니다. 데이터 수정,삭제,저장 시 캐쉬에 데이터를 변경하여 빠르게 데이터를 불러올때 활용하면
좋겠네요 또 그리고 위에서 설명했던것 처럼 주기마다 데이터가 변하고 접속한 클라이언트가 많을때도 활용하면 속도 향상에 도움이
되리라 생각합니다.

크게 어려운 코드는 없고 @EventListener(ApplicationReadyEvent.class) 어노테이션을 사용하여 어플리케이션이 구동되고
나면 디비에서 행정코드를 읽어 캐쉬에 저장하는 부분만 유의해서 보시면 됩니다.

*line 40-48*
```java
package io.github.goodsaem.api.store;

import io.github.goodsaem.api.entity.HCode;
import io.github.goodsaem.api.service.IHCodeService;
import lombok.extern.slf4j.Slf4j;
import org.apache.ignite.Ignite;
import org.apache.ignite.IgniteCache;
import org.apache.ignite.cache.CacheMode;
import org.apache.ignite.cache.CacheRebalanceMode;
import org.apache.ignite.configuration.CacheConfiguration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class DataStore {
    @Autowired
    private IHCodeService ihCodeService;

    private final IgniteCache<String, List<HCode>> hCodeStore;

    DataStore(Ignite ignite) {
        hCodeStore = ignite.getOrCreateCache(getCacheConfiguration("hCodeStore"));
    }

    private CacheConfiguration getCacheConfiguration(String name) {
        CacheConfiguration cacheConfiguration = new CacheConfiguration();
        cacheConfiguration.setName(name);
        cacheConfiguration.setCacheMode(CacheMode.REPLICATED);
        cacheConfiguration.setRebalanceMode(CacheRebalanceMode.SYNC);
        cacheConfiguration.setStatisticsEnabled(true);
        return cacheConfiguration;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void setHCodeCache() {
        hCodeStore.remove("hCodeCache");
        Map<String,List<HCode>> hCodeMap = ihCodeService.getHCodeMap();
        if(hCodeMap != null) {
            hCodeStore.putAll(hCodeMap);
        }
        getHCodeCache();
    }

    public List<HCode> getHCodeCache() {
        List<HCode> hCodes = hCodeStore.get("hCodeCache");
        log.info("ignite hCodes.size() ===> " + hCodes.size());
        return hCodes;
    }
}
```

## 6. HCodeController.java

기존 db에서 데이터 불러오던 부분을 캐쉬에서 가져오도록 코드를 수정했습니다.

*line 20,25*
```java
package io.github.goodsaem.api.controller.v1;

import io.github.goodsaem.api.entity.HCode;
import io.github.goodsaem.api.service.IHCodeService;
import io.github.goodsaem.api.store.DataStore;
import lombok.var;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Controller
public class HCodeController {
    @Autowired
    private IHCodeService ihCodeService;

    @Autowired
    private DataStore dataStore;

    @GetMapping("/hcodes")
    public String findHcodes(Model model) {
        //var hcodes = (List<HCode>) ihCodeService.findAll();
        var hcodes = (List<HCode>) dataStore.getHCodeCache();
        model.addAttribute("hcodes",hcodes);

        return "hcode";
    }
}
```

## 7. Server operation and problem!
이상태에서 서버를 시작해 보겠습니다.

::: spoiler 처음 시작 이부분 까지는 문제가 없습니다.

```shell

██████╗  ██████╗  ██████╗ ██████╗ ███████╗ █████╗ ███████╗███╗   ███╗
██╔════╝ ██╔═══██╗██╔═══██╗██╔══██╗██╔════╝██╔══██╗██╔════╝████╗ ████║
██║  ███╗██║   ██║██║   ██║██║  ██║███████╗███████║█████╗  ██╔████╔██║
██║   ██║██║   ██║██║   ██║██║  ██║╚════██║██╔══██║██╔══╝  ██║╚██╔╝██║
╚██████╔╝╚██████╔╝╚██████╔╝██████╔╝███████║██║  ██║███████╗██║ ╚═╝ ██║
╚═════╝  ╚═════╝  ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝
:: Spring Boot ::                         ver : 2.4.3
2021-03-18 00:01:07.833  INFO 48562 --- [           main] io.github.goodsaem.api.ApiApplication    : Starting ApiApplication using Java 1.8.0_275 on goodsaemui-iMac.local with PID 48562 (/Users/goodsaem/goodsaem/api/build/classes/java/main started by goodsaem in /Users/goodsaem/goodsaem/api)
2021-03-18 00:01:07.835  INFO 48562 --- [           main] io.github.goodsaem.api.ApiApplication    : No active profile set, falling back to default profiles: default
2021-03-18 00:01:08.228  INFO 48562 --- [           main] .s.d.r.c.RepositoryConfigurationDelegate : Bootstrapping Spring Data JPA repositories in DEFAULT mode.
2021-03-18 00:01:08.260  INFO 48562 --- [           main] .s.d.r.c.RepositoryConfigurationDelegate : Finished Spring Data repository scanning in 27 ms. Found 2 JPA repository interfaces.
2021-03-18 00:01:08.539  INFO 48562 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat initialized with port(s): 9090 (http)
2021-03-18 00:01:08.544  INFO 48562 --- [           main] o.apache.catalina.core.StandardService   : Starting service [Tomcat]
2021-03-18 00:01:08.544  INFO 48562 --- [           main] org.apache.catalina.core.StandardEngine  : Starting Servlet engine: [Apache Tomcat/9.0.43]
2021-03-18 00:01:08.606  INFO 48562 --- [           main] o.a.c.c.C.[.[localhost].[/spring]        : Initializing Spring embedded WebApplicationContext
2021-03-18 00:01:08.606  INFO 48562 --- [           main] w.s.c.ServletWebServerApplicationContext : Root WebApplicationContext: initialization completed in 744 ms
2021-03-18 00:01:08.726  INFO 48562 --- [           main] o.hibernate.jpa.internal.util.LogHelper  : HHH000204: Processing PersistenceUnitInfo [name: default]
2021-03-18 00:01:08.752  INFO 48562 --- [           main] org.hibernate.Version                    : HHH000412: Hibernate ORM core version 5.4.28.Final
2021-03-18 00:01:08.821  INFO 48562 --- [           main] o.hibernate.annotations.common.Version   : HCANN000001: Hibernate Commons Annotations {5.1.2.Final}
2021-03-18 00:01:08.875  INFO 48562 --- [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Starting...
2021-03-18 00:01:08.935  INFO 48562 --- [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Start completed.
2021-03-18 00:01:08.943  INFO 48562 --- [           main] org.hibernate.dialect.Dialect            : HHH000400: Using dialect: org.hibernate.dialect.MariaDBDialect
2021-03-18 00:01:09.232  INFO 48562 --- [           main] o.h.e.t.j.p.i.JtaPlatformInitiator       : HHH000490: Using JtaPlatform implementation: [org.hibernate.engine.transaction.jta.platform.internal.NoJtaPlatform]
2021-03-18 00:01:09.238  INFO 48562 --- [           main] j.LocalContainerEntityManagerFactoryBean : Initialized JPA EntityManagerFactory for persistence unit 'default'
2021-03-18 00:01:09.399  WARN 48562 --- [           main] o.apache.ignite.internal.util.typedef.G  : Ignite work directory is not provided, automatically resolved to: /Users/goodsaem/goodsaem/api/ignite/work
2021-03-18 00:01:09.446  INFO 48562 --- [           main] o.a.i.i.IgniteKernal%GoodSaem-Grid       :

>>>    __________  ________________
>>>   /  _/ ___/ |/ /  _/_  __/ __/
>>>  _/ // (7 7    // /  / / / _/
>>> /___/\___/_/|_/___/ /_/ /___/
>>>
>>> ver. 2.9.1#20201203-sha1:adcce517
>>> 2020 Copyright(C) Apache Software Foundation
>>>
>>> Ignite documentation: http://ignite.apache.org

[00:01:09]    __________  ________________
[00:01:09]   /  _/ ___/ |/ /  _/_  __/ __/
[00:01:09]  _/ // (7 7    // /  / / / _/
[00:01:09] /___/\___/_/|_/___/ /_/ /___/
[00:01:09]
[00:01:09] ver. 2.9.1#20201203-sha1:adcce517
[00:01:09] 2020 Copyright(C) Apache Software Foundation
[00:01:09]
[00:01:09] Ignite documentation: http://ignite.apache.org
[00:01:09]
[00:01:09] Quiet mode.
[00:01:09]   ^-- Logging by 'Slf4jLogger [impl=Logger[o.a.i.i.IgniteKernal%GoodSaem-Grid], quiet=true]'
[00:01:09]   ^-- To see **FULL** console log here add -DIGNITE_QUIET=false or "-v" to ignite.{sh|bat}
[00:01:09]
2021-03-18 00:01:09.449  INFO 48562 --- [           main] o.a.i.i.IgniteKernal%GoodSaem-Grid       : Config URL: n/a
2021-03-18 00:01:09.459  INFO 48562 --- [           main] o.a.i.i.IgniteKernal%GoodSaem-Grid       : IgniteConfiguration [igniteInstanceName=GoodSaem-Grid, pubPoolSize=8, svcPoolSize=8, callbackPoolSize=2, stripedPoolSize=8, sysPoolSize=8, mgmtPoolSize=2, dataStreamerPoolSize=1, utilityCachePoolSize=8, utilityCacheKeepAliveTime=60000, p2pPoolSize=2, qryPoolSize=2, buildIdxPoolSize=1, igniteHome=null, igniteWorkDir=/Users/goodsaem/goodsaem/api/ignite/work, mbeanSrv=com.sun.jmx.mbeanserver.JmxMBeanServer@1d56ce6a, nodeId=87bb368a-9f10-4b7d-92be-aa6a243b5a26, marsh=BinaryMarshaller [], marshLocJobs=false, daemon=false, p2pEnabled=false, netTimeout=5000, netCompressionLevel=1, sndRetryDelay=1000, sndRetryCnt=3, metricsHistSize=10000, metricsUpdateFreq=2000, metricsExpTime=9223372036854775807, discoSpi=TcpDiscoverySpi [addrRslvr=null, sockTimeout=0, ackTimeout=0, marsh=null, reconCnt=10, reconDelay=2000, maxAckTimeout=600000, soLinger=0, forceSrvMode=false, clientReconnectDisabled=false, internalLsnr=null, skipAddrsRandomization=false], segPlc=STOP, segResolveAttempts=2, waitForSegOnStart=true, allResolversPassReq=true, segChkFreq=10000, commSpi=TcpCommunicationSpi [connectGate=null, connPlc=org.apache.ignite.spi.communication.tcp.TcpCommunicationSpi$FirstConnectionPolicy@640d604, chConnPlc=null, enableForcibleNodeKill=false, enableTroubleshootingLog=false, locAddr=null, locHost=null, locPort=47100, locPortRange=100, shmemPort=-1, directBuf=true, directSndBuf=false, idleConnTimeout=600000, connTimeout=5000, maxConnTimeout=600000, reconCnt=10, sockSndBuf=32768, sockRcvBuf=32768, msgQueueLimit=0, slowClientQueueLimit=0, nioSrvr=null, shmemSrv=null, usePairedConnections=false, connectionsPerNode=1, tcpNoDelay=true, filterReachableAddresses=false, ackSndThreshold=32, unackedMsgsBufSize=0, sockWriteTimeout=2000, boundTcpPort=-1, boundTcpShmemPort=-1, selectorsCnt=4, selectorSpins=0, forceClientToSrvConnections=false, addrRslvr=null, ctxInitLatch=java.util.concurrent.CountDownLatch@62cbc478[Count = 1], stopping=false, metricsLsnr=null, connectionRequestor=null], evtSpi=org.apache.ignite.spi.eventstorage.NoopEventStorageSpi@5438fa43, colSpi=NoopCollisionSpi [], deploySpi=LocalDeploymentSpi [], indexingSpi=org.apache.ignite.spi.indexing.noop.NoopIndexingSpi@615db358, addrRslvr=null, encryptionSpi=org.apache.ignite.spi.encryption.noop.NoopEncryptionSpi@256bb5be, tracingSpi=org.apache.ignite.spi.tracing.NoopTracingSpi@5fef0c19, clientMode=false, rebalanceThreadPoolSize=1, rebalanceTimeout=10000, rebalanceBatchesPrefetchCnt=3, rebalanceThrottle=0, rebalanceBatchSize=524288, txCfg=TransactionConfiguration [txSerEnabled=false, dfltIsolation=REPEATABLE_READ, dfltConcurrency=PESSIMISTIC, dfltTxTimeout=0, txTimeoutOnPartitionMapExchange=0, deadlockTimeout=10000, pessimisticTxLogSize=0, pessimisticTxLogLinger=10000, tmLookupClsName=null, txManagerFactory=null, useJtaSync=false], cacheSanityCheckEnabled=true, discoStartupDelay=60000, deployMode=SHARED, p2pMissedCacheSize=100, locHost=null, timeSrvPortBase=31100, timeSrvPortRange=100, failureDetectionTimeout=10000, sysWorkerBlockedTimeout=null, clientFailureDetectionTimeout=30000, metricsLogFreq=60000, connectorCfg=ConnectorConfiguration [jettyPath=null, host=null, port=11211, noDelay=true, directBuf=false, sndBufSize=32768, rcvBufSize=32768, idleQryCurTimeout=600000, idleQryCurCheckFreq=60000, sndQueueLimit=0, selectorCnt=4, idleTimeout=7000, sslEnabled=false, sslClientAuth=false, sslCtxFactory=null, sslFactory=null, portRange=100, threadPoolSize=8, msgInterceptor=null], odbcCfg=null, warmupClos=null, atomicCfg=AtomicConfiguration [seqReserveSize=1000, cacheMode=PARTITIONED, backups=1, aff=null, grpName=null], classLdr=null, sslCtxFactory=null, platformCfg=null, binaryCfg=BinaryConfiguration [idMapper=null, nameMapper=null, serializer=null, compactFooter=false], memCfg=null, pstCfg=null, dsCfg=DataStorageConfiguration [sysRegionInitSize=41943040, sysRegionMaxSize=104857600, pageSize=0, concLvl=0, dfltDataRegConf=DataRegionConfiguration [name=default, maxSize=8589934592, initSize=268435456, swapPath=null, pageEvictionMode=DISABLED, evictionThreshold=0.9, emptyPagesPoolSize=100, metricsEnabled=false, metricsSubIntervalCount=5, metricsRateTimeInterval=60000, persistenceEnabled=false, checkpointPageBufSize=0, lazyMemoryAllocation=true], dataRegions=null, storagePath=null, checkpointFreq=180000, lockWaitTime=10000, checkpointThreads=4, checkpointWriteOrder=SEQUENTIAL, walHistSize=20, maxWalArchiveSize=1073741824, walSegments=10, walSegmentSize=67108864, walPath=db/wal, walArchivePath=db/wal/archive, metricsEnabled=false, walMode=LOG_ONLY, walTlbSize=131072, walBuffSize=0, walFlushFreq=2000, walFsyncDelay=1000, walRecordIterBuffSize=67108864, alwaysWriteFullPages=false, fileIOFactory=org.apache.ignite.internal.processors.cache.persistence.file.AsyncFileIOFactory@285a4fe3, metricsSubIntervalCnt=5, metricsRateTimeInterval=60000, walAutoArchiveAfterInactivity=-1, writeThrottlingEnabled=false, walCompactionEnabled=false, walCompactionLevel=1, checkpointReadLockTimeout=null, walPageCompression=DISABLED, walPageCompressionLevel=null], snapshotPath=snapshots, activeOnStart=true, activeOnStartPropSetFlag=false, autoActivation=true, autoActivationPropSetFlag=false, clusterStateOnStart=null, sqlConnCfg=null, cliConnCfg=ClientConnectorConfiguration [host=null, port=10800, portRange=100, sockSndBufSize=0, sockRcvBufSize=0, tcpNoDelay=true, maxOpenCursorsPerConn=128, threadPoolSize=8, idleTimeout=0, handshakeTimeout=10000, jdbcEnabled=true, odbcEnabled=true, thinCliEnabled=true, sslEnabled=false, useIgniteSslCtxFactory=true, sslClientAuth=false, sslCtxFactory=null, thinCliCfg=ThinClientConfiguration [maxActiveTxPerConn=100, maxActiveComputeTasksPerConn=0]], mvccVacuumThreadCnt=2, mvccVacuumFreq=5000, authEnabled=false, failureHnd=null, commFailureRslvr=null, sqlCfg=SqlConfiguration [longQryWarnTimeout=3000, dfltQryTimeout=0, sqlQryHistSize=1000, validationEnabled=false]]
2021-03-18 00:01:09.459  INFO 48562 --- [           main] o.a.i.i.IgniteKernal%GoodSaem-Grid       : Daemon mode: off
[00:01:09] OS: Mac OS X 10.16 x86_64
2021-03-18 00:01:09.460  INFO 48562 --- [           main] o.a.i.i.IgniteKernal%GoodSaem-Grid       : OS: Mac OS X 10.16 x86_64
2021-03-18 00:01:09.460  INFO 48562 --- [           main] o.a.i.i.IgniteKernal%GoodSaem-Grid       : OS user: goodsaem
2021-03-18 00:01:09.460  INFO 48562 --- [           main] o.a.i.i.IgniteKernal%GoodSaem-Grid       : PID: 48562
[00:01:09] VM information: OpenJDK Runtime Environment 1.8.0_275-b01 Amazon.com Inc. OpenJDK 64-Bit Server VM 25.275-b01
2021-03-18 00:01:09.460  INFO 48562 --- [           main] o.a.i.i.IgniteKernal%GoodSaem-Grid       : Language runtime: Java Platform API Specification ver. 1.8
2021-03-18 00:01:09.460  INFO 48562 --- [           main] o.a.i.i.IgniteKernal%GoodSaem-Grid       : VM information: OpenJDK Runtime Environment 1.8.0_275-b01 Amazon.com Inc. OpenJDK 64-Bit Server VM 25.275-b01
2021-03-18 00:01:09.461  INFO 48562 --- [           main] o.a.i.i.IgniteKernal%GoodSaem-Grid       : VM total memory: 8.9GB
2021-03-18 00:01:09.461  INFO 48562 --- [           main] o.a.i.i.IgniteKernal%GoodSaem-Grid       : Remote Management [restart: off, REST: on, JMX (remote: on, port: <n/a>, auth: off, ssl: on)]
2021-03-18 00:01:09.461  INFO 48562 --- [           main] o.a.i.i.IgniteKernal%GoodSaem-Grid       : Logger: Slf4jLogger [impl=Logger[org.apache.ignite.internal.IgniteKernal%GoodSaem-Grid], quiet=true]
2021-03-18 00:01:09.461  INFO 48562 --- [           main] o.a.i.i.IgniteKernal%GoodSaem-Grid       : IGNITE_HOME=null
2021-03-18 00:01:09.462  INFO 48562 --- [           main] o.a.i.i.IgniteKernal%GoodSaem-Grid       : VM arguments: [-XX:TieredStopAtLevel=1, -Xverify:none, -Dspring.output.ansi.enabled=always, -javaagent:/Applications/IntelliJ IDEA.app/Contents/lib/idea_rt.jar=53083:/Applications/IntelliJ IDEA.app/Contents/bin, -Dcom.sun.management.jmxremote, -Dspring.jmx.enabled=true, -Dspring.liveBeansView.mbeanDomain, -Dspring.application.admin.enabled=true, -Dfile.encoding=UTF-8]
2021-03-18 00:01:09.462  INFO 48562 --- [           main] o.a.i.i.IgniteKernal%GoodSaem-Grid       : System cache's DataRegion size is configured to 40 MB. Use DataStorageConfiguration.systemRegionInitialSize property to change the setting.
2021-03-18 00:01:09.462  INFO 48562 --- [           main] o.a.i.i.IgniteKernal%GoodSaem-Grid       : Configured caches [in 'sysMemPlc' dataRegion: ['ignite-sys-cache']]
2021-03-18 00:01:09.462  WARN 48562 --- [           main] o.a.i.i.IgniteKernal%GoodSaem-Grid       : Please set system property '-Djava.net.preferIPv4Stack=true' to avoid possible problems in mixed environments.
[00:01:09] Please set system property '-Djava.net.preferIPv4Stack=true' to avoid possible problems in mixed environments.
2021-03-18 00:01:09.464  WARN 48562 --- [%GoodSaem-Grid%] o.apache.ignite.internal.GridDiagnostic  : JMX remote management is enabled but JMX port is either not set or invalid. Check system property 'com.sun.management.jmxremote.port' to make sure it specifies valid TCP/IP port.
[00:01:09] Configured plugins:
2021-03-18 00:01:09.499  INFO 48562 --- [           main] o.a.i.i.p.plugin.IgnitePluginProcessor   : Configured plugins:
[00:01:09]   ^-- None
2021-03-18 00:01:09.499  INFO 48562 --- [           main] o.a.i.i.p.plugin.IgnitePluginProcessor   :   ^-- None
[00:01:09]
2021-03-18 00:01:09.499  INFO 48562 --- [           main] o.a.i.i.p.plugin.IgnitePluginProcessor   :
[00:01:09] Configured failure handler: [hnd=StopNodeOrHaltFailureHandler [tryStop=false, timeout=0, super=AbstractFailureHandler [ignoredFailureTypes=UnmodifiableSet [SYSTEM_WORKER_BLOCKED, SYSTEM_CRITICAL_OPERATION_TIMEOUT]]]]
2021-03-18 00:01:09.502  INFO 48562 --- [           main] o.a.i.i.p.failure.FailureProcessor       : Configured failure handler: [hnd=StopNodeOrHaltFailureHandler [tryStop=false, timeout=0, super=AbstractFailureHandler [ignoredFailureTypes=UnmodifiableSet [SYSTEM_WORKER_BLOCKED, SYSTEM_CRITICAL_OPERATION_TIMEOUT]]]]
2021-03-18 00:01:09.614  INFO 48562 --- [           main] o.a.i.s.c.tcp.TcpCommunicationSpi        : Successfully bound communication NIO server to TCP port [port=47100, locHost=0.0.0.0/0.0.0.0, selectorsCnt=4, selectorSpins=0, pairedConn=false]
2021-03-18 00:01:09.617  WARN 48562 --- [           main] o.a.i.s.c.tcp.TcpCommunicationSpi        : Message queue limit is set to 0 which may lead to potential OOMEs when running cache operations in FULL_ASYNC or PRIMARY_SYNC modes due to message queues growth on sender and receiver sides.
[00:01:09] Message queue limit is set to 0 which may lead to potential OOMEs when running cache operations in FULL_ASYNC or PRIMARY_SYNC modes due to message queues growth on sender and receiver sides.
2021-03-18 00:01:09.622  WARN 48562 --- [           main] o.a.i.s.c.noop.NoopCheckpointSpi         : Checkpoints are disabled (to enable configure any GridCheckpointSpi implementation)
2021-03-18 00:01:09.634  WARN 48562 --- [           main] o.a.i.i.m.c.GridCollisionManager         : Collision resolution is disabled (all jobs will be activated upon arrival).
[00:01:09] Security status [authentication=off, sandbox=off, tls/ssl=off]
2021-03-18 00:01:09.635  INFO 48562 --- [           main] o.a.i.i.IgniteKernal%GoodSaem-Grid       : Security status [authentication=off, sandbox=off, tls/ssl=off]
2021-03-18 00:01:09.728  INFO 48562 --- [           main] o.a.i.spi.discovery.tcp.TcpDiscoverySpi  : Successfully bound to TCP port [port=47500, localHost=0.0.0.0/0.0.0.0, locNodeId=87bb368a-9f10-4b7d-92be-aa6a243b5a26]
2021-03-18 00:01:09.755  WARN 48562 --- [           main] i.p.c.p.IgniteCacheDatabaseSharedManager : DataRegionConfiguration.maxWalArchiveSize instead DataRegionConfiguration.walHistorySize would be used for removing old archive wal files
2021-03-18 00:01:09.761  INFO 48562 --- [           main] i.p.c.p.IgniteCacheDatabaseSharedManager : Configured data regions initialized successfully [total=3]
2021-03-18 00:01:09.768  INFO 48562 --- [           main] o.a.i.i.p.c.d.d.t.PartitionsEvictManager : Evict partition permits=2
2021-03-18 00:01:09.803  WARN 48562 --- [           main] o.a.i.i.p.query.h2.IgniteH2Indexing      : Serialization of Java objects in H2 was enabled.
2021-03-18 00:01:09.826 ERROR 48562 --- [           main] o.a.i.i.IgniteKernal%GoodSaem-Grid       : Exception during start processors, node will be stopped and close connections
```

:::
***아래와 같은 오류가 발생하는데 원일을 알수 없어 한참을 구글링 했습니다.***
::: danger error

```shell
org.apache.ignite.internal.processors.query.IgniteSQLException: Failed to initialize DB connection:jdbc:h2:mem:87bb368a-9f10-4b7d-92be-aa6a243b5a26;LOCK_MODE=3;MULTI_THREADED=1;DB_CLOSE_ON_EXIT=FALSE;DEFAULT_LOCK_TIMEOUT=10000;FUNCTIONS_IN_SCHEMA=true;OPTIMIZE_REUSE_RESULTS=0;QUERY_CACHE_SIZE=0;MAX_OPERATION_MEMORY=0;BATCH_JOINS=1;ROW_FACTORY="org.apache.ignite.internal.processors.query.h2.opt.H2PlainRowFactory";DEFAULT_TABLE_ENGINE=org.apache.ignite.internal.processors.query.h2.opt.GridH2DefaultTableEngineorg.apache.ignite.internal.processors.query.IgniteSQLException:Failed to initialize DB connection: jdbc:h2:mem:87bb368a-9f10-4b7d-92be-aa6a243b5a26;LOCK_MODE=3;MULTI_THREADED=1;DB_CLOSE_ON_EXIT=FALSE;DEFAULT_LOCK_TIMEOUT=10000;FUNCTIONS_IN_SCHEMA=true;OPTIMIZE_REUSE_RESULTS=0;QUERY_CACHE_SIZE=0;MAX_OPERATION_MEMORY=0;BATCH_JOINS=1;ROW_FACTORY="org.apache.ignite.internal.processors.query.h2.opt.H2PlainRowFactory";DEFAULT_TABLE_ENGINE=org.apache.ignite.internal.processors.query.h2.opt.GridH2DefaultTableEngine
```

:::

::: spoiler 오류난부분 이하 생략

```shell
	at org.apache.ignite.internal.processors.query.h2.ConnectionManager.<init>(ConnectionManager.java:129) ~[ignite-indexing-2.9.1.jar:2.9.1]
	at org.apache.ignite.internal.processors.query.h2.IgniteH2Indexing.start(IgniteH2Indexing.java:2099) ~[ignite-indexing-2.9.1.jar:2.9.1]
	at org.apache.ignite.internal.processors.query.GridQueryProcessor.start(GridQueryProcessor.java:273) ~[ignite-core-2.9.1.jar:2.9.1]
	at org.apache.ignite.internal.IgniteKernal.startProcessor(IgniteKernal.java:1934) ~[ignite-core-2.9.1.jar:2.9.1]
	at org.apache.ignite.internal.IgniteKernal.start(IgniteKernal.java:1216) ~[ignite-core-2.9.1.jar:2.9.1]
	at org.apache.ignite.internal.IgnitionEx$IgniteNamedInstance.start0(IgnitionEx.java:2052) [ignite-core-2.9.1.jar:2.9.1]
	at org.apache.ignite.internal.IgnitionEx$IgniteNamedInstance.start(IgnitionEx.java:1698) [ignite-core-2.9.1.jar:2.9.1]
	at org.apache.ignite.internal.IgnitionEx.start0(IgnitionEx.java:1114) [ignite-core-2.9.1.jar:2.9.1]
	at org.apache.ignite.internal.IgnitionEx.start(IgnitionEx.java:634) [ignite-core-2.9.1.jar:2.9.1]
	at org.apache.ignite.internal.IgnitionEx.start(IgnitionEx.java:560) [ignite-core-2.9.1.jar:2.9.1]
	at org.apache.ignite.Ignition.start(Ignition.java:328) [ignite-core-2.9.1.jar:2.9.1]
	at io.github.goodsaem.api.config.IgniteConfig.ignite(IgniteConfig.java:51) [main/:na]
	at io.github.goodsaem.api.config.IgniteConfig$$EnhancerBySpringCGLIB$$60f465d7.CGLIB$ignite$0(<generated>) [main/:na]
	at io.github.goodsaem.api.config.IgniteConfig$$EnhancerBySpringCGLIB$$60f465d7$$FastClassBySpringCGLIB$$2894e447.invoke(<generated>) [main/:na]
	at org.springframework.cglib.proxy.MethodProxy.invokeSuper(MethodProxy.java:244) [spring-core-5.3.4.jar:5.3.4]
	at org.springframework.context.annotation.ConfigurationClassEnhancer$BeanMethodInterceptor.intercept(ConfigurationClassEnhancer.java:331) [spring-context-5.3.4.jar:5.3.4]
	at io.github.goodsaem.api.config.IgniteConfig$$EnhancerBySpringCGLIB$$60f465d7.ignite(<generated>) [main/:na]
	at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method) ~[na:1.8.0_275]
	at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62) ~[na:1.8.0_275]
	at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43) ~[na:1.8.0_275]
	at java.lang.reflect.Method.invoke(Method.java:498) ~[na:1.8.0_275]
	at org.springframework.beans.factory.support.SimpleInstantiationStrategy.instantiate(SimpleInstantiationStrategy.java:154) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.ConstructorResolver.instantiate(ConstructorResolver.java:653) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.ConstructorResolver.instantiateUsingFactoryMethod(ConstructorResolver.java:638) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.instantiateUsingFactoryMethod(AbstractAutowireCapableBeanFactory.java:1334) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBeanInstance(AbstractAutowireCapableBeanFactory.java:1177) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.doCreateBean(AbstractAutowireCapableBeanFactory.java:564) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBean(AbstractAutowireCapableBeanFactory.java:524) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractBeanFactory.lambda$doGetBean$0(AbstractBeanFactory.java:335) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.DefaultSingletonBeanRegistry.getSingleton(DefaultSingletonBeanRegistry.java:234) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:333) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:208) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.config.DependencyDescriptor.resolveCandidate(DependencyDescriptor.java:276) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.doResolveDependency(DefaultListableBeanFactory.java:1380) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.resolveDependency(DefaultListableBeanFactory.java:1300) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.ConstructorResolver.resolveAutowiredArgument(ConstructorResolver.java:887) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.ConstructorResolver.createArgumentArray(ConstructorResolver.java:791) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.ConstructorResolver.autowireConstructor(ConstructorResolver.java:229) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.autowireConstructor(AbstractAutowireCapableBeanFactory.java:1354) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBeanInstance(AbstractAutowireCapableBeanFactory.java:1204) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.doCreateBean(AbstractAutowireCapableBeanFactory.java:564) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBean(AbstractAutowireCapableBeanFactory.java:524) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractBeanFactory.lambda$doGetBean$0(AbstractBeanFactory.java:335) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.DefaultSingletonBeanRegistry.getSingleton(DefaultSingletonBeanRegistry.java:234) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:333) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:208) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.config.DependencyDescriptor.resolveCandidate(DependencyDescriptor.java:276) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.doResolveDependency(DefaultListableBeanFactory.java:1380) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.resolveDependency(DefaultListableBeanFactory.java:1300) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor$AutowiredFieldElement.resolveFieldValue(AutowiredAnnotationBeanPostProcessor.java:657) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor$AutowiredFieldElement.inject(AutowiredAnnotationBeanPostProcessor.java:640) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.annotation.InjectionMetadata.inject(InjectionMetadata.java:119) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor.postProcessProperties(AutowiredAnnotationBeanPostProcessor.java:399) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.populateBean(AbstractAutowireCapableBeanFactory.java:1413) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.doCreateBean(AbstractAutowireCapableBeanFactory.java:601) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBean(AbstractAutowireCapableBeanFactory.java:524) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractBeanFactory.lambda$doGetBean$0(AbstractBeanFactory.java:335) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.DefaultSingletonBeanRegistry.getSingleton(DefaultSingletonBeanRegistry.java:234) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:333) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:208) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.preInstantiateSingletons(DefaultListableBeanFactory.java:944) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.context.support.AbstractApplicationContext.finishBeanFactoryInitialization(AbstractApplicationContext.java:917) ~[spring-context-5.3.4.jar:5.3.4]
	at org.springframework.context.support.AbstractApplicationContext.refresh(AbstractApplicationContext.java:582) ~[spring-context-5.3.4.jar:5.3.4]
	at org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext.refresh(ServletWebServerApplicationContext.java:144) ~[spring-boot-2.4.3.jar:2.4.3]
	at org.springframework.boot.SpringApplication.refresh(SpringApplication.java:767) ~[spring-boot-2.4.3.jar:2.4.3]
	at org.springframework.boot.SpringApplication.refresh(SpringApplication.java:759) ~[spring-boot-2.4.3.jar:2.4.3]
	at org.springframework.boot.SpringApplication.refreshContext(SpringApplication.java:426) ~[spring-boot-2.4.3.jar:2.4.3]
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:326) ~[spring-boot-2.4.3.jar:2.4.3]
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:1311) ~[spring-boot-2.4.3.jar:2.4.3]
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:1300) ~[spring-boot-2.4.3.jar:2.4.3]
	at io.github.goodsaem.api.ApiApplication.main(ApiApplication.java:9) ~[main/:na]
Caused by: org.h2.jdbc.JdbcSQLNonTransientConnectionException: Unsupported connection setting "MULTI_THREADED" [90113-200]
	at org.h2.message.DbException.getJdbcSQLException(DbException.java:622) ~[h2-1.4.200.jar:1.4.200]
	at org.h2.message.DbException.getJdbcSQLException(DbException.java:429) ~[h2-1.4.200.jar:1.4.200]
	at org.h2.message.DbException.get(DbException.java:205) ~[h2-1.4.200.jar:1.4.200]
	at org.h2.message.DbException.get(DbException.java:181) ~[h2-1.4.200.jar:1.4.200]
	at org.h2.engine.ConnectionInfo.readSettingsFromURL(ConnectionInfo.java:269) ~[h2-1.4.200.jar:1.4.200]
	at org.h2.engine.ConnectionInfo.<init>(ConnectionInfo.java:78) ~[h2-1.4.200.jar:1.4.200]
	at org.h2.jdbc.JdbcConnection.<init>(JdbcConnection.java:152) ~[h2-1.4.200.jar:1.4.200]
	at org.h2.Driver.connect(Driver.java:69) ~[h2-1.4.200.jar:1.4.200]
	at java.sql.DriverManager.getConnection(DriverManager.java:664) ~[na:1.8.0_275]
	at java.sql.DriverManager.getConnection(DriverManager.java:270) ~[na:1.8.0_275]
	at org.apache.ignite.internal.processors.query.h2.ConnectionManager.<init>(ConnectionManager.java:118) ~[ignite-indexing-2.9.1.jar:2.9.1]
	... 70 common frames omitted

2021-03-18 00:01:09.828 ERROR 48562 --- [           main] o.a.i.i.IgniteKernal%GoodSaem-Grid       : Got exception while starting (will rollback startup routine).

org.apache.ignite.internal.processors.query.IgniteSQLException: Failed to initialize DB connection: jdbc:h2:mem:87bb368a-9f10-4b7d-92be-aa6a243b5a26;LOCK_MODE=3;MULTI_THREADED=1;DB_CLOSE_ON_EXIT=FALSE;DEFAULT_LOCK_TIMEOUT=10000;FUNCTIONS_IN_SCHEMA=true;OPTIMIZE_REUSE_RESULTS=0;QUERY_CACHE_SIZE=0;MAX_OPERATION_MEMORY=0;BATCH_JOINS=1;ROW_FACTORY="org.apache.ignite.internal.processors.query.h2.opt.H2PlainRowFactory";DEFAULT_TABLE_ENGINE=org.apache.ignite.internal.processors.query.h2.opt.GridH2DefaultTableEngine
	at org.apache.ignite.internal.processors.query.h2.ConnectionManager.<init>(ConnectionManager.java:129) ~[ignite-indexing-2.9.1.jar:2.9.1]
	at org.apache.ignite.internal.processors.query.h2.IgniteH2Indexing.start(IgniteH2Indexing.java:2099) ~[ignite-indexing-2.9.1.jar:2.9.1]
	at org.apache.ignite.internal.processors.query.GridQueryProcessor.start(GridQueryProcessor.java:273) ~[ignite-core-2.9.1.jar:2.9.1]
	at org.apache.ignite.internal.IgniteKernal.startProcessor(IgniteKernal.java:1934) ~[ignite-core-2.9.1.jar:2.9.1]
	at org.apache.ignite.internal.IgniteKernal.start(IgniteKernal.java:1216) ~[ignite-core-2.9.1.jar:2.9.1]
	at org.apache.ignite.internal.IgnitionEx$IgniteNamedInstance.start0(IgnitionEx.java:2052) [ignite-core-2.9.1.jar:2.9.1]
	at org.apache.ignite.internal.IgnitionEx$IgniteNamedInstance.start(IgnitionEx.java:1698) [ignite-core-2.9.1.jar:2.9.1]
	at org.apache.ignite.internal.IgnitionEx.start0(IgnitionEx.java:1114) [ignite-core-2.9.1.jar:2.9.1]
	at org.apache.ignite.internal.IgnitionEx.start(IgnitionEx.java:634) [ignite-core-2.9.1.jar:2.9.1]
	at org.apache.ignite.internal.IgnitionEx.start(IgnitionEx.java:560) [ignite-core-2.9.1.jar:2.9.1]
	at org.apache.ignite.Ignition.start(Ignition.java:328) [ignite-core-2.9.1.jar:2.9.1]
	at io.github.goodsaem.api.config.IgniteConfig.ignite(IgniteConfig.java:51) [main/:na]
	at io.github.goodsaem.api.config.IgniteConfig$$EnhancerBySpringCGLIB$$60f465d7.CGLIB$ignite$0(<generated>) [main/:na]
	at io.github.goodsaem.api.config.IgniteConfig$$EnhancerBySpringCGLIB$$60f465d7$$FastClassBySpringCGLIB$$2894e447.invoke(<generated>) [main/:na]
	at org.springframework.cglib.proxy.MethodProxy.invokeSuper(MethodProxy.java:244) [spring-core-5.3.4.jar:5.3.4]
	at org.springframework.context.annotation.ConfigurationClassEnhancer$BeanMethodInterceptor.intercept(ConfigurationClassEnhancer.java:331) [spring-context-5.3.4.jar:5.3.4]
	at io.github.goodsaem.api.config.IgniteConfig$$EnhancerBySpringCGLIB$$60f465d7.ignite(<generated>) [main/:na]
	at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method) ~[na:1.8.0_275]
	at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62) ~[na:1.8.0_275]
	at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43) ~[na:1.8.0_275]
	at java.lang.reflect.Method.invoke(Method.java:498) ~[na:1.8.0_275]
	at org.springframework.beans.factory.support.SimpleInstantiationStrategy.instantiate(SimpleInstantiationStrategy.java:154) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.ConstructorResolver.instantiate(ConstructorResolver.java:653) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.ConstructorResolver.instantiateUsingFactoryMethod(ConstructorResolver.java:638) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.instantiateUsingFactoryMethod(AbstractAutowireCapableBeanFactory.java:1334) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBeanInstance(AbstractAutowireCapableBeanFactory.java:1177) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.doCreateBean(AbstractAutowireCapableBeanFactory.java:564) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBean(AbstractAutowireCapableBeanFactory.java:524) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractBeanFactory.lambda$doGetBean$0(AbstractBeanFactory.java:335) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.DefaultSingletonBeanRegistry.getSingleton(DefaultSingletonBeanRegistry.java:234) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:333) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:208) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.config.DependencyDescriptor.resolveCandidate(DependencyDescriptor.java:276) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.doResolveDependency(DefaultListableBeanFactory.java:1380) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.resolveDependency(DefaultListableBeanFactory.java:1300) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.ConstructorResolver.resolveAutowiredArgument(ConstructorResolver.java:887) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.ConstructorResolver.createArgumentArray(ConstructorResolver.java:791) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.ConstructorResolver.autowireConstructor(ConstructorResolver.java:229) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.autowireConstructor(AbstractAutowireCapableBeanFactory.java:1354) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBeanInstance(AbstractAutowireCapableBeanFactory.java:1204) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.doCreateBean(AbstractAutowireCapableBeanFactory.java:564) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBean(AbstractAutowireCapableBeanFactory.java:524) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractBeanFactory.lambda$doGetBean$0(AbstractBeanFactory.java:335) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.DefaultSingletonBeanRegistry.getSingleton(DefaultSingletonBeanRegistry.java:234) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:333) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:208) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.config.DependencyDescriptor.resolveCandidate(DependencyDescriptor.java:276) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.doResolveDependency(DefaultListableBeanFactory.java:1380) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.resolveDependency(DefaultListableBeanFactory.java:1300) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor$AutowiredFieldElement.resolveFieldValue(AutowiredAnnotationBeanPostProcessor.java:657) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor$AutowiredFieldElement.inject(AutowiredAnnotationBeanPostProcessor.java:640) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.annotation.InjectionMetadata.inject(InjectionMetadata.java:119) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor.postProcessProperties(AutowiredAnnotationBeanPostProcessor.java:399) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.populateBean(AbstractAutowireCapableBeanFactory.java:1413) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.doCreateBean(AbstractAutowireCapableBeanFactory.java:601) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBean(AbstractAutowireCapableBeanFactory.java:524) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractBeanFactory.lambda$doGetBean$0(AbstractBeanFactory.java:335) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.DefaultSingletonBeanRegistry.getSingleton(DefaultSingletonBeanRegistry.java:234) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:333) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:208) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.preInstantiateSingletons(DefaultListableBeanFactory.java:944) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.context.support.AbstractApplicationContext.finishBeanFactoryInitialization(AbstractApplicationContext.java:917) ~[spring-context-5.3.4.jar:5.3.4]
	at org.springframework.context.support.AbstractApplicationContext.refresh(AbstractApplicationContext.java:582) ~[spring-context-5.3.4.jar:5.3.4]
	at org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext.refresh(ServletWebServerApplicationContext.java:144) ~[spring-boot-2.4.3.jar:2.4.3]
	at org.springframework.boot.SpringApplication.refresh(SpringApplication.java:767) ~[spring-boot-2.4.3.jar:2.4.3]
	at org.springframework.boot.SpringApplication.refresh(SpringApplication.java:759) ~[spring-boot-2.4.3.jar:2.4.3]
	at org.springframework.boot.SpringApplication.refreshContext(SpringApplication.java:426) ~[spring-boot-2.4.3.jar:2.4.3]
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:326) ~[spring-boot-2.4.3.jar:2.4.3]
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:1311) ~[spring-boot-2.4.3.jar:2.4.3]
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:1300) ~[spring-boot-2.4.3.jar:2.4.3]
	at io.github.goodsaem.api.ApiApplication.main(ApiApplication.java:9) ~[main/:na]
Caused by: org.h2.jdbc.JdbcSQLNonTransientConnectionException: Unsupported connection setting "MULTI_THREADED" [90113-200]
	at org.h2.message.DbException.getJdbcSQLException(DbException.java:622) ~[h2-1.4.200.jar:1.4.200]
	at org.h2.message.DbException.getJdbcSQLException(DbException.java:429) ~[h2-1.4.200.jar:1.4.200]
	at org.h2.message.DbException.get(DbException.java:205) ~[h2-1.4.200.jar:1.4.200]
	at org.h2.message.DbException.get(DbException.java:181) ~[h2-1.4.200.jar:1.4.200]
	at org.h2.engine.ConnectionInfo.readSettingsFromURL(ConnectionInfo.java:269) ~[h2-1.4.200.jar:1.4.200]
	at org.h2.engine.ConnectionInfo.<init>(ConnectionInfo.java:78) ~[h2-1.4.200.jar:1.4.200]
	at org.h2.jdbc.JdbcConnection.<init>(JdbcConnection.java:152) ~[h2-1.4.200.jar:1.4.200]
	at org.h2.Driver.connect(Driver.java:69) ~[h2-1.4.200.jar:1.4.200]
	at java.sql.DriverManager.getConnection(DriverManager.java:664) ~[na:1.8.0_275]
	at java.sql.DriverManager.getConnection(DriverManager.java:270) ~[na:1.8.0_275]
	at org.apache.ignite.internal.processors.query.h2.ConnectionManager.<init>(ConnectionManager.java:118) ~[ignite-indexing-2.9.1.jar:2.9.1]
	... 70 common frames omitted

2021-03-18 00:01:09.828  WARN 48562 --- [           main] o.a.i.i.IgniteKernal%GoodSaem-Grid       : Attempt to stop starting grid. This operation cannot be guaranteed to be successful.
2021-03-18 00:01:09.831 ERROR 48562 --- [           main] o.a.i.i.IgniteKernal%GoodSaem-Grid       : Failed to stop component (ignoring): GridProcessorAdapter []

java.lang.NullPointerException: null
	at org.apache.ignite.internal.processors.query.h2.IgniteH2Indexing.stop(IgniteH2Indexing.java:2314) ~[ignite-indexing-2.9.1.jar:2.9.1]
	at org.apache.ignite.internal.processors.query.GridQueryProcessor.stop(GridQueryProcessor.java:317) ~[ignite-core-2.9.1.jar:2.9.1]
	at org.apache.ignite.internal.IgniteKernal.stop0(IgniteKernal.java:2577) [ignite-core-2.9.1.jar:2.9.1]
	at org.apache.ignite.internal.IgniteKernal.stop(IgniteKernal.java:2455) [ignite-core-2.9.1.jar:2.9.1]
	at org.apache.ignite.internal.IgniteKernal.start(IgniteKernal.java:1400) [ignite-core-2.9.1.jar:2.9.1]
	at org.apache.ignite.internal.IgnitionEx$IgniteNamedInstance.start0(IgnitionEx.java:2052) [ignite-core-2.9.1.jar:2.9.1]
	at org.apache.ignite.internal.IgnitionEx$IgniteNamedInstance.start(IgnitionEx.java:1698) [ignite-core-2.9.1.jar:2.9.1]
	at org.apache.ignite.internal.IgnitionEx.start0(IgnitionEx.java:1114) [ignite-core-2.9.1.jar:2.9.1]
	at org.apache.ignite.internal.IgnitionEx.start(IgnitionEx.java:634) [ignite-core-2.9.1.jar:2.9.1]
	at org.apache.ignite.internal.IgnitionEx.start(IgnitionEx.java:560) [ignite-core-2.9.1.jar:2.9.1]
	at org.apache.ignite.Ignition.start(Ignition.java:328) [ignite-core-2.9.1.jar:2.9.1]
	at io.github.goodsaem.api.config.IgniteConfig.ignite(IgniteConfig.java:51) [main/:na]
	at io.github.goodsaem.api.config.IgniteConfig$$EnhancerBySpringCGLIB$$60f465d7.CGLIB$ignite$0(<generated>) [main/:na]
	at io.github.goodsaem.api.config.IgniteConfig$$EnhancerBySpringCGLIB$$60f465d7$$FastClassBySpringCGLIB$$2894e447.invoke(<generated>) [main/:na]
	at org.springframework.cglib.proxy.MethodProxy.invokeSuper(MethodProxy.java:244) [spring-core-5.3.4.jar:5.3.4]
	at org.springframework.context.annotation.ConfigurationClassEnhancer$BeanMethodInterceptor.intercept(ConfigurationClassEnhancer.java:331) [spring-context-5.3.4.jar:5.3.4]
	at io.github.goodsaem.api.config.IgniteConfig$$EnhancerBySpringCGLIB$$60f465d7.ignite(<generated>) [main/:na]
	at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method) ~[na:1.8.0_275]
	at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62) ~[na:1.8.0_275]
	at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43) ~[na:1.8.0_275]
	at java.lang.reflect.Method.invoke(Method.java:498) ~[na:1.8.0_275]
	at org.springframework.beans.factory.support.SimpleInstantiationStrategy.instantiate(SimpleInstantiationStrategy.java:154) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.ConstructorResolver.instantiate(ConstructorResolver.java:653) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.ConstructorResolver.instantiateUsingFactoryMethod(ConstructorResolver.java:638) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.instantiateUsingFactoryMethod(AbstractAutowireCapableBeanFactory.java:1334) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBeanInstance(AbstractAutowireCapableBeanFactory.java:1177) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.doCreateBean(AbstractAutowireCapableBeanFactory.java:564) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBean(AbstractAutowireCapableBeanFactory.java:524) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractBeanFactory.lambda$doGetBean$0(AbstractBeanFactory.java:335) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.DefaultSingletonBeanRegistry.getSingleton(DefaultSingletonBeanRegistry.java:234) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:333) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:208) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.config.DependencyDescriptor.resolveCandidate(DependencyDescriptor.java:276) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.doResolveDependency(DefaultListableBeanFactory.java:1380) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.resolveDependency(DefaultListableBeanFactory.java:1300) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.ConstructorResolver.resolveAutowiredArgument(ConstructorResolver.java:887) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.ConstructorResolver.createArgumentArray(ConstructorResolver.java:791) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.ConstructorResolver.autowireConstructor(ConstructorResolver.java:229) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.autowireConstructor(AbstractAutowireCapableBeanFactory.java:1354) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBeanInstance(AbstractAutowireCapableBeanFactory.java:1204) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.doCreateBean(AbstractAutowireCapableBeanFactory.java:564) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBean(AbstractAutowireCapableBeanFactory.java:524) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractBeanFactory.lambda$doGetBean$0(AbstractBeanFactory.java:335) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.DefaultSingletonBeanRegistry.getSingleton(DefaultSingletonBeanRegistry.java:234) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:333) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:208) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.config.DependencyDescriptor.resolveCandidate(DependencyDescriptor.java:276) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.doResolveDependency(DefaultListableBeanFactory.java:1380) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.resolveDependency(DefaultListableBeanFactory.java:1300) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor$AutowiredFieldElement.resolveFieldValue(AutowiredAnnotationBeanPostProcessor.java:657) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor$AutowiredFieldElement.inject(AutowiredAnnotationBeanPostProcessor.java:640) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.annotation.InjectionMetadata.inject(InjectionMetadata.java:119) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor.postProcessProperties(AutowiredAnnotationBeanPostProcessor.java:399) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.populateBean(AbstractAutowireCapableBeanFactory.java:1413) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.doCreateBean(AbstractAutowireCapableBeanFactory.java:601) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBean(AbstractAutowireCapableBeanFactory.java:524) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractBeanFactory.lambda$doGetBean$0(AbstractBeanFactory.java:335) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.DefaultSingletonBeanRegistry.getSingleton(DefaultSingletonBeanRegistry.java:234) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:333) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:208) [spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.preInstantiateSingletons(DefaultListableBeanFactory.java:944) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.context.support.AbstractApplicationContext.finishBeanFactoryInitialization(AbstractApplicationContext.java:917) ~[spring-context-5.3.4.jar:5.3.4]
	at org.springframework.context.support.AbstractApplicationContext.refresh(AbstractApplicationContext.java:582) ~[spring-context-5.3.4.jar:5.3.4]
	at org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext.refresh(ServletWebServerApplicationContext.java:144) ~[spring-boot-2.4.3.jar:2.4.3]
	at org.springframework.boot.SpringApplication.refresh(SpringApplication.java:767) ~[spring-boot-2.4.3.jar:2.4.3]
	at org.springframework.boot.SpringApplication.refresh(SpringApplication.java:759) ~[spring-boot-2.4.3.jar:2.4.3]
	at org.springframework.boot.SpringApplication.refreshContext(SpringApplication.java:426) ~[spring-boot-2.4.3.jar:2.4.3]
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:326) ~[spring-boot-2.4.3.jar:2.4.3]
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:1311) ~[spring-boot-2.4.3.jar:2.4.3]
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:1300) ~[spring-boot-2.4.3.jar:2.4.3]
	at io.github.goodsaem.api.ApiApplication.main(ApiApplication.java:9) ~[main/:na]

2021-03-18 00:01:09.837  INFO 48562 --- [           main] o.a.i.i.IgniteKernal%GoodSaem-Grid       :

>>> Ignite ver. 2.9.1#20201203-sha1:adcce517ce542fdaca954bce399e7a1940630403 stopped with ERRORS
>>> +------------------------------------------------------------------------------------------+
>>> Ignite instance name: GoodSaem-Grid
>>> Grid uptime: 00:00:01.185
>>> See log above for detailed error message.
>>> Note that some errors during stop can prevent grid from
>>> maintaining correct topology since this node may have
>>> not exited grid properly.


2021-03-18 00:01:09.839  WARN 48562 --- [           main] ConfigServletWebServerApplicationContext : Exception encountered during context initialization - cancelling refresh attempt: org.springframework.beans.factory.UnsatisfiedDependencyException: Error creating bean with name 'HCodeController': Unsatisfied dependency expressed through field 'dataStore'; nested exception is org.springframework.beans.factory.UnsatisfiedDependencyException: Error creating bean with name 'dataStore' defined in file [/Users/goodsaem/goodsaem/api/build/classes/java/main/io/github/goodsaem/api/store/DataStore.class]: Unsatisfied dependency expressed through constructor parameter 0; nested exception is org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'ignite' defined in class path resource [io/github/goodsaem/api/config/IgniteConfig.class]: Bean instantiation via factory method failed; nested exception is org.springframework.beans.BeanInstantiationException: Failed to instantiate [org.apache.ignite.Ignite]: Factory method 'ignite' threw exception; nested exception is class org.apache.ignite.internal.processors.query.IgniteSQLException: Failed to initialize DB connection: jdbc:h2:mem:87bb368a-9f10-4b7d-92be-aa6a243b5a26;LOCK_MODE=3;MULTI_THREADED=1;DB_CLOSE_ON_EXIT=FALSE;DEFAULT_LOCK_TIMEOUT=10000;FUNCTIONS_IN_SCHEMA=true;OPTIMIZE_REUSE_RESULTS=0;QUERY_CACHE_SIZE=0;MAX_OPERATION_MEMORY=0;BATCH_JOINS=1;ROW_FACTORY="org.apache.ignite.internal.processors.query.h2.opt.H2PlainRowFactory";DEFAULT_TABLE_ENGINE=org.apache.ignite.internal.processors.query.h2.opt.GridH2DefaultTableEngine
2021-03-18 00:01:09.839  INFO 48562 --- [           main] j.LocalContainerEntityManagerFactoryBean : Closing JPA EntityManagerFactory for persistence unit 'default'
2021-03-18 00:01:09.840  INFO 48562 --- [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown initiated...
[00:01:09] Ignite node stopped wih ERRORS [name=GoodSaem-Grid, uptime=00:00:01.185]
2021-03-18 00:01:09.842  INFO 48562 --- [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown completed.
2021-03-18 00:01:09.843  INFO 48562 --- [           main] o.apache.catalina.core.StandardService   : Stopping service [Tomcat]
2021-03-18 00:01:09.850  INFO 48562 --- [           main] ConditionEvaluationReportLoggingListener :

Error starting ApplicationContext. To display the conditions report re-run your application with 'debug' enabled.
2021-03-18 00:01:09.862 ERROR 48562 --- [           main] o.s.boot.SpringApplication               : Application run failed

org.springframework.beans.factory.UnsatisfiedDependencyException: Error creating bean with name 'HCodeController': Unsatisfied dependency expressed through field 'dataStore'; nested exception is org.springframework.beans.factory.UnsatisfiedDependencyException: Error creating bean with name 'dataStore' defined in file [/Users/goodsaem/goodsaem/api/build/classes/java/main/io/github/goodsaem/api/store/DataStore.class]: Unsatisfied dependency expressed through constructor parameter 0; nested exception is org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'ignite' defined in class path resource [io/github/goodsaem/api/config/IgniteConfig.class]: Bean instantiation via factory method failed; nested exception is org.springframework.beans.BeanInstantiationException: Failed to instantiate [org.apache.ignite.Ignite]: Factory method 'ignite' threw exception; nested exception is class org.apache.ignite.internal.processors.query.IgniteSQLException: Failed to initialize DB connection: jdbc:h2:mem:87bb368a-9f10-4b7d-92be-aa6a243b5a26;LOCK_MODE=3;MULTI_THREADED=1;DB_CLOSE_ON_EXIT=FALSE;DEFAULT_LOCK_TIMEOUT=10000;FUNCTIONS_IN_SCHEMA=true;OPTIMIZE_REUSE_RESULTS=0;QUERY_CACHE_SIZE=0;MAX_OPERATION_MEMORY=0;BATCH_JOINS=1;ROW_FACTORY="org.apache.ignite.internal.processors.query.h2.opt.H2PlainRowFactory";DEFAULT_TABLE_ENGINE=org.apache.ignite.internal.processors.query.h2.opt.GridH2DefaultTableEngine
	at org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor$AutowiredFieldElement.resolveFieldValue(AutowiredAnnotationBeanPostProcessor.java:660) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor$AutowiredFieldElement.inject(AutowiredAnnotationBeanPostProcessor.java:640) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.annotation.InjectionMetadata.inject(InjectionMetadata.java:119) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor.postProcessProperties(AutowiredAnnotationBeanPostProcessor.java:399) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.populateBean(AbstractAutowireCapableBeanFactory.java:1413) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.doCreateBean(AbstractAutowireCapableBeanFactory.java:601) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBean(AbstractAutowireCapableBeanFactory.java:524) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractBeanFactory.lambda$doGetBean$0(AbstractBeanFactory.java:335) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.DefaultSingletonBeanRegistry.getSingleton(DefaultSingletonBeanRegistry.java:234) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:333) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:208) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.preInstantiateSingletons(DefaultListableBeanFactory.java:944) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.context.support.AbstractApplicationContext.finishBeanFactoryInitialization(AbstractApplicationContext.java:917) ~[spring-context-5.3.4.jar:5.3.4]
	at org.springframework.context.support.AbstractApplicationContext.refresh(AbstractApplicationContext.java:582) ~[spring-context-5.3.4.jar:5.3.4]
	at org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext.refresh(ServletWebServerApplicationContext.java:144) ~[spring-boot-2.4.3.jar:2.4.3]
	at org.springframework.boot.SpringApplication.refresh(SpringApplication.java:767) [spring-boot-2.4.3.jar:2.4.3]
	at org.springframework.boot.SpringApplication.refresh(SpringApplication.java:759) [spring-boot-2.4.3.jar:2.4.3]
	at org.springframework.boot.SpringApplication.refreshContext(SpringApplication.java:426) [spring-boot-2.4.3.jar:2.4.3]
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:326) [spring-boot-2.4.3.jar:2.4.3]
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:1311) [spring-boot-2.4.3.jar:2.4.3]
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:1300) [spring-boot-2.4.3.jar:2.4.3]
	at io.github.goodsaem.api.ApiApplication.main(ApiApplication.java:9) [main/:na]
Caused by: org.springframework.beans.factory.UnsatisfiedDependencyException: Error creating bean with name 'dataStore' defined in file [/Users/goodsaem/goodsaem/api/build/classes/java/main/io/github/goodsaem/api/store/DataStore.class]: Unsatisfied dependency expressed through constructor parameter 0; nested exception is org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'ignite' defined in class path resource [io/github/goodsaem/api/config/IgniteConfig.class]: Bean instantiation via factory method failed; nested exception is org.springframework.beans.BeanInstantiationException: Failed to instantiate [org.apache.ignite.Ignite]: Factory method 'ignite' threw exception; nested exception is class org.apache.ignite.internal.processors.query.IgniteSQLException: Failed to initialize DB connection: jdbc:h2:mem:87bb368a-9f10-4b7d-92be-aa6a243b5a26;LOCK_MODE=3;MULTI_THREADED=1;DB_CLOSE_ON_EXIT=FALSE;DEFAULT_LOCK_TIMEOUT=10000;FUNCTIONS_IN_SCHEMA=true;OPTIMIZE_REUSE_RESULTS=0;QUERY_CACHE_SIZE=0;MAX_OPERATION_MEMORY=0;BATCH_JOINS=1;ROW_FACTORY="org.apache.ignite.internal.processors.query.h2.opt.H2PlainRowFactory";DEFAULT_TABLE_ENGINE=org.apache.ignite.internal.processors.query.h2.opt.GridH2DefaultTableEngine
	at org.springframework.beans.factory.support.ConstructorResolver.createArgumentArray(ConstructorResolver.java:800) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.ConstructorResolver.autowireConstructor(ConstructorResolver.java:229) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.autowireConstructor(AbstractAutowireCapableBeanFactory.java:1354) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBeanInstance(AbstractAutowireCapableBeanFactory.java:1204) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.doCreateBean(AbstractAutowireCapableBeanFactory.java:564) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBean(AbstractAutowireCapableBeanFactory.java:524) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractBeanFactory.lambda$doGetBean$0(AbstractBeanFactory.java:335) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.DefaultSingletonBeanRegistry.getSingleton(DefaultSingletonBeanRegistry.java:234) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:333) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:208) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.config.DependencyDescriptor.resolveCandidate(DependencyDescriptor.java:276) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.doResolveDependency(DefaultListableBeanFactory.java:1380) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.resolveDependency(DefaultListableBeanFactory.java:1300) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor$AutowiredFieldElement.resolveFieldValue(AutowiredAnnotationBeanPostProcessor.java:657) ~[spring-beans-5.3.4.jar:5.3.4]
	... 21 common frames omitted
Caused by: org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'ignite' defined in class path resource [io/github/goodsaem/api/config/IgniteConfig.class]: Bean instantiation via factory method failed; nested exception is org.springframework.beans.BeanInstantiationException: Failed to instantiate [org.apache.ignite.Ignite]: Factory method 'ignite' threw exception; nested exception is class org.apache.ignite.internal.processors.query.IgniteSQLException: Failed to initialize DB connection: jdbc:h2:mem:87bb368a-9f10-4b7d-92be-aa6a243b5a26;LOCK_MODE=3;MULTI_THREADED=1;DB_CLOSE_ON_EXIT=FALSE;DEFAULT_LOCK_TIMEOUT=10000;FUNCTIONS_IN_SCHEMA=true;OPTIMIZE_REUSE_RESULTS=0;QUERY_CACHE_SIZE=0;MAX_OPERATION_MEMORY=0;BATCH_JOINS=1;ROW_FACTORY="org.apache.ignite.internal.processors.query.h2.opt.H2PlainRowFactory";DEFAULT_TABLE_ENGINE=org.apache.ignite.internal.processors.query.h2.opt.GridH2DefaultTableEngine
	at org.springframework.beans.factory.support.ConstructorResolver.instantiate(ConstructorResolver.java:658) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.ConstructorResolver.instantiateUsingFactoryMethod(ConstructorResolver.java:638) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.instantiateUsingFactoryMethod(AbstractAutowireCapableBeanFactory.java:1334) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBeanInstance(AbstractAutowireCapableBeanFactory.java:1177) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.doCreateBean(AbstractAutowireCapableBeanFactory.java:564) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBean(AbstractAutowireCapableBeanFactory.java:524) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractBeanFactory.lambda$doGetBean$0(AbstractBeanFactory.java:335) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.DefaultSingletonBeanRegistry.getSingleton(DefaultSingletonBeanRegistry.java:234) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:333) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:208) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.config.DependencyDescriptor.resolveCandidate(DependencyDescriptor.java:276) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.doResolveDependency(DefaultListableBeanFactory.java:1380) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.resolveDependency(DefaultListableBeanFactory.java:1300) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.ConstructorResolver.resolveAutowiredArgument(ConstructorResolver.java:887) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.ConstructorResolver.createArgumentArray(ConstructorResolver.java:791) ~[spring-beans-5.3.4.jar:5.3.4]
	... 34 common frames omitted
Caused by: org.springframework.beans.BeanInstantiationException: Failed to instantiate [org.apache.ignite.Ignite]: Factory method 'ignite' threw exception; nested exception is class org.apache.ignite.internal.processors.query.IgniteSQLException: Failed to initialize DB connection: jdbc:h2:mem:87bb368a-9f10-4b7d-92be-aa6a243b5a26;LOCK_MODE=3;MULTI_THREADED=1;DB_CLOSE_ON_EXIT=FALSE;DEFAULT_LOCK_TIMEOUT=10000;FUNCTIONS_IN_SCHEMA=true;OPTIMIZE_REUSE_RESULTS=0;QUERY_CACHE_SIZE=0;MAX_OPERATION_MEMORY=0;BATCH_JOINS=1;ROW_FACTORY="org.apache.ignite.internal.processors.query.h2.opt.H2PlainRowFactory";DEFAULT_TABLE_ENGINE=org.apache.ignite.internal.processors.query.h2.opt.GridH2DefaultTableEngine
	at org.springframework.beans.factory.support.SimpleInstantiationStrategy.instantiate(SimpleInstantiationStrategy.java:185) ~[spring-beans-5.3.4.jar:5.3.4]
	at org.springframework.beans.factory.support.ConstructorResolver.instantiate(ConstructorResolver.java:653) ~[spring-beans-5.3.4.jar:5.3.4]
	... 48 common frames omitted
Caused by: org.apache.ignite.internal.processors.query.IgniteSQLException: Failed to initialize DB connection: jdbc:h2:mem:87bb368a-9f10-4b7d-92be-aa6a243b5a26;LOCK_MODE=3;MULTI_THREADED=1;DB_CLOSE_ON_EXIT=FALSE;DEFAULT_LOCK_TIMEOUT=10000;FUNCTIONS_IN_SCHEMA=true;OPTIMIZE_REUSE_RESULTS=0;QUERY_CACHE_SIZE=0;MAX_OPERATION_MEMORY=0;BATCH_JOINS=1;ROW_FACTORY="org.apache.ignite.internal.processors.query.h2.opt.H2PlainRowFactory";DEFAULT_TABLE_ENGINE=org.apache.ignite.internal.processors.query.h2.opt.GridH2DefaultTableEngine
	at org.apache.ignite.internal.processors.query.h2.ConnectionManager.<init>(ConnectionManager.java:129) ~[ignite-indexing-2.9.1.jar:2.9.1]
	at org.apache.ignite.internal.processors.query.h2.IgniteH2Indexing.start(IgniteH2Indexing.java:2099) ~[ignite-indexing-2.9.1.jar:2.9.1]
	at org.apache.ignite.internal.processors.query.GridQueryProcessor.start(GridQueryProcessor.java:273) ~[ignite-core-2.9.1.jar:2.9.1]
	at org.apache.ignite.internal.IgniteKernal.startProcessor(IgniteKernal.java:1934) ~[ignite-core-2.9.1.jar:2.9.1]
	at org.apache.ignite.internal.IgniteKernal.start(IgniteKernal.java:1216) ~[ignite-core-2.9.1.jar:2.9.1]
	at org.apache.ignite.internal.IgnitionEx$IgniteNamedInstance.start0(IgnitionEx.java:2052) ~[ignite-core-2.9.1.jar:2.9.1]
	at org.apache.ignite.internal.IgnitionEx$IgniteNamedInstance.start(IgnitionEx.java:1698) ~[ignite-core-2.9.1.jar:2.9.1]
	at org.apache.ignite.internal.IgnitionEx.start0(IgnitionEx.java:1114) ~[ignite-core-2.9.1.jar:2.9.1]
	at org.apache.ignite.internal.IgnitionEx.start(IgnitionEx.java:634) ~[ignite-core-2.9.1.jar:2.9.1]
	at org.apache.ignite.internal.IgnitionEx.start(IgnitionEx.java:560) ~[ignite-core-2.9.1.jar:2.9.1]
	at org.apache.ignite.Ignition.start(Ignition.java:328) ~[ignite-core-2.9.1.jar:2.9.1]
	at io.github.goodsaem.api.config.IgniteConfig.ignite(IgniteConfig.java:51) ~[main/:na]
	at io.github.goodsaem.api.config.IgniteConfig$$EnhancerBySpringCGLIB$$60f465d7.CGLIB$ignite$0(<generated>) ~[main/:na]
	at io.github.goodsaem.api.config.IgniteConfig$$EnhancerBySpringCGLIB$$60f465d7$$FastClassBySpringCGLIB$$2894e447.invoke(<generated>) ~[main/:na]
	at org.springframework.cglib.proxy.MethodProxy.invokeSuper(MethodProxy.java:244) ~[spring-core-5.3.4.jar:5.3.4]
	at org.springframework.context.annotation.ConfigurationClassEnhancer$BeanMethodInterceptor.intercept(ConfigurationClassEnhancer.java:331) ~[spring-context-5.3.4.jar:5.3.4]
	at io.github.goodsaem.api.config.IgniteConfig$$EnhancerBySpringCGLIB$$60f465d7.ignite(<generated>) ~[main/:na]
	at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method) ~[na:1.8.0_275]
	at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62) ~[na:1.8.0_275]
	at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43) ~[na:1.8.0_275]
	at java.lang.reflect.Method.invoke(Method.java:498) ~[na:1.8.0_275]
	at org.springframework.beans.factory.support.SimpleInstantiationStrategy.instantiate(SimpleInstantiationStrategy.java:154) ~[spring-beans-5.3.4.jar:5.3.4]
	... 49 common frames omitted
Caused by: org.h2.jdbc.JdbcSQLNonTransientConnectionException: Unsupported connection setting "MULTI_THREADED" [90113-200]
	at org.h2.message.DbException.getJdbcSQLException(DbException.java:622) ~[h2-1.4.200.jar:1.4.200]
	at org.h2.message.DbException.getJdbcSQLException(DbException.java:429) ~[h2-1.4.200.jar:1.4.200]
	at org.h2.message.DbException.get(DbException.java:205) ~[h2-1.4.200.jar:1.4.200]
	at org.h2.message.DbException.get(DbException.java:181) ~[h2-1.4.200.jar:1.4.200]
	at org.h2.engine.ConnectionInfo.readSettingsFromURL(ConnectionInfo.java:269) ~[h2-1.4.200.jar:1.4.200]
	at org.h2.engine.ConnectionInfo.<init>(ConnectionInfo.java:78) ~[h2-1.4.200.jar:1.4.200]
	at org.h2.jdbc.JdbcConnection.<init>(JdbcConnection.java:152) ~[h2-1.4.200.jar:1.4.200]
	at org.h2.Driver.connect(Driver.java:69) ~[h2-1.4.200.jar:1.4.200]
	at java.sql.DriverManager.getConnection(DriverManager.java:664) ~[na:1.8.0_275]
	at java.sql.DriverManager.getConnection(DriverManager.java:270) ~[na:1.8.0_275]
	at org.apache.ignite.internal.processors.query.h2.ConnectionManager.<init>(ConnectionManager.java:118) ~[ignite-indexing-2.9.1.jar:2.9.1]
	... 70 common frames omitted


Process finished with exit code 1
```

:::

## 8. Error 해결방법

### build.gradle 수정
41 번 라인처럼 h2 db 버전을 ***1.4.196*** 로 명시해 주어야 문제가 발생하지 않습니다. 높은 버전을 사용하거나 낮은 버전을 사용하면 문제가 발생합니다.

```yaml
buildscript {
	ext {
		apacheIgniteVersion = '2.9.1'
		springBootVersion = '2.4.3'
	}
	repositories {
		mavenCentral()
	}
	dependencies {
		classpath(
				"org.springframework.boot:spring-boot-gradle-plugin:${springBootVersion}")
	}
}

apply plugin: 'org.springframework.boot'
apply plugin: 'war'
apply plugin: 'io.spring.dependency-management'
sourceCompatibility = '1.8'
targetCompatibility = '1.8'


group = 'io.github.goodsaem'
version = '0.0.1-SNAPSHOT'

configurations {
	compileOnly {
		extendsFrom annotationProcessor
	}
}

repositories {
	mavenCentral()
}

dependencies {
	implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
	implementation 'org.springframework.boot:spring-boot-starter-freemarker'
	implementation 'org.springframework.boot:spring-boot-starter-web'
	implementation 'org.springframework.boot:spring-boot-autoconfigure'
	implementation("org.mariadb.jdbc:mariadb-java-client")
	implementation group: 'com.h2database', name: 'h2', version: '1.4.196'

	compile "org.apache.ignite:ignite-core:$apacheIgniteVersion",
			"org.apache.ignite:ignite-slf4j:$apacheIgniteVersion",
			"org.apache.ignite:ignite-spring:$apacheIgniteVersion"
			"org.apache.ignite:ignite-rest-http:$apacheIgniteVersion"

	compileOnly 'org.projectlombok:lombok'
	annotationProcessor 'org.projectlombok:lombok'
	testImplementation 'org.springframework.boot:spring-boot-starter-test'
}

test {
	useJUnitPlatform()
}
```
## 9. 테스트
이전 mariadb 연동시의 결과와 동일하지만 데이터를 캐쉬에서 불러와서 표시하는 부분만 달라집니다.

{% asset_img 1.jpg %}

## 10. 전체파일 다운로드
지금 까지 작성한 내용에 대해서 아래와 같이 압축해서 올립니다. 필요하신 분은 다운로드 받아서 사용하세요

[/api-master.zip](/down/api-master.zip)
