import os
import concurrent.futures
from google import genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

# Initialize Gemini client
genai_client = genai.Client(api_key=api_key)
model = "gemini-2.0-flash"


def format_journal_content(content: str) -> str:
    """Format the journal entry content."""
    response = genai_client.models.generate_content(
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
    return response.text.strip()


def extract_activities(content: str) -> str:
    """Extract activities from the journal entry content."""
    response = genai_client.models.generate_content(
        model=model,
        contents=f"""This is a journal entry. \n\n{content}.
        Extract up to 10 activities mentioned in the text.
        Return them in a single line, separated by commas only.
        Do not include any list formatting, quotes, or explanations.
        Example output: activity 1, activity 2, activity 3"""
    )
    return response.text.strip()


def extract_sentiments(content: str) -> str:
    """Extract sentiments from the journal entry content."""
    response = genai_client.models.generate_content(
        model=model,
        contents=f"""This is a journal entry. \n\n{content}.
        Extract up to 6 key emotions or feelings expressed in the text.
        Use precise and descriptive words (e.g., excited, calm,
        frustrated, hopeful) that clearly reflect the tone or mood.
        Return them in a single line, separated by commas only.
        Do not include any list formatting, quotes, or explanations.
        Example output: excited, calm, frustrated"""
    )
    return response.text.strip()


def extract_goals(content: str, goals: str) -> str:
    """Extract goals from the journal entry content."""
    response = genai_client.models.generate_content(
        model=model,
        contents=f"""This is a journal entry. \n{content}\n.
        Here is the list of goals (each with an ID and description):
        \n{goals}\n
        Based on the entry, list the relevant goal IDs as a
        comma-separated list of numbers.
        Do not include any list formatting, quotes, or explanations.
        Example output: 1, 3, 5"""
    )
    # Convert the response text to a list of integers
    return [int(x.strip()) for x in response.text.split(",")]


def analyze_entry(content: str, goals: str) -> tuple:
    """Analyze the journal entry content using concurrent tasks.
    This means that the tasks will run in parallel."""
    with concurrent.futures.ThreadPoolExecutor() as executor:
        f1 = executor.submit(format_journal_content, content)
        f2 = executor.submit(extract_activities, content)
        f3 = executor.submit(extract_sentiments, content)
        f4 = executor.submit(extract_goals, content, goals)
        return f1.result(), f2.result(), f3.result(), f4.result()
