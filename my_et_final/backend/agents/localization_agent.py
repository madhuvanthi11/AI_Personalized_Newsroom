"""
Localization Agent — My ET
Translates content using MyMemory free API (no key needed) + Groq AI fallback.
Supports: Hindi, Tamil, Malayalam, Telugu, Bengali, Marathi
"""

import aiohttp
import os
from typing import Optional

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"
GROQ_KEY = os.getenv("GROQ_API_KEY", "")

MYMEMORY_URL = "https://api.mymemory.translated.net/get"

LANG_PAIRS = {
    "hi": "en-US|hi-IN",
    "ta": "en-US|ta-IN",
    "ml": "en-US|ml-IN",
    "te": "en-US|te-IN",
    "bn": "en-US|bn-IN",
    "mr": "en-US|mr-IN",
}

LANG_NAMES = {
    "hi": "Hindi", "ta": "Tamil", "ml": "Malayalam",
    "te": "Telugu", "bn": "Bengali", "mr": "Marathi",
}

# In-memory cache
_cache = {}


class LocalizationAgent:
    """
    Translates text to regional Indian languages.
    Primary: MyMemory free API (no key needed)
    Fallback: Groq AI translation
    """

    async def translate(self, text: str, target_lang: str) -> str:
        if not text or target_lang == "en":
            return text

        cache_key = f"{target_lang}::{text[:80]}"
        if cache_key in _cache:
            return _cache[cache_key]

        # Try MyMemory first (free, no key)
        result = await self._mymemory_translate(text, target_lang)
        if result and result != text:
            _cache[cache_key] = result
            return result

        # Fallback: Groq AI translation
        if GROQ_KEY:
            result = await self._groq_translate(text, target_lang)
            if result:
                _cache[cache_key] = result
                return result

        return text

    async def _mymemory_translate(self, text: str, target_lang: str) -> Optional[str]:
        langpair = LANG_PAIRS.get(target_lang)
        if not langpair:
            return None

        chunk = text[:500]  # MyMemory limit
        params = {"q": chunk, "langpair": langpair}

        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    MYMEMORY_URL,
                    params=params,
                    timeout=aiohttp.ClientTimeout(total=8),
                ) as response:
                    data = await response.json()
                    if data.get("responseStatus") == 200:
                        translated = data.get("responseData", {}).get("translatedText", "")
                        if translated and len(translated) > 2 and "PLEASE SELECT" not in translated:
                            return translated
        except Exception as e:
            print(f"[LocalizationAgent] MyMemory error: {e}")

        return None

    async def _groq_translate(self, text: str, target_lang: str) -> Optional[str]:
        lang_name = LANG_NAMES.get(target_lang, target_lang)
        messages = [
            {"role": "system", "content": f"Translate the following English business news text to {lang_name}. Provide only the translation, no explanation or commentary."},
            {"role": "user", "content": text[:500]},
        ]
        try:
            async with aiohttp.ClientSession() as session:
                headers = {"Content-Type": "application/json", "Authorization": f"Bearer {GROQ_KEY}"}
                async with session.post(
                    GROQ_API_URL,
                    json={"model": GROQ_MODEL, "messages": messages, "temperature": 0.2, "max_tokens": 300},
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=20),
                ) as response:
                    data = await response.json()
                    return data["choices"][0]["message"]["content"].strip()
        except Exception as e:
            print(f"[LocalizationAgent] Groq translation error: {e}")
        return None
