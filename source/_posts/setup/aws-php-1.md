---
title: 1/13 무료로 aws + php 서버 구축
date: 2023-03-25 14:20:00
tags: [PHP,AWS]
category: [설치,PHP]
toc: true
---

![1/13 무료로 aws + php 서버 구축](/img/aws_php-001.png)

# <i class="fa fa-baby"></i> 1. 사전준비



AWS 서버구축 내용과 동일하며 백엔드를 PHP를 사용하고 싶을때 참고하시면 됩니다.

## 1. 구축조건
서버를 구축할때 아래의 조건에 맞게 구축되어야 된다는 원칙을 정하고 방법을 찾았습니다.

- 비용이 발생하면 안됩니다.
- 완벽하게 https 를 지원해 주어야 됩니다.
- php 도 실행가능하고 spring 도 지원가능해야 됩니다.
- 구축해야 되는 서버는 오로지 https://goodsaem.github.io 사이트에서 요청한 데이터만 응답해야 됩니다.
- db 도 사용할수 있어야 됩니다.

이런 조건을 맞추기 위해서는 **aws 서버 구축**이 정답이였습니다. 1년간 프리티어로 무료로 사용할수 있기에 회원가입을 하고 신용카드를
등록하여 프리티어 서버를 구축했습니다.

## 2. 아키텍처

1. 사용자가 브라우저를 통해서 [https://goodsaem.github.io](https://goodsaem.github.io) 를 접속합니다.
1. 데이터를 저장하거나 데이터를 db 조회가 필요한경우 [https://goodsaem.ml](https://goodsaem.ml) 로 rest api를 호출합니다.
    - [https://goodsaem.ml](https://goodsaem.ml) aws 프리티어 서버에 구축되어 있습니다.
    - https://goodsaem.github.io 에서 오는 요청 및  localhost에서 실행한 요청에 대해서만 허용하고 나머지는 거부합니다.
1. nginx 웹서버는 https://goodsaem.github.io 에서 호출한 요청에 대해서만 응답하고 나머지 요청은 전부 거부하도록 설정합니다.
1. [https://goodsaem.ml/php/](https://goodsaem.ml/php/) 아래의 하위 요청은 모두 php가 동작하도록 라우팅 하고
   [https://goodsaem.ml/spring/](https://goodsaem.ml/spring/) 으로 오는 요청은 spring boot가 응답하도록 설정합니다.
1. db는 mariadb를 사용하며 php spring에서 데이터 crud가 필요한 경우 동작하도록 설계합니다.

![problem](/img/architecture.jpg)

우선 서버 셋업이 완료되고 나서 ssl 수준이 얼마나 되는지 체크하는 사이트[https://www.ssllabs.com/ssltest/analyze.html](https://www.ssllabs.com/ssltest/analyze.html)에 점검한 결과 입니다.
자세한 내용은 모르겠지만 A+ , A를 받았으니 잘 설정한것 같네요 ^^

**https://goodsaem.github.io**

![goodsaem.ml](/img/goodsaem.duckdns.org.jpg)

**https://goodsaem.ml**

![goodsaem.ml](/img/goodsaem.github.io.jpg)
