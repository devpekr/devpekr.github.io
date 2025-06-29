### 오라클 클라우드 인스턴스생성
![](../../images/lpr71t.jpg)

- 오라클 클라우드 인스턴스 생성하는 방법에 대해서 정리함

- 접속주소
https://cloud.oracle.com/

- 이름은 내가 알아보기 쉽게 수정한다.

![](../../images/cr0xgy.jpg)

- 이미지 변경 버튼을 클릭하여 Ubuntu 를 선택한다.

![](../../images/yxyoel.jpg)

- 아래로 스크롤을 내려 버전을 24.04 버전을 선택하고 이미지 선택 버튼을 클릭한다.

![](../../images/ileoxm.jpg)

- 보안 다음

![](../../images/caicpt.jpg)

- 네트워킹 에서 새 가상 클라우드 네트워크 생성 및 새 퍼블릭 서브넷 생성 을 선택한다.

![](../../images/ma5zap.jpg)

- 나머지는 그대로 두로 ssh 부분에 프라이빗 키 다운로드 버튼을 클릭하여 키를 다운로드 하고 다음 버튼을 클릭한다.

![](../../images/uaft90.jpg)

- 스토리지는 기본값으로 해놓은 상태에서 다음

![](../../images/qn0is2.jpg)

- 예상 비용은 있지만 청구되는 금액이 아님

![](../../images/t7lc7k.jpg)

- 생성 버튼을 클릭하여 생성한다.

![](../../images/jvmtz7.jpg)

- 아래와 같이 만들어 지고 있다.

![](../../images/gdiuq0.jpg)

#### 고정 아이피 설정

- 인스턴스 이름을 클릭한다.

![](../../images/eea3ne.jpg)

- 네트워킹 아래에 연결된 vnic 쪽에서 이름을 클릭한다.

![](../../images/dioqtj.jpg)

- IP 관리 탭을 클릭한다 ipv4 주소 에서 ... 을 클릭하여 편집 메뉴를 클릭한다.

![](../../images/ythjnm.jpg)

- 퍼블릭 ip 없음을 선태학고 업데이트 버튼을 클릭한다.

![](../../images/di7p5p.jpg)

- 다시 편집을 클릭한다.

![](../../images/vf2ywc.jpg)

- 예약된 퍼블릭 ip /새 예약된 ip 주소 생성 / 퍼블릭 ip 이름은 적당한 이름(goodsame-public-ip)으로 / Oralce을 선택 / 업데이트 버튼을 클릭한다.

![](../../images/cscaw4.jpg)

- 여기까지 설정하면 고정아이피 셋업이 완료됨

![](../../images/xwsjeh.jpg)