/**
 * FLL Schedule Editor
 * Provides drag-and-drop functionality for editing the competition schedule
 */

class ScheduleEditor {
  constructor(config) {
    this.config = config;
    this.events = [];
    this.resources = [];
    this.eventMapping = {}; // Maps DOM elements to events
    this.isDragging = false;
    this.draggedEvent = null;
    this.dragOffset = { x: 0, y: 0 };
    this.gridEl = null;
    this.conflictScanner = new ConflictScanner(config);
  }

  /**
   * Initialize the schedule editor
   * @param {string} gridSelector - CSS selector for the grid container
   * @param {Array} events - Schedule events
   * @param {Array} resources - Available resources (tables, rooms)
   */
  initialize(gridSelector, events, resources) {
    this.gridEl = document.querySelector(gridSelector);
    this.events = events;
    this.resources = resources;

    if (!this.gridEl) {
      console.error("Schedule grid element not found");
      return;
    }

    // Clear any existing content
    this.gridEl.innerHTML = "";

    // Initialize grid with time slots and resource columns
    this.renderGrid();

    // Render events on the grid
    this.renderEvents();

    // Set up event listeners
    this.setupEventListeners();
  }

  /**
   * Render the schedule grid with time slots and resource columns
   */
  renderGrid() {
    const hours = this.getHoursArray();
    const resources = this.resources;

    // Create grid header with resource columns
    const headerEl = document.createElement("div");
    headerEl.className = "schedule-header flex border-b border-gray-200";

    // Time column header
    const timeHeaderEl = document.createElement("div");
    timeHeaderEl.className =
      "time-column w-24 flex-shrink-0 p-2 font-medium text-gray-700";
    timeHeaderEl.textContent = "Time";
    headerEl.appendChild(timeHeaderEl);

    // Resource column headers
    resources.forEach((resource) => {
      const resourceHeaderEl = document.createElement("div");
      resourceHeaderEl.className =
        "resource-column flex-1 p-2 font-medium text-gray-700 text-center border-l border-gray-200";
      resourceHeaderEl.textContent = resource.name;
      resourceHeaderEl.dataset.resourceId = resource.id;
      resourceHeaderEl.dataset.resourceType = resource.type;
      headerEl.appendChild(resourceHeaderEl);
    });

    this.gridEl.appendChild(headerEl);

    // Create grid rows for each time slot
    hours.forEach((hour) => {
      const rowEl = document.createElement("div");
      rowEl.className = "schedule-row flex border-b border-gray-200 relative";
      rowEl.dataset.hour = hour.value;

      // Time column
      const timeColEl = document.createElement("div");
      timeColEl.className =
        "time-column w-24 flex-shrink-0 p-2 text-gray-600 text-sm";
      timeColEl.textContent = hour.label;
      rowEl.appendChild(timeColEl);

      // Resource cells
      resources.forEach((resource) => {
        const cellEl = document.createElement("div");
        cellEl.className =
          "resource-cell flex-1 h-12 border-l border-gray-200 droppable";
        cellEl.dataset.resourceId = resource.id;
        cellEl.dataset.resourceType = resource.type;
        cellEl.dataset.hour = hour.value;
        rowEl.appendChild(cellEl);
      });

      this.gridEl.appendChild(rowEl);
    });
  }

  /**
   * Render schedule events on the grid
   */
  renderEvents() {
    this.events.forEach((event) => this.renderEvent(event));
  }

