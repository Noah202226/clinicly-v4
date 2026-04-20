"use client";
import React, { useEffect, useState } from "react";

function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // Update every second for a real-time display
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format the time for the current locale (PHT)
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(time);

  const formattedTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
    timeZone: "Asia/Manila", // Explicitly set to Manila Time
  }).format(time);

  return (
    <div className="flex-col items-end text-right">
      {/* <span className="text-xs font-medium text-muted-foreground leading-none">
        {formattedDate}{" "}
      </span> */}
      <span className="text-sm font-semibold tabular-nums leading-none">
        {formattedTime}
      </span>
    </div>
  );
}

export default LiveClock;
