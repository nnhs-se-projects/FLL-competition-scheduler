# FLL Competition Scheduler App

## What is the FIRST LEGO League?

The FIRST LEGO League, or FLL, introduces STEM to children through fun and exciting hands-on learning. Teams of students aged 9-14 build and program robots using LEGO Mindstorms technology in order to complete missions based on an annual theme as well as conduct research and present solutions to real-world problems that relate to the competitions theme. It is a chance for students to gain problem solving experience through a guided, global robotics program.

## What is the problem we are trying to solve?

Every year the FLL competition comes around, those in charge of schedules have to sit down and manually create schedules. This is such a grueling task because every team has to appear at their table runs and judging / robot rooms a specific number of times. As of right now the specific number for table runs and judging sessions is hard coded, but eventually that number should be configurable. Ideally the teams would also have breaks between their activities, which means finding the right time slots for each team takes a lot of time and causes a lot of frustration. So, our goal is to create a valid schedule that meets the required criteria.

## What it does

At the moment, our project generates two different valid schedules; one of the schedules is for each team's table runs and the other is for each team's judging sessions. Right now these schedules are independent of each other since the merging of the two has not been completed, but that is the next task to be completed.

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

The most updated version is not in main **ALL FILES SHOULD BE RUN FROM THE MERGE BRANCH** for the most updated version. The project should be easily runnable if all of the previous installations are there, especially node. Once the project is checked out from Github, and everything is installed it should be runnable.

### Debugging

In the .vscode file, you will find the launch.json file. In order to debug a file, you need to add a new launch configuration. The format should be the same as the examples found in the file such as the ‘Debug crossover.js’. All that should be changed to debug a different file should be a different name and changing the program to a different file name.

You will need to debug by changing the configuration in the debug panel. The default will generally be Node Server.

## How to Run Project & Expected Result

### Tables

One of the runnable files for table runs is random schedules. The most up-to-date for table runs is newRandomTables.js which will output a random, likely invalid table. Any time newRandomTables is used in another function, a test must also be used in order to regenerate a table until it is valid. I would recommend using tableTest.js in order to check whether the randomly generated table is valid. There will likely be a commented-out section of code at the bottom of the newRandomTables.js file which you can uncomment to see an example of a valid table run schedule.

Next, there is crossover.js which contains the genetic algorithm. The genetic algorithm should currently output, an array of grades for each generation then at the end, a best score (max currently being around 48) and the table that achieved said score.

Those two are really the only two files in relation to table runs that will give an output.

### Judging Rooms

Judging rooms also has a random schedule generator and a genetic algorithm. In randomJudgingSesh.js located within the judgingRooms folder, there is a commented-out section of code at the bottom. Uncommenting this will print out an array of arrays with the first 4 being robot rooms and the next 4 arrays being project rooms. At the bottom, it will then output a clearer version that contains the teams in each room.

Similar to random tables, random judging rooms should use a test before being used in any other code. I think that the best option is to use jrGrading.js and if it returns 0 then the schedule is not valid.

For the judging room genetic algorithm, jrGeneticAlg.js should be run. The code will output the old pool once and then the scores, then the new pool and its scores for however many generations there are. Finally, it will output the best score that was achieved and the schedule that achieved said score.

One thing you might notice is that the new pool continuously gets halved each generation with judging rooms. This is not the case for the genetic algorithm for tables and I would keep this in mind when you combine the two algorithms for a full valid schedule.

### Merged Schedule

This is kind of considered a failed story but you might find something useful in our framework. Essentially what occurs is that mergedSchedule.js will take two separately valid random tables and judging sessions then it will put it into an intermediate structure. The output should look like 32 sets of 5 key value pairs. For keys there should be sesh1, sesh2, run1, run2, run3. For values it should just be times more specifically the time at which a specific team will appear at a judging room or table. The result isn’t meant to be outputted put instead tested by mergeStructureTest.js

The file mergeStructureTest.js takes the output of mergedSchedule.js and tests if the two random schedules that were originally generated would return a valid schedule. If a schedule is valid the code will return said schedule. However, this occurs on a time scale that would probably require the entire period to even return one schedule and hence why it is considered as having failed.

### Full Random Schedule

This file, fullRandomSchedule.js is only found in the **merge** branch.

This function should return either null or a full schedule with both judging rooms and tables not having a conflict. If it returns null that means it either was stuck or it didn't have a possible solution and therefore has not completed a schedule. However, it should more likely return a full and working schedule. This result however, has NOT been properly tested so I would recommend **creating a test for a full schedule**. This will benefit you in checking the result of the random schedule and the result of your genetic algorithm.

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
