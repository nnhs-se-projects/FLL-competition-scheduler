/**
 * FLL Competition Scheduler - Utility Functions
 *
 * This file contains utility functions used throughout the application.
 */

/**
 * Generates a random number between min (inclusive) and max (exclusive)
 * @param {number} min - The minimum value (inclusive)
 * @param {number} max - The maximum value (exclusive)
 * @returns {number} A random number between min and max
 */
function randRange(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Counts the number of occurrences of an event in a schedule
 * @param {Object} schedule - The schedule object
 * @param {Object} eventToCount - The event to count
 * @param {number} start - The start index
 * @param {number} end - The end index
 * @returns {number} The number of occurrences
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
 * Shuffles an array in place
 * @param {Array} array - The array to shuffle
 * @returns {Array} The shuffled array
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Checks if an event overlaps with lunch
 * @param {number} startTime - The start time of the event
 * @param {number} duration - The duration of the event
 * @param {number} lunchStartTime - The start time of lunch
 * @param {number} lunchDuration - The duration of lunch
 * @returns {boolean} True if the event overlaps with lunch
 */
function overlapsWithLunch(startTime, duration, lunchStartTime, lunchDuration) {
  const eventEndTime = startTime + duration;
  const lunchEndTime = lunchStartTime + lunchDuration;
  return (
    (startTime >= lunchStartTime && startTime < lunchEndTime) ||
    (eventEndTime > lunchStartTime && eventEndTime <= lunchEndTime) ||
    (startTime <= lunchStartTime && eventEndTime >= lunchEndTime)
  );
}

/**
 * Adjusts a time to account for lunch
 * @param {number} time - The time to adjust
 * @param {number} lunchStartTime - The start time of lunch
 * @param {number} lunchDuration - The duration of lunch
 * @returns {number} The adjusted time
 */
function adjustForLunch(time, lunchStartTime, lunchDuration) {
  if (time >= lunchStartTime) {
    return time + lunchDuration;
  }
  return time;
}

/**
 * Formats a time in minutes to a string
 * @param {number} minutes - The time in minutes
 * @returns {string} The formatted time string
 */
function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
}

/**
 * Generates a team name from a team ID
 * @param {number} teamId - The team ID
 * @returns {string} The team name
 */
function generateTeamName(teamId) {
  return `Team ${teamId}`;
}

/**
 * Generates a location name from a location ID and type
 * @param {number} locationId - The location ID
 * @param {string} type - The location type
 * @returns {string} The location name
 */
function generateLocationName(locationId, type) {
  if (type === "tableRun") {
    return `Table ${locationId + 1}`;
  } else if (type === "projectJudging") {
    return `Project Room ${locationId + 1}`;
  } else if (type === "robotJudging") {
    return `Robot Design Room ${locationId + 1}`;
  }
  return `Location ${locationId + 1}`;
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
};
