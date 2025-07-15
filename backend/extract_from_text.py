import sys
import json
from rule_extractor import extract_actions

if __name__ == "__main__":
    # Read all input from stdin
    text = sys.stdin.read()

    # Extract actions
    actions = extract_actions(text)

    # ONLY print JSON result to stdout
    print(json.dumps(actions))

    # Save to file if needed (this won't pollute stdout)
    with open("extracted_output.json", "w") as f:
        json.dump(actions, f, indent=2)
