/**
 * FLL Competition Scheduler Utilities
 *
 * This file contains utility functions used throughout the scheduling system.
 */

/**
 * Generate a random integer between min (inclusive) and max (exclusive)
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (exclusive)
 * @returns {number} Random integer
 */
function randRange(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Count occurrences of a specific event in a schedule within a range
 * @param {Schedule} schedule - The schedule to search in
 * @param {Event} eventToCount - The event to count
 * @param {number} start - Start index (inclusive)
 * @param {number} end - End index (exclusive)
 * @returns {number} Number of occurrences
 */
function countOccurrences(schedule, eventToCount, start, end) {
  let count = 0;
  const events = schedule.getEventsInRange(start, end);

  for (const event of events) {
    if (event.equals(eventToCount)) {
      count++;
    }
  }

  return count;
}

/**
 * Shuffle an array using the Fisher-Yates algorithm
 * @param {Array} array - The array to shuffle
 * @returns {Array} The shuffled array
 */
function shuffleArray(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

/**
 * Check if a time overlaps with the lunch break
 * @param {number} startTime - Start time in minutes
 * @param {number} duration - Duration in minutes
 * @param {number} lunchStartTime - Lunch start time in minutes
 * @param {number} lunchDuration - Lunch duration in minutes
 * @returns {boolean} True if the time overlaps with lunch
 */
function overlapsWithLunch(startTime, duration, lunchStartTime, lunchDuration) {
  return (
    startTime < lunchStartTime + lunchDuration &&
    startTime + duration > lunchStartTime
  );
}

/**
 * Adjust a time to account for lunch break
 * @param {number} time - Time in minutes
 * @param {number} lunchStartTime - Lunch start time in minutes
 * @param {number} lunchDuration - Lunch duration in minutes
 * @returns {number} Adjusted time
 */
function adjustForLunch(time, lunchStartTime, lunchDuration) {
  if (time >= lunchStartTime) {
    return time + lunchDuration;
  }
  return time;
}

/**
 * Format minutes as a time string (HH:MM)
 * @param {number} minutes - Minutes since start of day
 * @returns {string} Formatted time string
 */
function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
}

/**
 * Generate a team name based on team ID
 * @param {number} teamId - Team ID
 * @returns {string} Team name
 */
function generateTeamName(teamId) {
  return `Team ${teamId}`;
}

/**
 * Generate a location name based on location ID and type
 * @param {number} locationId - Location ID
 * @param {string} type - Location type
 * @returns {string} Location name
 */
function generateLocationName(locationId, type) {
  if (type === "tableRun") {
    return `Table ${locationId + 1}`;
  } else if (type === "projectJudging") {
    return `Project Judging Room ${locationId + 1}`;
  } else if (type === "robotJudging") {
    return `Robot Design Room ${locationId + 1}`;
  }
  return `Location ${locationId}`;
}

/**
 * Convert a schedule to JSON format
 * @param {Object} schedule - The schedule to convert
 * @returns {Object} JSON representation of the schedule
 */
function scheduleToJson(schedule) {
  const result = {
    metadata: {
      numTeams: schedule.numTeams,
      numTables: schedule.numTables,
      numJudgingRooms: schedule.numJudgingRooms,
      score: schedule.score,
    },
    teams: {},
  };

  // Group events by team
  for (const event of schedule.events) {
    const teamName = `Team ${event.teamId}`;

    if (!result.teams[teamName]) {
      result.teams[teamName] = [];
    }

    result.teams[teamName].push({
      eventType: event.type,
      startTime: event.startTime,
      duration: event.duration,
      endTime: event.startTime + event.duration,
      location: event.location,
    });
  }

  // Sort events by start time for each team
  for (const teamName in result.teams) {
    result.teams[teamName].sort((a, b) => a.startTime - b.startTime);
  }

  return result;
}

export {
  randRange,
  countOccurrences,
  shuffleArray,
  overlapsWithLunch,
  adjustForLunch,
  formatTime,
  generateTeamName,
  generateLocationName,
  scheduleToJson,
};
