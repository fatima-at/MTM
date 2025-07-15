import React, { useRef, useState } from "react";
import SoftBox from "components/SoftBox";
import SoftButton from "components/SoftButton";
import axios from "axios";

function Dashboard() {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [summary, setSummary] = useState(null);
  const [meetingId, setMeetingId] = useState(null);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);

      // Upload file to backend
      const formData = new FormData();
      formData.append("meetingFile", file);

      try {
        const response = await axios.post("http://localhost:5000/api/meetings/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        // Get meeting ID from response if available
        const id = response.data.id || null;
        setMeetingId(id);
        setSummary(null); // Clear previous summary
      } catch (error) {
        // Handle error
        console.error("Upload failed:", error);
      }
    }
  };

  // Summarize button handler
  const handleSummarize = async () => {
    const meetingId=1;
    if (!meetingId) {
      alert("Please upload a meeting file first.");
      return;
    }
    try {
      const summaryRes = await axios.get(`http://localhost:5000/summarize?meeting_id=${meetingId}`);
      setSummary(summaryRes.data);
      console.log("Summary response:", summaryRes.data);
    } catch (error) {
      console.error("Summary fetch failed:", error);
    }
  };

  return (
    <SoftBox py={3} px={40} width="100%" display="flex" flexDirection="column" alignItems="flex-start">
      <h1>Upload Meeting</h1>
      {fileName && (
        <div style={{ marginBottom: "10px", fontWeight: "bold" }}>{fileName}</div>
      )}
      <SoftButton variant="gradient" color="info" type="button" onClick={handleButtonClick}>
        Upload
      </SoftButton>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
        accept="audio/*,video/*"
      />
      {/* Summarize Button */}
      <SoftButton
        variant="gradient"
        color="success"
        type="button"
        style={{ marginTop: "20px" }}
        onClick={handleSummarize}
       
      >
        Summarize
      </SoftButton>
      {summary && (
        <div style={{ marginTop: "30px", width: "100%" }}>
          <h2>Summary Comparison</h2>
          <div style={{ display: "flex", gap: "40px" }}>
            <div style={{ flex: 1 }}>
              <h4>Rule-based</h4>
              <p>{summary.rule_summary || "No summary available."}</p>
            </div>
            <div style={{ flex: 1 }}>
              <h4>ML-based</h4>
              <p>{summary.ml_summary || "No summary available."}</p>
            </div>
          </div>
        </div>
      )}
    </SoftBox>
  );
}

export default Dashboard;