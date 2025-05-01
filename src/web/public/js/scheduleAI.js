/**
 * FLL Competition Scheduler - AI-powered Schedule Editor
 *
 * This file contains the JavaScript code for the AI-powered schedule editor
 * that allows drag-and-drop functionality and conflict detection/resolution
 * using Google's Gemini API.
 */

// Global variables for schedule state
let scheduleEvents = [];
let scheduleConfig = {};
let draggedEvent = null;
let dragStartPos = { x: 0, y: 0 };
let isDragging = false;
let conflicts = [];

// Initialize the schedule editor
function initScheduleEditor(config, events) {
  scheduleConfig = config;

  // If events is provided, use it; otherwise, convert from legacy format
  if (events && Array.isArray(events)) {
    scheduleEvents = events;
  } else if (window.schedule) {
    // Convert from legacy schedule format to unified event format
    scheduleEvents = convertLegacySchedule(window.schedule);
  }

  // Render the schedule grid
  renderScheduleGrid();

  // Add event listeners for drag and drop
  setupDragAndDrop();

  // Add button event handlers
  document
    .getElementById("detectConflictsBtn")
    .addEventListener("click", detectConflicts);
  document
    .getElementById("fixAllConflictsBtn")
    .addEventListener("click", fixAllConflicts);
  document
    .getElementById("saveScheduleBtn")
    .addEventListener("click", saveSchedule);
}

// Convert legacy schedule format to unified event format
function convertLegacySchedule(schedule) {
  const events = [];
  let eventId = 1;

  // Process table runs
  if (schedule.tableRuns) {
    schedule.tableRuns.forEach((tableEvents, tableId) => {
      tableEvents.forEach((event) => {
        events.push({
          id: eventId++,
          teamId: event.teamID,
          teamName: event.teamName || `Team ${event.teamID}`,
          type: "tableRun",
          resourceType: "table",
          resourceId: tableId,
          resourceName: `Table ${tableId + 1}`,
          startTime: event.startTime,
          duration: event.duration,
          color: "#3B82F6", // blue-500
        });
      });
    });
  }

  // Process judging schedule
  if (schedule.judgingSchedule) {
    schedule.judgingSchedule.forEach((roomEvents, roomId) => {
      roomEvents.forEach((event) => {
        events.push({
          id: eventId++,
          teamId: event.teamID,
          teamName: event.teamName || `Team ${event.teamID}`,
          type: event.type,
          resourceType: "judgingRoom",
          resourceId: roomId,
          resourceName: event.locationName || `Judging Room ${roomId + 1}`,
          startTime: event.startTime,
          duration: event.duration,
          color: event.type === "projectJudging" ? "#10B981" : "#8B5CF6", // green-500 or purple-500
        });
      });
    });
  }

  // Process ceremonies and lunch
  if (schedule.teamsSchedule) {
    schedule.teamsSchedule.forEach((teamEvents, teamId) => {
      if (teamId === 0) return; // Skip index 0

      teamEvents.forEach((event) => {
        if (
          event.type === "lunch" ||
          event.type === "openingCeremony" ||
          event.type === "closingCeremony"
        ) {
          events.push({
            id: eventId++,
            teamId: event.teamID,
            teamName: event.teamName || `Team ${event.teamID}`,
            type: event.type,
            resourceType: "ceremony",
            resourceId: 0,
            resourceName: event.locationName || "Main Arena",
            startTime: event.startTime,
            duration: event.duration,
            color: event.type === "lunch" ? "#F59E0B" : "#EC4899", // amber-500 or pink-500
          });
        }
      });
    });
  }

  return events;
}