  /**
   * Render a single event on the grid
   * @param {Object} event - The event to render
   */
  renderEvent(event) {
    // Find the correct resource column and time row
    const resourceColumn = this.findResourceColumn(
      event.resourceType,
      event.resourceId
    );
    const startRow = this.findTimeRow(event.startTime);

    if (!resourceColumn || !startRow) {
      console.warn(`Could not place event: ${event.id}`);
      return;
    }

    // Create event element
    const eventEl = document.createElement("div");
    eventEl.className =
      "schedule-event absolute rounded p-1 text-xs cursor-move";
    eventEl.style.left = `${resourceColumn.offsetLeft}px`;
    eventEl.style.top = `${startRow.offsetTop}px`;
    eventEl.style.width = `${resourceColumn.offsetWidth - 2}px`;

    // Height based on duration (5 min = 10px)
    const duration = event.duration || 10; // Default 10 min
    eventEl.style.height = `${(duration / 5) * 10}px`;

    // Style based on event type
    const eventColor = this.getEventColor(event.type);
    eventEl.style.backgroundColor = eventColor.bg;
    eventEl.style.color = eventColor.text;
    eventEl.style.borderLeft = `3px solid ${eventColor.border}`;

    // Add event content
    eventEl.innerHTML = `
      <div class="event-title font-medium">${event.title || "Event"}</div>
      <div class="event-team">${event.teamName || `Team ${event.teamId}`}</div>
      <div class="event-time">${this.formatTime(
        event.startTime
      )} - ${this.formatTime(event.startTime + event.duration)}</div>
    `;

    // Store reference to event data
    eventEl.dataset.eventId = event.id;
    this.eventMapping[event.id] = { element: eventEl, event: event };

    // Append to grid
    this.gridEl.appendChild(eventEl);

    // Make draggable
    this.makeEventDraggable(eventEl);
  }

