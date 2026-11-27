### 오라클 클라우드에 오라클 자율운영 데이터 베이스 생성

- 오라클에 로그인후 > Oracle Database > 자율운영 데이터베이스 메뉴클릭

- 표시이름 입력 > 데이터베이스 이름 입력 > 트랜잭션 처리 선택

- 데이터베이스 구성 : 항상 무료 > 데이터베이스 버전 : 19c

- 비밀번호 입력 후 생성 버튼 클릭

- 데이터 베이스 생성이 완료되면 데이터 베이스 접속 버튼을 클릭한다.

- 전자 지갑 유형 > 인스턴스 전자 지갑 선택후 전자지갑 다운로드 버튼을 클릭한다.

- 비밀번호를 입력하고 다운로드 버튼을 클릭한다.

- 전자지갑을 다운로받았음

- 오라클 db 접속을 위해 아래 사이트에 접속한다.

https://www.oracle.com/database/sqldeveloper/technologies/download/

- Windows 64bit with JDK 17 included 버전을 다운로드한다.

- 압축을 풀고 sqldevloper 아이콘을 클릭하여 실행한다.

- 데이터 연결버튼(+)을 클릭하여 새연결 생성 /  name goodsaem / 사용자 이름 : admin 고정 / 비밀번호 : 생성시등록한 비밀번호를 입력 / 접속유형을 클라우드전자 지갑 선택 / 구성파일을 다운로드 받은 압축파일 선택 테스트 및 접속

- 테이블을 생성하고 데이터를 넣고 데이터가 잘 나오는지 확인한다.

```sql
create table test (
   name varchar2(100),
   email varchar2(100)
);

insert into test (name , email) values ('aaa','bbb@co.kr');

commit;

select * from test;
```

- 테이블 생성 및 데이터 insert select 테스트 성공