// Render the schedule grid with all events
function renderScheduleGrid() {
  const gridContainer = document.getElementById("scheduleGrid");
  if (!gridContainer) return;

  // Clear the grid
  gridContainer.innerHTML = "";

  // Create column headers
  const headerRow = document.createElement("div");
  headerRow.className = "grid-header";
  gridContainer.appendChild(headerRow);

  // Get list of resources and time boundaries
  const { resources, startTime, endTime } = getResourcesAndTimeBounds();

  // Add resource headers
  resources.forEach((resource) => {
    const resourceHeader = document.createElement("div");
    resourceHeader.className = "resource-header";
    resourceHeader.textContent = resource.name;
    resourceHeader.dataset.resourceType = resource.type;
    resourceHeader.dataset.resourceId = resource.id;
    headerRow.appendChild(resourceHeader);
  });

  // Create time slots for each 15-minute interval
  const timeInterval = 15; // minutes
  for (let time = startTime; time < endTime; time += timeInterval) {
    const timeRow = document.createElement("div");
    timeRow.className = "time-row";
    timeRow.dataset.time = time;
    gridContainer.appendChild(timeRow);

    // Add time label
    const timeLabel = document.createElement("div");
    timeLabel.className = "time-label";
    timeLabel.textContent = formatTime(time);
    timeRow.appendChild(timeLabel);

    // Add cells for each resource
    resources.forEach((resource) => {
      const cell = document.createElement("div");
      cell.className = "schedule-cell";
      cell.dataset.time = time;
      cell.dataset.resourceType = resource.type;
      cell.dataset.resourceId = resource.id;
      cell.dataset.droppable = "true";
      timeRow.appendChild(cell);
    });
  }

  // Add events to the grid
  scheduleEvents.forEach((event) => {
    addEventToGrid(event);
  });
}

// Get unique resources and time boundaries from events
function getResourcesAndTimeBounds() {
  const resourceMap = new Map();
  let minTime = 8 * 60; // Default: 8:00 AM in minutes
  let maxTime = 17 * 60; // Default: 5:00 PM in minutes

  // Extract day bounds from config if available
  if (scheduleConfig) {
    if (scheduleConfig.dayStart !== undefined) {
      minTime =
        typeof scheduleConfig.dayStart === "number"
          ? scheduleConfig.dayStart * 60
          : minTime;
    }
    if (scheduleConfig.dayEnd !== undefined) {
      maxTime =
        typeof scheduleConfig.dayEnd === "number"
          ? scheduleConfig.dayEnd * 60
          : maxTime;
    }
  }

  // Check all events for resources and time boundaries
  scheduleEvents.forEach((event) => {
    const resourceKey = `${event.resourceType}-${event.resourceId}`;

    if (!resourceMap.has(resourceKey)) {
      resourceMap.set(resourceKey, {
        type: event.resourceType,
        id: event.resourceId,
        name: event.resourceName,
      });
    }

    // Update time boundaries if needed
    minTime = Math.min(minTime, event.startTime);
    maxTime = Math.max(maxTime, event.startTime + event.duration);
  });

  // Add standard resources if not already present
  for (let i = 0; i < (scheduleConfig.numTables || 4); i++) {
    const resourceKey = `table-${i}`;
    if (!resourceMap.has(resourceKey)) {
      resourceMap.set(resourceKey, {
        type: "table",
        id: i,
        name: `Table ${i + 1}`,
      });
    }
  }

  for (let i = 0; i < (scheduleConfig.numJudgingRooms || 8); i++) {
    const resourceKey = `judgingRoom-${i}`;
    if (!resourceMap.has(resourceKey)) {
      resourceMap.set(resourceKey, {
        type: "judgingRoom",
        id: i,
        name: `Judging Room ${i + 1}`,
      });
    }
  }

  // Add ceremony resource
  if (!resourceMap.has("ceremony-0")) {
    resourceMap.set("ceremony-0", {
      type: "ceremony",
      id: 0,
      name: "Main Arena",
    });
  }

  // Convert resource map to array
  const resources = Array.from(resourceMap.values());

  // Round time boundaries to nearest interval for grid rendering
  const interval = 15; // minutes
  minTime = Math.floor(minTime / interval) * interval;
  maxTime = Math.ceil(maxTime / interval) * interval;

  return {
    resources,
    startTime: minTime,
    endTime: maxTime,
  };
}

