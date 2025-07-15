/**
=========================================================
* Soft UI Dashboard React - v4.0.1
=========================================================

* Product Page: https://www.creative-tim.com/product/soft-ui-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// @mui material components
import Card from "@mui/material/Card";

// Soft UI Dashboard React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";

// Soft UI Dashboard React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Table from "examples/Tables/Table";

// Remove these imports
// import authorsTableData from "layouts/tables/data/authorsTableData";
// import projectsTableData from "layouts/tables/data/projectsTableData";

// Example: Replace with your real user and tasks data
const currentUser = { id: "user123", name: "John Doe" };
const tasks = [
  {
    description: "Finish report",
    deadline: "2025-06-15",
    urgency: "High",
    people: [
      ["avatar1.png", "John Doe"],
      ["avatar2.png", "Jane Smith"],
    ],
    assignedTo: ["user123", "user456"],
  },
  // ...add more tasks as needed...
];

function Tables() {
  // Filter tasks assigned to the current user
  const userTasks = tasks.filter(task => task.assignedTo.includes(currentUser.id));

  // Define columns
  const columns = [
    { name: "description", align: "left" },
    { name: "deadline", align: "center" },
    { name: "urgency", align: "center" },
    { name: "people", align: "left" },
  ];

  // Format rows for the Table component
  const rows = userTasks.map(task => ({
    description: task.description,
    deadline: task.deadline,
    urgency: task.urgency,
    people: task.people[0], // Shows first person as avatar+name
    hasBorder: true,
  }));

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <SoftBox py={3}>
        <Card>
          <SoftBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
            <SoftTypography variant="h6">My Tasks</SoftTypography>
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
            <Table columns={columns} rows={rows} />
          </SoftBox>
        </Card>
      </SoftBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Tables;