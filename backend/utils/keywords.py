# Keywords indicating stress, depression, or drug use
STRESS_KEYWORDS = [
    "stressed", "overwhelmed", "burnt out", "can't cope", "pressure", "panic"
]

DEPRESSION_KEYWORDS = [
    "depressed", "sad", "hopeless", "empty", "no point", "suicide", "self-harm",
    "worthless", "lonely", "alone", "cry", "don't want to live"
]

DRUG_KEYWORDS = [
    "cocaine", "heroin", "weed", "meth", "pills", "oxy", "high", "addicted",
    "withdrawal", "using again","drugs"
]

def check_keywords(text):
    text_lower = text.lower()
    issues = {
        "stress": [kw for kw in STRESS_KEYWORDS if kw in text_lower],
        "depression": [kw for kw in DEPRESSION_KEYWORDS if kw in text_lower],
        "substance": [kw for kw in DRUG_KEYWORDS if kw in text_lower]
    }
    return {k: v for k, v in issues.items() if v}