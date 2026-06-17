from __future__ import annotations

import os
from collections.abc import Callable
from typing import Any, TypeVar

import requests

DEFAULT_ENDPOINT = "https://relay-security-lemon.vercel.app/api/execute"

T = TypeVar("T")


class RelayPolicyError(RuntimeError):
    def __init__(self, message: str, result: dict[str, Any]):
        super().__init__(message)
        self.result = result


class Relay:
    def __init__(
        self,
        api_key: str | None = None,
        endpoint: str | None = None,
        timeout: float = 15,
    ) -> None:
        self.api_key = api_key or os.getenv("RELAY_API_KEY")
        self.endpoint = endpoint or os.getenv("RELAY_ENDPOINT") or DEFAULT_ENDPOINT
        self.timeout = timeout

    def check(
        self,
        tool: str,
        arguments: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        headers = {"Content-Type": "application/json"}

        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        response = requests.post(
            self.endpoint,
            headers=headers,
            json={"tool": tool, "arguments": arguments or {}},
            timeout=self.timeout,
        )
        response.raise_for_status()
        return response.json()

    def assert_allowed(
        self,
        tool: str,
        arguments: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        result = self.check(tool, arguments)

        if result.get("status") == "blocked":
            raise RelayPolicyError(
                result.get("reason", "Blocked by Relay policy"),
                result,
            )

        return result

    def guard_tool(
        self,
        tool: str,
        handler: Callable[[dict[str, Any]], T],
    ) -> Callable[[dict[str, Any] | None], T]:
        def guarded(arguments: dict[str, Any] | None = None) -> T:
            safe_arguments = arguments or {}
            self.assert_allowed(tool, safe_arguments)
            return handler(safe_arguments)

        return guarded
