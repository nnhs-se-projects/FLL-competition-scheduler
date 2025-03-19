/**
 * FLL Competition Scheduler Models
 *
 * This file contains the core data structures used in the scheduling system.
 */

import CONFIG from "./config.js";

/**
 * Represents a scheduled event in the competition
 */
class Event {
  /**
   * Create a new event
   * @param {number} teamId - The team's unique identifier
   * @param {string} teamName - The team's name
   * @param {number} startTime - Start time in minutes from the beginning of the day
   * @param {number} duration - Duration of the event in minutes
   * @param {number} locationId - The location's unique identifier
   * @param {string} locationName - The location's name
   * @param {string} type - The type of event (tableRun, projectJudging, robotJudging)
   */
  constructor(
    teamId,
    teamName,
    startTime,
    duration,
    locationId,
    locationName,
    type
  ) {
    this.teamId = teamId;
    this.teamName = teamName;
    this.startTime = startTime;
    this.duration = duration;
    this.locationId = locationId;
    this.locationName = locationName;
    this.type = type;
  }

  /**
   * Check if this event equals another event
   * @param {Event} otherEvent - The event to compare with
   * @returns {boolean} True if the events are equal
   */
  equals(otherEvent) {
    return (
      this.teamId === otherEvent.teamId &&
      this.teamName === otherEvent.teamName &&
      this.startTime === otherEvent.startTime &&
      this.duration === otherEvent.duration &&
      this.locationId === otherEvent.locationId &&
      this.locationName === otherEvent.locationName &&
      this.type === otherEvent.type
    );
  }

  /**
   * Create a copy of this event
   * @returns {Event} A new event with the same properties
   */
  copy() {
    return new Event(
      this.teamId,
      this.teamName,
      this.startTime,
      this.duration,
      this.locationId,
      this.locationName,
      this.type
    );
  }

  /**
   * Get the end time of this event
   * @returns {number} The end time in minutes from the beginning of the day
   */
  getEndTime() {
    return this.startTime + this.duration;
  }

  /**
   * Check if this event overlaps with another event
   * @param {Event} otherEvent - The event to check for overlap
   * @param {number} buffer - Additional buffer time to consider (in minutes)
   * @returns {boolean} True if the events overlap
   */
  overlaps(otherEvent, buffer = 0) {
    return (
      this.startTime < otherEvent.startTime + otherEvent.duration + buffer &&
      this.startTime + this.duration + buffer > otherEvent.startTime
    );
  }
}

/**
 * Represents a complete schedule for the FLL competition
 */
class Schedule {
  constructor() {
    this.events = [];
    this.score = 0;
    this.mutationProbability = CONFIG.GENETIC.MUTATION_PROBABILITY;
    this.numberOfPotentialMutations = CONFIG.GENETIC.MUTATIONS_PER_SCHEDULE;
  }

  /**
   * Add an event to the schedule
   * @param {Event} event - The event to add
   */
  addEvent(event) {
    this.events.push(event);
  }

  /**
   * Get all events in the schedule
   * @returns {Event[]} All events
   */
  getAllEvents() {
    return this.events;
  }

  /**
   * Get events for a specific team
   * @param {number} teamId - The team's ID
   * @returns {Event[]} Events for the team
   */
  getTeamEvents(teamId) {
    return this.events.filter((event) => event.teamId === teamId);
  }

  /**
   * Get events for a specific location
   * @param {number} locationId - The location's ID
   * @param {string} type - The type of event
   * @returns {Event[]} Events at the location
   */
  getLocationEvents(locationId, type) {
    return this.events.filter(
      (event) => event.locationId === locationId && event.type === type
    );
  }

  /**
   * Create a deep copy of this schedule
   * @returns {Schedule} A new schedule with copied events
   */
  createCopy() {
    const copy = new Schedule();
    for (const event of this.events) {
      copy.addEvent(event.copy());
    }
    copy.score = this.score;
    return copy;
  }

  /**
   * Get the number of events in the schedule
   * @returns {number} The number of events
   */
  getSize() {
    return this.events.length;
  }

  /**
   * Get events in a specific range
   * @param {number} start - Start index (inclusive)
   * @param {number} end - End index (exclusive)
   * @returns {Event[]} Events in the range
   */
  getEventsInRange(start, end) {
    return this.events.slice(start, end);
  }

  /**
   * Get an event at a specific index
   * @param {number} index - The index
   * @returns {Event} The event
   */
  getEventAtIndex(index) {
    return this.events[index];
  }

  /**
   * Replace events in a specific range
   * @param {number} start - Start index (inclusive)
   * @param {number} end - End index (exclusive)
   * @param {Event[]} events - New events
   */
  replaceEventsInRange(start, end, events) {
    this.events.splice(start, end - start, ...events);
  }

  /**
   * Replace an event at a specific index
   * @param {number} index - The index
   * @param {Event} event - The new event
   */
  replaceEventAtIndex(index, event) {
    this.events[index] = event;
  }

  /**
   * Sort events by start time
   */
  sortByStartTime() {
    this.events.sort((a, b) => a.startTime - b.startTime);
  }

  /**
   * Build a schedule organized by teams
   * @returns {Object} Schedule by teams
   */
  buildTeamSchedule() {
    const teamSchedule = {};

    for (let i = 1; i <= CONFIG.NUM_TEAMS; i++) {
      teamSchedule[i] = [];
    }

    for (const event of this.events) {
      teamSchedule[event.teamId].push(event);
    }

    // Sort each team's events by start time
    Object.values(teamSchedule).forEach((events) => {
      events.sort((a, b) => a.startTime - b.startTime);
    });

    return teamSchedule;
  }

  /**
   * Build a schedule organized by table locations
   * @returns {Object} Schedule by tables
   */
  buildTableSchedule() {
    const tableSchedule = {};

    for (let i = 0; i < CONFIG.NUM_ROBOT_TABLES; i++) {
      tableSchedule[i] = [];
    }

    for (const event of this.events) {
      if (event.type === CONFIG.EVENT_TYPES.TABLE_RUN) {
        tableSchedule[event.locationId].push(event);
      }
    }

    // Sort each table's events by start time
    Object.values(tableSchedule).forEach((events) => {
      events.sort((a, b) => a.startTime - b.startTime);
    });

    return tableSchedule;
  }

  /**
   * Build a schedule organized by judging rooms
   * @returns {Object} Schedule by judging rooms
   */
  buildJudgingSchedule() {
    const judgingSchedule = {};

    for (let i = 0; i < CONFIG.NUM_JUDGING_ROOMS; i++) {
      judgingSchedule[i] = [];
    }

    for (const event of this.events) {
      if (
        event.type === CONFIG.EVENT_TYPES.PROJECT_JUDGING ||
        event.type === CONFIG.EVENT_TYPES.ROBOT_JUDGING
      ) {
        judgingSchedule[event.locationId].push(event);
      }
    }

    // Sort each judging room's events by start time
    Object.values(judgingSchedule).forEach((events) => {
      events.sort((a, b) => a.startTime - b.startTime);
    });

    return judgingSchedule;
  }
}

export { Event, Schedule };
