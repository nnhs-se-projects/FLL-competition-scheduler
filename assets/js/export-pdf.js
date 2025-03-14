/**
 * PDF Export functionality for FLL Tournament Management System
 * Uses jsPDF and html2canvas for direct PDF download
 */
document.addEventListener("DOMContentLoaded", function () {
  // Load required libraries if not already loaded
  loadRequiredLibraries();

  // Add export PDF buttons to relevant pages
  addExportPdfButtons();
});

function loadRequiredLibraries() {
  // Check if jsPDF is already loaded
  if (typeof jspdf === "undefined" && typeof jsPDF === "undefined") {
    const jsPDFScript = document.createElement("script");
    jsPDFScript.src =
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    document.head.appendChild(jsPDFScript);
  }

  // Check if html2canvas is already loaded
  if (typeof html2canvas === "undefined") {
    const html2canvasScript = document.createElement("script");
    html2canvasScript.src =
      "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    document.head.appendChild(html2canvasScript);
  }
}

function addExportPdfButtons() {
  // Check if we're on a relevant page
  const currentPath = window.location.pathname;

  if (
    currentPath.includes("/tables") ||
    currentPath.includes("/judging") ||
    currentPath.includes("/teams")
  ) {
    // Find the print button container
    const printButtonContainer = document.querySelector(
      ".flex.justify-end.mb-4"
    );

    // Check if button already exists to prevent duplicates
    if (printButtonContainer && !document.querySelector(".export-pdf-button")) {
      // Create the export PDF button
      const exportButton = document.createElement("button");
      exportButton.className =
        "export-pdf-button bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center ml-2";
      exportButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export PDF
      `;

      // Add event listener
      exportButton.addEventListener("click", exportToPdf);

      // Add button to container
      printButtonContainer.appendChild(exportButton);
    }

    // Remove any duplicate export buttons that might be in the DOM
    const exportButtons = document.querySelectorAll('[class*="export-pdf"]');
    if (exportButtons.length > 1) {
      for (let i = 1; i < exportButtons.length; i++) {
        exportButtons[i].remove();
      }
    }
  }
}

function exportToPdf() {
  // Check if required libraries are loaded
  if (
    typeof html2canvas === "undefined" ||
    (typeof jspdf === "undefined" && typeof jsPDF === "undefined")
  ) {
    alert(
      "PDF export libraries are still loading. Please try again in a few seconds."
    );
    return;
  }

  // Get page title for filename
  let pageTitle = "fll-schedule";
  if (window.location.pathname.includes("/tables")) {
    pageTitle = "robot-game-tables";
  } else if (window.location.pathname.includes("/judging")) {
    pageTitle = "judging-rooms";
  } else if (window.location.pathname.includes("/teams")) {
    pageTitle = "team-schedules";
  }
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `${pageTitle}-${timestamp}.pdf`;

  // Create a clone of the content to avoid modifying the original
  const contentElement = document.querySelector(".max-w-7xl");
  const contentClone = contentElement.cloneNode(true);

  // Create a temporary container for the PDF content
  const tempContainer = document.createElement("div");
  tempContainer.style.position = "absolute";
  tempContainer.style.left = "-9999px";
  tempContainer.style.backgroundColor = "white";
  tempContainer.style.width = "800px"; // Fixed width for better PDF generation
  document.body.appendChild(tempContainer);

  // Add a header to the PDF
  const header = document.createElement("div");
  header.style.textAlign = "center";
  header.style.marginBottom = "20px";
  header.innerHTML = `
    <h1 style="font-size: 24px; margin-bottom: 5px;">FLL Competition Schedule</h1>
    <h2 style="font-size: 18px; margin-bottom: 5px;">${pageTitle
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase())}</h2>
    <p style="font-size: 14px;">Generated: ${new Date().toLocaleDateString()}</p>
  `;
  tempContainer.appendChild(header);

  // Process the clone to make it suitable for PDF
  // Remove no-print elements
  contentClone.querySelectorAll(".no-print").forEach((el) => el.remove());

  // Show print-only elements
  contentClone.querySelectorAll(".hidden.print\\:block").forEach((el) => {
    el.classList.remove("hidden");
    el.style.display = "block";
  });

  // Get the main content container with schedules
  const mainContent = contentClone.querySelector(
    ".bg-white.rounded-lg.shadow.p-6"
  );
  if (mainContent) {
    tempContainer.appendChild(mainContent);
  } else {
    // If main content not found, try to get all tables
    const tables = contentClone.querySelectorAll("table");
    if (tables.length > 0) {
      tables.forEach((table) => {
        const tableContainer = document.createElement("div");
        tableContainer.style.marginBottom = "20px";

        // Try to get table title
        const tableParent = table.parentElement;
        const tableTitle = tableParent.querySelector("h3");
        if (tableTitle) {
          const titleElement = document.createElement("h3");
          titleElement.textContent = tableTitle.textContent;
          titleElement.style.fontSize = "16px";
          titleElement.style.marginBottom = "10px";
          tableContainer.appendChild(titleElement);
        }

        // Style the table
        table.style.width = "100%";
        table.style.borderCollapse = "collapse";
        table.style.marginBottom = "15px";

        // Style table cells
        table.querySelectorAll("th, td").forEach((cell) => {
          cell.style.border = "1px solid #ddd";
          cell.style.padding = "8px";
          cell.style.textAlign = "left";
        });

        // Style table headers
        table.querySelectorAll("th").forEach((header) => {
          header.style.backgroundColor = "#f2f2f2";
          header.style.fontWeight = "bold";
        });

        tableContainer.appendChild(table);
        tempContainer.appendChild(tableContainer);
      });
    } else {
      // If no tables found, add an error message
      const errorMsg = document.createElement("p");
      errorMsg.textContent = "No schedule content found to export.";
      tempContainer.appendChild(errorMsg);
    }
  }

  // Apply styles to ensure content is visible
  tempContainer.querySelectorAll(".bg-gray-50, .bg-white").forEach((el) => {
    el.style.display = "block";
    el.style.backgroundColor = "white";
  });

  tempContainer.querySelectorAll("table").forEach((table) => {
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.marginBottom = "15px";
  });

  tempContainer.querySelectorAll(".grid").forEach((grid) => {
    grid.style.display = "block";
  });

  tempContainer.querySelectorAll(".whitespace-nowrap").forEach((cell) => {
    cell.style.whiteSpace = "normal";
    cell.style.wordWrap = "break-word";
  });

  // Use html2canvas to capture the content
  html2canvas(tempContainer, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "white",
  })
    .then((canvas) => {
      // Create PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Calculate dimensions
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / pdfWidth;
      const totalPages = Math.ceil(canvasHeight / (pdfHeight * ratio));

      // Add pages to PDF
      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage();
        }

        // Calculate the portion of the canvas to use for this page
        const srcY = i * pdfHeight * ratio;
        const srcHeight = Math.min(pdfHeight * ratio, canvasHeight - srcY);

        pdf.addImage(
          imgData,
          "JPEG",
          0,
          0,
          pdfWidth,
          srcHeight / ratio,
          null,
          "FAST",
          0,
          srcY
        );
      }

      // Save the PDF
      pdf.save(filename);

      // Clean up
      document.body.removeChild(tempContainer);
    })
    .catch((error) => {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF. Please try again.");
      document.body.removeChild(tempContainer);
    });
}

/**
 * Adjusts styles on a cloned content element so that all schedule elements are visible
 * and styled similarly to the print view.
 */
function adjustScheduleStyles(rootElement) {
  // Force background elements to display correctly
  rootElement.querySelectorAll(".bg-gray-50, .bg-white").forEach((el) => {
    el.style.display = "block";
    el.style.backgroundColor = "white";
  });

  // Ensure all tables are visible and styled
  rootElement.querySelectorAll("table").forEach((el) => {
    el.style.display = "table";
    el.style.tableLayout = "fixed";
    el.style.width = "100%";
    el.style.borderCollapse = "collapse";
    el.style.marginBottom = "1rem";
  });

  // Fix flex containers
  rootElement.querySelectorAll(".flex").forEach((el) => {
    el.style.display = "flex";
  });

  // Fix grid containers – if needed, you can choose to retain grid styles instead
  rootElement.querySelectorAll(".grid").forEach((el) => {
    el.style.display = "block";
  });

  // Fix table cell whitespace so that content wraps properly
  rootElement.querySelectorAll(".whitespace-nowrap").forEach((el) => {
    el.style.whiteSpace = "normal";
    el.style.wordWrap = "break-word";
  });

  // Style table cells
  rootElement.querySelectorAll("td, th").forEach((el) => {
    el.style.padding = "6px 8px";
    el.style.border = "1px solid #ddd";
    el.style.textAlign = "left";
  });

  // Style table headers
  rootElement.querySelectorAll("th").forEach((el) => {
    el.style.backgroundColor = "#f2f2f2";
    el.style.fontWeight = "bold";
  });

  // Adjust Robot Game Tables (assumed 3 columns)
  rootElement.querySelectorAll(".table-schedule table").forEach((table) => {
    const timeColumns = table.querySelectorAll(
      "th:nth-child(1), td:nth-child(1)"
    );
    timeColumns.forEach((col) => {
      col.style.width = "20%";
    });
    const teamColumns = table.querySelectorAll(
      "th:nth-child(2), td:nth-child(2)"
    );
    teamColumns.forEach((col) => {
      col.style.width = "40%";
    });
    const durationColumns = table.querySelectorAll(
      "th:nth-child(3), td:nth-child(3)"
    );
    durationColumns.forEach((col) => {
      col.style.width = "40%";
    });
  });

  // Adjust Judging Rooms (assumed 4 columns)
  rootElement.querySelectorAll(".judging-schedule table").forEach((table) => {
    const timeColumns = table.querySelectorAll(
      "th:nth-child(1), td:nth-child(1)"
    );
    timeColumns.forEach((col) => {
      col.style.width = "15%";
    });
    const teamColumns = table.querySelectorAll(
      "th:nth-child(2), td:nth-child(2)"
    );
    teamColumns.forEach((col) => {
      col.style.width = "25%";
    });
    const typeColumns = table.querySelectorAll(
      "th:nth-child(3), td:nth-child(3)"
    );
    typeColumns.forEach((col) => {
      col.style.width = "40%";
    });
    const durationColumns = table.querySelectorAll(
      "th:nth-child(4), td:nth-child(4)"
    );
    durationColumns.forEach((col) => {
      col.style.width = "20%";
    });
  });

  // Ensure schedule containers are set to display and avoid breaking in the middle
  rootElement
    .querySelectorAll(".table-schedule, .judging-schedule, .team-schedule")
    .forEach((el) => {
      el.style.display = "block";
      el.style.pageBreakInside = "avoid";
      el.style.breakInside = "avoid";
      el.style.marginBottom = "20px";
      el.style.backgroundColor = "white";
    });
}
