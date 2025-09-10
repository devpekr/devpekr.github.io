from langchain.prompts import PromptTemplate

def create_short_answer_prompt(question):
    template = "{question}(500글자 이내로 답변)"
    prompt = PromptTemplate.from_template(template=template)
    return prompt.format(question=question)