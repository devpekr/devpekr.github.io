import os
import warnings

import httpx
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

warnings.simplefilter("ignore")
client = httpx.Client(verify=False, timeout=30)

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

gpt = ChatOpenAI(
    model="gemini-1.5-flash",
    temperature=0,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
    api_key=api_key,
    http_client=client,
)
msg = ''' 유지보수가 용이하게 아래코드를 리팩토링해줘 공통으로 사용되는 부분은 모듈로 따로 빼주고
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
import warnings
import httpx
import os
from dotenv import load_dotenv
warnings.simplefilter("ignore")
client = httpx.Client(verify=False, timeout=30)

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

template = "{question}(500글자 이내로 답변)"
prompt = PromptTemplate.from_template(template=template)

gpt = ChatOpenAI(
    model="gemini-1.5-flash",
    temperature=0,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
    api_key=api_key,
    http_client=client,
)

final_prompt = prompt.format(question="gemini api 는 무엇인가?")
response = gpt.invoke(final_prompt)

print(response.content)
'''
response = gpt.invoke(msg)

print(response.content)
