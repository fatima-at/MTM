const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const db = new sqlite3.Database(path.resolve(__dirname, "meetings.db"));
// Drop table if exists (optional for clean testing)
db.serialize(() => {
  db.run(`DROP TABLE IF EXISTS employees`);

  // Create the table
  db.run(`
    CREATE TABLE employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      position TEXT NOT NULL,
      skills TEXT,
      projects TEXT,
      available_hours INTEGER
    )
  `);

  // Sample employee data
  const employees = [
    ["Alice", "Johnson", "Frontend Developer", "HTML,CSS,JavaScript,React", "Website Redesign,Client Portal", 20],
    ["Bob", "Smith", "Backend Developer", "Python,Django,SQL,REST", "API Development,Data Sync", 15],
    ["Charlie", "Lee", "DevOps Engineer", "Docker,Kubernetes,AWS,CI/CD", "Deployment Automation", 10],
    ["Diana", "Khan", "Data Scientist", "Python,Pandas,Scikit-learn,ML", "Forecasting Model,Analytics Dashboard", 18],
    ["Ethan", "Brown", "Project Manager", "Agile,Scrum,Communication,Planning", "All Projects", 25],
    ["Fiona", "Garcia", "Mobile Developer", "Flutter,Dart,Firebase,UI/UX", "Mobile App", 12],
    ["George", "Wang", "Full Stack Developer", "Node.js,Vue.js,SQL,GraphQL", "Internal Tools", 16],
    ["Hannah", "Martinez", "QA Engineer", "Testing,Automation,Selenium,Postman", "Website Redesign,Mobile App", 14]
  ];

  const stmt = db.prepare(`
    INSERT INTO employees (first_name, last_name, position, skills, projects, available_hours)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const emp of employees) {
    stmt.run(emp);
  }

  stmt.finalize(() => {
    console.log("✅ Employees table created and populated.");
    db.close();
  });
});
