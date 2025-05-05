/**
 * FLL Competition Scheduler - Admin Controller
 *
 * This file handles admin user management operations.
 */

import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { isAdmin } from "../models/adminUsers.js";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the admin users file
const adminFilePath = path.join(__dirname, "../models/adminUsers.js");

/**
 * Get the current list of admin users from the file
 * @returns {Array} List of admin email addresses
 */
const getAdminUsers = () => {
  try {
    // Read the file content
    const fileContent = fs.readFileSync(adminFilePath, "utf8");

    // Extract admin emails using regex
    const match = fileContent.match(/const adminUsers = \[([\s\S]*?)\];/);
    if (match && match[1]) {
      return match[1]
        .split(",")
        .map((line) => {
          // Extract email from each line
          const emailMatch = line.match(/"([^"]+)"/);
          return emailMatch ? emailMatch[1] : null;
        })
        .filter((email) => email && email !== "admin@example.com"); // Filter out null values and example email
    }
    return [];
  } catch (error) {
    console.error("Error reading admin users file:", error);
    return [];
  }
};

/**
 * Save the admin users list to the file
 * @param {Array} adminUsers - List of admin email addresses
 * @returns {boolean} Success status
 */
const saveAdminUsers = (adminUsers) => {
  try {
    // Read the current file content
    const currentContent = fs.readFileSync(adminFilePath, "utf8");

    // Format the admin users array for file content
    const adminUsersString = adminUsers
      .map((email) => `  "${email}"`)
      .join(",\n");

    // Build the new file content
    const newContent = currentContent.replace(
      /const adminUsers = \[([\s\S]*?)\];/,
      `const adminUsers = [\n  // Add your admin email addresses here\n${adminUsersString}\n  // Add more admin emails as needed\n];`
    );

    // Write the updated content back to the file
    fs.writeFileSync(adminFilePath, newContent, "utf8");
    return true;
  } catch (error) {
    console.error("Error saving admin users file:", error);
    return false;
  }
};

/**
 * Display the admin management page
 */
export const adminManagement = (req, res) => {
  // Check if user is an admin
  if (!isAdmin(req.session.user)) {
    return res.redirect("/overview?error=unauthorized");
  }

  // Get the list of admin users
  const admins = getAdminUsers();

  // Render the admin management page
  res.render("admin_management", {
    admins,
    path: "/admin",
    query: req.query,
  });
};

/**
 * Add a new admin user
 */
export const addAdmin = (req, res) => {
  // Check if user is an admin
  if (!isAdmin(req.session.user)) {
    return res.redirect("/overview?error=unauthorized");
  }

  // Get the email from the request body
  const { email } = req.body;

  // Validate email
  if (!email || !email.includes("@")) {
    return res.redirect("/admin?error=invalid_email");
  }

  // Get the current list of admin users
  const admins = getAdminUsers();

  // Check if the user is already an admin
  if (admins.includes(email)) {
    return res.redirect("/admin?error=already_admin");
  }

  // Add the new admin
  admins.push(email);

  // Save the updated list
  if (saveAdminUsers(admins)) {
    return res.redirect("/admin?success=admin_added");
  } else {
    return res.redirect("/admin?error=save_failed");
  }
};

/**
 * Remove an admin user
 */
export const removeAdmin = (req, res) => {
  // Check if user is an admin
  if (!isAdmin(req.session.user)) {
    return res.redirect("/overview?error=unauthorized");
  }

  // Get the email from the request body
  const { email } = req.body;

  // Validate email
  if (!email) {
    return res.redirect("/admin?error=invalid_email");
  }

  // Get the current list of admin users
  const admins = getAdminUsers();

  // Remove the admin
  const updatedAdmins = admins.filter((admin) => admin !== email);

  // Check if the current user is removing themselves
  const isSelfRemoval = email === req.session.user.email;

  // Save the updated list
  if (saveAdminUsers(updatedAdmins)) {
    if (isSelfRemoval) {
      // If user removed themselves as admin, redirect to overview
      return res.redirect("/overview?success=admin_removed");
    }
    return res.redirect("/admin?success=admin_removed");
  } else {
    return res.redirect("/admin?error=save_failed");
  }
};
