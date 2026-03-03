import os
from typing import List

# placeholder implementations; replace with actual extraction libraries

def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from a PDF file located at file_path."""
    # in production use pdfminer, PyPDF2, or similar
    try:
        with open(file_path, "rb") as f:
            content = f.read()
        # naive fallback
        return content.decode(errors="ignore")
    except Exception:
        return ""


def extract_text_from_image(file_path: str) -> str:
    """Extract text from an image file (OCR)."""
    # stub; could integrate Tesseract via pytesseract
    return ""


# optionally you could expose a convenience method

def extract_text(file_path: str) -> str:
    """Dispatch to pdf or image depending on extension."""
    _, ext = os.path.splitext(file_path.lower())
    if ext in [".pdf"]:
        return extract_text_from_pdf(file_path)
    else:
        return extract_text_from_image(file_path)
