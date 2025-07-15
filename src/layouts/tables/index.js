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
  { name: "assignedTo", align: "left" }, // <-- changed from "assignee" to "assignedTo"
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
      const res = await fetch(
        `/action-items?meeting_id=${meetingId}&type=${viewType}`
      );
      const data = await res.json();
      console.log("Fetched data:", data);

      const normalizedRows = data.map((item) => {
        if (viewType === "ml") {
          return {
            task: item.task || item.sentence || "",
            assignedTo: item.assignee
              ? item.assignee.map((p) => p.name).join(", ")
              : "Unassigned",
            deadline: item.deadline || "",
            urgency: item.urgency || "",
            description: item.sentence || "",
          };
        } else {
          return {
            task: item.verb || "",
            assignedTo:
              typeof item.assigned_to === "string"
                ? item.assigned_to
                : (item.assigned_to || []).join(", "),
            deadline: Array.isArray(item.deadline)
              ? item.deadline.join(", ")
              : item.deadline || "",
            urgency: item.urgency || "",
            description: item.sentence || "",
          };
        }
      });

      setRows(normalizedRows);
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
