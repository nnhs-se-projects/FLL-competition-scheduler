/**
 * FLL Competition Scheduler - Admin Users
 *
 * This file defines the list of authorized admin users who can access the configuration features.
 */

// Array of authorized admin user emails
const adminUsers = [
  // Add your admin email addresses here
  "kwang@stu.naperville203.org",
  "asharma1@stu.naperville203.org",
  "tsisaac@stu.naperville203.org",
  // Add more admin emails as needed
];

/**
 * Check if a user is an admin
 * @param {Object} user - User object with email property
 * @returns {boolean} - Whether the user is an admin
 */
export function isAdmin(user) {
  if (!user || !user.email) return false;
  return adminUsers.includes(user.email);
}

export default adminUsers;
