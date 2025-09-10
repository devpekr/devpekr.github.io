---
title: Gemini API - 3. 모듈화
date: 2025-09-10 23:56:27
tags: [Gemini]
categories: [Gemini]
---

![](../images/free-icon-3d-cube-4002027.png)

{% callout type:"info" title:"모듈화" %}
중복코드 제거를 위해 공통적으로 쓰는 부분은 모듈화 부터 진행하고 예제를 만들어갈 예정임
{% endcallout %}

# config.py
반복적으로 입력되는 api 키 분리
```python
import os
from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY is None:
    raise ValueError("GOOGLE_API_KEY environment variable not set.")

API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"
```
# gpt_client.py
모델을 선택하고 모델의 api base url 설정한다.
```python
import httpx
from langchain_openai import ChatOpenAI


class GPTClient:
    def __init__(self, api_key, base_url, model="gemini-1.5-flash", temperature=0):
        self.client = httpx.Client(verify=False, timeout=30)  # Consider using verify=True for production
        self.gpt = ChatOpenAI(
            model=model,
            temperature=temperature,
            base_url=base_url,
            api_key=api_key,
            http_client=self.client,
        )

    def invoke(self, prompt):
        try:
            response = self.gpt.invoke(prompt)
            return response.content
        except httpx.HTTPError as e:
            print(f"HTTP Error: {e}")
            return None
        except Exception as e:
            print(f"An error occurred: {e}")
            return None
```
# prompt_templates.py
프롬프트 템플릿
```python
from langchain.prompts import PromptTemplate

def create_short_answer_prompt(question):
    template = "{question}(500글자 이내로 답변)"
    prompt = PromptTemplate.from_template(template=template)
    return prompt.format(question=question)
```

# 101.py
첫번째 예제 : 코드가 간결해지고 유지보수 용이하게 변경됨

## 코드
```python
from config import GOOGLE_API_KEY, API_BASE_URL
from gpt_client import GPTClient
from prompt_templates import create_short_answer_prompt

if __name__ == "__main__":
    gpt_client = GPTClient(api_key=GOOGLE_API_KEY, base_url=API_BASE_URL)
    prompt = create_short_answer_prompt("gemini api 는 무엇인가?")
    response = gpt_client.invoke(prompt)
    if response:
        print(response)
```

## 실행결과
Gemini API는 구글에서 개발한 대규모 언어 모델(LLM)인 Gemini를 프로그래밍 방식으로 활용할 수 있도록 제공하는 인터페이스입니다.  다양한 작업을 수행할 수 있도록 설계되었으며, 텍스트 생성, 번역, 질문 응답, 코드 생성 등의 기능을 제공합니다.  개발자는 이 API를 사용하여 자체 애플리케이션이나 서비스에 Gemini의 강력한 기능을 통합할 수 있습니다.

Gemini API는 여러 가지 모델 크기와 기능을 제공하여 다양한 요구 사항을 충족합니다.  작은 모델은 속도와 효율성을 중시하는 애플리케이션에 적합하며, 큰 모델은 더욱 정교하고 복잡한 작업에 적합합니다.  또한, API는 다양한 프로그래밍 언어를 지원하여 개발자의 편의성을 높입니다.

Gemini API를 사용하면 다음과 같은 작업이 가능합니다.

* **텍스트 생성:**  이야기, 코드, 이메일, 기타 텍스트 형식을 생성합니다.
* **번역:**  한 언어에서 다른 언어로 텍스트를 번역합니다.
* **질문 응답:**  질문에 대한 답변을 생성합니다.
* **요약:**  긴 텍스트를 요약합니다.
* **분류:**  텍스트를 다양한 범주로 분류합니다.
* **코드 생성:**  프로그래밍 코드를 생성합니다.

Gemini API는 구글 클라우드 플랫폼을 통해 제공되며, 사용량에 따라 비용이 청구됩니다.  개발자는 API 문서와 다양한 예제 코드를 통해 Gemini API를 쉽게 학습하고 사용할 수 있습니다.  하지만, 다른 LLM API와 마찬가지로,  출력 결과의 정확성과 윤리적인 측면을 항상 고려해야 합니다.