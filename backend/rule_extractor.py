import spacy
from spacy.matcher import Matcher
from typing import List, Dict
import json
import os

nlp = spacy.load("en_core_web_sm")

def extract_actions(text: str) -> List[Dict]:
    doc = nlp(text)
    matcher = Matcher(nlp.vocab)
    pattern = [{"POS": "VERB", "DEP": "ROOT"}]
    matcher.add("IMPERATIVE", [pattern])
    matches = matcher(doc)

    actions = []
    for match_id, start, end in matches:
        verb = doc[start:end][0]
        sentence = doc[start].sent

        assignee = [ent.text for ent in sentence.ents if ent.label_ == "PERSON"]
        deadline = [ent.text for ent in sentence.ents if ent.label_ in ("DATE", "TIME")]

        actions.append({
            "verb": verb.lemma_,
            "sentence": sentence.text,
            "assignee": assignee or None,
            "deadline": deadline or None
        })
        print("Extracted actions:", actions)

    return actions

