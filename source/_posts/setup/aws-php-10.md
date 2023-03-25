---
title: 10/13 무료로 aws + php 서버 구축
date: 2023-03-25 15:50:00
tags: [PHP,AWS]
category: [설치,PHP]
toc: true
---
![10/13 무료로 aws + php 서버 구축](/img/aws_php-010.png)
# <i class="fas fa-server"></i> 10. AWS 보안설정

http 및 https 로 접속하기 위해서는 aws에 인바운드 (들어오는쪽)에 방화벽 설정을 해주셔야 됩니다.
아래와 같이 aws 콘솔에서 EC2 > 인스턴스 > 인스터스 명을 클릭하시고 *보안* 탭에서  보안그룹의 보안
그룹번호를 클릭합니다.

![img](/img/31.jpg)

인바운드 규칙 변경을 통해 아래와 같이 http , https 에대한 규칙을 추가합니다.

![img](/img/33.jpg)

규칙 추가는 인바운드 규칙 편집 버튼을 클릭하여 아래와 같이 http,https 위치무관이라고 선택하고 저장하시면 됩니다.

![img](/img/32.jpg)

여기까지 설정하셨다면 ec2 서버의 IP주소/phpinfo.php 로 접속해서 php정보가 아래와 같이 정상적으로 로딩 되는지를 확인 합니다
이렇게 나온다면 nginx + php 설정이 완료 되었습니다.

![img](/img/34.jpg)
