"use client";

import { useState, useEffect } from "react";
import { differenceInSeconds } from "date-fns";
import { TimeLeft } from "@/types";

export function useCountdown(targetDate: Date | string): TimeLeft {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const target =
      typeof targetDate === "string" ? new Date(targetDate) : targetDate;

    const calculateTimeLeft = () => {
      const now = new Date();
      const diff = differenceInSeconds(target, now);

      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(diff / 86400),
        hours: Math.floor((diff % 86400) / 3600),
        minutes: Math.floor((diff % 3600) / 60),
        seconds: diff % 60,
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (
        newTimeLeft.days === 0 &&
        newTimeLeft.hours === 0 &&
        newTimeLeft.minutes === 0 &&
        newTimeLeft.seconds === 0
      ) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

export function formatTimeLeft(timeLeft: TimeLeft): string {
  const { days, hours, minutes, seconds } = timeLeft;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  return `${hours}h ${minutes}m ${seconds}s`;
}

// Get daily reset time (4:00 AM server time - using Asia/Shanghai)
export function getDailyResetTime(): Date {
  const now = new Date();
  const reset = new Date(now);

  // Set to 4:00 AM
  reset.setUTCHours(20, 0, 0, 0); // 4:00 AM UTC+8 = 20:00 UTC previous day

  // If past today's reset, set to tomorrow
  if (now >= reset) {
    reset.setDate(reset.getDate() + 1);
  }

  return reset;
}

// Get weekly reset time (Monday 4:00 AM server time)
export function getWeeklyResetTime(): Date {
  const now = new Date();
  const reset = new Date(now);

  // Get next Monday
  const dayOfWeek = reset.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7 || 7;

  reset.setDate(reset.getDate() + daysUntilMonday);
  reset.setUTCHours(20, 0, 0, 0); // 4:00 AM UTC+8

  return reset;
}
