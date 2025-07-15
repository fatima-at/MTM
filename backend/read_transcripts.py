import sqlite3

def fetch_meeting_transcripts():
    conn = sqlite3.connect('meetings.db')
    cursor = conn.cursor()
    cursor.execute("SELECT id, transcript FROM meetings")
    rows = cursor.fetchall()
    conn.close()
    return rows  # List of tuples: (id, transcript)
