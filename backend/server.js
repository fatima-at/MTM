const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const { saveMeeting, getLatestMeeting, getAllEmployees } = require("./db");
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

    // 🧠 Run your Python pipeline to extract + assign + save summary/tasks
    console.log("Running ML pipeline...");
    const python = spawn("python", [path.resolve(__dirname, "main.py")]);

    python.stdout.on("data", (data) => {
      console.log(`📥 pipeline output: ${data.toString()}`);
    });

    python.stderr.on("data", (data) => {
      console.error(`❌ pipeline error: ${data.toString()}`);
    });

    python.on("close", (code) => {
      console.log(`🔁 ML pipeline finished with code ${code}`);
    });

    const actions = await extractActionsFromText(transcript);

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
    ]);

    let outputChunks = [];
    let errorChunks = [];

    python.stdin.write(text);
    python.stdin.end();

    python.stdout.on("data", (data) => {
      outputChunks.push(data);
    });

    python.stderr.on("data", (data) => {
      errorChunks.push(data);
    });

    python.on("close", (code) => {
      const output = Buffer.concat(outputChunks).toString();
      const error = Buffer.concat(errorChunks).toString();

      if (code === 0) {
        try {
          const result = JSON.parse(output);
          resolve(result);
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
    const filePath = path.join(__dirname, "extracted_output.json");
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      res.json(JSON.parse(data));  // rule-based is an array
    } else {
      res.json([]);
    }
  } else {
    const filePath = path.join(__dirname, "extracted_ML.json");
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      res.json(data.tasks || []);  // extract only the tasks array
    } else {
      res.json([]);
    }
  }
});

app.get("/summarize", (req, res) => {
  const { meeting_id } = req.query;

  // Rule-based summary
  const rulePath = path.join(__dirname, "extracted_output.json");
  let ruleSummary = "";
  if (fs.existsSync(rulePath)) {
    const ruleData = JSON.parse(fs.readFileSync(rulePath, "utf-8"));
    ruleSummary = ruleData.map(item => item.sentence).join(" ");
  }

  // ML-based summary (now a string field inside the file)
  const mlPath = path.join(__dirname, "extracted_ML.json");
  let mlSummary = "";
  if (fs.existsSync(mlPath)) {
    const mlData = JSON.parse(fs.readFileSync(mlPath, "utf-8"));
    mlSummary = mlData.summary || "";
  }

  res.json({
    meeting_id,
    rule_summary: ruleSummary,
    ml_summary: mlSummary
  });
});

function normalizeEmployeeSkills(rawSkills) {
  const map = {
    "node.js": "backend",
    "vue.js": "web",
    "react": "web",
    "angular": "web",
    "sql": "data",
    "graphql": "api",
    "mongodb": "data",
    "python": "python",
    "figma": "design",
    "ui": "design"
  };

  return (rawSkills || "")
    .toLowerCase()
    .split(/[,; ]+/)
    .map(s => s.trim())
    .map(skill => map[skill] || skill);  // normalize or keep as-is
}

const matchTasksToEmployees = (tasks, employees) => {
  const skillKeywords = ["web", "python", "design", "data", "api", "backend"];

  const synonyms = {
    dashboard: "web",
    frontend: "web",
    ui: "design",
    ux: "design",
    prototype: "design",
    iot: "backend",
    database: "data",
    analysis: "data"
  };

  return tasks.map(task => {
    let sentence = task.sentence.toLowerCase();

    // Add synonyms to help match
    Object.entries(synonyms).forEach(([keyword, mappedSkill]) => {
      if (sentence.includes(keyword)) {
        sentence += " " + mappedSkill;
      }
    });

    const matchedSkill = skillKeywords.find(skill =>
      sentence.includes(skill)
    );

    const assignedEmployee = employees.find(emp => {
      const normalizedSkills = normalizeEmployeeSkills(emp.skills);
      return matchedSkill && normalizedSkills.includes(matchedSkill);
    });

    const assignedTo = assignedEmployee
      ? `${assignedEmployee.first_name} ${assignedEmployee.last_name}`
      : "Unassigned";

    console.log(`\nTask: "${task.sentence.trim()}"`);
    console.log(`Matched Skill: ${matchedSkill || "None"}`);
    console.log(`Assigned To: ${assignedTo}`);

    return {
      ...task,
      assignee: assignedTo,
      skill: matchedSkill || "Unknown"
    };
  });
};



app.get("/extract-latest", async (req, res) => {
  try {
    const latestMeeting = await getLatestMeeting();
    if (!latestMeeting) {
      return res.status(404).json({ error: "No meetings found." });
    }

    const { id, transcript } = latestMeeting;
    const tasks = await extractActionsFromText(transcript);
    const employees = await getAllEmployees();

    const matchedTasks = matchTasksToEmployees(tasks, employees);

    const outputPath = path.join(__dirname, "extracted_output.json");
    fs.writeFileSync(outputPath, JSON.stringify(matchedTasks, null, 2), "utf-8");

    res.json({
      meeting_id: id,
      tasks: matchedTasks
    });
  } catch (err) {
    console.error("Error extracting latest meeting:", err);
    res.status(500).json({ error: err.message });
  }
});


app.listen(5000, () => console.log("Server started on port 5000"));