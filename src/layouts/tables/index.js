import React, { useState, useEffect } from "react";

// MUI & Soft UI components
import Card from "@mui/material/Card";
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftButton from "components/SoftButton";

// Soft UI Layout
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import Table from "examples/Tables/Table";

// Column definition must match your JSON keys exactly
const columns = [
  { name: "task", align: "left" },
  { name: "description", align: "left" },
  { name: "assignee", align: "left" },
  { name: "deadline", align: "center" },
  { name: "skill", align: "center" },
  { name: "urgency", align: "center" },
];

function Tables() {
  const [rows, setRows] = useState([]);
  const [viewType, setViewType] = useState("rule");
  const [loading, setLoading] = useState(false);
  const meetingId = "your_meeting_id_here"; // Replace if needed

  useEffect(() => {
    async function fetchTasks() {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/action-items?meeting_id=${meetingId}&type=${viewType}`);
        const data = await res.json();
        console.log("Fetched data:", data);

        setRows(
          data.map((item) => ({
            task: item.verb || "",
            description: item.sentence || "",
            assignee: item.assignee || "",
            deadline: Array.isArray(item.deadline) ? item.deadline.join(", ") : item.deadline || "",
            skill: item.skill || "",
            urgency: item.urgency || "",
          }))
        );
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setRows([]);
      }
      setLoading(false);
    }

    fetchTasks();
  }, [viewType, meetingId]);

  return (
    <DashboardLayout>
      <SoftBox py={3}>
        <Card>
          <SoftBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
            <SoftTypography variant="h6">Action Items</SoftTypography>
            <SoftButton
              variant="gradient"
              color="info"
              onClick={() => setViewType(viewType === "rule" ? "ml" : "rule")}
            >
              {viewType === "rule" ? "Switch to ML" : "Switch to Rule-Based"}
            </SoftButton>
          </SoftBox>
          <SoftBox
            sx={{
              "& .MuiTableRow-root:not(:last-child)": {
                "& td": {
                  borderBottom: ({ borders: { borderWidth, borderColor } }) =>
                    `${borderWidth[1]} solid ${borderColor}`,
                },
              },
            }}
          >
            {loading ? (
              <SoftTypography variant="button">Loading...</SoftTypography>
            ) : (
              <Table columns={columns} rows={rows} />
            )}
          </SoftBox>
        </Card>
      </SoftBox>
    </DashboardLayout>
  );
}

export default Tables;
