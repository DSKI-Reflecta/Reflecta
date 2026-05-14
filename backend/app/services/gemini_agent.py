import os
from google import genai
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# get the API key from the environment
api_key = os.getenv("GEMINI_API_KEY")


def format_journal_content(content: str) -> str:
    """Formatting logic or AI integration with Google Gemini"""
    client = genai.Client(api_key=api_key)
    model = "gemini-2.0-flash"

    response = client.models.generate_content(
        model=model,
        contents=f"""This is a journal entry. \n\n{content}.
        Format the journal entry by adding clear section headers for
        different times of day (e.g., Morning, Afternoon, Evening).
        Include a few relevant emojis to enhance readability,
        but keep it subtle. Maintain the original personal writing style
        and tone, while correcting any unclear phrasing or language mistakes.
        Return only the formatted journal content itself,
        without any extra explanations or commentary.""",
    )

    return response.text
