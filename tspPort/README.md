# FLL Competition Scheduler - TSP Port

This directory contains the adapter code to integrate the FLL Competition Scheduler with the existing website.

## Files

- `scheduleAdapter.cjs` - CommonJS adapter for the FLL Competition Scheduler
- `package.json` - Package configuration for the tspPort directory

## Usage

The adapter is automatically used by the website when generating schedules. The website imports the `FLLSchedule` class from the `scheduleAdapter.cjs` file and uses it to generate schedules.

## Integration with MongoDB

The adapter integrates with the existing MongoDB database through the website's server. The website stores the generated schedules in the user's session, which is backed by MongoDB.

## Configuration

The adapter uses the configuration from the `config.js` file in the root directory. You can modify this file to change the number of teams, tables, judging rooms, and other parameters.

## Troubleshooting

If you encounter any issues with the adapter, check the server logs for error messages. The adapter includes fallback mechanisms to use the original scheduling algorithm if the new one fails.
