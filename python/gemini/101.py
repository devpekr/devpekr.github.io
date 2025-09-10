from config import GOOGLE_API_KEY, API_BASE_URL
from gpt_client import GPTClient
from prompt_templates import create_short_answer_prompt

if __name__ == "__main__":
    gpt_client = GPTClient(api_key=GOOGLE_API_KEY, base_url=API_BASE_URL)
    prompt = create_short_answer_prompt("gemini api 는 무엇인가?")
    response = gpt_client.invoke(prompt)
    if response:
        print(response)