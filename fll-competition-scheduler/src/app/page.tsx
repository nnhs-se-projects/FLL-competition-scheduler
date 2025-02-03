"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// Adjust to your actual schedule module paths
import { createFullSchedule, buildTeamsSchedule } from "./fullRandomSchedule";

type ScheduleEvent = {
  eventType: string;
  startTime: number;
  duration: number;
  endTime: number;
};

type ScheduleData = Record<string, ScheduleEvent[]>;

/**
 * This component:
 *  - Flattens the schedule into a single array of events (with team name).
 *  - Finds earliest (minTime) and latest (maxTime) across all events.
 *  - Renders a vertical axis (top to bottom) for times from minTime..maxTime.
 *  - Groups events by their integer startTime, placing them side-by-side horizontally.
 *  - Each event block’s width is proportional to (endTime - startTime).
 */
function VerticalTimeSchedule({
  scheduleData,
}: {
  scheduleData: ScheduleData;
}) {
  // 1) Flatten: { "Team 1": [ev1, ev2], "Team 2": [...] } => an array of { teamName, startTime, endTime, ... }
  const allEvents = Object.entries(scheduleData).flatMap(([teamName, events]) =>
    events.map((evt) => ({
      teamName,
      ...evt,
    }))
  );

  // 2) Find min and max times (integer) across all events
  let minTime = Infinity;
  let maxTime = -Infinity;
  for (const evt of allEvents) {
    if (evt.startTime < minTime) minTime = evt.startTime;
    if (evt.endTime > maxTime) maxTime = evt.endTime;
  }

  // 3) Scale factors for layout
  const scaleY = 40; // 40 px for each "time unit" vertically
  const scaleX = 40; // 40 px for each "time unit" horizontally

  // 4) Build a map of startTime -> array of events that begin at that time
  //    so we can place them side-by-side horizontally if they share the same startTime
  const startMap: Record<number, typeof allEvents> = {};
  for (const evt of allEvents) {
    const sTime = Math.floor(evt.startTime); // or just evt.startTime if always an integer
    if (!startMap[sTime]) startMap[sTime] = [];
    startMap[sTime].push(evt);
  }

  // 5) We'll create an array of all integer time "ticks" from minTime..maxTime
  const timeTicks: number[] = [];
  for (let t = minTime; t <= maxTime; t++) {
    timeTicks.push(t);
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Vertical Block Schedule
      </h2>

      <div className="relative border rounded p-4 overflow-x-auto bg-white dark:bg-gray-700">
        {/* 
            LEFT AXIS of times: We'll place them absolutely 
            (like a "ruler" from minTime to maxTime). 
        */}
        <div className="absolute left-0 top-0 h-full flex flex-col items-end pr-2 text-xs text-gray-700 dark:text-gray-200">
          {timeTicks.map((t) => (
            <div
              key={t}
              style={{
                position: "absolute",
                top: (t - minTime) * scaleY,
                // Each "tick" can get 1em of vertical space or just a small line
              }}
            >
              {t}:00
            </div>
          ))}
        </div>

        {/* 
            MAIN "TRACK" AREA: We'll shift everything to the right 
            so it doesn't overlap the time axis on the left.
        */}
        <div
          className="ml-12 relative"
          style={{ minHeight: (maxTime - minTime) * scaleY + 60 }}
        >
          {/* 
              Draw horizontal lines for each time tick if desired 
              (purely visual).
           */}
          {timeTicks.map((t) => (
            <div
              key={t}
              className="absolute left-0 w-full border-t border-gray-300 dark:border-gray-500"
              style={{
                top: (t - minTime) * scaleY,
              }}
            />
          ))}

          {/* 
              For each distinct startTime, place its events side-by-side. 
              We'll keep track of the "cumulative" left offset so each event 
              doesn’t overlap the next.
          */}
          {Object.entries(startMap).map(([startStr, eventsAtTime]) => {
            const sTime = Number(startStr);

            // Sort them by e.g. endTime - so shorter ones come first, or any logic
            // We'll just keep them in the order they appear
            let currentLeft = 0;

            return (
              <div
                key={startStr}
                style={{
                  position: "absolute",
                  top: (sTime - minTime) * scaleY,
                  height: scaleY,
                  // ^ This row is scaleY px tall
                  //   (you can also do a bigger row if you want more vertical space).
                  width: "100%",
                }}
              >
                {eventsAtTime.map((evt, i) => {
                  const w = (evt.endTime - evt.startTime) * scaleX;

                  // We'll place the block at currentLeft, then increment currentLeft
                  // by w + some gap so the next block sits to its right
                  const left = currentLeft;
                  currentLeft += w + 8; // 8px gap

                  return (
                    <div
                      key={i}
                      className="absolute rounded bg-blue-500 text-white px-2 py-1 text-xs flex flex-col justify-center"
                      style={{
                        left,
                        width: w,
                        // fill the "row" vertically
                        top: 0,
                        bottom: 0,
                        overflow: "hidden",
                      }}
                    >
                      <span className="font-semibold">
                        {evt.teamName} – {evt.eventType}
                      </span>
                      <span>
                        {evt.startTime}–{evt.endTime}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);

  useEffect(() => {
    // 1) Generate raw schedule
    const schedule = createFullSchedule();

    // 2) Build per-team schedule (table runs & judging sessions)
    const teamsSchedule = buildTeamsSchedule(schedule);

    // 3) Convert to JSON object with { "Team X": [ {eventType, startTime, ...}, ... ], ... }
    const jsonObj: ScheduleData = {};
    for (let i = 1; i <= 32; i++) {
      jsonObj[`Team ${i}`] = teamsSchedule[i].map((event) => ({
        eventType: event.event,
        startTime: event.startTime,
        duration: event.duration,
        endTime: event.startTime + event.duration,
      }));
    }
    setScheduleData(jsonObj);
  }, []);

  return (
    <div className="min-h-screen p-8 pb-20 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="flex items-center justify-center mb-8">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
      </header>

      <main className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Generated Schedule
        </h1>

        {/* 1) Original Table (Optional) */}
        {scheduleData ? (
          <div className="overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-200 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3">Team</th>
                  <th className="px-6 py-3">Event #</th>
                  <th className="px-6 py-3">Event Type</th>
                  <th className="px-6 py-3">Start Time</th>
                  <th className="px-6 py-3">Duration</th>
                  <th className="px-6 py-3">End Time</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(scheduleData).map(([teamName, events]) =>
                  events.map((event, index) => (
                    <tr
                      key={`${teamName}-${index}`}
                      className="bg-white border-b dark:bg-gray-700 dark:border-gray-600"
                    >
                      <td className="px-6 py-4 font-medium whitespace-nowrap">
                        {teamName}
                      </td>
                      <td className="px-6 py-4">{index + 1}</td>
                      <td className="px-6 py-4 capitalize">
                        {event.eventType}
                      </td>
                      <td className="px-6 py-4">{event.startTime}</td>
                      <td className="px-6 py-4">{event.duration}</td>
                      <td className="px-6 py-4">{event.endTime}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center">Loading schedule...</p>
        )}

        {/* 2) Vertical Time Axis with Horizontal Blocks */}
        {scheduleData && <VerticalTimeSchedule scheduleData={scheduleData} />}
      </main>

      <footer className="mt-12 flex flex-wrap justify-center gap-6">
        <a
          className="flex items-center gap-2 hover:underline"
          href="https://nextjs.org/learn"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
            aria-hidden="true"
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline"
          href="https://vercel.com/templates?framework=next.js"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
            aria-hidden="true"
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline"
          href="https://nextjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
            aria-hidden="true"
          />
          Next.js
        </a>
      </footer>
    </div>
  );
}
