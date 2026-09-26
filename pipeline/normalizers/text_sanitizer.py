import re
import unicodedata


def clean_text(text: str) -> str:
	text = unicodedata.normalize("NFC", text)
	text = re.sub(r"[\u200b-\u200d\ufeff]", "", text)
	return re.sub(r"\s+", " ", text).strip()
