---
title: SpringBoot 오라클 클라우드 자율데이터 베이스 연동  
date: 2025-07-05 18:40:47
tags: [Blog]
categories: [Blog]
toc: true
---

# {% fa database %} 연동 이미지
아래와 같이 https://goodsaem.github.io로 접속하면 오라클 클라우드에 접속하여 데이터를 불러오는 구성을 만들어 보자. 블로그에서
동적 컨텐츠를 제공하기 위함 이며 하나씩 만들어가면서 블로그도 업그레이드 예정이다.

{% callout type:"info" title:"오라클 클라우드 springboot 연동" %}
gpt한테도 물어보고 인터넷검색도 해봤는데 잘 동작하는 예제가 없어 springboot 최신 버전으로 연동하는 서비스를 만들어 보고자 한다.
{% endcallout %}

{% draw "/drawio/spring-oracle-cloud.drawio" %}

## 동작
- 아래와 같은 형태로 동작한다.

![](../../images/cj6o8k.jpg)


## 전자지갑 다운로드
- 데이터 베이스 접속 버튼을 클릭한후 > 전자지갑 다운로드 > 비밀번호 입력 > 다운로드 버튼을 클릭하면 > Wallet_goodsaem.zip 파일이 다운로드 된다.

![](../../images/e1q172.jpg)