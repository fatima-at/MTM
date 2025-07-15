import spacy
from spacy.matcher import Matcher
from typing import List, Dict

nlp = spacy.load("en_core_web_sm")

def extract_actions(text: str) -> List[Dict]:
    doc = nlp(text)
    matcher = Matcher(nlp.vocab)
    pattern = [{"POS": "VERB", "DEP": "ROOT"}]
    matcher.add("IMPERATIVE", [pattern])
    matches = matcher(doc)

    urgency_keywords = {"urgent", "asap", "immediately", "high priority", "right away", "as soon as possible", "important"}

    actions = []
    for match_id, start, end in matches:
        verb = doc[start:end][0]
        sentence = doc[start].sent

        assignee = [ent.text for ent in sentence.ents if ent.label_ == "PERSON"]
        deadline = [ent.text for ent in sentence.ents if ent.label_ in ("DATE", "TIME")]

        sentence_text_lower = sentence.text.lower()
        urgency = None
        for keyword in urgency_keywords:
            if keyword in sentence_text_lower:
                urgency = "High"
                break

        actions.append({
            "verb": verb.lemma_,
            "sentence": sentence.text,
            "deadline": deadline or None,
            "urgency": urgency
        })

    return actions
