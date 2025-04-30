# FLL Competition Scheduler

A flexible and optimized scheduling system for FIRST LEGO League (FLL) competitions.

## Overview

The FLL Competition Scheduler is a web application that helps organizers create optimized schedules for FIRST LEGO League competitions. It uses a genetic algorithm to generate schedules that minimize conflicts and waiting times for teams.

## Features

- Generate optimized schedules for FLL competitions
- Configure any number of teams, tables, and judging rooms
- Define day bounds and lunch waves
- Enforce proper buffer times between activities
- Prevent resource conflicts (team, table, and judging room)
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
│   │   ├── scheduler.js     # Main scheduling logic
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

## Schedule Configuration

The scheduler supports a wide range of configuration options:

### Core Parameters

- **NUM_TEAMS**: Number of teams participating (10-50)
- **NUM_ROBOT_TABLES**: Number of robot game tables (2-8)
- **NUM_JUDGING_ROOMS**: Number of judging rooms (2-16)
- **ROUNDS_PER_TEAM**: Number of robot game rounds per team (typically 3)

### Day Bounds

- **DAY_START**: Start time of the competition day in minutes (e.g., 8:00 AM = 480)
- **DAY_END**: End time of the competition day in minutes (e.g., 5:00 PM = 1020)

### Durations

- **TABLE_RUN**: Duration of a robot game run in minutes
- **TABLE_BUFFER**: Buffer time between consecutive table runs
- **JUDGING_SESSION**: Duration of a judging session in minutes
- **JUDGE_BUFFER**: Buffer time between consecutive judging sessions
- **LUNCH_DURATION**: Duration of lunch break in minutes
- **MIN_TRANSITION_TIME**: Minimum time required for teams to move between events

### Lunch Waves

- **LUNCH_WAVES**: Array of lunch start times in minutes (e.g., [660, 690, 720] for 11:00 AM, 11:30 AM, 12:00 PM)

### Genetic Algorithm Parameters

- **POPULATION_SIZE**: Size of the population in the genetic algorithm
- **GENERATIONS**: Number of generations to evolve
- **MUTATION_PROBABILITY**: Probability of mutation (0.0-1.0)
- **MUTATIONS_PER_SCHEDULE**: Number of potential mutations per schedule
- **ELITE_PERCENTAGE**: Percentage of top schedules to keep unchanged (0.0-1.0)

## Schedule Generation

The schedule generation process follows these steps:

1. Create a random initial schedule
2. Evaluate the schedule for conflicts and constraints
3. Optimize the schedule using a genetic algorithm
4. Return the best schedule found

### Scheduling Rules

The scheduler enforces several rules:

- Each team must have exactly one project judging session
- Each team must have exactly one robot design judging session
- Each team must have exactly ROUNDS_PER_TEAM table runs
- No team can have overlapping events (with transition buffer)
- No resource (table or judging room) can have overlapping events (with buffer)
- All events must be within the day bounds
- Teams should be assigned to a lunch wave if possible

The genetic algorithm optimizes for:

- Minimizing idle time for teams
- Maximizing resource utilization
- Providing lunch breaks for all teams

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
