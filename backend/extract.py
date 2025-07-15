import ollama
import json
from datetime import datetime

def extract_tasks(transcript):
    prompt = f"""
You are an AI assistant helping to extract tasks from meeting transcripts. Return ONLY valid JSON. Do NOT include any extra explanation.

Format:
[
  {{
    "task": "Short task title",
    "description": "Brief description of the task",
    "urgency": "high, medium, or low",
    "skills": ["skill1", "skill2", ...],
    "deadline": "YYYY-MM-DD (e.g., 2025-08-05). If a relative deadline is mentioned (e.g., '3 weeks from now'), calculate the exact date assuming today's date is {datetime.today().strftime('%Y-%m-%d')}"
  }},
  ...
]

Transcript:
\"\"\"
{transcript}
\"\"\"
"""

    response = ollama.chat(
        model='mistral',
        messages=[{"role": "user", "content": prompt}]
    )

    content = response['message']['content']

    try:
        # Try parsing the model output as JSON
        tasks = json.loads(content)
        return tasks
    except json.JSONDecodeError:
        print("⚠️ Model response is not valid JSON. Here's what was returned:")
        print(content)
        return []
