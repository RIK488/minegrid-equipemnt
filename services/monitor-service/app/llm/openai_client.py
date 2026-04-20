"""OpenAI-compatible LLM client (works with OpenAI API or any compatible endpoint)."""
from __future__ import annotations
import httpx
from app.llm.client import BaseLLMClient, LLMResponse


class OpenAIClient(BaseLLMClient):
    def __init__(self, api_key: str, model: str = "gpt-4o-mini", base_url: str = "https://api.openai.com/v1"):
        self.api_key = api_key
        self.model = model
        self.base_url = base_url

    async def complete(self, system_prompt: str, user_prompt: str) -> LLMResponse:
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    "temperature": 0.2,
                    "response_format": {"type": "json_object"},
                },
            )
            resp.raise_for_status()
            data = resp.json()

        choice = data["choices"][0]["message"]
        usage = data.get("usage", {})

        return LLMResponse(
            text=choice["content"],
            model=data.get("model", self.model),
            tokens_used=usage.get("total_tokens", 0),
        )
