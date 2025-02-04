"use client";

import { useRouter } from "next/navigation";
import { createFullSchedule, buildTeamsSchedule } from "./fullRandomSchedule";
import { useEffect, useState } from "react";

type ScheduleEvent = {
  event: string;
  startTime: number;
  duration: number;
  endTime: number;
};

type TeamSchedule = {
  [key: string]: ScheduleEvent[];
};

export default function Home() {
  const router = useRouter();
  const [schedule, setSchedule] = useState<TeamSchedule | null>(null);

  useEffect(() => {
    // 1) Generate raw schedule
    const schedule = createFullSchedule();
    console.log("Raw Schedule:", schedule);

    // 2) Build per-team schedule (table runs & judging sessions)
    const teamsSchedule = buildTeamsSchedule(schedule);
    console.log("Teams Schedule:", teamsSchedule);

    // 3) Convert to JSON object
    const jsonObj: TeamSchedule = {};
    for (let i = 1; i <= 32; i++) {
      jsonObj[`Team ${i}`] = teamsSchedule[i].map((event) => ({
        event: event.event,
        startTime: event.startTime,
        duration: event.duration,
        endTime: event.startTime + event.duration,
      }));
    }
    console.log("Final Schedule JSON:", JSON.stringify(jsonObj, null, 2));
    setSchedule(jsonObj);
  }, []);

  const handleLogout = () => {
    document.cookie = "auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    router.replace("/login");
  };

  // Find min and max times across all events
  const timeRange = schedule
    ? Object.values(schedule)
        .flat()
        .reduce(
          (acc, event) => ({
            min: Math.min(acc.min, event.startTime),
            max: Math.max(acc.max, event.endTime),
          }),
          { min: 24, max: 0 }
        )
    : { min: 8, max: 17 }; // Default 8 AM to 5 PM

  // Generate time slots
  const timeSlots = Array.from(
    { length: timeRange.max - timeRange.min },
    (_, i) => timeRange.min + i
  );

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* Header with title and logout */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            FLL Competition Schedule
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all hover:scale-105 shadow-lg"
          >
            Logout
          </button>
        </div>

        {/* Schedule Container */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl overflow-auto border border-gray-700 max-h-[800px]">
          <div className="inline-grid grid-cols-[80px_1fr]">
            {/* Fixed left column */}
            <div className="bg-gray-800/90 flex flex-col sticky left-0 z-50">
              {/* Time label */}
              <div className="p-2 text-center text-sm font-medium text-gray-400 border-b border-gray-700 h-10 sticky top-0 bg-gray-800/90 z-50">
                Time
              </div>
              {/* Time slots */}
              <div className="flex-1">
                {timeSlots.map((time) => (
                  <div
                    key={time}
                    className="h-8 flex items-center justify-end pr-2 border-b border-gray-700 text-xs font-medium text-gray-400"
                  >
                    {time}:00
                  </div>
                ))}
              </div>
            </div>

            {/* Main schedule area */}
            <div className="overflow-visible">
              <div style={{ width: "calc(120px * 32)" }}>
                {/* Sticky team headers */}
                <div className="sticky top-0 bg-gray-800/90 border-b border-gray-700 z-10 shadow-lg">
                  <div className="grid grid-cols-[repeat(32,120px)]">
                    {Array.from({ length: 32 }, (_, i) => i + 1).map(
                      (teamNum) => (
                        <div
                          key={teamNum}
                          className="p-2 text-center text-xs font-medium text-gray-400 whitespace-nowrap border-r border-gray-700/50 h-10"
                        >
                          Team {teamNum}
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Events grid */}
                <div
                  className="relative"
                  style={{ height: `${timeSlots.length * 2}rem` }}
                >
                  {/* Grid lines */}
                  <div className="absolute inset-0 grid grid-cols-[repeat(32,120px)]">
                    {Array.from({ length: 32 }, (_, i) => (
                      <div
                        key={i}
                        className="border-r border-gray-700/50 h-full"
                      />
                    ))}
                  </div>

                  {schedule &&
                    Object.entries(schedule).map(([teamName, events]) =>
                      events.map((event) => {
                        const teamNumber = parseInt(teamName.split(" ")[1]);
                        const column = teamNumber - 1;

                        return (
                          <div
                            key={`${teamName}-${event.event}-${event.startTime}`}
                            style={{
                              position: "absolute",
                              top: `${
                                (event.startTime - timeRange.min) * 2
                              }rem`,
                              height: `${event.duration * 2}rem`,
                              left: `${column * 120}px`,
                              width: "116px",
                            }}
                            className={`${
                              event.event === "tableRun"
                                ? "bg-gradient-to-br from-blue-500 to-blue-600"
                                : "bg-gradient-to-br from-emerald-500 to-emerald-600"
                            } text-white text-xs p-1.5 shadow-lg hover:scale-[1.02] hover:z-20 transition-all duration-200 backdrop-blur-sm border border-white/10 overflow-hidden group mx-0.5`}
                          >
                            <div className="font-medium truncate group-hover:text-white text-white/90">
                              {event.event === "tableRun"
                                ? "Robot Game"
                                : "Judging"}
                            </div>
                            <div className="text-[10px] truncate group-hover:text-white text-white/70">
                              {event.startTime}:00 - {event.endTime}:00
                            </div>
                          </div>
                        );
                      })
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {!schedule && (
          <div className="text-center mt-8 text-xl text-gray-400">
            Generating schedule...
          </div>
        )}

        <style jsx global>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </div>
    </div>
  );
}
