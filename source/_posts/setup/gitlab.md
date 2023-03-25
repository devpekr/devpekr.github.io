---
title: GitLab 사용법
date: 2023-03-24 23:15:32
tags: [gitlab]
category: [설치,GitLab]
toc: true
---

### {% fa github %} 개요
GitLab은 Git 기반의 협업 소프트웨어 개발 플랫폼으로, 코드 호스팅, 이슈 트래킹, CI/CD 파이프라인,
협업 도구 등 다양한 기능을 제공한다. github은 소스코드들을 공개해야 무료로 사용할수 있다.
gitlab 경우에는 **소스 코드를 비공개로 사용할수 있어** 선택하게 되었다.
일반적인 GitLab을 사용하는 이유는 다음과 같다.

**1. 통합된 플랫폼**
GitLab은 코드 호스팅, 이슈 트래킹, CI/CD 파이프라인, 협업 도구 등 다양한 기능을 한 플랫폼에서 제공한다. 이를 통해 개발자는 다른 도구를 사용해야 할 필요 없이 모든 작업을 GitLab에서 처리할 수 있다.

**2. 강력한 코드 관리 기능**
GitLab은 Git 기반의 코드 관리를 위한 다양한 기능을 제공 한다. 브랜치, 태그, 병합 등의 Git 기능 외에도 코드 검토, 코드 검색, 코드 스니펫, 이력 추적 등 다양한 코드 관리 기능을 제공한다.

**3. 뛰어난 협업 도구**
GitLab은 팀 내 협업을 위한 다양한 기능을 제공합니다. 이슈 트래킹, 코드 리뷰, 코드 머지 요청, 웹 IDE 등을 제공하여 팀 내에서 협업하고 코드 품질을 향상시킬 수 있다.

**4. CI/CD 파이프라인**
GitLab은 CI/CD 파이프라인을 자체적으로 지원하며, 자동화된 빌드, 테스트, 배포를 제공한다. 이를 통해 개발자는 코드 변경 사항을 자동으로 테스트하고 배포할 수 있어 개발 생산성을 높일 수 있다.

**5. 보안 기능**
GitLab은 보안을 강화하기 위한 다양한 기능을 제공한다. 예를 들어, 보안 취약점 자동 탐지, 민감한 데이터 마스킹, 사용자 인증 및 권한 관리 등이 있다.


### {% fa user %} 회원가입
회원가입은 gmail 계정만 있으면 한번 클릭으로 가입이 완료된다.

### {% fa document %} 초기설정

로그인 하시고 나면 ssh-key와 패스워드를 설정하셔야 됩니다. 둘다 git commit할때 사용하므로
미리 작업을 진행합니다.

1. 패스워드 설정 하라는 팝업메시지가 있는데 그걸 클릭하셔서 패스워드 설정하시면 됩니다.
1. ssh key 작업은 mac 기준으로 설명드리겠습니다.
    - 터미널을 실행한후 아래와 같이 입력합니다.
    ```shell
    ssh-keygen -t rsa -b 2048 -C "goodsaem"
    ```
    - 중간에 passphrase를 입력하라고 하는데 그냥 엔터를 입력합니다. 그렇게 진행이 되고 나면
      /Users/goodsaem/.ssh/id_rsa 키가 생성됩니다.
   ```shell
    Generating public/private rsa key pair.
    Enter file in which to save the key (/Users/goodsaem/.ssh/id_rsa):
    Enter passphrase (empty for no passphrase):
    Enter same passphrase again:
    Your identification has been saved in /Users/goodsaem/.ssh/id_rsa.
    Your public key has been saved in /Users/goodsaem/.ssh/id_rsa.pub.
    The key fingerprint is:
    SHA256:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx goodsaem
    The key's randomart image is:
    +---[RSA 2048]----+
    |   ...           |
    +----[SHA256]-----+
    ``` 
    - 생성한 키 내용을 복사합니다. (cat 으로 문자열을 출력한후 드래그해서 복사합니다.)
    ```shell
    cat /Users/goodsaem/.ssh/id_rsa
    ```
    - 그리고 나서 key 입력하는 창에 붙여넣기를 하고 저장합니다. [https://gitlab.com/-/profile/keys](https://gitlab.com/-/profile/keys)

{% asset_img 1.jpg %}

## 3. 프로젝트 생성 및 소스 업로드
[https://gitlab.com/projects/new](https://gitlab.com/projects/new) 페이지에서 신규 프로젝트를 생성합니다.

{% asset_img 2.jpg %}

프로젝트 명을 적당히 입력하고 private 개인용으로 하시고 readme 파일을 생성하지 않은 상태로 create project 버튼을 클릭하여 프로젝틀 생성합니다.

{% asset_img 3.jpg %}

파일을 올릴려고 하는 디렉토리로 이동 한후 아래와 같이 입력합니다.

```shell
git init
Initialized empty Git repository in /Users/goodsaem/goodsaem/good/.git/
```

생성한 프로젝트에서 Clone Clone with HTTPS 내용을 복사합니다.

{% asset_img 4.jpg %}

그리고 나서 git remote add origin 복사한 부분 붙여 넣기를 합니다. 이 명령어로 remote로 저장하겠다는 뜻이고
이때 아이디와 패스워드를 물어보는데 아이디는 이메일 주소를 입력해주시면 되고 패스워드는 설정한 패스워드를 입력합니다.

```shell
git remote add origin git@gitlab.com:bsh96699403/goodsaem.github.io.git
```

현재 디렉토리의 모든 파일을 git에 추가 합니다.
```shell
git .
```

추가된 내용을 commit 합니다.
```shell
git commit -m "Initial commit"
```

gitlab.com에 반영합니다.
```shell
git push -u origin master
```

업로드가 다되어 프로젝트로 이동하면 아래와 같이 모든 파일이 업로드 되었음을 확인할수 있습니다.

{% asset_img 5.jpg %}
