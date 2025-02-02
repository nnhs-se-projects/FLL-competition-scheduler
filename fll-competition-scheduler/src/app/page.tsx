"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// Adjust the path to your schedule module as necessary
import { createFullSchedule, buildTeamsSchedule } from "./fullRandomSchedule";

type ScheduleEvent = {
  eventType: string;
  startTime: number;
  duration: number;
  endTime: number;
};

type ScheduleData = Record<string, ScheduleEvent[]>;

export default function Home() {
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);

  useEffect(() => {
    // Generate the schedule (this may take a short while if many iterations are needed)
    const schedule = createFullSchedule();

    // Build the teams schedule (this aggregates table runs and judging sessions per team)
    const teamsSchedule = buildTeamsSchedule(schedule);

    // Build a JSON object in the desired format.
    const jsonObj: ScheduleData = {};
    for (let i = 1; i <= 32; i++) {
      jsonObj[`Team ${i}`] = teamsSchedule[i].map((event) => ({
        eventType: event.event, // either "tableRun" or "judgingSession"
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
        {scheduleData ? (
          <div className="overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-200 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Team
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Event #
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Event Type
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Start Time
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Duration
                  </th>
                  <th scope="col" className="px-6 py-3">
                    End Time
                  </th>
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
