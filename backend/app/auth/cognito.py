import os

import requests
from cachetools import TTLCache
from jose import jwt

from dotenv import load_dotenv

load_dotenv()

COGNITO_REGION = os.getenv("COGNITO_REGION", "eu-central-1")
COGNITO_USER_POOL_ID = os.getenv("COGNITO_USER_POOL_ID", "")
COGNITO_APP_CLIENT_ID = os.getenv("COGNITO_APP_CLIENT_ID", "")

_jwks_cache = TTLCache(maxsize=1, ttl=3600)


def _get_jwks():
    cache_key = f"{COGNITO_REGION}:{COGNITO_USER_POOL_ID}"
    if cache_key not in _jwks_cache:
        url = (
            f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com"
            f"/{COGNITO_USER_POOL_ID}/.well-known/jwks.json"
        )
        resp = requests.get(url, timeout=5)
        resp.raise_for_status()
        _jwks_cache[cache_key] = resp.json()["keys"]
    return _jwks_cache[cache_key]


def verify_token(token: str) -> dict:
    jwks = _get_jwks()
    headers = jwt.get_unverified_headers(token)
    kid = headers.get("kid")
    key = next((k for k in jwks if k["kid"] == kid), None)
    if not key:
        raise ValueError("Token key ID not found in JWKS")

    issuer = (
        f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com"
        f"/{COGNITO_USER_POOL_ID}"
    )
    payload = jwt.decode(
        token,
        key,
        algorithms=["RS256"],
        audience=COGNITO_APP_CLIENT_ID,
        issuer=issuer,
    )
    return payload
