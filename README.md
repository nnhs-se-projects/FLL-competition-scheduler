# FLL Competition Scheduler App

## What is the FIRST LEGO League?

The FIRST LEGO League, or FLL, introduces STEM to children through fun and exciting hands-on learning. Teams of students aged 9-14 build and program robots using LEGO Mindstorms technology in order to complete missions based on an annual theme as well as conduct research and present solutions to real-world problems that relate to the competitions theme. It is a chance for students to gain problem solving experience through a guided, global robotics program.

## What is the problem we are trying to solve?

Every year the FLL competition comes around, those in charge of schedules have to sit down and manually create schedules. This is such a grueling task because every team has to appear at their table runs and judging / robot rooms a specific number of times. As of right now the specific number for table runs and judging sessions is hard coded, but eventually that number should be configurable. Ideally the teams would also have breaks between their activities, which means finding the right time slots for each team takes a lot of time and causes a lot of frustration. So, our goal is to create a valid schedule that meets the required criteria.

## What it does

At the moment, our project generates a valid schedule randomly. The genetic algorithm attempts to produce a better schedule than the randomly generated ones, but doesn't improve it much. More investigation is needed to determine if this can be improved with tuning.

## How it works

Our project is split up into two different sections; team runs and judging sessions that work independently of each other. Both team runs and judging sessions have a genetic algorithm (explained below) that generate valid schedules based on the criteria.

## Platform Requirements

For the duration of our time working on the project, Visual Studio Code was the main platform being used. As of right now, the code is printed out into the VS Code Output, but eventually the goal is to export the finalized schedule into a Google Sheets / Excel spreadsheet. Our project does has Node.js set up in case an outside web browser wanted to be implemented, but at the point it is at, Node.js did not really do much for the project.

## Installation Instructions/Versions/External Dependencies

