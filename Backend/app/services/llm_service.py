from litellm import completion

import os
import sys
import json

# Add project root to sys.path so we can import from prompt
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from dotenv import load_dotenv
from prompt.quality_prompt import get_prompt
from pydantic import BaseModel

load_dotenv()

from typing import List

class SummaryMessage(BaseModel):
    role: str
    content: str

class AnalystResult(BaseModel):
    summary: List[SummaryMessage]
    quality_score: float
    intent: str
    outcome: str



def analyze_conversation(transcript: str) -> AnalystResult | None:
    try:
        response = completion(
            model="fireworks_ai/qwen3-reranker-8b", 
            api_key=os.getenv("FIRE_WORKS_API_KEY"),
            messages=[
                {"content": get_prompt(), "role": "system"},
                {"content": json.dumps(transcript), "role": "user"},
            ],
            response_format=AnalystResult,
        )
        print("🤷‍♀️🤷‍♀️🤷‍♀️🤷‍♀️🤷‍♀️")
        print(response)
        content = response.choices[0].message.content
        if isinstance(content, str):
            return AnalystResult(**json.loads(content))
        return None
    except Exception as e:
        print(f"Error during LLM analysis: {e}")
        return None

if __name__ == "__main__":
    conversation = """
    {
      "conversation": [
        {
          "role": "counselor",
          "message": "Hello! Thank you for contacting EduCare Consultancy. My name is Anita. How can I help you today?"
        },
        {
          "role": "student",
          "message": "Hi ma’am, I recently passed my 12th and I want to study for a bachelor’s degree in India, but I’m confused about what to choose."
        }
      ]
    }
    """
    res = analyze_conversation(conversation)
    print(res)