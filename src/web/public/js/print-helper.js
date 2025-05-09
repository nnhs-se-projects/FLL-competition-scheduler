/**
 * Print helper functions for FLL Competition Scheduler
 * Optimized for creating concise handouts for teams, judges, and table volunteers
 */

// eslint-disable-next-line no-unused-vars
function printSchedule() {
  // Identify which page we're on and apply specific optimizations
  const path = window.location.pathname;
  const isTeamsPage = path.includes("/teams");
  const isTablesPage = path.includes("/tables");
  const isJudgingPage = path.includes("/judging");

  // Show print preparation message
  const message = document.createElement("div");
  message.style.position = "fixed";
  message.style.top = "50%";
  message.style.left = "50%";
  message.style.transform = "translate(-50%, -50%)";
  message.style.background = "rgba(0,0,0,0.8)";
  message.style.color = "white";
  message.style.padding = "20px";
  message.style.borderRadius = "8px";
  message.style.zIndex = "9999";
  message.textContent = "Preparing schedule for printing...";
  document.body.appendChild(message);

  // General print styling
  const printStyles = document.createElement("style");
  printStyles.id = "print-styles";
  printStyles.textContent = `
    @media print {
      @page { 
        size: portrait;
        margin: 10mm; 
      }
      body { 
        font-family: Arial, sans-serif; 
        background: white;
        color: black;
        font-size: 11px;
      }
      .no-print, nav, footer, .summary-cards, button {
        display: none !important;
      }
      .print-header {
        text-align: center;
        margin-bottom: 10mm;
      }
      .print-header h1 {
        font-size: 18px;
        margin-bottom: 4px;
      }
      .print-header h2 {
        font-size: 16px;
        margin-bottom: 4px;
      }
      .print-header p {
        font-size: 12px;
        color: #666;
      }
      .print-container {
        page-break-inside: avoid;
      }
      .team-schedule, .table-schedule, .judging-schedule {
        page-break-inside: avoid;
        margin-bottom: 5mm;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 5mm;
      }
      th, td {
        border: 1px solid #ddd;
        padding: 5px;
        text-align: left;
      }
      th {
        background-color: #f2f2f2;
        font-weight: bold;
      }
      .text-blue-600 { color: #2563eb !important; }
      .text-purple-600 { color: #9333ea !important; }
      .text-green-600 { color: #16a34a !important; }
      .text-amber-600 { color: #d97706 !important; }
      .text-red-600 { color: #dc2626 !important; }
      .text-gray-600 { color: #4b5563 !important; }
      .text-yellow-600 { color: #ca8a04 !important; }
      .bg-gray-50 { background-color: #ffffff !important; }
    }
  `;
  document.head.appendChild(printStyles);

  // Ensure the print header is visible
  document.querySelectorAll(".hidden.print\\:block").forEach((el) => {
    el.classList.remove("hidden");
    el.style.display = "block";
  });

  // Make all relevant containers visible for printing
  document.querySelectorAll(".bg-gray-50, .bg-white").forEach((el) => {
    el.style.display = "block";
    el.style.backgroundColor = "white";
  });

  // Apply specific optimizations based on page type
  if (isTeamsPage) {
    // For team handouts, organize schedules compactly
    document.querySelectorAll(".team-schedule").forEach((team) => {
      // Ensure team name is visible
      const teamHeader = team.querySelector("h3");
      if (teamHeader) teamHeader.style.fontSize = "14px";

      // Sort events chronologically
      const events = Array.from(team.querySelectorAll(".schedule-item")).sort(
        (a, b) => {
          const timeA = a
            .querySelector(".text-right p:first-child")
            .textContent.trim();
          const timeB = b
            .querySelector(".text-right p:first-child")
            .textContent.trim();
          return timeA.localeCompare(timeB);
        }
      );

      // Recreate events in a table for more concise display
      const scheduleTable = document.createElement("table");
      scheduleTable.className = "team-schedule-table";

      // Create table header
      const tableHeader = document.createElement("thead");
      tableHeader.innerHTML = `
        <tr>
          <th>Time</th>
          <th>Activity</th>
          <th>Location</th>
          <th>Duration</th>
        </tr>
      `;
      scheduleTable.appendChild(tableHeader);

      // Create table body
      const tableBody = document.createElement("tbody");
      events.forEach((event) => {
        const time = event
          .querySelector(".text-right p:first-child")
          .textContent.trim();
        const duration = event
          .querySelector(".text-right p:last-child")
          .textContent.trim();
        const activity = event
          .querySelector("p.font-medium")
          .textContent.trim();
        const location = event
          .querySelector("p.text-sm.text-gray-500")
          .textContent.trim();

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${time}</td>
          <td>${activity}</td>
          <td>${location}</td>
          <td>${duration}</td>
        `;
        tableBody.appendChild(row);
      });
      scheduleTable.appendChild(tableBody);

      // Replace the original content with the table
      const scheduleContainer = team.querySelector(".space-y-3");
      if (scheduleContainer) {
        scheduleContainer.innerHTML = "";
        scheduleContainer.appendChild(scheduleTable);
      }
    });
  } else if (isTablesPage || isJudgingPage) {
    // For tables and judging, ensure consistent layout
    document.querySelectorAll("table").forEach((table) => {
      table.style.width = "100%";
      table.style.tableLayout = "fixed";

      // Fix column widths for better layout
      const columns = table.querySelectorAll("th, td");
      const columnCount = table.querySelectorAll("th").length;
      const equalWidth = 100 / columnCount;

      columns.forEach((col) => {
        col.style.width = `${equalWidth}%`;
        col.style.padding = "5px";
        col.style.border = "1px solid #ddd";
      });
    });
  }

  // Add a small delay to ensure styles are applied before printing
  setTimeout(() => {
    document.body.removeChild(message);

    // Trigger print dialog
    window.print();

    // Clean up after printing
    setTimeout(() => {
      document.getElementById("print-styles").remove();

      // Restore original classes
      document.querySelectorAll(".hidden.print\\:block").forEach((el) => {
        el.classList.add("hidden");
      });
    }, 1000);
  }, 500);
}
