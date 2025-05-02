/**
 * PDF Export functionality for FLL Competition Scheduler
 * Improved for creating concise, well-formatted handouts
 */
document.addEventListener("DOMContentLoaded", function () {
  // Add export PDF buttons to relevant pages
  addExportPdfButtons();

  // Load required libraries
  loadRequiredLibraries();
});

function loadRequiredLibraries() {
  // Load html2canvas
  if (typeof window.html2canvas === "undefined") {
    const html2canvasScript = document.createElement("script");
    html2canvasScript.src =
      "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    document.head.appendChild(html2canvasScript);
  }

  // Load jsPDF
  if (
    typeof window.jspdf === "undefined" &&
    typeof window.jsPDF === "undefined"
  ) {
    const jsPdfScript = document.createElement("script");
    jsPdfScript.src =
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    document.head.appendChild(jsPdfScript);
  }
}

function addExportPdfButtons() {
  // Check if we're on a relevant page
  const currentPath = window.location.pathname;
  const isTeamsPage = currentPath.includes("/teams");
  const isTablesPage = currentPath.includes("/tables");
  const isJudgingPage = currentPath.includes("/judging");
  const isOverviewPage =
    currentPath === "/" || currentPath.includes("/overview");

  // Add export buttons to schedule pages (teams, tables, judging)
  if (isTeamsPage || isTablesPage || isJudgingPage) {
    // Find the export button container
    const exportBtnContainer = document.getElementById("exportBtnContainer");

    // Check if button already exists to prevent duplicates
    if (
      exportBtnContainer &&
      !exportBtnContainer.querySelector(".export-pdf-button")
    ) {
      // Create the export PDF button
      const exportButton = createExportButton();

      // Add event listener
      exportButton.addEventListener("click", function () {
        exportToPdf("schedule");
      });

      // Add button to container
      exportBtnContainer.appendChild(exportButton);
    }
  }

  // Add export button to master schedule on overview page
  if (isOverviewPage) {
    // Find the master schedule export button container
    const masterScheduleExportBtnContainer = document.getElementById(
      "masterScheduleExportBtnContainer"
    );

    if (
      masterScheduleExportBtnContainer &&
      !masterScheduleExportBtnContainer.querySelector(".export-pdf-button")
    ) {
      // Create the export PDF button
      const exportButton = createExportButton();

      // Add event listener
      exportButton.addEventListener("click", function () {
        exportToPdf("master");
      });

      // Add button to container
      masterScheduleExportBtnContainer.appendChild(exportButton);
    }
  }

  // Remove any duplicate export buttons that might be in the DOM
  const exportButtons = document.querySelectorAll(".export-pdf-button");
  const buttonContainers = new Set();
  exportButtons.forEach((button) => {
    const container = button.parentElement;
    if (buttonContainers.has(container)) {
      button.remove();
    } else {
      buttonContainers.add(container);
    }
  });
}

