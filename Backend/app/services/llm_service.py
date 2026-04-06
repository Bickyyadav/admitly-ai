from litellm import completion

import os
import sys
import json
import re

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


def _extract_json_object(raw: str) -> dict:
    """Extract and parse a JSON object from LLM output, even if surrounded by reasoning text."""
    # Step 1: Remove markdown code fences
    cleaned = re.sub(r'```(?:json)?\s*', '', raw)
    cleaned = re.sub(r'```', '', cleaned)
    cleaned = cleaned.strip()

    # Step 2: Try direct parse first (fastest path)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Step 3: Find the first '{' and match its closing '}' using brace counting
    start = cleaned.find('{')
    if start == -1:
        raise json.JSONDecodeError("No JSON object found in LLM output", cleaned, 0)

    depth = 0
    in_string = False
    escape_next = False
    for i in range(start, len(cleaned)):
        ch = cleaned[i]
        if escape_next:
            escape_next = False
            continue
        if ch == '\\' and in_string:
            escape_next = True
            continue
        if ch == '"' and not escape_next:
            in_string = not in_string
            continue
        if in_string:
            continue
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                json_str = cleaned[start:i + 1]
                return json.loads(json_str)

    raise json.JSONDecodeError("Unmatched braces in LLM output", cleaned, start)


def _call_llm(messages: list, attempt: int = 1) -> str | None:
    """Call the LLM and return raw content string, or None."""
    response = completion(
        model="fireworks_ai/accounts/fireworks/models/qwen3p6-plus",
        api_key=os.getenv("FIRE_WORKS_API_KEY"),
        messages=messages,
        max_tokens=500,
        temperature=0.2,
        response_format={"type": "json_object"},
    )
    content = response.choices[0].message.content
    print(f"LLM attempt {attempt} raw (first 500 chars): {content[:500] if content else 'None'}")
    return content


def analyze_conversation(transcript: str) -> AnalystResult | None:
    content = None
    for attempt in range(1, 3):  # max 2 attempts
        try:
            if attempt == 1:
                messages = [
                    {"content": get_prompt(), "role": "system"},
                    {"content": transcript, "role": "user"},
                ]
            else:
                # Retry with a very forceful JSON-only prompt
                messages = [
                    {
                        "content": (
                            "You are a JSON-only API. You MUST respond with a single valid JSON object and NOTHING else. "
                            "No thinking, no analysis, no explanation — ONLY the JSON object.\n\n"
                            + get_prompt()
                        ),
                        "role": "system",
                    },
                    {
                        "content": f"Respond ONLY with the JSON object. Here is the transcript:\n\n{transcript}",
                        "role": "user",
                    },
                ]

            content = _call_llm(messages, attempt)

            if not content:
                print(f"Error: LLM returned empty content on attempt {attempt}")
                continue

            # Strip <think>...</think> blocks if present (Qwen thinking mode)
            content = re.sub(r'<think>.*?</think>', '', content, flags=re.DOTALL).strip()

            parsed = _extract_json_object(content)
            return AnalystResult(**parsed)

        except json.JSONDecodeError as e:
            print(f"JSON parse error on attempt {attempt}: {e}")
            print(f"Raw content was: {content[:1000] if content else 'None'}")
            if attempt < 2:
                print("Retrying with forceful JSON-only prompt...")
                continue
            return None
        except Exception as e:
            print(f"Error during LLM analysis attempt {attempt}: {e}")
            if attempt < 2:
                continue
            return None

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