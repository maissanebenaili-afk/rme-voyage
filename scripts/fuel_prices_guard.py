"""Garde-fou du robot carburant : ne jamais remplacer un bulletin par un plus ancien."""
from datetime import date


def is_older_observation(incoming: str, current: str) -> bool:
    """Vrai seulement si la date ISO reçue est antérieure à celle déjà enregistrée.

    Une date illisible lève ValueError : le robot s'arrête au lieu de deviner.
    """
    return date.fromisoformat(incoming) < date.fromisoformat(current)
