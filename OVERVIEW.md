# FLL Competition Scheduler - Comprehensive Overview

## Project Architecture

The FLL Competition Scheduler is a full-stack JavaScript application designed to create optimized schedules for FIRST LEGO League competitions. The project follows a modular architecture with clear separation of concerns:

```
FLL-competition-scheduler/
├── .vscode/                # VS Code configuration
├── config/                 # Configuration files
├── node_modules/           # Dependencies
├── scripts/                # Utility scripts
├── src/                    # Source code
│   ├── data/               # Data storage
│   ├── scheduler/          # Core scheduling algorithm
│   ├── tests/              # Test files
│   ├── utils/              # Utility functions
│   ├── web/                # Web application
│   └── index.js            # Main entry point
└── index.js                # Application entry point
```

## Core Components

### 1. Scheduler Engine

The scheduler engine is the heart of the application, consisting of several key components:

#### Data Models (`src/scheduler/models.js`)

- **Event Class**: Represents a single scheduled activity (robot game, project judging, or robot design judging)

  - Properties: teamId, teamName, startTime, duration, locationId, locationName, type
  - Methods: equals(), copy(), getEndTime(), overlaps()

- **Schedule Class**: Contains a collection of events and methods to manipulate them
  - Methods: addEvent(), getTeamEvents(), getLocationEvents(), createCopy(), buildTeamSchedule(), buildTableSchedule(), buildJudgingSchedule()

#### Simple Scheduler (`src/scheduler/simpleScheduler.js`)

Creates a basic valid schedule using a deterministic approach:

1. **scheduleJudgingSessions()**: Assigns teams to judging rooms in a round-robin fashion

   - Handles odd numbers of judging rooms by allocating more rooms to project judging
   - Adjusts for lunch breaks
   - Ensures sufficient breaks between sessions

2. **scheduleTableRuns()**: Assigns teams to robot game tables

   - Checks for conflicts with judging sessions
   - Applies table offsets to stagger starts
   - Ensures no team has overlapping events

3. **evaluateSimpleSchedule()**: Validates the schedule and assigns a score
   - Checks that each team has the correct number of events
   - Verifies no overlapping events for teams or locations
   - Ensures sufficient breaks between events

#### Genetic Algorithm (`src/scheduler/geneticAlgorithm.js`)

Optimizes the schedule through evolutionary techniques:

1. **optimizeSchedule()**: Main function that runs the genetic algorithm

   - Creates an initial population based on the simple schedule
   - Evolves the population over multiple generations
   - Returns the best schedule found

2. **crossover()**: Creates child schedules by combining parts of two parent schedules

   - Selects random crossover points
   - Takes events from both parents
   - Handles duplicate events through replaceDuplicates()

3. **mutate()**: Introduces random changes to schedules

   - Swaps random events with a probability defined in the configuration
   - Re-evaluates the schedule after mutation

4. **swapRandomEvents()**: Helper function for mutation
   - Selects two random events in the schedule
   - Swaps their positions

#### Configuration (`src/scheduler/config.js`)

Central configuration file with parameters for:

- Tournament settings (teams, tables, judging rooms)
- Event durations and timing
- Genetic algorithm parameters (population size, generations, mutation rate)

### 2. Web Application

The web application provides a user interface for generating and viewing schedules:

#### Server (`src/web/server.js`)

- Built with Express.js
- Handles session management and authentication
- Serves static files and renders views

#### Routes (`src/web/routes/router.js`)

- Defines endpoints for different views (overview, tables, judging, teams)
- Handles schedule generation and regeneration
- Manages user sessions

#### Schedule Adapter (`src/web/scheduleAdapter.cjs`)

- Bridges the ES module scheduler with the CommonJS web application
- Provides an interface for the web application to interact with the scheduler
- Handles conversion between different data formats

#### Views (`src/web/views/`)

- EJS templates for rendering HTML
- Organized into partials for reusable components
- Responsive design with Tailwind CSS

#### Static Assets (`src/web/public/`)

- CSS stylesheets for styling
- Client-side JavaScript for interactivity
- Images and other static resources

### 3. Utility Functions

#### General Utilities (`src/utils/utils.js`)

- Random number generation
- Array manipulation
- Time formatting and conversion
- Name generation for teams and locations

#### Visualization (`src/utils/visualizer.js`)