- [Follow Toolchain Setup Instructions](https://docs.google.com/document/d/1wvdn-MVotuBM6wehNdPpbbOFMzmKLPxFzErH8-mkP1s/preview#heading=h.3yvggqtpi70w) (changes depending on device)
  - Install [Node.js Version 18](https://nodejs.org/en/download/)
- [Complete VS Code Configuration](https://docs.google.com/document/d/1wvdn-MVotuBM6wehNdPpbbOFMzmKLPxFzErH8-mkP1s/preview#heading=h.km0ln4d4gqv2)
- Recommended Extensions to Download
  - "Christian-kohler.npm-intellisense",
  - "Dbaeumer.vscode-eslint",
  - "Humao.rest-client",
  - "esbenp.prettier-vscode",
  - "streetsidesoftware.code-spell-checker",
  - "L13rary.l13-diff"

## Configuring Project to be Runnable

The most updated version is in main. The project should be easily runnable if all of the previous installations are there, especially node. Once the project is checked out from Github, and everything is installed it should be runnable.

### Debugging

In the .vscode file, you will find the launch.json file. In order to debug a file, you need to add a new launch configuration. The format should be the same as the examples found in the file such as the ‘Debug main.js’. All that should be changed to debug a different file should be a different name and changing the program to a different file name.

You will need to debug by changing the configuration in the debug panel. The default will generally be Node Server.

## How to Run Project & Expected Result

### Tests

Tests can be run via the VS Code Run and Debug tab by selecting the "Debug tests" options. There are also other test files that can be run manually. These may or may not be up to date with the current state of the code.

### Schedule Creation

The createFullSchedule function will always return a valid random schedule. It continues to generate a random schedule until one is valid.

### Scoring

The quality of the schedule is assessed by the score function. An invalid schedule receives a score of 0.

### Genetic Algorithm

The tspPort folder contains a port of the APCSA Traveling Student lab to Javascript. The code has been generalized to support Javascript objects at genomes. The Gene and Genome classes are only used in the unit tests. The FLLSchedule and Event classes are used when the genetic algorithm is applied to an FLL schedule.

## Architecture

In terms of this project’s architecture, there is not that much complexity. As of right now, everything is in JavaScript files in the folder. We do however have a genetic algorithm and many many files, so I will describe those here.
We have two separate algorithms for random schedule generators and genetic algorithms. One is for creating judging session schedules (all in the folder JudgingRooms), and one is for creating table run schedules (crossover.js, newRandomTables.js, tableGrading.js, tableTest.js, and test.js). How our random schedule generators (randomJudgingSesh.js and newRandomTables.js) work is we first create a group of 32 teams, then randomly grab a team and assign it to a timeslot. We also check to see that a team is not in two places at once.
For the genetic algorithms, we first have a grading function. Both tableRun schedules and judgingRoom schedules are graded based on the distance in between a team’s different events. For judgingRooms, the grade is automatically zero if there is only a distance of one time slot in between judging sessions. Table run grading also takes into account whether or not a team goes to different tables rather than the same one multiple times; the more variety the better.
Next, there's the crossover files and functions. Both of these functions work the same way. First, it takes the two points and crosses over the two parent schedules using those points. After crossing over, the algorithm checks if there are any errors such as a team being in two places at once and fixes them. The function then returns the children.  
 Finally, there's an actual genetic algorithm (there are still two separate functions for the two different schedules at this point). The genetic algorithm first generates a pool of 100 valid schedules, then it grades all of them and sorts them in order of highest to lowest grades. It then takes the top half best graded schedules and randomly selects schedules to be crossed over. The children from the crossover are added to a new pool which repeats this entire process until there are only a couple of the best schedules left. It then takes that schedule and returns it. One difference between the judgingSession genetic algorithm and the tableRun genetic algorithm is that the judgingSession genetic algorithm continually halves the old pool until there are two left. The tableRun algorithm does not, and instead just continues to keep the pool the same length.
Asides from the two separate genetic algorithms, we also have two files for the sake of merging the two schedules. How it works at the moment is it’ll generate a judgingRoom schedule and a tableRun schedule, and then use an intermediate structure to format the schedule. This intermediate structure is created in mergedSchedule.js and is essentially an array of maps, one for each team. Each map contains every judging session and table run of that team. The mergeStructuretest.js checks to see if this merged schedule is valid. Unfortunately this is a very faulty algorithm and will likely need to be scrapped or rewritten.

A visual for how the genetic algorithm can be found here: [slides](https://docs.google.com/presentation/d/1RVjUeKI7246r_ZDXprFyxotVa0rsB8iHquuw-sJFdgM/edit?usp=sharing)

fullRandomSchedule.js takes a valid judging room schedule and then uses that as a template to create a table schedule. The code uses a pool of each team 3 times then randomly takes a value to try and put into the schedule. Then it should check against the judging room schedule and what's already in the tables to see if that team can be inserted into the table based on time conflicts. It continues to do this until either all teams have been inserted three times or all teams left are invalid.

## Data Schema - Judging Rooms JavaScript Object Organization

- randomJudgingSesh
  - _teamsR_ and _teamsP_ - arrays that will hold objects representing each team
  - _Team object (ex. team1)_ - has a name as a string, start time to the activity, and duration of the activity
    - Start time - Project room one has a start time of 0 and every room after is offset by 5 minutes. Robot room one also has a start time of 0 and is offset by five minutes for every room after.
      - Project room 1: Start time - 0
      - Project room 2: Start time - 5
      - Project room 3: Start time - 10
      - Project room 4: Start time - 15
    - Duration - It is hardcoded to be 25 minutes which is the 15-minute actual duration + 10-minute break.
  - _projectRooms_ and _robotRooms_ - is an array of arrays → Each array of rooms holds an array of teams in a timeslot (using the start time attribute). Using .concat they are merged and returned.
- JRcrossover
  - _child_ - an array of arrays made in a crossover between two parents
  - _children_ - an array of two arrays, childA & childB
- JRGrading
  - _teamGrades_ - an array of scores of each team in the schedule - they are then summed up to calculate the totalScore of the schedule
- jrGeneticAlg
  - _oldPool_ - is an array populated with 100 random judging room schedules
  - _newPool_ - children with scores higher than 0.9 are pushed to the new pool - to get a better next generation, the new pool turns into the old pool for the next generation and is reset to an empty array

## Data Schema - Table Runs JavaScript Object Organization

For table runs, we have it organized first into an array of tables. So, the array consists of 4 arrays representing tables. Then the arrays representing tables are further divided with each having arrays representing teams. So, let’s say the object returned by random tables is referred to as child. Child would equal an array with 4 tables and each table having 24 teams. Child[0] is the first table. Child[0][0] is the first team at table 1.

Each team is an object. For tables the properties are name, run, start, and duration. The name is currently just a generic team1, team2, etc. For runs, each team will have 3 runs and that is generally just used to help first create the random table. The run number holds no significance on order. Then start is simply the time that the team is scheduled to arrive as the table. Duration is consistently set to 10 minutes. This time does not factor in breaks necessary for the team.

## Data Schema - Merge JavaScript Object Organization

The merge structure is an array of maps. An array of 32 maps (each map being a team) and each map having 5 keys with times. The keys sesh1 and sesh2 refer to judging rooms and there are also runs 1, 2, and 3 referring to table runs. The reason it’s in an array is just so that the value can be returned and each map can be called based on index.

For fullSchedule.js there is an array with index 0 being an array of tables and index 1 being the array of judging rooms. The tables and judging rooms are in the same structure as they would be separately but are not just put into one array that is returned.

## Remaining User Stories

- All remaining user stories are captured in Trello

## Known Issues

- The merge schedules function is not efficient and likely needs to be completely redone. We ran it for 10 hours and only got a couple of schedules. It is recommended to start creating a merge schedule from scratch. This will include reworking the test for the merged schedule.
- When we run our table schedule, we would occasionally get an issue where the children are identical to each other within the genetic algorithm. This problem does not occur often, but it is something to be aware of if it comes up. We were not able to find out why that was occurring.

**2024 Contributors - Kelsey Wessel, Angela Ping, Sophia Xi, Alyssa Pandya**
