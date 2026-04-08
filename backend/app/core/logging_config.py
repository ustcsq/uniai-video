import logging
import sys


def configure_logging(level: str = "INFO") -> None:
    root = logging.getLogger()
    if root.handlers:
        return
    lvl = getattr(logging, level.upper(), logging.INFO)
    root.setLevel(lvl)
    h = logging.StreamHandler(sys.stdout)
    h.setLevel(lvl)
    h.setFormatter(
        logging.Formatter("%(asctime)s %(levelname)s [%(name)s] %(message)s"),
    )
    root.addHandler(h)
