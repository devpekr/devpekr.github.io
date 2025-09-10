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