  /**
   * Make an event element draggable
   * @param {HTMLElement} eventEl - The event element to make draggable
   */
  makeEventDraggable(eventEl) {
    eventEl.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return; // Only handle left mouse button

      e.preventDefault();
      const rect = eventEl.getBoundingClientRect();

      this.isDragging = true;
      this.draggedEvent = eventEl;
      this.dragOffset = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      // Add dragging class
      eventEl.classList.add("dragging");

      // Track mouse movement
      document.addEventListener("mousemove", this.handleMouseMove);
      document.addEventListener("mouseup", this.handleMouseUp);
    });
  }

  /**
   * Handle mouse movement during drag
   * @param {MouseEvent} e - Mouse event
   */
  handleMouseMove = (e) => {
    if (!this.isDragging || !this.draggedEvent) return;

    const x = e.clientX - this.dragOffset.x;
    const y = e.clientY - this.dragOffset.y;

    this.draggedEvent.style.left = `${x}px`;
    this.draggedEvent.style.top = `${y}px`;
  };

  /**
   * Handle mouse up to complete drag operation
   * @param {MouseEvent} e - Mouse event
   */
  handleMouseUp = (e) => {
    if (!this.isDragging || !this.draggedEvent) return;

    // Find the drop target
    const dropTarget = this.findDropTarget(e.clientX, e.clientY);

    if (dropTarget) {
      // Get event details
      const eventId = this.draggedEvent.dataset.eventId;
      const event = this.eventMapping[eventId].event;

      // Get new position details
      const newResourceId = dropTarget.dataset.resourceId;
      const newResourceType = dropTarget.dataset.resourceType;
      const newHour = parseFloat(dropTarget.dataset.hour);

      // Check for conflicts
      const conflicts = this.conflictScanner.checkForConflicts(
        event,
        newResourceType,
        newResourceId,
        newHour
      );

      if (conflicts.length === 0) {
        // Update event position
        this.updateEventPosition(
          event,
          newResourceType,
          newResourceId,
          newHour
        );
      } else {
        // Show conflicts and ask if we should fix
        this.handleConflicts(
          conflicts,
          event,
          newResourceType,
          newResourceId,
          newHour
        );
      }
    } else {
      // Return to original position
      this.resetEventPosition(this.draggedEvent);
    }

    // Clean up
    this.draggedEvent.classList.remove("dragging");
    this.isDragging = false;
    this.draggedEvent = null;

    document.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("mouseup", this.handleMouseUp);
  };

  /**
   * Update event position in the schedule
   * @param {Object} event - The event to update
   * @param {string} resourceType - New resource type
   * @param {string} resourceId - New resource ID
   * @param {number} startTime - New start time
   */
  updateEventPosition(event, resourceType, resourceId, startTime) {
    // Update event data
    event.resourceType = resourceType;
    event.resourceId = resourceId;
    event.startTime = startTime;

    // Re-render the event
    const eventEl = this.eventMapping[event.id].element;
    eventEl.remove();
    this.renderEvent(event);

    // Call update callback if provided
    if (this.config.onEventUpdate) {
      this.config.onEventUpdate(event);
    }
  }

  /**
   * Reset an event element to its original position
   * @param {HTMLElement} eventEl - The event element
   */
  resetEventPosition(eventEl) {
    const eventId = eventEl.dataset.eventId;
    const event = this.eventMapping[eventId].event;

    const resourceColumn = this.findResourceColumn(
      event.resourceType,
      event.resourceId
    );
    const startRow = this.findTimeRow(event.startTime);

    if (resourceColumn && startRow) {
      eventEl.style.left = `${resourceColumn.offsetLeft}px`;
      eventEl.style.top = `${startRow.offsetTop}px`;
    }
  }

  /**
   * Handle conflicts when moving an event
   * @param {Array} conflicts - List of conflict details
   * @param {Object} event - The event being moved
   * @param {string} resourceType - New resource type
   * @param {string} resourceId - New resource ID
   * @param {number} startTime - New start time
   */
  handleConflicts(conflicts, event, resourceType, resourceId, startTime) {
    // Display conflict information
    const conflictMessage = conflicts
      .map(
        (c) =>
          `Conflict with team ${c.event.teamId} at ${this.formatTime(
            c.event.startTime
          )}`
      )
      .join("\n");

    // Ask if we should resolve conflicts with Gemini AI
    if (
      confirm(
        `Schedule conflicts detected:\n${conflictMessage}\n\nWould you like to use AI to resolve these conflicts?`
      )
    ) {
      // Call AI to fix conflicts
      this.resolveConflictsWithAI(
        conflicts,
        event,
        resourceType,
        resourceId,
        startTime
      );
    } else {
      // Reset position
      this.resetEventPosition(this.eventMapping[event.id].element);
    }
  }

  /**
   * Resolve conflicts using Gemini AI
   * @param {Array} conflicts - List of conflict details
   * @param {Object} event - The event being moved
   * @param {string} resourceType - New resource type
   * @param {string} resourceId - New resource ID
   * @param {number} startTime - New start time
   */
  async resolveConflictsWithAI(
    conflicts,
    event,
    resourceType,
    resourceId,
    startTime
  ) {
    // Show loading indicator
    const loadingEl = document.createElement("div");
    loadingEl.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
    loadingEl.innerHTML = `
      <div class="bg-white p-6 rounded-lg shadow-xl">
        <div class="flex items-center">
          <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
          <div class="text-lg">AI is resolving schedule conflicts...</div>
        </div>
      </div>
    `;
    document.body.appendChild(loadingEl);

    try {
      // Prepare data for AI
      const scheduleData = {
        events: this.events,
        conflicts: conflicts,
        movedEvent: {
          event: event,
          newResourceType: resourceType,
          newResourceId: resourceId,
          newStartTime: startTime,
        },
        config: this.config,
      };

      // Call API
      const response = await fetch("/api/gemini-optimize/fix-conflicts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scheduleData),
      });

      if (!response.ok) {
        throw new Error("Failed to resolve conflicts");
      }

      const result = await response.json();

      if (result.success) {
        // Apply the fixed schedule
        this.events = result.schedule;

        // Clear and re-render
        this.gridEl.innerHTML = "";
        this.renderGrid();
        this.renderEvents();

        alert("Schedule conflicts have been resolved by AI!");
      } else {
        throw new Error(result.message || "AI could not resolve conflicts");
      }
    } catch (error) {
      console.error("Error resolving conflicts:", error);
      alert(`Error: ${error.message}`);

      // Reset position of the dragged event
      this.resetEventPosition(this.eventMapping[event.id].element);
    } finally {
      // Remove loading indicator
      loadingEl.remove();
    }
  }

  /**
   * Find the appropriate drop target based on coordinates
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {HTMLElement|null} The drop target element or null
   */
  findDropTarget(x, y) {
    // Get elements at position
    const elements = document.elementsFromPoint(x, y);

    // Find the first droppable element
    for (const el of elements) {
      if (el.classList.contains("droppable")) {
        return el;
      }
    }

    return null;
  }

  /**
   * Find a resource column by type and ID
   * @param {string} resourceType - The resource type
   * @param {string} resourceId - The resource ID
   * @returns {HTMLElement|null} The resource column element or null
   */
  findResourceColumn(resourceType, resourceId) {
    return document.querySelector(
      `.resource-column[data-resource-type="${resourceType}"][data-resource-id="${resourceId}"]`
    );
  }

  /**
   * Find a time row by hour
   * @param {number} time - The time in minutes
   * @returns {HTMLElement|null} The time row element or null
   */
  findTimeRow(time) {
    // Convert time to nearest hour
    const hour = Math.floor(time / 60);
    return document.querySelector(`.schedule-row[data-hour="${hour}"]`);
  }

  /**
   * Get an array of hours for the grid
   * @returns {Array} Array of hour objects with value and label
   */
  getHoursArray() {
    const startHour = Math.floor(this.config.dayStart / 60);
    const endHour = Math.ceil(this.config.dayEnd / 60);
    const hours = [];

    for (let hour = startHour; hour <= endHour; hour++) {
      hours.push({
        value: hour,
        label: this.formatHour(hour),
      });
    }

    return hours;
  }

  /**
   * Format an hour value as a time string
   * @param {number} hour - The hour value (0-23)
   * @returns {string} Formatted time string (e.g., "8:00 AM")
   */
  formatHour(hour) {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:00 ${period}`;
  }

  /**
   * Format a time value in minutes as a time string
   * @param {number} minutes - Time in minutes since midnight
   * @returns {string} Formatted time string (e.g., "8:30 AM")
   */
  formatTime(minutes) {
    const hour = Math.floor(minutes / 60);
    const min = minutes % 60;
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${min.toString().padStart(2, "0")} ${period}`;
  }

  /**
   * Get color scheme for different event types
   * @param {string} eventType - The event type
   * @returns {Object} Color scheme with bg, text, and border colors
   */
  getEventColor(eventType) {
    const colors = {
      tableRun: { bg: "#dbeafe", text: "#1e40af", border: "#3b82f6" },
      projectJudging: { bg: "#dcfce7", text: "#166534", border: "#22c55e" },
      robotJudging: { bg: "#fef9c3", text: "#854d0e", border: "#eab308" },
      lunch: { bg: "#fee2e2", text: "#991b1b", border: "#ef4444" },
      openingCeremony: { bg: "#f3e8ff", text: "#6b21a8", border: "#a855f7" },
      closingCeremony: { bg: "#f3e8ff", text: "#6b21a8", border: "#a855f7" },
      default: { bg: "#e5e7eb", text: "#374151", border: "#9ca3af" },
    };

    return colors[eventType] || colors.default;
  }

  /**
   * Set up event listeners for the schedule editor
   */
  setupEventListeners() {
    // Double-click to edit event
    this.gridEl.addEventListener("dblclick", (e) => {
      // Find the closest event element
      const eventEl = e.target.closest(".schedule-event");
      if (eventEl) {
        const eventId = eventEl.dataset.eventId;
        const event = this.eventMapping[eventId].event;
        this.openEventEditor(event);
      }
    });
  }

  /**
   * Open the event editor modal
   * @param {Object} event - The event to edit
   */
  openEventEditor(event) {
    // Create modal element
    const modalEl = document.createElement("div");
    modalEl.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
    modalEl.innerHTML = `
      <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">Edit Event</h2>
        
        <form id="event-edit-form" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
            <input type="text" name="title" value="${
              event.title || ""
            }" class="w-full px-3 py-2 border border-gray-300 rounded-md">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Team</label>
            <input type="text" disabled value="${
              event.teamName || `Team ${event.teamId}`
            }" class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input type="time" name="startTime" value="${this.formatTimeForInput(
              event.startTime
            )}" class="w-full px-3 py-2 border border-gray-300 rounded-md">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
            <input type="number" name="duration" value="${
              event.duration
            }" class="w-full px-3 py-2 border border-gray-300 rounded-md">
          </div>
          
          <div class="flex justify-end space-x-3 pt-4">
            <button type="button" id="cancel-edit" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md">Save Changes</button>
          </div>
        </form>
      </div>
    `;

    // Add to document
    document.body.appendChild(modalEl);

    // Set up form handlers
    const form = modalEl.querySelector("#event-edit-form");
    const cancelBtn = modalEl.querySelector("#cancel-edit");

    // Cancel button closes the modal
    cancelBtn.addEventListener("click", () => {
      modalEl.remove();
    });

    // Form submission updates the event
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      // Get form values
      const title = form.elements.title.value;
      const startTimeStr = form.elements.startTime.value;
      const duration = parseInt(form.elements.duration.value);

      // Convert time string to minutes
      const [hours, minutes] = startTimeStr.split(":").map(Number);
      const startTime = hours * 60 + minutes;

      // Update event
      event.title = title;
      event.startTime = startTime;
      event.duration = duration;

      // Re-render the event
      const eventEl = this.eventMapping[event.id].element;
      eventEl.remove();
      this.renderEvent(event);

      // Close modal
      modalEl.remove();

      // Call update callback if provided
      if (this.config.onEventUpdate) {
        this.config.onEventUpdate(event);
      }
    });
  }

  /**
   * Format time in minutes as HH:MM for input fields
   * @param {number} minutes - Time in minutes since midnight
   * @returns {string} Formatted time string (e.g., "08:30")
   */
  formatTimeForInput(minutes) {
    const hour = Math.floor(minutes / 60);
    const min = minutes % 60;
    return `${hour.toString().padStart(2, "0")}:${min
      .toString()
      .padStart(2, "0")}`;
  }
}

