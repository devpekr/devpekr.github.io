### Github SSH 연결방법

**git-scm은 설치되어 있어야 아래 내용 실행가능함**  

GitHub 로그인을 ssh 로 설정하면 매번 로그인 할 필요없이 편하게 source 를 commit 하고 push 할수 있다.  
GitHub SSH 설정하는 방법에 대해 windows 기준으로 정리함 (**※ git은 설치되어 있어야 함**)  
**SSH 키 생성 후 생성된 키를 클립보드에 복사**  

---
- Git Bash 창 실행
   
- ssh-keygen 명령어 실행
```bash
ssh-keygen -t rsa -b 2048 -f ~/.ssh/goodsame2.github.io_key
```
- 기본값설정을 위해 엔터 엔터를 입력
- 아래와 같이 goodsame2.github.io_key 와 goodsame2.github.io_key.pub 가 만들어진걸 확인할수 있다.
   
- 아래 명령어를 입력하여 출력된 내용을 복사
```
cat ~/.ssh/goodsame2.github.io_key.pub
```

**github ssh 키 등록**
깃허브에 SSH 공개키 등록을 위해 깃허브 홈페이지에 로그인을 진행하고 아래 순서되로 키를 생성
1. 프로파일 아이콘클릭
2. Settings 아이콘을 클릭
3. SSH and GPG key 클릭
4. title에  goodsame2.github.io_pub 입력
5. Key 에 복사한 내용 붙여넣기
6. Add deploy key 아이콘 클릭
   

- 테스트를 위해 이름 및 이메일 주소를 등록한다.
```
git config --global user.name "goodsame2"
git config --global user.email "goodsame2@proton.me"
```

- github 접속을 위해 ssh 에이전트에 개인키를 등록한다.

- 터미널에서 다음 명령어를 입력해서 ssh-agent를 실행
```
eval "$(ssh-agent -s)"
```

- ssh-agent가 실행된 상태에서 다시 키 추가:
```
ssh-add ~/.ssh/goodsame2.github.io_key
```
- 성공
```
Identity added: /c/Users/Administrator/.ssh/goodsame2.github.io_key (Administrator@WIN-DBSA6V6A1MT)
```

- 테스트 (Git Bash로 테스트 할것)
- 소스복제 (git clone)
  
```
$ git clone git@github.com:goodsame2/goodsame2.github.io.git
```
- 소스복제가 끝나면 아래와 같은 메시지를 볼수 있다.
```
Cloning into 'goodsame2.github.io'...
The authenticity of host 'github.com (20.200.245.247)' can't be established.
ED25519 key fingerprint is SHA256:+xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added 'github.com' (ED25519) to the list of known hosts.
remote: Enumerating objects: 3, done.
remote: Counting objects: 100% (3/3), done.
remote: Total 3 (delta 0), reused 0 (delta 0), pack-reused 0 (from 0)
Receiving objects: 100% (3/3), done.
```

- 복제된 디렉토리로 이동한후 아래와 같이 index.html을  작성한다.
```html html
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

- 작성 된 내용을 git에 추가한다.
```
$ git add .
```

- commit 수횅
```
$ git commit -m "init commit"
```
- push 수행
```
$ git push origin main
```
- 아래와 같이 push가 완료됨
```
Enumerating objects: 4, done.
Counting objects: 100% (4/4), done.
Delta compression using up to 3 threads
Compressing objects: 100% (3/3), done.
Writing objects: 100% (3/3), 582 bytes | 582.00 KiB/s, done.
Total 3 (delta 0), reused 0 (delta 0), pack-reused 0 (from 0)
To github.com:goodsame2/goodsame2.github.io.git
   ac7ef11..6a721f7  main -> main
```
- https://goodsame2.github.io/ 사이트 접속해서 아래와 같은 화면이 나오면 완료
