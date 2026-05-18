#!/usr/bin/env python3
"""Chalkboard theme — Python example."""

from __future__ import annotations

import asyncio
import re
from dataclasses import dataclass, field
from enum import Enum, auto
from typing import Any, Generic, TypeVar

# ── Constants ─────────────────────────────────────────────────────────────────

VERSION = "2.0.0"
MAX_RETRIES: int = 3
_EMAIL_RE = re.compile(r"^[\w.%+\-]+@[\w.\-]+\.[a-z]{2,}$", re.IGNORECASE)

T = TypeVar("T")

# ── Enum ──────────────────────────────────────────────────────────────────────

class Status(Enum):
    PENDING = auto()
    RUNNING = auto()
    DONE = auto()
    FAILED = auto()


# ── Dataclass ─────────────────────────────────────────────────────────────────

@dataclass
class User:
    id: int
    name: str
    email: str
    tags: list[str] = field(default_factory=list)

    def __post_init__(self) -> None:
        if not _EMAIL_RE.match(self.email):
            raise ValueError(f"Invalid email: {self.email!r}")

    @property
    def display(self) -> str:
        return f"{self.name} <{self.email}>"


# ── Generic class ─────────────────────────────────────────────────────────────

class Result(Generic[T]):
    """A simple Result type — either Ok or Err."""

    def __init__(self, value: T | None = None, error: str | None = None) -> None:
        self._value = value
        self._error = error

    @classmethod
    def ok(cls, value: T) -> Result[T]:
        return cls(value=value)

    @classmethod
    def err(cls, message: str) -> Result[T]:
        return cls(error=message)

    @property
    def is_ok(self) -> bool:
        return self._error is None

    def unwrap(self) -> T:
        if self._error:
            raise RuntimeError(self._error)
        return self._value  # type: ignore[return-value]


# ── Decorator ─────────────────────────────────────────────────────────────────

def retry(times: int = 3):
    """Retry a coroutine up to *times* on exception."""
    def decorator(fn):
        async def wrapper(*args: Any, **kwargs: Any):
            last_exc: Exception | None = None
            for attempt in range(1, times + 1):
                try:
                    return await fn(*args, **kwargs)
                except Exception as exc:  # noqa: BLE001
                    last_exc = exc
                    print(f"Attempt {attempt}/{times} failed: {exc}")
            raise RuntimeError(f"All {times} attempts failed") from last_exc
        return wrapper
    return decorator


# ── Async function ────────────────────────────────────────────────────────────

@retry(times=MAX_RETRIES)
async def fetch_user(user_id: int) -> Result[User]:
    """Fetch a user by ID from a hypothetical API."""
    await asyncio.sleep(0.1)  # simulate network
    if user_id <= 0:
        return Result.err(f"Invalid user ID: {user_id}")
    return Result.ok(User(id=user_id, name="Ada Lovelace", email="ada@example.com"))


# ── Pattern matching (3.10+) ──────────────────────────────────────────────────

def describe_status(status: Status) -> str:
    match status:
        case Status.PENDING:
            return "Waiting to start"
        case Status.RUNNING:
            return "Currently running"
        case Status.DONE:
            return "Completed successfully"
        case Status.FAILED:
            return "Failed — check logs"
        case _:
            return "Unknown status"


# ── F-strings & walrus ────────────────────────────────────────────────────────

def summarise(users: list[User]) -> str:
    if not (count := len(users)):
        return "No users found."
    names = ", ".join(u.name for u in users)
    return f"Found {count} user{'s' if count != 1 else ''}: {names}"


# ── Entry point ───────────────────────────────────────────────────────────────

async def main() -> None:
    result = await fetch_user(1)
    if result.is_ok:
        user = result.unwrap()
        print(f"Fetched: {user.display}")
        print(f"Version {VERSION} — status: {describe_status(Status.DONE)}")


if __name__ == "__main__":
    asyncio.run(main())
