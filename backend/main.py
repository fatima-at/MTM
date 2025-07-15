import json
from read_transcripts import fetch_meeting_transcripts
from extract import extract_tasks
from match import match_tasks_to_employees, load_employees  # Import both from match

def run_pipeline():
    # Step 1: Get latest transcript
    transcripts = fetch_meeting_transcripts()
    if not transcripts:
        print("No transcripts found.")
        return

    latest_id, latest_transcript = transcripts[-1]  # Get last entry

    # Step 2: Extract tasks
    print(f"📄 Processing meeting #{latest_id}...")
    tasks = extract_tasks(latest_transcript)
    if not tasks:
        print("No tasks extracted.")
        return

    # Step 3: Load employees from DB
    employees = load_employees()

    # Step 4: Match tasks to employees
    assignments = match_tasks_to_employees(tasks, employees)

    # Step 5: Save result
    with open("assigned_tasks.json", "w") as f:
        json.dump(assignments, f, indent=2, ensure_ascii=False)

    print("✅ Task assignments saved to 'assigned_tasks.json'.")

if __name__ == "__main__":
    run_pipeline()
