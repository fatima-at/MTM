const { spawn } = require("child_process");
const path = require("path");

async function extractTextFromMedia(filePath) {
  return new Promise((resolve, reject) => {
    const python = spawn("python", [
      path.resolve(__dirname, "transcribe.py"),
      filePath,
    ]);

    let transcript = "";
    let error = "";

    python.stdout.on("data", (data) => {
      transcript += data.toString();
    });

    python.stderr.on("data", (data) => {
      error += data.toString();
    });

    python.on("close", (code) => {
      if (code === 0) {
        resolve(transcript.trim());
      } else {
        reject(new Error(error || "Transcription failed"));
      }
    });
  });
}

module.exports = { extractTextFromMedia };