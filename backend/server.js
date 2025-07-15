const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const { saveMeeting } = require("./db");
const { extractTextFromMedia } = require("./speechToText");
const { spawn } = require("child_process");
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

    const actions = await extractActionsFromText(transcript);
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

async function extractActionsFromText(text) {
  return new Promise((resolve, reject) => {
    const python = spawn("python", [
      path.resolve(__dirname, "extract_from_text.py"),
      text,
    ]);

    let output = "";
    let error = "";

    python.stdout.on("data", (data) => {
      output += data.toString();
    });

    python.stderr.on("data", (data) => {
      error += data.toString();
    });
     python.on("close", (code) => {
      if (code === 0) {
        try {
          resolve(JSON.parse(output));
        } catch (e) {
          reject(new Error("Failed to parse extractor output: " + output));
        }
      } else {
        reject(new Error(error || "Extraction failed"));
      }
    });
  });
}
app.get("/action-items", (req, res) => {
  const { meeting_id, type } = req.query;
  if (type === "rule") {
    // Serve extracted_output.json for rule-based
    const filePath = path.join(__dirname, "extracted_output.json");
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      res.json(JSON.parse(data));
    } else {
      res.json([]);
    }
  } else {
    // TODO: Handle ML-based or other types
    res.json([]);
  }
});
app.get("/summarize", (req, res) => {
  const { meeting_id } = req.query;

  // Read rule-based summary
  const rulePath = path.join(__dirname, "extracted_output.json");
  let ruleSummary = "";
  if (fs.existsSync(rulePath)) {
    const ruleData = JSON.parse(fs.readFileSync(rulePath, "utf-8"));
    ruleSummary = ruleData.map(item => item.sentence).join(" ");
  }

  // Read ML-based summary
  const mlPath = path.join(__dirname, "extracted_ML.json");
  let mlSummary = "";
  if (fs.existsSync(mlPath)) {
    const mlData = JSON.parse(fs.readFileSync(mlPath, "utf-8"));
    mlSummary = mlData.map(item => item.sentence || item.summary || "").join(" ");
  }

  res.json({
    meeting_id,
    rule_summary: ruleSummary,
    ml_summary: mlSummary
  });
});
app.listen(5000, () => console.log("Server started on port 5000"));