- Generates text representations of schedules
- Creates different views (team, table, judging)
- Exports schedules to JSON for web display

## Key Technologies

### Backend

- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **EJS**: Templating engine
- **MongoDB**: Database (via Mongoose)
- **express-session**: Session management

### Frontend

- **Tailwind CSS**: Utility-first CSS framework
- **JavaScript**: Client-side interactivity
- **HTML5**: Markup language

### Development Tools

- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Jest**: Testing framework
- **Nodemon**: Development server with hot reloading

## Algorithm Details

### Genetic Algorithm Implementation

The genetic algorithm optimizes schedules through simulated evolution:

1. **Initialization**:

   - Start with a population of schedules (typically 100)
   - First schedule is created using the simple scheduler
   - Remaining schedules are mutations of the first one

2. **Selection**:

   - Schedules are sorted by fitness score
   - Top-performing schedules have higher probability of selection
   - Tournament selection is used to pick parents

3. **Crossover**:

   - Two parent schedules are combined to create children
   - Random crossover points determine which parts come from which parent
   - Special handling ensures no duplicate events

4. **Mutation**:

   - Random swaps of events introduce diversity
   - Mutation probability controls how often mutations occur
   - Helps escape local optima

5. **Evaluation**:

   - Each schedule is scored based on multiple criteria
   - Valid schedules (no conflicts) get higher scores
   - Compact schedules with minimal waiting time are preferred

6. **Elitism**:

   - Top-performing schedules are preserved unchanged
   - Ensures the best solutions aren't lost

7. **Termination**:
   - Algorithm runs for a fixed number of generations
   - Returns the highest-scoring schedule

### Schedule Evaluation Criteria

Schedules are evaluated based on:

1. **Validity**: No overlapping events for teams or locations
2. **Compactness**: Minimal waiting time between events
3. **Balance**: Even distribution of events across time and locations
4. **Constraints**: Respect for lunch breaks and other fixed time constraints

## Detailed Algorithm Walkthrough

### The Scheduling Problem

At its core, the FLL Competition Scheduler solves a complex constraint satisfaction problem:

- **Given**: A set of teams, tables, judging rooms, and time constraints
- **Goal**: Create a schedule where:
  - Each team participates in all required events
  - No team has overlapping events
  - No location hosts multiple events simultaneously
  - Events are distributed efficiently throughout the day

This is an NP-hard problem, meaning there's no known polynomial-time algorithm to find the optimal solution. Instead, we use a two-phase approach: first creating a valid schedule, then optimizing it.

### Phase 1: Creating a Valid Schedule

The simple scheduler creates an initial valid schedule through these steps:

#### Step 1: Schedule Judging Sessions

```pseudocode
function scheduleJudgingSessions(schedule):
    // Calculate room allocations
    numProjectRooms = ceil(NUM_JUDGING_ROOMS / 2)
    numRobotRooms = floor(NUM_JUDGING_ROOMS / 2)

    // Schedule project judging
    for each team (1 to NUM_TEAMS):
        roomId = (team % numProjectRooms)
        startTime = floor(team / numProjectRooms) * (JUDGING_SESSION + JUDGING_BREAK)

        // Adjust for lunch
        if startTime >= LUNCH_START_TIME:
            startTime += LUNCH_DURATION

        // Create and add event
        event = new Event(team, teamName, startTime, JUDGING_SESSION, roomId, locationName, PROJECT_JUDGING)
        schedule.addEvent(event)

    // Schedule robot design judging (similar logic with offset)
    for each team (1 to NUM_TEAMS):
        roomId = (team % numRobotRooms) + numProjectRooms
        startTime = floor(team / numRobotRooms) * (JUDGING_SESSION + JUDGING_BREAK) + JUDGING_SESSION + 30

        // Adjust for lunch
        if startTime >= LUNCH_START_TIME:
            startTime += LUNCH_DURATION

        // Create and add event
        event = new Event(team, teamName, startTime, JUDGING_SESSION, roomId, locationName, ROBOT_JUDGING)
        schedule.addEvent(event)
```

**Example**: For 16 teams and 6 judging rooms:

- Project judging rooms: ceil(6/2) = 3 rooms
- Robot design judging rooms: floor(6/2) = 3 rooms
- Team 1 gets project judging in room 1 at time 0
- Team 2 gets project judging in room 2 at time 0
- Team 3 gets project judging in room 3 at time 0
- Team 4 gets project judging in room 1 at time (25 + 10) = 35
- And so on...

#### Step 2: Schedule Table Runs

```pseudocode
function scheduleTableRuns(schedule):
    // Get existing team events
    teamSchedule = schedule.buildTeamSchedule()

    // For each round
    for round = 0 to ROUNDS_PER_TEAM - 1:
        // For each team
        for team = 1 to NUM_TEAMS:
            tableId = team % NUM_ROBOT_TABLES

            // Calculate initial start time
            startTime = 200 + (round * (NUM_TEAMS / NUM_ROBOT_TABLES) * TABLE_RUN) +
                       (floor(team / NUM_ROBOT_TABLES) * TABLE_RUN)

            // Apply table offset
            startTime += TABLE_OFFSETS[tableId]

            // Check for conflicts with existing team events
            teamEvents = teamSchedule[team]
            hasConflict = true

            while hasConflict:
                hasConflict = false

                for each event in teamEvents:
                    if startTime < event.endTime + 15 AND
                       startTime + TABLE_RUN + 15 > event.startTime:
                        hasConflict = true
                        startTime = event.endTime + 15
                        break

            // Create and add event
            event = new Event(team, teamName, startTime, TABLE_RUN, tableId, locationName, TABLE_RUN)
            schedule.addEvent(event)

            // Update team's events
            teamEvents.push(event)
            teamSchedule[team] = teamEvents
```

**Example**: For 16 teams, 4 tables, and 3 rounds:

- Round 1, Team 1 gets table 1 at time 200
- Round 1, Team 2 gets table 2 at time 200
- Round 1, Team 3 gets table 3 at time 200
- Round 1, Team 4 gets table 4 at time 200
- Round 1, Team 5 gets table 1 at time 210
- If any conflict is detected, the event is pushed later in time

#### Step 3: Evaluate the Schedule

```pseudocode
function evaluateSimpleSchedule(schedule):
    // Build different views
    teamSchedule = schedule.buildTeamSchedule()
    tableSchedule = schedule.buildTableSchedule()
    judgingSchedule = schedule.buildJudgingSchedule()

    // Check team event counts
    for each team in teamSchedule:
        tableRunCount = 0
        projectJudgingCount = 0
        robotJudgingCount = 0

        for each event in team's events:
            if event.type == TABLE_RUN:
                tableRunCount++
            else if event.type == PROJECT_JUDGING:
                projectJudgingCount++
            else if event.type == ROBOT_JUDGING:
                robotJudgingCount++

        // Verify counts
        if tableRunCount != ROUNDS_PER_TEAM OR
           projectJudgingCount != 1 OR
           robotJudgingCount != 1:
            return 0.0  // Invalid schedule

        // Check for overlapping team events
        sort team's events by startTime
        for i = 0 to team's events.length - 2:
            if events[i].endTime + 10 > events[i+1].startTime:
                return 0.0  // Invalid schedule

    // Check for overlapping table events
    for each table in tableSchedule:
        sort table's events by startTime
        for i = 0 to table's events.length - 2:
            if events[i].endTime > events[i+1].startTime:
                return 0.0  // Invalid schedule

    // Check for overlapping judging events
    for each room in judgingSchedule:
        sort room's events by startTime
        for i = 0 to room's events.length - 2:
            if events[i].endTime + JUDGING_BREAK > events[i+1].startTime:
                return 0.0  // Invalid schedule

    // Calculate score based on additional metrics
    waitingTimeScore = calculateWaitingTimeScore(teamSchedule)
    balanceScore = calculateBalanceScore(tableSchedule, judgingSchedule)

    return 0.5 + (0.3 * waitingTimeScore) + (0.2 * balanceScore)
```

The evaluation function first checks that the schedule is valid (no conflicts), then calculates a score based on waiting time and balance metrics.

### Phase 2: Optimizing the Schedule

Once we have a valid schedule, we use a genetic algorithm to optimize it:

#### Step 1: Initialize Population

