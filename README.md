# FLL Competition Scheduler App

## What is the FIRST LEGO League?

The FIRST LEGO League, or FLL, introduces STEM to children through fun and exciting hands-on learning. Teams of students aged 9-14 build and program robots using LEGO Mindstorms technology in order to complete missions based on an annual theme as well as conduct research and present solutions to real-world problems that relate to the competitions theme. It is a chance for students to gain problem solving experience through a guided, global robotics program.

## What is the problem we are trying to solve?

Every year the FLL competition comes around, those in charge of schedules have to sit down and manually create schedules. This is such a grueling task because every team has to appear at their table runs and judging / robot rooms a specific number of times. As of right now the specific number for table runs and judging sessions is hard coded, but eventually that number should be configurable. Ideally the teams would also have breaks between their activities, which means finding the right time slots for each team takes a lot of time and causes a lot of frustration. So, our goal is to create a valid schedule that meets the required criteria.

## What it does

At the moment, our project generates a valid schedule randomly that is displayed on our website. We are able to display 4 different schedules on the website that includes a visual block schedule, a schedule storted by teams, judging rooms, and time. The genetic algorithm attempts to produce a better schedule than the randomly generated ones, but doesn't improve it much. More investigation is needed to determine if this can be improved with tuning.

## How it works

Our project is split up into two different sections; team runs and judging sessions that work independently of each other. Both team runs and judging sessions have a genetic algorithm (explained below) that generate valid schedules based on the criteria.
We then store the data from our schedule in json, which is used to display different schedules on the website.

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

### Server
Run the server and you will be directed to the website. After you go through the google authentication, you will see the different schedules generated from the genetic algorithm.

### Tests

Tests can be run via the VS Code Run and Debug tab by selecting the "Debug tests" options. There are also other test files that can be run manually. These may or may not be up to date with the current state of the code.

### Schedule Creation

The createFullSchedule function will always return a valid random schedule. It continues to generate a random schedule until one is valid.

### Scoring

The quality of the schedule is assessed by the score function. An invalid schedule receives a score of 0.

### Genetic Algorithm

The tspPort folder contains a port of the APCSA Traveling Student lab to Javascript. The code has been generalized to support Javascript objects at genomes. The Gene and Genome classes are only used in the unit tests. The FLLSchedule and Event classes are used when the genetic algorithm is applied to an FLL schedule. There are a couple of functions from the judgingRooms folder that are used when creating the initial schedule.

A visual for how the genetic algorithm can be found here: [slides](https://docs.google.com/presentation/d/1RVjUeKI7246r_ZDXprFyxotVa0rsB8iHquuw-sJFdgM/edit?usp=sharing)

## Data Schema

This section needs to be updated to reflect the data schema used in the context of the createFullSchedule function and the data scheme used in the context of the genetic algorithm.

## Remaining User Stories

- All remaining user stories are captured in Trello

## Known Issues

- The merge schedules function is not efficient and likely needs to be completely redone. We ran it for 10 hours and only got a couple of schedules. It is recommended to start creating a merge schedule from scratch. This will include reworking the test for the merged schedule.
- When we run our table schedule, we would occasionally get an issue where the children are identical to each other within the genetic algorithm. This problem does not occur often, but it is something to be aware of if it comes up. We were not able to find out why that was occurring.

**2024 Contributors - Kelsey Wessel, Angela Ping, Sophia Xi, Alyssa Pandya**

**2025 Contributors - Kyle Wang, Aiden Xie, Tommy Isaac, Arnav Sharma**
