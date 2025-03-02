/**
 * Format a time value (in minutes) based on a configured start time
 * @param {number} minutes - Minutes from the start time
 * @param {string} startTimeStr - Start time in HH:MM format (default: "08:00")
 * @returns {string} Formatted time string in HH:MM format
 */
function formatTime(minutes, startTimeStr) {
  // Default to 8:00 AM if no start time is provided
  const defaultStartTime = "08:00";
  const startTime = startTimeStr || defaultStartTime;

  // Parse the start time
  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const startTotalMinutes = startHours * 60 + startMinutes;

  // Add the schedule minutes to the start time
  const totalMinutes = startTotalMinutes + minutes;

  // Convert back to hours and minutes
  const hours = Math.floor(totalMinutes / 60) % 24;
  const mins = totalMinutes % 60;

  // Format with leading zeros
  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = mins.toString().padStart(2, "0");

  return `${formattedHours}:${formattedMinutes}`;
}

module.exports = {
  formatTime,
};