```pseudocode
function optimizeSchedule(initialSchedule):
    popSize = GENETIC.POPULATION_SIZE
    generations = GENETIC.GENERATIONS
    elitePercentage = GENETIC.ELITE_PERCENTAGE

    // Create initial population
    oldPool = new Array(popSize)
    newPool = new Array(popSize)

    // First schedule is the initial valid schedule
    oldPool[0] = initialSchedule

    // Create variations through mutation
    for i = 1 to popSize - 1:
        oldPool[i] = initialSchedule.createCopy()
        mutate(oldPool[i])

    // Sort by score
    sort oldPool by score (descending)
```

**Example**: With population size 100:

- Schedule 0: The initial valid schedule (score: 0.65)
- Schedule 1: Mutation of initial schedule (score: 0.63)
- Schedule 2: Another mutation (score: 0.67)
- ...and so on

#### Step 2: Evolution Loop

```pseudocode
function evolutionLoop(oldPool, newPool, generations, popSize, elitePercentage):
    for generation = 0 to generations - 1:
        newPoolIndex = 0

        // Perform crossovers to fill most of the new pool
        crossoversToPerform = floor((popSize - popSize * elitePercentage) / 2)

        for i = 0 to crossoversToPerform - 1:
            // Select parents from top half
            parentA = oldPool[random(0, floor(popSize / 2))]
            parentB = oldPool[random(0, floor(popSize / 2))]

            // Determine crossover points
            x1 = random(0, parentA.size - 2)
            x2 = random(x1 + 1, parentA.size)

            // Create children through crossover
            childA = crossover(parentA, parentB, x1, x2)
            childB = crossover(parentB, parentA, x1, x2)

            // Mutate children
            mutate(childA)
            mutate(childB)

            // Add to new pool
            newPool[newPoolIndex++] = childA
            newPool[newPoolIndex++] = childB

        // Copy elite schedules to new pool
        eliteCount = floor(popSize * elitePercentage)

        for i = 0 to eliteCount - 1:
            newPool[newPoolIndex++] = oldPool[i]

        // Swap pools
        [oldPool, newPool] = [newPool, oldPool]

        // Sort new current pool
        sort oldPool by score (descending)

    // Return best schedule
    return oldPool[0]
```

**Example**: With 20 generations, population 100, elite percentage 0.2:

- Generation 0: Best score = 0.67
- Generation 1: Best score = 0.69
- Generation 2: Best score = 0.72
- ...
- Generation 19: Best score = 0.85

#### Step 3: Crossover Operation

The crossover operation is critical for combining good features from two parent schedules:

```pseudocode
function crossover(parentA, parentB, x1, x2):
    // Create a copy of parentA as the base
    child = parentA.createCopy()

    // Replace middle segment with parentB's events
    child.replaceEventsInRange(0, x1, parentA.getEventsInRange(0, x1))
    child.replaceEventsInRange(x1, x2, parentB.getEventsInRange(x1, x2))
    child.replaceEventsInRange(x2, child.size, parentA.getEventsInRange(x2, parentA.size))

    // Handle duplicates
    replaceDuplicates(parentA, parentB, child, x1, x2)

    // Evaluate child
    child.score = evaluateSchedule(child)

    return child
```

**Visual Example**:

```
Parent A: [A1, A2, A3, A4, A5, A6, A7, A8]
Parent B: [B1, B2, B3, B4, B5, B6, B7, B8]
Crossover points: x1=2, x2=5

Initial child: [A1, A2, B3, B4, B5, A6, A7, A8]

After duplicate handling (if B3 = A7 and B4 = A1):
Final child: [B5, A2, B3, B4, B5, A6, A3, A8]
```

#### Step 4: Mutation Operation

Mutations introduce diversity by randomly swapping events:

```pseudocode
function mutate(schedule):
    for i = 0 to schedule.numberOfPotentialMutations - 1:
        if random() < schedule.mutationProbability:
            swapRandomEvents(schedule)

    // Re-evaluate after mutations
    schedule.score = evaluateSchedule(schedule)
```

```pseudocode
function swapRandomEvents(schedule):
    a = random(0, schedule.size)
    b = random(0, schedule.size)

    // Swap events at indices a and b
    temp = schedule.getEventAtIndex(a)
    schedule.replaceEventAtIndex(a, schedule.getEventAtIndex(b))
    schedule.replaceEventAtIndex(b, temp)
```

**Example**:

```
Before mutation: [E1, E2, E3, E4, E5]
Random indices: a=1, b=3
After mutation: [E1, E4, E3, E2, E5]
```

