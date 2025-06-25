### Github SSH 연결방법
![](/images/pb9w1z.jpg)

**git-scm은 설치되어 있어야 아래 내용 실행가능함**


GitHub 로그인을 ssh 로 설정하면 매번 로그인 할 필요없이 편하게 source 를 commit 하고 push 할수 있다.
GitHub SSH 설정하는 방법에 대해 windows 기준으로 정리함 (**※ git은 설치되어 있어야 함**)  
**SSH 키 생성 후 생성된 키를 클립보드에 복사**

---
1. Git Bash 창 실행
   ![](/images/y0afas.jpg)
1. ssh-keygen 명령어 실행
```
ssh-keygen -t rsa -b 2048 -f ~/.ssh/goodsame2.github.io_key
```
1. 기본값설정을 위해 엔터 엔터를 입력
1. 아래와 같이 goodsame2.github.io_key 와 goodsame2.github.io_key.pub 가 만들어진걸 확인할수 있다.
   ![](/images/usb4z3.jpg)
1. 아래 명령어를 입력하여 출력된 내용을 복사
```
cat ~/.ssh/goodsame2.github.io_key.pub
```
![](/images/cwbr0c.jpg)
**github ssh 키 등록**
깃허브에 SSH 공개키 등록을 위해 깃허브 홈페이지에 로그인을 진행하고 아래 순서되로 키를 생성
1. 프로젝트를 선택
1. Settings 아이콘을 클릭
1. Deploy Key를 선택
1. Add deploy key 아이콘 클릭
1. goodsame2.github.io_pub 키와 같은형태로 키 생성
   ![](/images/cr6ums.jpg)
1. git 이름 이메일 등록
```
git config --global user.name "goodsame2"
git config --global user.email "goodsame2@proton.me"
```

$ ssh-add ~/.ssh/goodsame2.github.io_key
Identity added: /c/Users/Administrator/.ssh/goodsame2.github.io_key (Administrator@WIN-DBSA6V6A1MT)



이제부터 ssh 키로 연결할수 있다.

- 테스트 (Git Bash로 테스트 할것)
1. 소스복제
```
$ git clone git@github.com:goodsame2/goodsame2.github.io.git
```
```
Cloning into 'goodsame2.github.io'...
The authenticity of host 'github.com (20.200.245.247)' can't be established.
ED25519 key fingerprint is SHA256:+DiY3wvvV6TuJJhbpZisF/zLDA0zPMSvHdkr4UvCOqU.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added 'github.com' (ED25519) to the list of known hosts.
remote: Enumerating objects: 3, done.
remote: Counting objects: 100% (3/3), done.
remote: Total 3 (delta 0), reused 0 (delta 0), pack-reused 0 (from 0)
Receiving objects: 100% (3/3), done.
```

```
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>나의 첫 번째 웹 페이지</title>
</head>
<body>
    <h1>안녕하세요! GoodSame2에 오신 것을 환영합니다.</h1>
    <p>이 페이지는 Git Bash를 사용하여 생성한 간단한 HTML 페이지입니다.</p>
</body>
</html>

```

```
$ git add .
$ git commit -m "init commit"
$ git push origin main
Enumerating objects: 4, done.
Counting objects: 100% (4/4), done.
Delta compression using up to 3 threads
Compressing objects: 100% (3/3), done.
Writing objects: 100% (3/3), 582 bytes | 582.00 KiB/s, done.
Total 3 (delta 0), reused 0 (delta 0), pack-reused 0 (from 0)
To github.com:goodsame2/goodsame2.github.io.git
   ac7ef11..6a721f7  main -> main
```

![](/images/lefyvl.jpg)