function createExportButton() {
  const exportButton = document.createElement("button");
  exportButton.className =
    "export-pdf-button bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center";
  exportButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    Export PDF
  `;
  return exportButton;
}

function exportToPdf(type = "schedule") {
  // Get page title for filename
  let pageTitle = "fll-schedule";
  const path = window.location.pathname;
  const isTeamsPage = path.includes("/teams");
  const isTablesPage = path.includes("/tables");
  const isJudgingPage = path.includes("/judging");
  const isMasterSchedule = type === "master";

  if (isMasterSchedule) {
    pageTitle = "master-schedule";
  } else if (isTablesPage) {
    pageTitle = "robot-game-tables";
  } else if (isJudgingPage) {
    pageTitle = "judging-rooms";
  } else if (isTeamsPage) {
    pageTitle = "team-schedules";
  }

  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `${pageTitle}-${timestamp}.pdf`;

  // Show loading indicator
  const loadingIndicator = document.createElement("div");
  loadingIndicator.id = "pdf-loading-indicator";
  loadingIndicator.style.position = "fixed";
  loadingIndicator.style.top = "50%";
  loadingIndicator.style.left = "50%";
  loadingIndicator.style.transform = "translate(-50%, -50%)";
  loadingIndicator.style.padding = "20px";
  loadingIndicator.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  loadingIndicator.style.color = "white";
  loadingIndicator.style.borderRadius = "5px";
  loadingIndicator.style.zIndex = "9999";
  loadingIndicator.textContent = "Generating PDF...";
  document.body.appendChild(loadingIndicator);

  // Check if libraries are loaded
  if (
    typeof window.html2canvas === "undefined" ||
    (typeof window.jspdf === "undefined" && typeof window.jsPDF === "undefined")
  ) {
    // Load required libraries
    loadRequiredLibraries();

    // Wait for libraries to load
    const checkLibrariesLoaded = setInterval(() => {
      if (
        window.html2canvas !== undefined &&
        (window.jspdf !== undefined || window.jsPDF !== undefined)
      ) {
        clearInterval(checkLibrariesLoaded);
        prepareAndGeneratePDF(
          filename,
          loadingIndicator,
          isTeamsPage,
          isTablesPage,
          isJudgingPage,
          isMasterSchedule
        );
      }
    }, 100);

    // Set a timeout in case libraries don't load
    setTimeout(() => {
      clearInterval(checkLibrariesLoaded);
      if (
        typeof window.html2canvas === "undefined" ||
        (typeof window.jspdf === "undefined" &&
          typeof window.jsPDF === "undefined")
      ) {
        document.body.removeChild(loadingIndicator);
        alert(
          "Failed to load PDF generation libraries. Please try again later."
        );
      }
    }, 5000);
  } else {
    // Libraries already loaded
    prepareAndGeneratePDF(
      filename,
      loadingIndicator,
      isTeamsPage,
      isTablesPage,
      isJudgingPage,
      isMasterSchedule
    );
  }
}

function prepareAndGeneratePDF(
  filename,
  loadingIndicator,
  isTeamsPage,
  isTablesPage,
  isJudgingPage,
  isMasterSchedule
) {
  try {
    // Create optimized content for PDF export
    const container = document.createElement("div");
    container.id = "pdf-export-container";
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "0";
    container.style.width = "210mm"; // A4 width
    container.style.backgroundColor = "white";
    container.style.fontFamily = "Arial, sans-serif";
    container.style.fontSize = "11px";
    container.style.padding = "10mm";
    container.style.boxSizing = "border-box";

    // Create header
    const header = document.createElement("div");
    header.style.textAlign = "center";
    header.style.marginBottom = "10mm";

    const title = document.createElement("h1");
    title.style.fontSize = "18px";
    title.style.marginBottom = "4px";
    title.textContent = "FLL Competition Schedule";
    header.appendChild(title);

    const subtitle = document.createElement("h2");
    subtitle.style.fontSize = "16px";
    subtitle.style.marginBottom = "4px";

    if (isMasterSchedule) {
      subtitle.textContent = "Master Schedule";
    } else if (isTeamsPage) {
      subtitle.textContent = "Team Schedules";
    } else if (isTablesPage) {
      subtitle.textContent = "Robot Game Tables";
    } else if (isJudgingPage) {
      subtitle.textContent = "Judging Rooms";
    }

    header.appendChild(subtitle);

    const timestamp = document.createElement("p");
    timestamp.style.fontSize = "12px";
    timestamp.style.color = "#666";
    timestamp.textContent = `Generated: ${new Date().toLocaleDateString()}`;
    header.appendChild(timestamp);

    container.appendChild(header);

    // Create content based on page type
    if (isMasterSchedule) {
      createMasterScheduleContent(container);
    } else if (isTeamsPage) {
      createTeamsPageContent(container);
    } else if (isTablesPage) {
      createTablesPageContent(container);
    } else if (isJudgingPage) {
      createJudgingPageContent(container);
    }

    // Add container to document
    document.body.appendChild(container);

    // Use html2canvas to capture the content
    window
      .html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      })
      .then((canvas) => {
        try {
          // Create PDF using jsPDF
          let pdf;
          if (window.jspdf) {
            pdf = new window.jspdf.jsPDF({
              orientation: "portrait",
              unit: "mm",
              format: "a4",
            });
          } else {
            pdf = new window.jsPDF({
              orientation: "portrait",
              unit: "mm",
              format: "a4",
            });
          }

          // Calculate dimensions
          const imgWidth = 210; // A4 width in mm
          const pageHeight = 297; // A4 height in mm
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          let heightLeft = imgHeight;
          let position = 0;

          // Add first page
          const imgData = canvas.toDataURL("image/jpeg", 1.0);
          pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;

          // Add additional pages if needed
          while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }

          // Save the PDF
          pdf.save(filename);

          // Clean up
          document.body.removeChild(container);
          document.body.removeChild(loadingIndicator);
        } catch (error) {
          console.error("Error creating PDF:", error);
          document.body.removeChild(container);
          document.body.removeChild(loadingIndicator);
          alert("Failed to create PDF: " + error.message);
        }
      })
      .catch((error) => {
        console.error("Error capturing content:", error);
        document.body.removeChild(container);
        document.body.removeChild(loadingIndicator);
        alert("Failed to capture content for PDF: " + error.message);
      });
  } catch (error) {
    console.error("Error preparing content for PDF:", error);
    document.body.removeChild(loadingIndicator);
    alert("Failed to prepare content for PDF: " + error.message);
  }
}

function createMasterScheduleContent(container) {
  // Create a legend for the master schedule
  const legend = document.createElement("div");
  legend.style.marginBottom = "10px";
  legend.style.fontSize = "10px";
  legend.innerHTML = `
    <p style="margin-bottom: 5px; font-weight: bold;">Legend:</p>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
      <p><span style="display: inline-block; width: 10px; height: 10px; background-color: #fee2e2; margin-right: 5px;"></span>Opening/Closing</p>
      <p><span style="display: inline-block; width: 10px; height: 10px; background-color: #ede9fe; margin-right: 5px;"></span>Robot Design</p>
      <p><span style="display: inline-block; width: 10px; height: 10px; background-color: #dcfce7; margin-right: 5px;"></span>Project</p>
      <p><span style="display: inline-block; width: 10px; height: 10px; background-color: #dbeafe; margin-right: 5px;"></span>Robot Game</p>
      <p><span style="display: inline-block; width: 10px; height: 10px; background-color: #fef3c7; margin-right: 5px;"></span>Lunch</p>
    </div>
  `;
  container.appendChild(legend);

  // Clone the master schedule table for the PDF
  const originalTable = document.querySelector(
    ".master-schedule-container table"
  );
  if (originalTable) {
    const table = originalTable.cloneNode(true);
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.fontSize = "9px";

    // Format cells
    const cells = table.querySelectorAll("th, td");
    cells.forEach((cell) => {
      cell.style.border = "1px solid #ddd";
      cell.style.padding = "2px";
      cell.style.textAlign = cell.classList.contains("text-center")
        ? "center"
        : "left";

      // Preserve background colors
      if (cell.classList.contains("bg-red-50"))
        cell.style.backgroundColor = "#fee2e2";
      if (cell.classList.contains("bg-purple-50"))
        cell.style.backgroundColor = "#ede9fe";
      if (cell.classList.contains("bg-green-50"))
        cell.style.backgroundColor = "#dcfce7";
      if (cell.classList.contains("bg-blue-50"))
        cell.style.backgroundColor = "#dbeafe";
      if (cell.classList.contains("bg-amber-50"))
        cell.style.backgroundColor = "#fef3c7";
      if (
        cell.classList.contains("bg-gray-50") ||
        cell.classList.contains("bg-gray-100")
      )
        cell.style.backgroundColor = "#f9fafb";
    });

    container.appendChild(table);
  } else {
    const errorMsg = document.createElement("p");
    errorMsg.textContent = "No master schedule found to export";
    errorMsg.style.color = "red";
    container.appendChild(errorMsg);
  }
}

function createTeamsPageContent(container) {
  // Create a more optimized and concise team schedule layout
  const teams = document.querySelectorAll(".team-schedule");

  teams.forEach((team, index) => {
    // Extract team information
    const teamHeaderEl = team.querySelector("h3");
    const teamName = teamHeaderEl
      ? teamHeaderEl.textContent.trim()
      : `Team ${index + 1}`;

    // Create team section
    const teamSection = document.createElement("div");
    teamSection.style.pageBreakInside = "avoid";
    teamSection.style.marginBottom = "10mm";

    // Create team header
    const teamHeader = document.createElement("h3");
    teamHeader.style.fontSize = "14px";
    teamHeader.style.marginBottom = "5px";
    teamHeader.style.backgroundColor = "#f0f0f0";
    teamHeader.style.padding = "5px";
    teamHeader.style.borderRadius = "3px";
    teamHeader.textContent = teamName;
    teamSection.appendChild(teamHeader);

    // Create team schedule table
    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.marginBottom = "5mm";

    // Add table header
    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr>
        <th style="border: 1px solid #ddd; padding: 5px; background-color: #f2f2f2; width: 15%;">Time</th>
        <th style="border: 1px solid #ddd; padding: 5px; background-color: #f2f2f2; width: 35%;">Activity</th>
        <th style="border: 1px solid #ddd; padding: 5px; background-color: #f2f2f2; width: 35%;">Location</th>
        <th style="border: 1px solid #ddd; padding: 5px; background-color: #f2f2f2; width: 15%;">Duration</th>
      </tr>
    `;
    table.appendChild(thead);

    // Add table body
    const tbody = document.createElement("tbody");

    // Get all events for this team and sort them by time
    const events = Array.from(team.querySelectorAll(".schedule-item"));
    events.sort((a, b) => {
      const timeA = a
        .querySelector(".text-right p:first-child")
        .textContent.trim();
      const timeB = b
        .querySelector(".text-right p:first-child")
        .textContent.trim();
      return timeA.localeCompare(timeB);
    });

    // Add each event as a row
    events.forEach((event) => {
      const time = event
        .querySelector(".text-right p:first-child")
        .textContent.trim();
      const duration = event
        .querySelector(".text-right p:last-child")
        .textContent.trim();
      const activityEl = event.querySelector("p.font-medium span");
      const activity = activityEl
        ? activityEl.textContent.trim()
        : event.querySelector("p.font-medium").textContent.trim();
      const location = event
        .querySelector("p.text-sm.text-gray-500")
        .textContent.trim();

      // Get event type color
      let backgroundColor = "#ffffff";
      if (activity.includes("Robot Game")) backgroundColor = "#ebf5ff";
      else if (activity.includes("Robot Design")) backgroundColor = "#f5ebff";
      else if (activity.includes("Project")) backgroundColor = "#ebffeb";
      else if (activity.includes("Lunch")) backgroundColor = "#fff5eb";
      else if (activity.includes("Opening")) backgroundColor = "#ffebeb";
      else if (activity.includes("Closing")) backgroundColor = "#ffebeb";

      const row = document.createElement("tr");
      row.innerHTML = `
        <td style="border: 1px solid #ddd; padding: 5px; background-color: ${backgroundColor};">${time}</td>
        <td style="border: 1px solid #ddd; padding: 5px; background-color: ${backgroundColor}; font-weight: medium;">${activity}</td>
        <td style="border: 1px solid #ddd; padding: 5px; background-color: ${backgroundColor};">${location}</td>
        <td style="border: 1px solid #ddd; padding: 5px; background-color: ${backgroundColor};">${duration}</td>
      `;
      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    teamSection.appendChild(table);

    // Add team section to container
    container.appendChild(teamSection);

    // Add page break after every two teams except the last
    if (index % 2 === 1 && index < teams.length - 1) {
      const pageBreak = document.createElement("div");
      pageBreak.style.pageBreakAfter = "always";
      pageBreak.style.height = "1px";
      container.appendChild(pageBreak);
    }
  });
}

