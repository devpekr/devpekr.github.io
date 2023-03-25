---
title: 1/13 무료 aws + springboot 서버 구축
date: 2023-03-25 20:01:00
tags: [SPRINGBOOT,AWS]
category: [설치,SPRINGBOOT]
toc: true
---

{% asset_img aws_springboot-001.png %}

# <i class="fas fa-server"></i> 1. 사전준비

aws + ubuntu 18 + mariadb + springboot 백엔드 서버 구축에 관련된 내용입니다. 

## 1. 구축 조건

서버를 구축할때 아래의 조건에 맞게 구축되어야 된다는 원칙을 정하고 방법을 찾았습니다.

- 비용이 발생하면 안됩니다.
- 완벽하게 https 를 지원해 주어야 됩니다.
- springboot 지원가능해야 됩니다.
- 구축해야 되는 서버는 오로지 https://goodsaem.github.io 사이트에서 요청한 데이터만 응답해야 됩니다.
- mariadb 도 사용할수 있어야 됩니다.

이런 조건을 맞추기 위해서는 **aws 서버 구축**이 정답이였습니다. 1년간 프리티어로 무료로 사용할수 있기에 회원가입을 하고 신용카드를
등록하여 프리티어 서버를 구축했습니다.

## 2. 아키텍처

1. 사용자가 브라우저를 통해서 [https://goodsaem.github.io](https://goodsaem.github.io) 를 접속합니다.
1. 데이터를 저장하거나 데이터를 db 조회가 필요한경우 [https://goodsaem.ml](https://goodsaem.ml) 로 rest api를 호출합니다.
    - [https://goodsaem.ml](https://goodsaem.ml) aws 프리티어 서버에 구축되어 있습니다.
    - https://goodsaem.github.io 에서 오는 요청 및  localhost에서 실행한 요청에 대해서만 허용하고 나머지는 거부합니다.
1. nginx 웹서버는 https://goodsaem.github.io 에서 호출한 요청에 대해서만 응답하고 나머지 요청은 전부 거부하도록 설정합니다.
1. [https://goodsaem.ml/spring/](https://goodsaem.ml/spring/) 으로 오는 요청은 spring boot가 응답하도록 설정합니다.
1. db는 mariadb를 사용하며 spring에서 데이터 crud가 필요한 경우 동작하도록 설계합니다.   

{% asset_img 2.jpg %}

## 3. 목표

서버 셋업이 완료되고 나서 ssl 수준이 얼마나 되는지 체크하는 사이트[https://www.ssllabs.com/ssltest/analyze.html](https://www.ssllabs.com/ssltest/analyze.html)에 점검한 결과 입니다.
A를 받았으니 잘 설정한것 같네요 ^^

{% asset_img 40.jpg %}

{% asset_img 41.jpg %}

## 4. 무료 도메인 발급

무료 도메인 발급 받는 방법에 대해서 알아 보겠습니다.

요즘 대부분의 웹서버는 https 통신을 합니다. 이제는 선택이 아닌 필수 인것 같네요 제가 서버를 구축하게 된 직접적인 원인도 https 설정을 하기 위함입니다.
nginx 에 https 서비스를 구성하기 위해서는 도메인이 필요합니다. 도메인이 준비되면 certbot을 통해서 무료 ssl 인증서 적용 및 http/2 적용이 가능한데요 
무료 도메인 가입하는 부분에 대해서 아래오 같이 정리했습니다. 서버셋업전 도메인 발급 받으시기 바랍니다.


## 5. Freenom

Freenom 에서 무료 도메인 발급 받는 방법입니다.

[https://www.freenom.com/en/index.html?lang=en](https://www.freenom.com/en/index.html?lang=en) freenom 이란
사이트에서 무료 도메인을 발급 받을수 있습니다. 회원가입을 후 도메인 등록을 진행합니다.

- 로그인 후 원하는 도메인을 입력하고 엔터키를 클릭한후 사용하고자 하는 도메인에서 Get it now! 버튼을 클릭하여 선택합니다.
  그리고 나서 **Checkout** 버튼을 클릭합니다.

  {% asset_img 35.jpg %}

- Use DNS 버튼을 클릭하고 Use Freenom DNS Service를 선택한후 aws free tier의 퍼블릭 ipv4 주소를 입력하고 Continue 버튼을 클릭합니다.

  {% asset_img 36.jpg %}

- 도메인 주문이 완료되었습니다.

  {% asset_img 38.jpg %}

- My Domain 에서 주문한 도메인 확인이 가능합니다.
  ::: tip goodsaem.ml
  무료 도메인을 2개 신청했는데 2번째꺼는 어떤이유인지 mydomain에 추가 되지 않아 goodsaem.ml로 셋팅 진행하겠습니다.
  :::

  {% asset_img 39.jpg %}