// Add a single event to the grid
function addEventToGrid(event) {
  // Find the appropriate cell
  const cell = document.querySelector(
    `.schedule-cell[data-time="${event.startTime}"][data-resource-type="${event.resourceType}"][data-resource-id="${event.resourceId}"]`
  );
  if (!cell) return;

  // Create event element
  const eventEl = document.createElement("div");
  eventEl.className = "schedule-event";
  eventEl.dataset.eventId = event.id;
  eventEl.dataset.teamId = event.teamId;
  eventEl.dataset.type = event.type;
  eventEl.dataset.resourceType = event.resourceType;
  eventEl.dataset.resourceId = event.resourceId;
  eventEl.dataset.startTime = event.startTime;
  eventEl.dataset.duration = event.duration;
  eventEl.dataset.draggable = "true";

  // Calculate height based on duration
  const timeInterval = 15; // minutes
  const rowHeight = 30; // pixels per row
  const heightInRows = event.duration / timeInterval;
  eventEl.style.height = `${heightInRows * rowHeight}px`;
  eventEl.style.backgroundColor = event.color || "#3B82F6";

  // Add event content
  eventEl.innerHTML = `
    <div class="event-title">${event.teamName}</div>
    <div class="event-details">${getEventTypeLabel(event.type)}</div>
    <div class="event-time">${formatTime(event.startTime)} - ${formatTime(
    event.startTime + event.duration
  )}</div>
  `;

  // Add to the grid
  cell.appendChild(eventEl);
}

// Helper function to get readable event type label
function getEventTypeLabel(type) {
  switch (type) {
    case "tableRun":
      return "Robot Game";
    case "projectJudging":
      return "Project Judging";
    case "robotJudging":
      return "Robot Design";
    case "lunch":
      return "Lunch";
    case "openingCeremony":
      return "Opening Ceremony";
    case "closingCeremony":
      return "Closing Ceremony";
    default:
      return type;
  }
}

