# FLL Competition Scheduler

A flexible and optimized scheduling system for FIRST LEGO League (FLL) competitions.

## Overview

The FLL Competition Scheduler is a web application that helps organizers create optimized schedules for FIRST LEGO League competitions. It uses a genetic algorithm to generate schedules that minimize conflicts and waiting times for teams.

## Features

- Generate optimized schedules for FLL competitions
- Customize the number of teams, tables, and judging rooms
- View schedules from different perspectives (teams, tables, judging rooms)
- User authentication with Google Sign-In
- Responsive web interface

## Project Structure

```
fll-competition-scheduler/
├── index.js                 # Main entry point
├── package.json             # Project metadata and dependencies
├── .env                     # Environment variables (not in git)
├── .env.example             # Example environment variables
├── config/                  # Configuration files
│   ├── .eslintrc.json       # ESLint configuration
│   ├── .prettierignore      # Prettier ignore patterns
│   └── jest.config.js       # Jest configuration
├── scripts/                 # Utility scripts
│   ├── setup.js             # Project setup script
│   └── start.js             # Application start script
├── src/                     # Source code
│   ├── data/                # Data files
│   │   └── schedule.json    # Generated schedule data
│   ├── index.js             # Source entry point
│   ├── tests/               # Test files
│   │   ├── integration.test.js  # Integration tests
│   │   ├── geneticAlgorithm.test.js # Unit tests for genetic algorithm
│   │   └── scheduler.test.js   # Unit tests for scheduler
│   ├── scheduler/           # Scheduling algorithm
│   │   ├── config.js        # Configuration settings
│   │   ├── models.js        # Data models
│   │   ├── geneticAlgorithm.js # Genetic algorithm implementation
│   │   └── simpleScheduler.js  # Simple scheduling algorithm
│   ├── utils/               # Utility functions
│   │   ├── utils.js         # General utility functions
│   │   └── visualizer.js    # Schedule visualization
│   └── web/                 # Web application
│       ├── server.js        # Express server
│       ├── connection.js    # Database connection
│       ├── scheduleAdapter.cjs # Adapter for the scheduler
│       ├── models/          # Database models
│       │   └── entry.js     # Entry model
│       ├── routes/          # Express routes
│       │   ├── router.js    # Main router
│       │   └── auth.js      # Authentication routes
│       ├── views/           # EJS templates
│       │   ├── include/     # Shared template parts
│       │   ├── partials/    # Partial templates
│       │   ├── auth.ejs     # Authentication page
│       │   ├── landing.ejs  # Landing page
│       │   ├── overview.ejs # Overview page
│       │   ├── tables.ejs   # Tables page
│       │   ├── teams.ejs    # Teams page
│       │   └── judging.ejs  # Judging page
│       └── public/          # Static assets
│           ├── css/         # Stylesheets
│           ├── js/          # Client-side JavaScript
│           └── img/         # Images
```

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/fll-competition-scheduler.git
   cd fll-competition-scheduler
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Run the setup script:

   ```
   npm run setup
   ```

4. Create a `.env` file with the following variables (see `.env.example`):

   ```
   MONGO_URI=your_mongodb_connection_string
   SESSION_SECRET=your_session_secret
   ```

5. Start the server:

   ```
   npm start
   ```

6. Open your browser and navigate to `http://localhost:8080`

## Development

To run the server in development mode with automatic reloading:

```
npm run dev
```

## Testing

To run tests:

```
npm test
```

To run integration tests:

```
npm run test:integration
```

## Linting

To lint the code:

```
npm run lint
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

**2024 Contributors - Kelsey Wessel, Angela Ping, Sophia Xi, Alyssa Pandya**

**2025 Contributors - Kyle Wang, Aiden Xie, Tommy Isaac, Arnav Sharma**