/**
 * Conflict scanner for the schedule editor
 */
class ConflictScanner {
  constructor(config) {
    this.config = config;
  }

  /**
   * Check for conflicts when moving an event
   * @param {Object} event - The event being moved
   * @param {string} newResourceType - New resource type
   * @param {string} newResourceId - New resource ID
   * @param {number} newStartTime - New start time
   * @returns {Array} List of conflict details
   */
  checkForConflicts(event, newResourceType, newResourceId, newStartTime) {
    const conflicts = [];

    // Check for team conflicts
    const teamConflicts = this.checkTeamConflicts(event, newStartTime);
    conflicts.push(...teamConflicts);

    // Check for resource conflicts
    const resourceConflicts = this.checkResourceConflicts(
      event,
      newResourceType,
      newResourceId,
      newStartTime
    );
    conflicts.push(...resourceConflicts);

    return conflicts;
  }

  /**
   * Check for team conflicts (same team with overlapping events)
   * @param {Object} event - The event being moved
   * @param {number} newStartTime - New start time
   * @returns {Array} List of team conflicts
   */
  checkTeamConflicts(event, newStartTime) {
    const conflicts = [];
    const teamId = event.teamId;
    const eventId = event.id;
    const endTime = newStartTime + event.duration;

    // Check against all events for this team
    const teamEvents = this.config.events.filter(
      (e) => e.teamId === teamId && e.id !== eventId
    );

    for (const teamEvent of teamEvents) {
      const teamEventEnd = teamEvent.startTime + teamEvent.duration;

      // Add buffer time for transitions
      const bufferTime = this.config.transitionTime || 5;

      // Check for overlap with buffer
      if (
        newStartTime < teamEventEnd + bufferTime &&
        endTime + bufferTime > teamEvent.startTime
      ) {
        conflicts.push({
          type: "team",
          event: teamEvent,
          message: `Team ${teamId} has overlap with ${
            teamEvent.title || "event"
          }`,
        });
      }
    }

    return conflicts;
  }