### Practical Example: 16-Team Tournament

Let's walk through a simplified example of scheduling a 16-team tournament:

1. **Configuration**:

   - 16 teams
   - 4 robot game tables
   - 6 judging rooms (3 project, 3 robot design)
   - 3 rounds per team
   - Table run duration: 10 minutes
   - Judging session duration: 25 minutes
   - Judging break: 10 minutes
   - Lunch: 45 minutes starting at 150 minutes (12:30 PM)

2. **Simple Scheduler**:

   - Project judging: Teams 1-3 at 8:00 AM, Teams 4-6 at 8:35 AM, etc.
   - Robot design judging: Teams 1-3 at 9:00 AM, Teams 4-6 at 9:35 AM, etc.
   - Table runs: Start at 11:20 AM, with teams rotating through tables

3. **Initial Schedule Evaluation**:

   - Valid (no conflicts): Yes
   - Waiting time score: 0.6 (some teams have long waits)
   - Balance score: 0.7 (reasonably balanced)
   - Overall score: 0.65

4. **Genetic Algorithm Optimization**:

   - Generation 0: Best score = 0.65
   - Generation 5: Best score = 0.72
   - Generation 10: Best score = 0.78
   - Generation 15: Best score = 0.82
   - Generation 19: Best score = 0.85

5. **Final Schedule Improvements**:
   - Average waiting time reduced by 15 minutes
   - More balanced distribution of events
   - Better flow of teams through the competition

### Key Insights into the Algorithm

1. **Balance Between Exploration and Exploitation**:

   - Crossover exploits good features from existing schedules
   - Mutation explores new possibilities
   - Elitism preserves the best solutions

2. **Handling Constraints**:

   - Hard constraints (no conflicts) are enforced through the evaluation function
   - Soft constraints (waiting time, balance) are optimized through the fitness score

3. **Performance Considerations**:

   - The simple scheduler ensures we start with a valid schedule
   - Incremental evaluation after mutations improves performance
   - Caching and efficient data structures reduce computation time

4. **Adaptability**:
   - The algorithm can handle different tournament sizes
   - Configuration parameters allow fine-tuning for specific requirements
   - Special cases (odd number of rooms, lunch breaks) are handled gracefully

## Web Application Flow

1. **Authentication**: Users sign in with Google authentication
2. **Schedule Generation**: Initial schedule is created when user first logs in
3. **Schedule Viewing**: Users can view the schedule from different perspectives
   - Overview: Summary and upcoming events
   - Tables: Schedule for each robot game table
   - Judging: Schedule for each judging room
   - Teams: Individual schedule for each team
4. **Configuration**: Users can adjust parameters and regenerate schedules
5. **Export**: Schedules can be printed or exported to PDF

## Printing and Export Features

The application includes specialized features for printing and exporting schedules:

1. **Print CSS**: Custom styles for printed output

   - Removes navigation and UI elements
   - Optimizes layout for paper
   - Adds page breaks between sections

2. **PDF Export**: Client-side PDF generation
   - Uses HTML-to-PDF conversion
   - Preserves formatting and styles
   - Includes all schedule views

## Deployment Considerations

The application can be deployed in various environments:

1. **Local Development**:

   - Run with `npm run dev` for hot reloading
   - Uses local MongoDB or in-memory storage

2. **Production Deployment**:

   - Set environment variables for database connection
   - Configure session secret for security
   - Use process manager like PM2 for reliability

3. **Containerization**:
   - Can be containerized with Docker
   - Includes configuration for multi-container setup

## Future Enhancements

The codebase is designed to accommodate future enhancements:

1. **Advanced Configuration**:

   - More customization options for schedule generation
   - Support for special constraints and requirements

2. **User Management**:

   - Multiple user roles (admin, organizer, viewer)
   - Team registration and management

3. **Real-time Updates**:

   - WebSocket integration for live schedule updates
   - Notifications for schedule changes

4. **Mobile Application**:
   - React Native version for mobile devices
   - Offline support for use at competition venues

## Conclusion

The FLL Competition Scheduler is a sophisticated application that combines advanced algorithms with a user-friendly web interface. Its modular architecture makes it maintainable and extensible, while its optimization capabilities ensure high-quality schedules for FIRST LEGO League competitions.