function createTablesPageContent(container) {
  // Create a more optimized and concise tables layout
  const tables = document.querySelectorAll(".table-schedule");

  tables.forEach((tableSection, index) => {
    // Extract table information
    const tableHeaderEl = tableSection.querySelector("h3");
    const tableName = tableHeaderEl
      ? tableHeaderEl.textContent.trim()
      : `Table ${index + 1}`;

    // Create table section
    const section = document.createElement("div");
    section.style.pageBreakInside = "avoid";
    section.style.marginBottom = "10mm";

    // Create table header
    const sectionHeader = document.createElement("h3");
    sectionHeader.style.fontSize = "14px";
    sectionHeader.style.marginBottom = "5px";
    sectionHeader.style.backgroundColor = "#ebf5ff"; // Blue tint for robot tables
    sectionHeader.style.padding = "5px";
    sectionHeader.style.borderRadius = "3px";
    sectionHeader.textContent = tableName;
    section.appendChild(sectionHeader);

    // Clone the existing table and format it
    const originalTable = tableSection.querySelector("table");
    if (originalTable) {
      const table = originalTable.cloneNode(true);
      table.style.width = "100%";
      table.style.borderCollapse = "collapse";
      table.style.marginBottom = "5mm";

      // Format table cells
      const cells = table.querySelectorAll("th, td");
      cells.forEach((cell) => {
        cell.style.border = "1px solid #ddd";
        cell.style.padding = "5px";

        // Set header background
        if (cell.tagName.toLowerCase() === "th") {
          cell.style.backgroundColor = "#f2f2f2";
        }

        // Add color to event type cells
        if (cell.classList.contains("text-blue-600")) {
          cell.style.color = "#2563eb";
          cell.parentElement.style.backgroundColor = "#ebf5ff";
        } else if (cell.classList.contains("text-teal-600")) {
          cell.style.color = "#0d9488";
          cell.parentElement.style.backgroundColor = "#ebfffd";
        }
      });

      section.appendChild(table);
    }

    // Add section to container
    container.appendChild(section);

    // Add page break after every 2 tables except the last
    if (index % 2 === 1 && index < tables.length - 1) {
      const pageBreak = document.createElement("div");
      pageBreak.style.pageBreakAfter = "always";
      pageBreak.style.height = "1px";
      container.appendChild(pageBreak);
    }
  });
}

