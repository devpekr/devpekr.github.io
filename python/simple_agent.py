import os
from typing import Annotated
from typing_extensions import TypedDict
from dotenv import load_dotenv
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langchain_google_genai import ChatGoogleGenerativeAI

# .env 파일 로드 (OpenAI 및 Google API 키 등 설정)
load_dotenv()

# 1. State(상태) 정의
class State(TypedDict):
    # add_messages는 새로운 메시지 객체를 기존 메시지 리스트에 누적(append)해주는 리듀서입니다.
    messages: Annotated[list, add_messages]

# 2. Graph 빌더 생성
graph_builder = StateGraph(State)

# 3. LLM 선언 및 챗봇 노드(Node) 함수 정의
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)

def chatbot(state: State):
    # 현재 상태에 축적된 메시지들을 전달해 LLM을 호출하고, 결과를 반환합니다.
    response = llm.invoke(state["messages"])
    return {"messages": [response]}

# 그래프 빌더에 노드 등록
graph_builder.add_node("chatbot", chatbot)

# 4. 흐름(Edge) 정의
# START에서 출발하여 chatbot 노드로 향하고, chatbot 노드가 끝나면 END(종료)로 향합니다.
graph_builder.add_edge(START, "chatbot")
graph_builder.add_edge("chatbot", END)

# 5. 그래프 컴파일
graph = graph_builder.compile()
print("[OK] 그래프 컴파일 완료!")


# 스트리밍 실행 예제
initial_input = {"messages": [("user", "안녕하세요! LangGraph의 핵심 특징 3가지만 알려주세요.")]}

events = graph.stream(initial_input)
for event in events:
    for value in event.values():
        print("\n[Assistant]")
        print(value["messages"][-1].content)


from IPython.display import Image, display

try:
    # Mermaid.js API를 통해 그래프 구조를 PNG 이미지로 생성 및 출력합니다.
    png_data = graph.get_graph().draw_mermaid_png()
    with open("graph_structure.png", "wb") as f:
        f.write(png_data)
    print("[OK] 그래프 구조를 'graph_structure.png'로 저장했습니다.")
except Exception as e:
    print("시각화 도구 실행 실패:", e)