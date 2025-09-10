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
