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

  // Create and populate the visual schedule grid
  function createScheduleGrid(scheduleData) {
    const container = document.getElementById("schedule-grid-container");
    if (!container || !scheduleData) return;

    // Clear existing content
    container.innerHTML = "";

    // Create the grid structure
    const gridWrapper = document.createElement("div");
    gridWrapper.className = "grid-wrapper";

    // Calculate the latest end time from all events
    const latestEndTime = Math.max(
      ...scheduleData.map((event) => event.startTime + event.duration)
    );
    const lastHour = Math.ceil((latestEndTime + 30) / 60); // Add 30-minute buffer

    // Create time axis with corner cell
    const timeAxis = document.createElement("div");
    timeAxis.className = "time-axis";

    // Add corner cell
    const cornerCell = document.createElement("div");
    cornerCell.className = "corner-cell";
    timeAxis.appendChild(cornerCell);

    // Create time slots up to the latest event
    for (let hour = 0; hour <= lastHour; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeSlot = document.createElement("div");
        timeSlot.className = "time-slot";
        const formattedHour = hour.toString().padStart(2, "0");
        const formattedMinute = minute.toString().padStart(2, "0");
        timeSlot.textContent = `${formattedHour}:${formattedMinute}`;
        timeAxis.appendChild(timeSlot);
      }
    }
    gridWrapper.appendChild(timeAxis);

    // Create team columns
    const teamsContainer = document.createElement("div");
    teamsContainer.className = "teams-container";

    // Get unique team IDs and sort them
    const teamIds = [
      ...new Set(scheduleData.map((event) => event.teamID)),
    ].sort((a, b) => a - b);

    teamIds.forEach((teamId) => {
      const teamColumn = document.createElement("div");
      teamColumn.className = "team-column";

      const headerContainer = document.createElement("div");
      headerContainer.className = "team-header-container";
      headerContainer.textContent = `Team ${teamId}`;
      teamColumn.appendChild(headerContainer);

      const eventsContainer = document.createElement("div");
      eventsContainer.className = "events-container";
      teamColumn.appendChild(eventsContainer);

      // Add events for this team
      const teamEvents = scheduleData.filter(
        (event) => event.teamID === teamId
      );
      teamEvents.forEach((event) => {
        const eventElement = document.createElement("div");
        eventElement.className = `event ${
          event.type === "tableRun" ? "table-run" : "judging"
        }`;

        // Calculate position and height based on minutes
        const startMinutes = event.startTime;
        const PIXELS_PER_MINUTE = 40 / 15; // 2.667 pixels per minute
        const topPosition = startMinutes * PIXELS_PER_MINUTE;
        const height = event.duration * PIXELS_PER_MINUTE;

        eventElement.style.top = `${topPosition}px`;
        eventElement.style.height = `${height}px`;

        // Add event details
        eventElement.innerHTML = `
          <div class="event-content">
            <div class="event-title">${
              event.type === "tableRun"
                ? "Table Run"
                : event.type === "robotJudging"
                ? "Design Judging"
                : "Project Judging"
            }</div>
            <div class="event-time">${formatTime(startMinutes)} - ${formatTime(
          startMinutes + event.duration
        )}</div>
          </div>
        `;

        eventsContainer.appendChild(eventElement);
      });

      teamsContainer.appendChild(teamColumn);
    });

    gridWrapper.appendChild(teamsContainer);
    container.appendChild(gridWrapper);
  }

  function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours
      .toString()
      .padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  }

  // Add styles dynamically
  const styles = `
    .grid-wrapper {
      display: flex;
      height: 1000px;
      overflow: hidden;
      border: 1px solid #ccc;
      margin: 20px 0;
    }

    .time-axis {
      position: sticky;
      left: 0;
      z-index: 2;
      min-width: 120px;  /* Further increased width */
      border-right: 1px solid #ccc;
      background: #f5f5f5;
      overflow: hidden;
    }

    .time-slot {
      height: 40px;
      padding: 5px 20px 5px 5px;  /* Increased right padding */
      border-bottom: 1px solid #eee;
      font-size: 11px;
      line-height: 40px;
      text-align: right;
      white-space: nowrap;
      user-select: none;
      box-sizing: border-box;
    }

    .teams-container {
      padding-top: 40px;
      margin-top: -40px;
      display: flex;
      overflow-x: auto;
      overflow-y: scroll;
      position: relative;
      flex: 1;
    }

    .team-column {
      min-width: 250px;  /* Increased from 200px */
      position: relative;
      border-right: 1px solid #eee;
      height: 100%;
      box-sizing: border-box;
    }

    .team-header-container {
      position: sticky;
      top: 0;
      height: 40px;
      background: #f5f5f5;
      z-index: 3;
      border-bottom: 1px solid #ccc;
      text-align: center;
      line-height: 40px;
      padding: 0 5px;
      white-space: nowrap;
    }

    .events-container {
      position: relative;
      height: 100%;  /* Changed from min-height */
      box-sizing: border-box;
    }

    .event {
      position: absolute;
      left: 5px;
      right: 5px;
      padding: 6px 10px;
      border-radius: 4px;
      font-size: 12px;
      overflow: hidden;
      margin: 2px;
      z-index: 1;
      box-sizing: border-box;
      display: flex;
      align-items: center;
    }

    .event-content {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }

    .event-title {
      font-weight: bold;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .event-time {
      font-size: 11px;
      white-space: nowrap;
      opacity: 0.9;
      flex-shrink: 0;
    }

    .table-run {
      background-color: rgba(144, 202, 249, 0.9);
    }

    .judging {
      background-color: rgba(165, 214, 167, 0.9);
    }

    .event-location {
      font-size: 11px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: 2px;
    }

    /* Ensure scrollbars align */
    .time-axis::-webkit-scrollbar,
    .teams-container::-webkit-scrollbar {
      width: 12px;
      height: 12px;
    }

    .time-axis::-webkit-scrollbar-track,
    .teams-container::-webkit-scrollbar-track {
      background: #f5f5f5;
    }

    .time-axis::-webkit-scrollbar-thumb,
    .teams-container::-webkit-scrollbar-thumb {
      background-color: #ccc;
      border-radius: 6px;
      border: 3px solid #f5f5f5;
    }

    .corner-cell {
      height: 40px;
      background: #f5f5f5;
      border-bottom: 1px solid #ccc;
      border-right: 1px solid #ccc;
      box-sizing: border-box;
      min-width: 120px;  /* Match time-axis width */
    }
  `;

  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  // Initialize the grid when schedule data is available
  // You'll need to modify this part based on how your data is loaded
  const scheduleData = window.scheduleData; // Assuming schedule data is available globally
  if (scheduleData) {
    createScheduleGrid(scheduleData);
  }

  // Add scroll synchronization
  function syncScroll(e) {
    const timeAxis = document.querySelector(".time-axis");
    const teamsContainer = document.querySelector(".teams-container");

    if (e.target === teamsContainer) {
      timeAxis.style.transform = `translateY(-${teamsContainer.scrollTop}px)`;
    }
  }

  // Only need one event listener now
  const teamsContainer = document.querySelector(".teams-container");
  teamsContainer.addEventListener("scroll", syncScroll);
});
