---
title: 공공데이터 휴일 기념이 정보받기 with springboot  
date: 2025-07-06 18:28:07
tags: [Blog]
categories: [Blog]
toc: true
---

## 사용한 공공데이터

한국천문연구원_특일 정보

https://www.data.go.kr/tcs/dss/selectApiDataDetailView.do?publicDataPk=15012690

![](../../images/zodpl9.jpg)

## api 정보

![](../../images/imj6qv.jpg)

- 요청변수/출력결과는 아래와 같다.

![](../../images/vgxdc3.jpg)


## 기념일(ANNIVERSARY) : getAnniversaryInfo
```json
{
  "response": {
    "header": {
      "resultCode": "00",
      "resultMsg": "NORMAL SERVICE."
    },
    "body": {
      "items": {
        "item": [
          {
            "dateKind": "02",
            "dateName": "국군의 날",
            "isHoliday": "N",
            "locdate": 20251001,
            "seq": 1
          },
          {
            "dateKind": "02",
            "dateName": "노인의 날",
            "isHoliday": "N",
            "locdate": 20251002,
            "seq": 1
          },
          {
            "dateKind": "02",
            "dateName": "세계 한인의 날",
            "isHoliday": "N",
            "locdate": 20251005,
            "seq": 2
          },
          {
            "dateKind": "02",
            "dateName": "재향군인의 날",
            "isHoliday": "N",
            "locdate": 20251008,
            "seq": 3
          },
          {
            "dateKind": "02",
            "dateName": "임산부의 날",
            "isHoliday": "N",
            "locdate": 20251010,
            "seq": 1
          },
          {
            "dateKind": "02",
            "dateName": "정신건강의 날",
            "isHoliday": "N",
            "locdate": 20251010,
            "seq": 2
          },
          {
            "dateKind": "02",
            "dateName": "스포츠의 날",
            "isHoliday": "N",
            "locdate": 20251015,
            "seq": 1
          },
          {
            "dateKind": "02",
            "dateName": "부마민주항쟁 기념일",
            "isHoliday": "N",
            "locdate": 20251016,
            "seq": 1
          },
          {
            "dateKind": "02",
            "dateName": "문화의 날",
            "isHoliday": "N",
            "locdate": 20251018,
            "seq": 1
          },
          {
            "dateKind": "02",
            "dateName": "경찰의 날",
            "isHoliday": "N",
            "locdate": 20251021,
            "seq": 1
          }
        ]
      },
      "numOfRows": 10,
      "pageNo": 1,
      "totalCount": 14
    }
  }
}
```
## 공휴일(REST) : getRestDeInfo
```json
{
  "response": {
    "header": {
      "resultCode": "00",
      "resultMsg": "NORMAL SERVICE."
    },
    "body": {
      "items": {
        "item": [
          {
            "dateKind": "01",
            "dateName": "개천절",
            "isHoliday": "Y",
            "locdate": 20251003,
            "seq": 1
          },
          {
            "dateKind": "01",
            "dateName": "추석",
            "isHoliday": "Y",
            "locdate": 20251005,
            "seq": 1
          },
          {
            "dateKind": "01",
            "dateName": "추석",
            "isHoliday": "Y",
            "locdate": 20251006,
            "seq": 1
          },
          {
            "dateKind": "01",
            "dateName": "추석",
            "isHoliday": "Y",
            "locdate": 20251007,
            "seq": 1
          },
          {
            "dateKind": "01",
            "dateName": "대체공휴일",
            "isHoliday": "Y",
            "locdate": 20251008,
            "seq": 1
          },
          {
            "dateKind": "01",
            "dateName": "한글날",
            "isHoliday": "Y",
            "locdate": 20251009,
            "seq": 1
          }
        ]
      },
      "numOfRows": 10,
      "pageNo": 1,
      "totalCount": 6
    }
  }
}
```
## 국경일(HOLI) : getHoliDeInfo
```json
{
  "response": {
    "header": {
      "resultCode": "00",
      "resultMsg": "NORMAL SERVICE."
    },
    "body": {
      "items": {
        "item": [
          {
            "dateKind": "01",
            "dateName": "개천절",
            "isHoliday": "Y",
            "locdate": 20251003,
            "seq": 1
          },
          {
            "dateKind": "01",
            "dateName": "추석",
            "isHoliday": "Y",
            "locdate": 20251005,
            "seq": 1
          },
          {
            "dateKind": "01",
            "dateName": "추석",
            "isHoliday": "Y",
            "locdate": 20251006,
            "seq": 1
          },
          {
            "dateKind": "01",
            "dateName": "추석",
            "isHoliday": "Y",
            "locdate": 20251007,
            "seq": 1
          },
          {
            "dateKind": "01",
            "dateName": "대체공휴일",
            "isHoliday": "Y",
            "locdate": 20251008,
            "seq": 1
          },
          {
            "dateKind": "01",
            "dateName": "한글날",
            "isHoliday": "Y",
            "locdate": 20251009,
            "seq": 1
          }
        ]
      },
      "numOfRows": 10,
      "pageNo": 1,
      "totalCount": 6
    }
  }
}
```
## 24절기(DIVISIONS) : get24DivisionsInfo
```json
{
  "response": {
    "header": {
      "resultCode": "00",
      "resultMsg": "NORMAL SERVICE."
    },
    "body": {
      "items": {
        "item": [
          {
            "dateKind": "03",
            "dateName": "한로",
            "isHoliday": "N",
            "kst": "0941      ",
            "locdate": 20251008,
            "seq": 2
          },
          {
            "dateKind": "03",
            "dateName": "상강",
            "isHoliday": "N",
            "kst": "1251      ",
            "locdate": 20251023,
            "seq": 1
          }
        ]
      },
      "numOfRows": 10,
      "pageNo": 1,
      "totalCount": 2
    }
  }
}
```
## 잡절(SUNDRY) : getSundryDayInfo
```json
{
  "response": {
    "header": {
      "resultCode": "00",
      "resultMsg": "NORMAL SERVICE."
    },
    "body": {
      "items": {
        "item": {
          "dateKind": "04",
          "dateName": "한식",
          "isHoliday": "N",
          "locdate": 20250405,
          "seq": 2
        }
      },
      "numOfRows": 10,
      "pageNo": 1,
      "totalCount": 1
    }
  }
}
```

## 전체 데이터 베이스 생성