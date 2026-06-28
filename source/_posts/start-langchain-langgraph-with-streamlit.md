---
title: LangChain & LangGraph 공부 시작하기: 버전 확인부터 Streamlit 챗봇 UI 뼈대 만들기
date: 2026-06-28 21:26:00
tags: [LangChain, LangGraph, Streamlit, Python, AIAgent]
categories: [Coding, Python]
toc: true
---

# LangChain & LangGraph 공부 시작하기: 버전 확인부터 Streamlit 챗봇 UI 뼈대 만들기

최근 LLM(대형 언어 모델)을 기반으로 스스로 판단하고 동작하는 **AI 에이전트(AI Agent)** 개발에 대한 관심이 뜨겁습니다. 그중에서도 LangChain 생태계의 **LangGraph**는 순환(Cyclic) 그래프 구조를 지원하여 강력하고 정교한 에이전트 시스템을 구축할 수 있게 도와줍니다.

이번 포스팅에서는 LangChain과 LangGraph 개발 및 실습을 본격적으로 시작하기에 앞서, 필수 개발 환경 검증부터 기초 프롬프트 테스트, 그리고 대화형 프로토타입을 만들기 위한 **Streamlit 기반 Chat UI 뼈대 구축**까지 하나씩 살펴보겠습니다.

---

## 1. 1단계: 패키지 설치 확인 (`check_version.py`)

LangChain과 LangGraph는 업데이트 주기가 매우 빠른 라이브러리입니다. 프로젝트를 시작하기 전에 버전을 명확히 파악하고 실행 환경을 검증하는 것이 좋습니다. 파이썬 내장 `importlib.metadata` 모듈을 이용하면 패키지를 직접 import하지 않고도 버전을 손쉽게 출력할 수 있습니다.

```python
from importlib.metadata import version

print(f"LangChain version: {version('langchain')}")
print(f"LangGraph version: {version('langgraph')}")
```

* **핵심 포인트**: `version()` 함수는 현재 환경에 설치된 해당 패키지의 정확한 버전 스트링을 반환합니다. 의존성 충돌이나 특정 버전에서만 제공되는 기능을 디버깅할 때 유용하게 쓰입니다.

---

## 2. 2단계: 프롬프트 템플릿 기초 테스트 (`graph_101.py`)

LLM이 우리의 의도대로 동작하기 위해서는 페르소나(역할)와 입력 구조를 정형화하는 **프롬프트 템플릿** 설계가 중요합니다. LangChain에서 제공하는 `ChatPromptTemplate`을 활용해 시스템 메시지와 사용자 입력을 구성하는 방법을 맛보겠습니다.

```python
from langchain_core.prompts import ChatPromptTemplate

# System 메시지와 User 메시지의 페어 구조 템플릿 정의
prompt = ChatPromptTemplate.from_messages([
    ("system", "당신은 반도체 defect 분석 전문가 이다."),
    ("user", "{input}")
])

# 입력을 템플릿에 주입하여 실행 객체 생성
messages = prompt.invoke({"input" : "안녕하세요!"})
print("생성된 프롬프트")

# 파싱 결과 확인
for msg in messages.to_messages():
    print(f" [{msg.type}] {msg.text}")
```

* **`ChatPromptTemplate.from_messages`**: 튜플 형식 `(role, message)`의 리스트를 전달받아 대화용 프롬프트를 구성합니다.
* **`prompt.invoke(...)`**: 템플릿 변수인 `{input}`에 실제 유저의 입력값을 대입하여 완성된 프롬프트 데이터를 빌드합니다.
* **`msg.type` & `msg.text`**: 생성된 메시지가 `system` 유형인지 `user` 유형인지, 어떤 텍스트를 담고 있는지 가시화하여 LLM으로 넘기기 직전의 상태를 확인합니다.

---

## 3. 3단계: Streamlit으로 챗봇 UI 뼈대 잡기 (`graph_102.py`)

로직이 터미널에서만 돌면 실제 사용자가 사용해보기 어렵습니다. 파이썬 환경에서 가장 빠르고 직관적으로 웹 GUI 프로토타입을 제작할 수 있는 **Streamlit** 라이브러리를 이용하여 대화창 UI 뼈대를 설계해보겠습니다.

```python
import streamlit as st

# 페이지 구성 설정
st.set_page_config(
    page_title="ai agent",
    page_icon="😉",
    layout="centered"
)

st.header("😉 AI Agent")

# 세션 상태(Session State)에 대화 이력 배열 초기화 및 보관
if "messages" not in st.session_state:
    st.session_state.messages = []

# 기존 대화 이력이 있다면 순차적으로 화면에 렌더링
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# 사용자로부터 실시간 채팅 입력 받기
if prompt := st.chat_input("메시지를 입력하세요."):
    # 1. 유저 메시지 저장 및 화면 출력
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # 2. 어시스턴트(봇) 응답 처리 (여기서는 단순 에코 응답)
    response = f"입력하신 메시지: {prompt}"
    st.session_state.messages.append({"role": "assistant", "content": response})
    with st.chat_message("assistant"):
        st.markdown(response)
```

* **`st.session_state`**: 웹 브라우저의 특성상 페이지가 리프레시되거나 새로운 입력이 가해지면 파이썬 변수가 초기화되는데, 이 문제를 해결하고 대화 내역(`messages`)을 지속해서 유지하기 위해 사용합니다.
* **`st.chat_input`**: 세련된 고정형 채팅 입력창 위젯을 생성하고 사용자의 텍스트 입력을 감지합니다.
* **`st.chat_message`**: `user`와 `assistant` 역할을 기반으로 한 채팅 말풍선 레이아웃을 제공하여 별도의 CSS 스타일링 없이도 완성도 높은 챗봇 UI를 연출합니다.

---

## 4. 마치며

이번 포스팅에서는 LangChain/LangGraph 에이전트와 결합할 **웹 GUI 뼈대**와 **프롬프트 기본 테스트**를 완료했습니다. 현재 단계는 사용자가 입력한 내용을 단순히 에코(Echo) 방식으로 보여주는 프로토타입에 가깝습니다.

다음 포스팅에서는 이 Streamlit UI 코드 위에 실제 LangGraph로 구축한 **추론 루프(Reasoning Loop)**와 에이전트 로직을 이식하여, 스스로 도구를 사용하고 깊이 있게 분석하는 진짜 AI 에이전트를 완성해보겠습니다.
