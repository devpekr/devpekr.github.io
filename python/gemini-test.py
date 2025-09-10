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

# 프롬프트 템플릿
template = "{question} (500글자 이내로 답변)"
prompt = PromptTemplate.from_template(template=template)

# Gemini(OpenAI 호환) Chat 모델 연결
gpt = ChatOpenAI(
    model="gemini-1.5-flash",   # 사용할 Gemini 모델명
    temperature=0,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
    api_key=api_key,
    http_client=client,
)

# 프롬프트 적용
final_prompt = prompt.format(question="컴퓨터란 무엇인가?")
response = gpt.invoke(final_prompt)

print(response.content)
