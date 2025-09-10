from config import GOOGLE_API_KEY, API_BASE_URL
from gpt_client import GPTClient

if __name__ == "__main__":
    gpt_client = GPTClient(api_key=GOOGLE_API_KEY, base_url=API_BASE_URL)
    response = gpt_client.invoke("넌 기상리포트야 오늘날짜가 언제인지 말하고 오늘 서울 날씨가 어떻게 되는지 아나운서 어조로 알려주고 옷차림에 대해서도 알려줘")
    if response:
        print(response)