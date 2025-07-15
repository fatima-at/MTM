import React, { useState, useEffect } from "react";
// @mui material components
import Card from "@mui/material/Card";

// Soft UI Dashboard React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftButton from "components/SoftButton";

// Soft UI Dashboard React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Table from "examples/Tables/Table";

// Table columns for action items
const columns = [
  { name: "task", align: "left" },
  { name: "assignedTo", align: "left" },
  { name: "deadline", align: "center" },
  { name: "urgency", align: "center" },
];

function Tables() {
  const [rows, setRows] = useState([]);
  const [viewType, setViewType] = useState("rule"); // "rule" or "ml"
  const [loading, setLoading] = useState(false);

  // TODO: Replace with actual meeting id source (route param, context, etc.)
  const meetingId = "your_meeting_id_here";

  useEffect(() => {
    async function fetchTasks() {
      setLoading(true);
      try {
        const res = await fetch(
          `/action-items?meeting_id=${meetingId}&type=${viewType}`
        );
        const data = await res.json();
        console.log("Fetched data:", data);
        setRows(
        data.map((item) => ({
          task: item.verb || "",
          assignedTo: item.assignee ? item.assignee.join(", ") : "",
          deadline: item.deadline ? item.deadline.join(", ") : "",
          urgency: item.urgency || "", 
        }))
      );
      } catch (err) {
        setRows([]);
      }
      setLoading(false);
    }
    fetchTasks();
  }, [viewType, meetingId]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
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
      <Footer />
    </DashboardLayout>
  );
}

export default Tables;