/**
 * contains client-side Javascript functions
 *  (primarily event handlers to fetch data from the Node server)
 */

// Add styling for the schedule table
document.addEventListener("DOMContentLoaded", function () {
  const scheduleContainers = document.querySelectorAll(".schedule-container");
  scheduleContainers.forEach((container) => {
    container.style.margin = "2rem 0";
    container.style.padding = "0 1rem";
  });

  // Add some spacing between tables
  const tables = document.querySelectorAll('table[role="grid"]');
  tables.forEach((table) => {
    table.style.marginBottom = "2rem";
  });

  // Style the h3 headers
  const h3s = document.querySelectorAll("h3");
  h3s.forEach((h3) => {
    h3.style.marginTop = "1.5rem";
    h3.style.color = "#2c3e50";
  });
});
