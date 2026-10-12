"""Small, testable guard against replacing newer fuel data with an older bulletin."""
from datetime import date


def is_older_observation(incoming: str, current: str) -> bool:
    """Return True only when the incoming ISO date is older than the stored date."""
    return date.fromisoformat(incoming) < date.fromisoformat(current)