function createJudgingPageContent(container) {
  // Create a more optimized and concise judging rooms layout
  const judgingRooms = document.querySelectorAll(".judging-schedule");

  judgingRooms.forEach((roomSection, index) => {
    // Extract room information
    const roomHeaderEl = roomSection.querySelector("h3");
    const roomName = roomHeaderEl
      ? roomHeaderEl.textContent.trim()
      : `Judging Room ${index + 1}`;

    // Create room section
    const section = document.createElement("div");
    section.style.pageBreakInside = "avoid";
    section.style.marginBottom = "10mm";

    // Create room header
    const sectionHeader = document.createElement("h3");
    sectionHeader.style.fontSize = "14px";
    sectionHeader.style.marginBottom = "5px";
    sectionHeader.style.backgroundColor = "#f5ebff"; // Purple tint for judging rooms
    sectionHeader.style.padding = "5px";
    sectionHeader.style.borderRadius = "3px";
    sectionHeader.textContent = roomName;
    section.appendChild(sectionHeader);

    // Clone the existing table and format it
    const originalTable = roomSection.querySelector("table");
    if (originalTable) {
      const table = originalTable.cloneNode(true);
      table.style.width = "100%";
      table.style.borderCollapse = "collapse";
      table.style.marginBottom = "5mm";

      // Format table cells
      const cells = table.querySelectorAll("th, td");
      cells.forEach((cell) => {
        cell.style.border = "1px solid #ddd";
        cell.style.padding = "5px";

        // Set header background
        if (cell.tagName.toLowerCase() === "th") {
          cell.style.backgroundColor = "#f2f2f2";
        }

        // Add color to event type cells
        if (cell.classList.contains("text-green-600")) {
          cell.style.color = "#16a34a";
          cell.parentElement.style.backgroundColor = "#ebffeb";
        } else if (cell.classList.contains("text-purple-600")) {
          cell.style.color = "#9333ea";
          cell.parentElement.style.backgroundColor = "#f5ebff";
        } else if (cell.classList.contains("text-indigo-600")) {
          cell.style.color = "#4f46e5";
          cell.parentElement.style.backgroundColor = "#eef0ff";
        }
      });

      section.appendChild(table);
    }

    // Add section to container
    container.appendChild(section);

    // Add page break after every 2 rooms except the last
    if (index % 2 === 1 && index < judgingRooms.length - 1) {
      const pageBreak = document.createElement("div");
      pageBreak.style.pageBreakAfter = "always";
      pageBreak.style.height = "1px";
      container.appendChild(pageBreak);
    }
  });
}
