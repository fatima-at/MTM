import sqlite3

# Sample transcript
transcript = """
During today's meeting, we discussed two upcoming projects for our development team. The first project is a mobile app for health tracking, which needs to integrate with wearable devices and provide real-time analytics. We aim to deliver a working prototype within three weeks.

The second project involves creating a web-based dashboard for managing IoT sensors across smart homes. The goal is to allow remote configuration, alerting, and data visualization using real-time charts. We are targeting a launch in two months.

Design, backend, and data engineers will be involved in both projects. Tasks and assignments will be determined in follow-up sessions.
"""

# File name of the associated audio
filename = "meeting.m4a"

# Connect to DB
conn = sqlite3.connect("meetings.db")
cursor = conn.cursor()

# Ensure the table has the necessary schema
cursor.execute("""
CREATE TABLE IF NOT EXISTS meetings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transcript TEXT NOT NULL,
    filename TEXT
)
""")

# Insert the meeting
cursor.execute("INSERT INTO meetings (transcript, filename) VALUES (?, ?)", (transcript, filename))
conn.commit()

print("✅ Meeting inserted successfully.")

# Optional: Show the inserted row ID
print(f"🆔 Inserted meeting ID: {cursor.lastrowid}")

conn.close()
