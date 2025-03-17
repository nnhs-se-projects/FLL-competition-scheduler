/**
 * PDF Export functionality for FLL Tournament Management System
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
    const exportButtons = document.querySelectorAll(".export-pdf-button");
    if (exportButtons.length > 1) {
      for (let i = 1; i < exportButtons.length; i++) {
        exportButtons[i].remove();
      }
    }
  }
}

function exportToPdf() {
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
    if (typeof window.html2canvas === "undefined") {
      const html2canvasScript = document.createElement("script");
      html2canvasScript.src =
        "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
      document.head.appendChild(html2canvasScript);
    }

    if (
      typeof window.jspdf === "undefined" &&
      typeof window.jsPDF === "undefined"
    ) {
      const jsPdfScript = document.createElement("script");
      jsPdfScript.src =
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      document.head.appendChild(jsPdfScript);
    }

    // Wait for libraries to load
    const checkLibrariesLoaded = setInterval(() => {
      if (
        window.html2canvas !== undefined &&
        (window.jspdf !== undefined || window.jsPDF !== undefined)
      ) {
        clearInterval(checkLibrariesLoaded);
        captureAndGeneratePDF(filename, loadingIndicator);
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
    captureAndGeneratePDF(filename, loadingIndicator);
  }
}

function captureAndGeneratePDF(filename, loadingIndicator) {
  try {
    // Create a hidden clone of the content to avoid modifying the visible page
    const contentElement = document.querySelector(
      ".bg-white.rounded-lg.shadow.p-6"
    );
    if (!contentElement) {
      throw new Error("Could not find schedule content to export");
    }

    // Create a clone container
    const cloneContainer = document.createElement("div");
    cloneContainer.id = "pdf-clone-container";
    cloneContainer.style.position = "absolute";
    cloneContainer.style.left = "-9999px";
    cloneContainer.style.top = "0";
    cloneContainer.style.width = contentElement.offsetWidth + "px";
    cloneContainer.style.backgroundColor = "white";
    cloneContainer.style.zIndex = "-9999";

    // Clone the content
    const clone = contentElement.cloneNode(true);
    cloneContainer.appendChild(clone);
    document.body.appendChild(cloneContainer);

    // Apply print styles to the clone
    applyPrintStylesToClone(clone);

    // Use html2canvas to capture the clone
    window
      .html2canvas(clone, {
        scale: 2, // Increased scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      })
      .then((canvas) => {
        try {
          // Create PDF using jsPDF - fix the constructor name
          let pdf;
          if (window.jspdf) {
            // Use jspdf if available
            pdf = new window.jspdf.jsPDF({
              orientation: "portrait",
              unit: "mm",
              format: "a4",
            });
          } else {
            // Use jsPDF if jspdf is not available
            pdf = new window.jsPDF({
              orientation: "portrait",
              unit: "mm",
              format: "a4",
            });
          }

          // Calculate dimensions
          const imgWidth = 210; // A4 width in mm
          const pageHeight = 295; // A4 height in mm
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
          document.body.removeChild(cloneContainer);
          document.body.removeChild(loadingIndicator);
        } catch (error) {
          console.error("Error creating PDF:", error);
          document.body.removeChild(cloneContainer);
          document.body.removeChild(loadingIndicator);
          alert("Failed to create PDF: " + error.message);
        }
      })
      .catch((error) => {
        console.error("Error capturing content:", error);
        document.body.removeChild(cloneContainer);
        document.body.removeChild(loadingIndicator);
        alert("Failed to capture content for PDF: " + error.message);
      });
  } catch (error) {
    console.error("Error preparing content for PDF:", error);
    document.body.removeChild(loadingIndicator);
    alert("Failed to prepare content for PDF: " + error.message);
  }
}

function applyPrintStylesToClone(element) {
  // Force all content to be visible
  element.querySelectorAll(".bg-gray-50, .bg-white").forEach((el) => {
    el.style.display = "block";
    el.style.backgroundColor = "white";
  });

  // Ensure tables are visible and properly formatted
  element.querySelectorAll("table").forEach((el) => {
    el.style.display = "table";
    el.style.tableLayout = "fixed";
    el.style.width = "100%";
    el.style.borderCollapse = "collapse";
    el.style.marginBottom = "20px";
  });

  // Fix flex containers
  element.querySelectorAll(".flex").forEach((el) => {
    el.style.display = "flex";
  });

  // Fix table cell whitespace
  element.querySelectorAll(".whitespace-nowrap").forEach((el) => {
    el.style.whiteSpace = "normal";
    el.style.wordWrap = "break-word";
  });

  // Fix table cell padding and add borders
  element.querySelectorAll("td, th").forEach((el) => {
    el.style.padding = "6px 8px";
    el.style.border = "1px solid #ddd";
  });

  // Adjust Robot Game Tables (3 columns)
  element.querySelectorAll(".table-schedule table").forEach((table) => {
    // Time column
    table
      .querySelectorAll("th:nth-child(1), td:nth-child(1)")
      .forEach((col) => {
        col.style.width = "20%";
      });

    // Team column
    table
      .querySelectorAll("th:nth-child(2), td:nth-child(2)")
      .forEach((col) => {
        col.style.width = "40%";
      });

    // Duration column
    table
      .querySelectorAll("th:nth-child(3), td:nth-child(3)")
      .forEach((col) => {
        col.style.width = "40%";
      });
  });

  // Adjust Judging Rooms (4 columns)
  element.querySelectorAll(".judging-room table").forEach((table) => {
    // Time column
    table
      .querySelectorAll("th:nth-child(1), td:nth-child(1)")
      .forEach((col) => {
        col.style.width = "15%";
      });

    // Team column
    table
      .querySelectorAll("th:nth-child(2), td:nth-child(2)")
      .forEach((col) => {
        col.style.width = "25%";
      });

    // Type column
    table
      .querySelectorAll("th:nth-child(3), td:nth-child(3)")
      .forEach((col) => {
        col.style.width = "40%";
      });

    // Duration column
    table
      .querySelectorAll("th:nth-child(4), td:nth-child(4)")
      .forEach((col) => {
        col.style.width = "20%";
      });
  });

  // Make sure all hidden elements that should be visible in print are shown
  element.querySelectorAll(".hidden.print\\:block").forEach((el) => {
    el.classList.remove("hidden");
    el.style.display = "block";
  });

  // Hide elements that shouldn't be in the PDF
  element.querySelectorAll(".no-print").forEach((el) => {
    el.style.display = "none";
  });

  // Make sure all schedule containers are visible
  element.querySelectorAll(".schedule-container").forEach((el) => {
    el.style.display = "block";
    el.style.marginBottom = "20px";
  });

  // Ensure all headings are visible
  element.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((el) => {
    el.style.display = "block";
    el.style.marginBottom = "10px";
    el.style.marginTop = "20px";
    el.style.color = "#000";
  });
}
