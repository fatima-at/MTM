import json
from read_transcripts import fetch_meeting_transcripts
from extract import extract_tasks
from match import match_tasks_to_employees, load_employees

def run_pipeline():
    # Step 1: Get latest transcript
    transcripts = fetch_meeting_transcripts()
    if not transcripts:
        print("No transcripts found.")
        return

    latest_id, latest_transcript = transcripts[-1]

    # Step 2: Extract tasks + summary
    print(f"Processing meeting #{latest_id}...")
    extracted_data = extract_tasks(latest_transcript)

    if not extracted_data or not extracted_data.get("tasks"):
        print("No tasks extracted.")
        return

    summary = extracted_data.get("summary", "")
    tasks = extracted_data["tasks"]

    # Step 3: Load employees from DB
    employees = load_employees()

    # Step 4: Match tasks to employees
    assignments = match_tasks_to_employees(tasks, employees)

    # Step 5: Build final result with summary
    result = {
        "meeting_id": latest_id,
        "summary": summary,
        "tasks": assignments  # each task already includes assigned_to info
    }

    # Step 6: Save to file
    with open("extracted_ML.json", "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print("Task assignments + summary saved to 'extracted_ML.json'.")

if __name__ == "__main__":
    run_pipeline()
