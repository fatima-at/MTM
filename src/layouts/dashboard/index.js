import React, { useRef, useState } from "react";
import SoftBox from "components/SoftBox";
import SoftButton from "components/SoftButton";
import axios from "axios";

function Dashboard() {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState("");

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
        await axios.post("http://localhost:5000/api/meetings/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        // Optionally show success message
      } catch (error) {
        // Handle error
        console.error("Upload failed:", error);
      }
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
    </SoftBox>
  );
}

export default Dashboard;