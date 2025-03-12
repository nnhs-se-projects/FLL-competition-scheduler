/**
 * Print helper functions for FLL Competition Scheduler
 */

// eslint-disable-next-line no-unused-vars
function printSchedule() {
  // Force all content to be visible for printing
  document.querySelectorAll(".bg-gray-50, .bg-white").forEach((el) => {
    el.setAttribute("data-original-display", el.style.display);
    el.style.display = "block";
    el.setAttribute("data-original-bg", el.style.backgroundColor);
    el.style.backgroundColor = "white";
  });

  // Ensure tables are visible
  document.querySelectorAll("table").forEach((el) => {
    el.setAttribute("data-original-display", el.style.display);
    el.style.display = "table";
    el.style.tableLayout = "fixed";
    el.style.width = "100%";
  });

  // Fix flex containers
  document.querySelectorAll(".flex").forEach((el) => {
    el.setAttribute("data-original-display", el.style.display);
    el.style.display = "flex";
  });

  // Fix table cell whitespace
  document.querySelectorAll(".whitespace-nowrap").forEach((el) => {
    el.style.whiteSpace = "normal";
    el.style.wordWrap = "break-word";
  });

  // Fix table cell padding
  document.querySelectorAll("td, th").forEach((el) => {
    el.style.padding = "6px 8px";
  });

  // Adjust Robot Game Tables (3 columns)
  document.querySelectorAll(".table-schedule table").forEach((table) => {
    // Time column
    const timeColumns = table.querySelectorAll(
      "th:nth-child(1), td:nth-child(1)"
    );
    timeColumns.forEach((col) => {
      col.style.width = "20%";
    });

    // Team column
    const teamColumns = table.querySelectorAll(
      "th:nth-child(2), td:nth-child(2)"
    );
    teamColumns.forEach((col) => {
      col.style.width = "40%";
    });

    // Duration column
    const durationColumns = table.querySelectorAll(
      "th:nth-child(3), td:nth-child(3)"
    );
    durationColumns.forEach((col) => {
      col.style.width = "40%";
    });
  });

  // Adjust Judging Rooms (4 columns)
  document.querySelectorAll(".judging-room table").forEach((table) => {
    // Time column
    const timeColumns = table.querySelectorAll(
      "th:nth-child(1), td:nth-child(1)"
    );
    timeColumns.forEach((col) => {
      col.style.width = "15%";
    });

    // Team column
    const teamColumns = table.querySelectorAll(
      "th:nth-child(2), td:nth-child(2)"
    );
    teamColumns.forEach((col) => {
      col.style.width = "25%";
    });

    // Type column
    const typeColumns = table.querySelectorAll(
      "th:nth-child(3), td:nth-child(3)"
    );
    typeColumns.forEach((col) => {
      col.style.width = "40%";
    });

    // Duration column
    const durationColumns = table.querySelectorAll(
      "th:nth-child(4), td:nth-child(4)"
    );
    durationColumns.forEach((col) => {
      col.style.width = "20%";
    });
  });

  // Add a small delay to ensure styles are applied before printing
  setTimeout(() => {
    // Trigger print dialog
    window.print();

    // Restore original styles after printing
    setTimeout(() => {
      document.querySelectorAll("[data-original-display]").forEach((el) => {
        el.style.display = el.getAttribute("data-original-display");
        el.removeAttribute("data-original-display");
      });

      document.querySelectorAll("[data-original-bg]").forEach((el) => {
        el.style.backgroundColor = el.getAttribute("data-original-bg");
        el.removeAttribute("data-original-bg");
      });

      document.querySelectorAll(".whitespace-nowrap").forEach((el) => {
        el.style.whiteSpace = "nowrap";
        el.style.wordWrap = "";
      });

      document.querySelectorAll("table").forEach((el) => {
        el.style.tableLayout = "";
        el.style.width = "";
      });

      document.querySelectorAll("td, th").forEach((el) => {
        el.style.width = "";
        el.style.padding = "";
      });
    }, 1000);
  }, 100);
}
