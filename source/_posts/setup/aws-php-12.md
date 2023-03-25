---
title: 12/13 무료로 aws + php 서버 구축
date: 2023-03-25 16:10:00
tags: [PHP,AWS]
category: [설치,PHP]
toc: true
---
![12/13 무료로 aws + php 서버 구축](/img/aws_php-012.png)
# <i class="fas fa-server"></i> 12. SSL 점검

SSL이 제되로 생성되었는지 [https://www.ssllabs.com/ssltest/analyze.html](https://www.ssllabs.com/ssltest/analyze.html) 사이트에 접속하여
아래와 같이 도메인을 입력하고 점검을 수행합니다.

![img](/img/40.jpg)

A 라고 연두색으로 나오는것 보니 제되로 설정이 된것 같습니다.

![img](/img/41.jpg)

이제 실제로 https 로 접속을 시도해 보겠습니다. [https://goodsaem.ml/info.php](https://goodsaem.ml/info.php) https 프로토콜을 이용하여
설정한 도메인으로 접속하니 아래 그림과 같이 정상적으로 화면이 나왔습니다. 보안 오류 같은거 없이 ^^ 대 성공입니다. 자물쇠 모양을 더블클릭하세요

![img](/img/42.jpg)

아래와 같이 보안 연결이 사용되었다는 내용이 확인되며 인증서도 유효 하다고 하네요.

![img](/img/43.jpg)
