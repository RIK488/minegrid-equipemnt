"""
LLM client interface + factory.

All LLM calls go through this abstraction so the provider can be swapped
via LLM_PROVIDER env var (none / mock / openai).
"""
from __future__ import annotations
from abc import ABC, abstractmethod
from dataclasses import dataclass
from app.config import get_settings


@dataclass
class LLMResponse:
    text: str
    model: str
    tokens_used: int


class BaseLLMClient(ABC):
    @abstractmethod
    async def complete(self, system_prompt: str, user_prompt: str) -> LLMResponse:
        ...


def get_llm_client() -> BaseLLMClient:
    """Factory — returns the configured LLM client."""
    settings = get_settings()
    provider = settings.llm_provider.lower()

    if provider == "openai":
        from app.llm.openai_client import OpenAIClient
        return OpenAIClient(api_key=settings.llm_api_key, model=settings.llm_model)

    from app.llm.mock_client import MockLLMClient
    return MockLLMClient()
