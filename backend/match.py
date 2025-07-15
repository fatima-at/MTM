import sqlite3
import json
from datetime import datetime, timedelta
from sentence_transformers import SentenceTransformer, util

# === Load the model for semantic similarity ===
model = SentenceTransformer('all-MiniLM-L6-v2')

# === Connect to the SQLite DB ===
conn = sqlite3.connect('meetings.db')  # Change this path as needed
cursor = conn.cursor()

# === Load employees and preprocess their skills ===
def load_employees():
    cursor.execute("SELECT id, first_name, last_name, skills FROM employees")
    rows = cursor.fetchall()
    employees = []
    for row in rows:
        id, fname, lname, skills = row
        skill_list = [s.strip() for s in skills.split(',')] if skills else []
        employees.append({
            "id": id,
            "name": f"{fname} {lname}",
            "skills": skill_list,
            "skill_embeddings": model.encode(skill_list) if skill_list else []
        })
    return employees

# === Match task skills to employees ===
def match_tasks_to_employees(tasks, employees):
    results = []

    for task in tasks:
        required_skills = task.get("skills", [])
        assigned = []

        for rskill in required_skills:
            rskill_embedding = model.encode(rskill)
            best_match = None
            best_score = -1

            for emp in employees:
                for idx, eskill_emb in enumerate(emp["skill_embeddings"]):
                    score = util.cos_sim(rskill_embedding, eskill_emb).item()
                    if score > best_score:
                        best_score = score
                        best_match = emp

            if best_match and best_match["id"] not in [e["id"] for e in assigned]:
                assigned.append({
                    "id": best_match["id"],
                    "name": best_match["name"],
                    "match_score": round(best_score, 3)
                })

        results.append({
            "task": task["task"],
            "description": task.get("description", ""),
            "urgency": task.get("urgency", ""),
            "skills": required_skills,
            "deadline": task.get("deadline", ""),
            "assigned_to": assigned
        })

    return results