// Format time from minutes to HH:MM AM/PM
function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHours}:${mins.toString().padStart(2, "0")} ${ampm}`;
}

// Set up drag and drop functionality
function setupDragAndDrop() {
  const gridContainer = document.getElementById("scheduleGrid");
  if (!gridContainer) return;

  // Event delegation for drag start
  gridContainer.addEventListener("mousedown", function (e) {
    const eventEl = e.target.closest(".schedule-event");
    if (!eventEl) return;

    // Start dragging
    draggedEvent = findEventById(parseInt(eventEl.dataset.eventId));
    if (!draggedEvent) return;

    isDragging = true;
    eventEl.classList.add("dragging");

    // Record drag start position
    dragStartPos = {
      x: e.clientX,
      y: e.clientY,
      startTime: draggedEvent.startTime,
      resourceType: draggedEvent.resourceType,
      resourceId: draggedEvent.resourceId,
    };

    // Set up ghost element for dragging
    const ghostEl = eventEl.cloneNode(true);
    ghostEl.style.position = "absolute";
    ghostEl.style.opacity = "0.7";
    ghostEl.style.pointerEvents = "none";
    ghostEl.style.zIndex = "1000";
    ghostEl.style.width = `${eventEl.offsetWidth}px`;
    document.body.appendChild(ghostEl);

    // Position ghost element
    updateGhostPosition(ghostEl, e.clientX, e.clientY);

    // Store ghost element reference
    document.ghostElement = ghostEl;
  });

  // Mouse move for dragging
  document.addEventListener("mousemove", function (e) {
    if (!isDragging || !document.ghostElement) return;

    // Move ghost element
    updateGhostPosition(document.ghostElement, e.clientX, e.clientY);

    // Highlight drop target
    highlightDropTarget(e);
  });

  // Mouse up for drop
  document.addEventListener("mouseup", function (e) {
    if (!isDragging) return;

    // Handle the drop
    const dropTarget = getDropTarget(e);
    if (dropTarget && draggedEvent) {
      // Get new resource and time
      const newResourceType = dropTarget.dataset.resourceType;
      const newResourceId = parseInt(dropTarget.dataset.resourceId);
      const newStartTime = parseInt(dropTarget.dataset.time);

      // Try to move the event
      moveEvent(draggedEvent, newResourceType, newResourceId, newStartTime);
    }

    // Clean up
    if (document.ghostElement) {
      document.body.removeChild(document.ghostElement);
      document.ghostElement = null;
    }

    const draggingEvent = document.querySelector(".schedule-event.dragging");
    if (draggingEvent) {
      draggingEvent.classList.remove("dragging");
    }

    isDragging = false;
    draggedEvent = null;
  });
}

// Update ghost element position
function updateGhostPosition(ghostEl, x, y) {
  ghostEl.style.left = `${x - 50}px`;
  ghostEl.style.top = `${y - 15}px`;
}

// Highlight potential drop target
function highlightDropTarget(e) {
  // Remove existing highlights
  document.querySelectorAll(".schedule-cell.drop-target").forEach((cell) => {
    cell.classList.remove("drop-target");
  });

  // Find and highlight new drop target
  const dropTarget = getDropTarget(e);
  if (dropTarget) {
    dropTarget.classList.add("drop-target");
  }
}

// Get drop target element
function getDropTarget(e) {
  // Get element under cursor
  const elementsUnderCursor = document.elementsFromPoint(e.clientX, e.clientY);

  // Find first valid drop target
  return elementsUnderCursor.find(
    (el) =>
      el.classList.contains("schedule-cell") && el.dataset.droppable === "true"
  );
}

// Find event by ID
function findEventById(id) {
  return scheduleEvents.find((event) => event.id === id);
}

// Move an event to a new time/resource
function moveEvent(event, newResourceType, newResourceId, newStartTime) {
  // Check if it's actually a new position
  if (
    event.resourceType === newResourceType &&
    event.resourceId === newResourceId &&
    event.startTime === newStartTime
  ) {
    return;
  }

  // Track the old values for checking conflicts
  const oldEvent = { ...event };

  // Update the event
  event.resourceType = newResourceType;
  event.resourceId = parseInt(newResourceId);
  event.startTime = newStartTime;

  // Update resource name if needed
  if (newResourceType === "table") {
    event.resourceName = `Table ${newResourceId + 1}`;
  } else if (newResourceType === "judgingRoom") {
    event.resourceName = `Judging Room ${newResourceId + 1}`;
  } else if (newResourceType === "ceremony") {
    event.resourceName = "Main Arena";
  }

  // Check for conflicts
  const movedConflicts = checkEventConflicts(event);

  if (movedConflicts.length > 0) {
    // Show conflicts
    showConflictWarning(movedConflicts);

    // Prepare data for AI resolution
    const movedEventData = {
      event: oldEvent,
      newResourceType,
      newResourceId,
      newStartTime,
    };

    // Option to resolve with AI
    if (
      confirm(
        "This move creates conflicts. Would you like the AI to resolve these conflicts automatically?"
      )
    ) {
      resolveConflictsWithAI(movedEventData, movedConflicts);
    }
  }

  // Re-render the schedule
  renderScheduleGrid();
}

// Check for conflicts with a specific event
function checkEventConflicts(event) {
  const conflicts = [];

  // Team conflicts - same team can't be in two places at once
  scheduleEvents.forEach((otherEvent) => {
    if (otherEvent.id === event.id) return; // Skip self
    if (otherEvent.teamId !== event.teamId) return; // Only check same team

    // Check for time overlap
    if (
      event.startTime < otherEvent.startTime + otherEvent.duration &&
      event.startTime + event.duration > otherEvent.startTime
    ) {
      conflicts.push({
        type: "team",
        team: event.teamId,
        events: [event, otherEvent],
      });
    }
  });

  // Resource conflicts - same resource can't be used by two teams at once
  scheduleEvents.forEach((otherEvent) => {
    if (otherEvent.id === event.id) return; // Skip self
    if (
      otherEvent.resourceType !== event.resourceType ||
      otherEvent.resourceId !== event.resourceId
    )
      return; // Only check same resource

    // Check for time overlap
    if (
      event.startTime < otherEvent.startTime + otherEvent.duration &&
      event.startTime + event.duration > otherEvent.startTime
    ) {
      conflicts.push({
        type: "resource",
        resourceType: event.resourceType,
        resourceId: event.resourceId,
        events: [event, otherEvent],
      });
    }
  });

  return conflicts;
}

// Show conflict warning to the user
function showConflictWarning(conflicts) {
  const warningContainer = document.getElementById("conflictWarnings");
  if (!warningContainer) return;

  // Clear existing warnings
  warningContainer.innerHTML = "";

  // Add heading
  const heading = document.createElement("h3");
  heading.className = "text-xl font-bold text-red-600 mb-2";
  heading.textContent = "Schedule Conflicts Detected";
  warningContainer.appendChild(heading);

  // Add conflicts
  conflicts.forEach((conflict) => {
    const warningEl = document.createElement("div");
    warningEl.className = "bg-red-50 border border-red-200 rounded p-3 mb-2";

    let warningText = "";
    if (conflict.type === "team") {
      warningText = `Team ${conflict.events[0].teamId} (${conflict.events[0].teamName}) has overlapping events:`;
    } else {
      warningText = `Resource conflict in ${conflict.events[0].resourceName}:`;
    }

    warningEl.innerHTML = `
      <div class="font-medium">${warningText}</div>
      <ul class="pl-5 mt-1 list-disc">
        ${conflict.events
          .map(
            (e) => `
          <li>${getEventTypeLabel(e.type)} at ${formatTime(
              e.startTime
            )} - ${formatTime(e.startTime + e.duration)}</li>
        `
          )
          .join("")}
      </ul>
    `;

    warningContainer.appendChild(warningEl);
  });

  // Show the container
  warningContainer.classList.remove("hidden");
}

// Detect all conflicts in the schedule
function detectConflicts() {
  conflicts = [];

  // Check each event for conflicts
  scheduleEvents.forEach((event) => {
    const eventConflicts = checkEventConflicts(event);

    // Add unique conflicts
    eventConflicts.forEach((conflict) => {
      // Check if we already have this conflict
      const isDuplicate = conflicts.some(
        (c) =>
          c.type === conflict.type &&
          (c.type === "team"
            ? c.team === conflict.team
            : c.resourceType === conflict.resourceType &&
              c.resourceId === conflict.resourceId) &&
          conflict.events.every((e1) => c.events.some((e2) => e1.id === e2.id))
      );

      if (!isDuplicate) {
        conflicts.push(conflict);
      }
    });
  });

  // Show conflicts if any
  if (conflicts.length > 0) {
    showConflictWarning(conflicts);
    return conflicts;
  } else {
    // No conflicts
    const warningContainer = document.getElementById("conflictWarnings");
    if (warningContainer) {
      warningContainer.innerHTML =
        '<div class="bg-green-50 border border-green-200 rounded p-3 mb-2 text-green-800">No conflicts detected! Your schedule is valid.</div>';
      warningContainer.classList.remove("hidden");
    }
    return [];
  }
}

// Fix all conflicts using AI
function fixAllConflicts() {
  const statusMessage = document.getElementById("aiStatus");
  if (statusMessage) {
    statusMessage.textContent = "Asking AI to fix conflicts...";
    statusMessage.classList.remove("hidden");
  }

  // Call AI to fix all conflicts
  fetch("/api/gemini-optimize/fix-all-conflicts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      events: scheduleEvents,
      config: scheduleConfig,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Update schedule with fixed events
        scheduleEvents = data.schedule;

        // Re-render the schedule
        renderScheduleGrid();

        // Show success message
        if (statusMessage) {
          statusMessage.textContent =
            "AI successfully fixed conflicts! Schedule updated.";
          statusMessage.className =
            "bg-green-100 text-green-800 p-3 rounded mt-4";
        }

        // Show any changes applied
        const changesContainer = document.getElementById("aiChanges");
        if (changesContainer && data.changes && data.changes.length) {
          changesContainer.innerHTML = `
          <h4 class="text-lg font-medium mb-2">Changes Applied</h4>
          <ul class="list-disc pl-5">
            ${data.changes.map((change) => `<li>${change}</li>`).join("")}
          </ul>
        `;
          changesContainer.classList.remove("hidden");
        }

        // Check if any conflicts remain
        const remainingConflicts = detectConflicts();
        if (remainingConflicts.length === 0) {
          const warningContainer = document.getElementById("conflictWarnings");
          if (warningContainer) {
            warningContainer.innerHTML =
              '<div class="bg-green-50 border border-green-200 rounded p-3 mb-2 text-green-800">All conflicts resolved! Your schedule is valid.</div>';
          }
        }
      } else {
        // Show error
        if (statusMessage) {
          statusMessage.textContent = `Error: ${
            data.message || "Failed to fix conflicts"
          }`;
          statusMessage.className = "bg-red-100 text-red-800 p-3 rounded mt-4";
        }
      }
    })
    .catch((error) => {
      console.error("Error fixing conflicts:", error);
      if (statusMessage) {
        statusMessage.textContent = `Error: ${error.message}`;
        statusMessage.className = "bg-red-100 text-red-800 p-3 rounded mt-4";
      }
    });
}

// Resolve specific conflicts with AI
function resolveConflictsWithAI(movedEvent, conflicts) {
  const statusMessage = document.getElementById("aiStatus");
  if (statusMessage) {
    statusMessage.textContent = "Asking AI to resolve conflicts...";
    statusMessage.classList.remove("hidden");
  }

  // Call AI to resolve conflicts
  fetch("/api/gemini-optimize/fix-conflicts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      events: scheduleEvents,
      conflicts: conflicts,
      movedEvent: movedEvent,
      config: scheduleConfig,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Update schedule with fixed events
        scheduleEvents = data.schedule;

        // Re-render the schedule
        renderScheduleGrid();

        // Show success message
        if (statusMessage) {
          statusMessage.textContent =
            "AI successfully resolved conflicts! Schedule updated.";
          statusMessage.className =
            "bg-green-100 text-green-800 p-3 rounded mt-4";
        }

        // Show any changes applied
        const changesContainer = document.getElementById("aiChanges");
        if (changesContainer && data.changes && data.changes.length) {
          changesContainer.innerHTML = `
          <h4 class="text-lg font-medium mb-2">Changes Applied</h4>
          <ul class="list-disc pl-5">
            ${data.changes.map((change) => `<li>${change}</li>`).join("")}
          </ul>
        `;
          changesContainer.classList.remove("hidden");
        }

        // Check if any conflicts remain
        detectConflicts();
      } else {
        // Show error
        if (statusMessage) {
          statusMessage.textContent = `Error: ${
            data.message || "Failed to resolve conflicts"
          }`;
          statusMessage.className = "bg-red-100 text-red-800 p-3 rounded mt-4";
        }
      }
    })
    .catch((error) => {
      console.error("Error resolving conflicts:", error);
      if (statusMessage) {
        statusMessage.textContent = `Error: ${error.message}`;
        statusMessage.className = "bg-red-100 text-red-800 p-3 rounded mt-4";
      }
    });
}

// Save the schedule
function saveSchedule() {
  const statusMessage = document.getElementById("aiStatus");
  if (statusMessage) {
    statusMessage.textContent = "Saving schedule...";
    statusMessage.classList.remove("hidden");
  }

  // Call API to save schedule
  fetch("/api/save-schedule", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      events: scheduleEvents,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Show success message
        if (statusMessage) {
          statusMessage.textContent = "Schedule saved successfully!";
          statusMessage.className =
            "bg-green-100 text-green-800 p-3 rounded mt-4";
        }
      } else {
        // Show error
        if (statusMessage) {
          statusMessage.textContent = `Error: ${
            data.message || "Failed to save schedule"
          }`;
          statusMessage.className = "bg-red-100 text-red-800 p-3 rounded mt-4";
        }
      }
    })
    .catch((error) => {
      console.error("Error saving schedule:", error);
      if (statusMessage) {
        statusMessage.textContent = `Error: ${error.message}`;
        statusMessage.className = "bg-red-100 text-red-800 p-3 rounded mt-4";
      }
    });
}

// Export functions for global use
window.initScheduleEditor = initScheduleEditor;
window.detectConflicts = detectConflicts;
window.fixAllConflicts = fixAllConflicts;
window.saveSchedule = saveSchedule;
