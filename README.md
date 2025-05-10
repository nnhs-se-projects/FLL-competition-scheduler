# FLL Competition Scheduler

A flexible and optimized scheduling system for FIRST LEGO League (FLL) competitions.

## Overview

The FLL Competition Scheduler is a web application designed to help organizers create optimized schedules for FIRST LEGO League competitions. The application uses a genetic algorithm to generate schedules that minimize conflicts and waiting times for teams while ensuring all competition requirements are met.

The scheduler:

- Automatically assigns teams to robot game rounds, judging sessions, and lunch breaks
- Uses constraints such as no overlapping events for teams or resources
- Minimizes the waiting time between activities
- Provides 3 views of the schedule (by team, table, or judging room)

## Platform Requirements

### Supported Operating Systems

- **Windows**: Windows 10 or later
- **macOS**: macOS 11 Big Sur or later
- **Linux/Raspberry Pi OS**: Raspberry Pi OS Bullseye or later

### Prerequisites

- **Node.js**: Version 18.x or higher ([Download](https://nodejs.org/en/download/))
- **npm**: Version 8.x or higher (included with Node.js)
- **MongoDB**: Version 6.0 or higher ([Download](https://www.mongodb.com/try/download/community))
- **Git**: Latest version ([Download](https://git-scm.com/downloads))
- **Modern web browser**: Chrome, Firefox, Edge, or Safari (latest version)

## Installation Instructions

### Windows

1. Install Node.js from [nodejs.org](https://nodejs.org/en/download/)
2. Install MongoDB Community Edition:
   - Download MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)
   - Follow the [Windows installation instructions](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-windows/)
   - Start MongoDB service: `net start MongoDB`
3. Clone the repository:
   ```
   git clone https://github.com/yourusername/fll-competition-scheduler.git
   cd fll-competition-scheduler
   ```
4. Install dependencies:
   ```
   npm install
   ```
5. Run the setup script:
   ```
   npm run setup
   ```

### macOS

1. Install Homebrew if not already installed:

   ```
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. Install Node.js and MongoDB:

   ```
   brew install node
   brew tap mongodb/brew
   brew install mongodb-community@6.0
   ```

3. Start MongoDB service:

   ```
   brew services start mongodb-community@6.0
   ```

4. Clone the repository:

   ```
   git clone https://github.com/yourusername/fll-competition-scheduler.git
   cd fll-competition-scheduler
   ```

5. Install dependencies:

   ```
   npm install
   ```

6. Run the setup script:
   ```
   npm run setup
   ```

### Raspberry Pi OS

1. Update your system:

   ```
   sudo apt update
   sudo apt upgrade
   ```

2. Install Node.js:

   ```
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

3. Install MongoDB:

   ```
   sudo apt install -y mongodb
   sudo systemctl enable mongodb
   sudo systemctl start mongodb
   ```

4. Clone the repository:

   ```
   git clone https://github.com/yourusername/fll-competition-scheduler.git
   cd fll-competition-scheduler
   ```

5. Install dependencies:

   ```
   npm install
   ```

6. Run the setup script:
   ```
   npm run setup
   ```

## Configuration

1. Create a `.env` file in the root directory with the following variables:

   ```
   # MongoDB Connection
   MONGO_URI=mongodb://localhost:27017/fll-scheduler

   # Session Secret (generate a random string)
   SESSION_SECRET=your_session_secret

   # Port for the web server
   PORT=8080

   # Google OAuth (optional, for authentication)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   CALLBACK_URL=http://localhost:8080/auth/google/callback
   ```

2. For Google authentication (optional):
   - Create a project in the [Google Cloud Console](https://console.cloud.google.com/)
   - Set up OAuth credentials for a web application
   - Add the redirect URI: `http://localhost:8080/auth/google/callback`
   - Copy the Client ID and Client Secret to your `.env` file

## Running the Application

1. Start the server:

   ```
   npm start
   ```

2. For development with automatic reloading:

   ```
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:8080`

4. You should see the landing page with options to create a new schedule or view existing ones.

## Expected Results

After successfully starting the application:

1. You'll be able to access the web interface via http://localhost:8080
2. If authentication is enabled, you'll need to sign in with Google
3. You can create a new competition schedule by entering parameters like:
   - Number of teams (10-50)
   - Number of robot game tables (2-8)
   - Number of judging rooms (2-16)
   - Competition day start and end times
   - Lunch break options
4. The system will generate an optimized schedule
5. You can view and export the schedule from different perspectives (team, table, judging)

## Project Architecture

The FLL Competition Scheduler follows a modular architecture:

### Core Components

1. **Web Server (Express)**: Handles HTTP requests, renders views, and manages authentication
2. **Scheduler**: Core scheduling algorithm that generates optimized schedules
3. **Database (MongoDB)**: Stores user data, competition parameters, and generated schedules
4. **Views (EJS)**: Templates for rendering the user interface

### Code Organization

```
fll-competition-scheduler/
├── index.js                 # Main entry point
├── package.json             # Project metadata and dependencies
├── src/                     # Source code
│   ├── scheduler/           # Scheduling algorithm
│   │   ├── config.js        # Configuration settings
│   │   ├── models.js        # Data models
│   │   ├── scheduler.js     # Main scheduling logic
│   │   ├── geneticAlgorithm.js # Genetic algorithm implementation
│   │   └── simpleScheduler.js  # Simple scheduling algorithm
│   ├── utils/               # Utility functions
│   │   └── utils.js         # General utility functions
│   └── web/                 # Web application
│       ├── server.js        # Express server
│       ├── connection.js    # Database connection
│       ├── scheduleAdapter.cjs # Adapter for the scheduler
│       ├── models/          # Database models
│       ├── routes/          # Express routes
│       └── views/           # EJS templates
```

### Data Flow

1. User inputs competition parameters through the web interface
2. Parameters are passed to the scheduler
3. Scheduler generates an optimized schedule using the genetic algorithm
4. Schedule is saved to the database and displayed to the user
5. User can view and export the schedule in different formats

## Data Schema

### MongoDB Documents

#### User Schema

```javascript
{
  email: String,          // User's email address
  name: String,           // User's display name
  googleId: String,       // Google OAuth ID
  role: String,           // User role (admin, organizer)
  createdAt: Date,        // Account creation timestamp
  lastLogin: Date         // Last login timestamp
}
```

#### Competition Schema

```javascript
{
  name: String,           // Competition name
  date: Date,             // Competition date
  location: String,       // Competition location
  createdBy: ObjectId,    // Reference to User
  createdAt: Date,        // Creation timestamp
  parameters: {           // Competition parameters
    numTeams: Number,     // Number of teams
    numTables: Number,    // Number of robot game tables
    numJudgingRooms: Number, // Number of judging rooms
    roundsPerTeam: Number,// Number of robot rounds per team
    dayStart: Number,     // Start time in minutes (e.g., 480 for 8:00 AM)
    dayEnd: Number,       // End time in minutes
    tableRunDuration: Number, // Duration of table runs
    judgingSessionDuration: Number, // Duration of judging sessions
    lunchDuration: Number,// Duration of lunch
    lunchWaves: [Number], // Lunch start times
    // Additional parameters...
  },
  schedule: {             // Generated schedule
    teamsSchedule: [      // Schedule by team
      [                   // Array of events for each team
        {
          teamId: Number, // Team ID
          teamName: String, // Team name
          type: String,   // Event type (tableRun, robotJudging, etc.)
          startTime: Number, // Start time in minutes
          duration: Number, // Duration in minutes
          locationId: Number, // Table or room ID
          locationName: String // Table or room name
        }
      ]
    ],
    tablesSchedule: [     // Schedule by table
      // Similar structure to teamsSchedule
    ],
    judgingSchedule: [    // Schedule by judging room
      // Similar structure to teamsSchedule
    ]
  }
}
```

### In-Memory Data Structures

#### Schedule Object

```javascript
{
  teams: [                 // Array of team objects
    {
      id: Number,          // Team ID
      name: String,        // Team name
      events: [            // Array of events for this team
        {
          type: String,    // Event type
          startTime: Number, // Start time in minutes
          duration: Number, // Duration in minutes
          resourceId: Number // Table or room ID
        }
      ]
    }
  ],
  resources: {             // Resources (tables and rooms)
    tables: [              // Array of table objects
      {
        id: Number,        // Table ID
        name: String,      // Table name
        events: [          // Array of events for this table
          // Similar to team events
        ]
      }
    ],
    judgingRooms: [        // Array of judging room objects
      // Similar to tables
    ]
  }
}
```

## Product Backlog

### User Stories

1. **Authentication**: As a tournament coordinator, I want it so that only authorized users can edit the configuration page. Unauthorized users can only view the schedule views.

2. **Export to Google Sheets**: As a tournament coordinator, I want to export the schedule so I can import it into Google Sheets or Excel.

3. **Self-Hosting**: As a tournament coordinator, I want the website that can be hosted and served from a background server.

4. **Timezone Configuration**: As a tournament coordinator, I want to be able to modify the time increments between each events to maximize the productivity.

5. **Mobile Schedule View**: As a tournament coordinator, I want to see the schedule on a web application so it can be more accessible.

## Known Issues

1. **Large Competition Performance**: For competitions with more than 40 teams, the scheduler may take several minutes to generate an optimized schedule.

2. **Browser Compatibility**: The interface is optimized for Chrome and Firefox. Some visual elements may not render correctly in older browsers.

3. **Concurrent Users**: The system has not been tested with a large number of concurrent users and may experience performance issues under heavy load.

4. **Lunch Assignment**: In rare cases, teams may not be assigned a lunch break if the schedule is extremely tight. A manual check is recommended.

5. **Mobile Responsiveness**: Some schedule views may be difficult to navigate on small mobile screens due to the large amount of data displayed.

6. **Authentication Timeout**: Sessions may expire unexpectedly after periods of inactivity.

7. **Drag and Drop**: Currently, the option to manually drag and drop different events into the schedule is unavailable. In general, specific events (unique to each tournament) cannot be implemented.

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

This project is licensed under the MIT License.

## Contributors

**2024 Contributors - Kelsey Wessel, Angela Ping, Sophia Xi, Alyssa Pandya**

**2025 Contributors - Kyle Wang, Aiden Xie, Tommy Isaac, Arnav Sharma**
