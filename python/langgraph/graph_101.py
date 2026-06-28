from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages([
    ("system", "당신은 반도체 defect 분석 전문가 이다."),
    ("user", "{input}")
])

messages = prompt.invoke({"input" : "안녕하세요!"})
print("생성된 프롬프트")

for msg in messages.to_messages():
    print(f" [{msg.type}] {msg.text}")