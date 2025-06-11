const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const { saveMeeting } = require("./db");
const { extractTextFromMedia } = require("./speechToText");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "backend/uploads/" });

app.post("/api/meetings/upload", upload.single("meetingFile"), async (req, res) => {
  const file = req.file;
  if (!file) {
    console.log("No file uploaded.");
    return res.status(400).send("No file uploaded.");
  }

  console.log(`Received upload: ${file.originalname} (${file.path})`);

  try {
    console.log("Starting transcription...");
    const transcript = await extractTextFromMedia(file.path);
    console.log("Transcription complete.");

    console.log("Saving meeting to database...");
    const meetingId = await saveMeeting(file.originalname, transcript);
    console.log(`Meeting saved to DB with ID: ${meetingId}`);

    // Optionally delete the file after processing
    fs.unlink(file.path, () => {
      console.log(`Temporary file deleted: ${file.path}`);
    });

    res.json({ id: meetingId, filename: file.originalname, transcript });
    console.log("Upload and processing complete.\n");
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).send("Server error: " + err.message);
  }
});

app.listen(5000, () => console.log("Server started on port 5000"));