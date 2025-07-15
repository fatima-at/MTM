import sys
import json
from rule_extractor import extract_actions

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python extract_from_text.py <text>")
        sys.exit(1)
    text = sys.argv[1]
    actions = extract_actions(text)
    print(json.dumps(actions))
    with open("extracted_output.json", "w") as f:
        json.dump(actions, f, indent=2)
    