  /**
   * Check for resource conflicts (same resource with overlapping events)
   * @param {Object} event - The event being moved
   * @param {string} newResourceType - New resource type
   * @param {string} newResourceId - New resource ID
   * @param {number} newStartTime - New start time
   * @returns {Array} List of resource conflicts
   */
  checkResourceConflicts(event, newResourceType, newResourceId, newStartTime) {
    const conflicts = [];
    const eventId = event.id;
    const endTime = newStartTime + event.duration;

    // Check against all events for this resource
    const resourceEvents = this.config.events.filter(
      (e) =>
        e.resourceType === newResourceType &&
        e.resourceId === newResourceId &&
        e.id !== eventId
    );

    for (const resourceEvent of resourceEvents) {
      const resourceEventEnd = resourceEvent.startTime + resourceEvent.duration;

      // Add buffer time based on resource type
      let bufferTime = 0;
      if (newResourceType === "table") {
        bufferTime = this.config.tableBuffer || 2;
      } else if (newResourceType === "judging") {
        bufferTime = this.config.judgeBuffer || 3;
      }

      // Check for overlap with buffer
      if (
        newStartTime < resourceEventEnd + bufferTime &&
        endTime + bufferTime > resourceEvent.startTime
      ) {
        conflicts.push({
          type: "resource",
          event: resourceEvent,
          message: `Resource ${newResourceType} ${newResourceId} has overlap with team ${resourceEvent.teamId}`,
        });
      }
    }

    return conflicts;
  }
}

// Export the ScheduleEditor class
window.ScheduleEditor = ScheduleEditor;
