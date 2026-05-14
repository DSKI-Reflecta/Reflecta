import os
import json
import re
import time
import logging
from typing import Optional, Type

from dotenv import load_dotenv
from openai import OpenAI, RateLimitError, APIStatusError
from pydantic import BaseModel

from app.db.database import AIUsageLog, SessionLocal

load_dotenv()

logger = logging.getLogger(__name__)

AI_PROVIDER = os.getenv("AI_PROVIDER", "gemini")

PROVIDERS = {
    "gemini": {
        "api_key": os.getenv("GEMINI_API_KEY"),
        "base_url": "https://generativelanguage.googleapis.com/v1beta/openai/",
        "model": "gemma-4-31b-it",
    },
    "zai": {
        "api_key": os.getenv("ZAI_API_KEY"),
        "base_url": "https://api.z.ai/api/coding/paas/v4/",
        "model": "GLM-5-Turbo",
    },
}

provider = PROVIDERS[AI_PROVIDER]
MODEL = provider["model"]

client = OpenAI(
    api_key=provider["api_key"],
    base_url=provider["base_url"],
)

MAX_RETRIES = 3
RETRY_BASE_DELAY = 1.0


def _log_usage(user_id, feature, input_tokens, output_tokens, success, error_message=None):
    db = SessionLocal()
    try:
        log = AIUsageLog(
            user_id=user_id,
            feature=feature,
            model=MODEL,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            success=success,
            error_message=error_message,
        )
        db.add(log)
        db.commit()
    finally:
        db.close()


def _is_retryable(exc: Exception) -> bool:
    if isinstance(exc, RateLimitError):
        return True
    if isinstance(exc, APIStatusError) and exc.status_code >= 500:
        return True
    return False


def call_ai(
    messages: list[dict],
    feature: str,
    db=None,
    user_id: Optional[int] = None,
    response_model: Optional[Type[BaseModel]] = None,
) -> dict | str:
    last_exc = None

    for attempt in range(MAX_RETRIES):
        try:
            response = client.chat.completions.create(
                model=MODEL,
                messages=messages,
                response_format={"type": "json_object"},
            )

            content = response.choices[0].message.content
            input_tokens = getattr(response.usage, "prompt_tokens", None)
            output_tokens = getattr(response.usage, "completion_tokens", None)

            _log_usage(user_id, feature, input_tokens, output_tokens, True)

            content = re.sub(r"<thought>.*?</thought>", "", content, flags=re.DOTALL).strip()
            parsed = json.loads(content)
            if response_model:
                return response_model.model_validate(parsed)
            return parsed

        except Exception as e:
            last_exc = e
            if _is_retryable(e) and attempt < MAX_RETRIES - 1:
                delay = RETRY_BASE_DELAY * (2 ** attempt)
                logger.warning(f"AI call '{feature}' failed (attempt {attempt + 1}), retrying in {delay}s: {e}")
                time.sleep(delay)
                continue
            _log_usage(user_id, feature, None, None, False, str(e))
            raise

    _log_usage(user_id, feature, None, None, False, str(last_exc))
    raise last_exc
