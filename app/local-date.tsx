"use client";

import { useEffect, useState } from "react";

const DAY = 24 * 60 * 60 * 1000;

// "today", "3 days ago", "2 weeks ago", "5 months ago"
function relative(date: Date, now: Date): string {
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  const days = Math.round((now.getTime() - date.getTime()) / DAY);
  if (days < 7) return rtf.format(-days, "day");
  if (days < 30) return rtf.format(-Math.floor(days / 7), "week");
  return rtf.format(-Math.floor(days / 30), "month");
}

// Formats a YYYY-MM-DD date in the viewer's locale, or relative to today when it's less than
// 6 months old and `relative` is set.
// Pages are prerendered without knowing the viewer or the current day, so the ISO date is
// rendered first and swapped after hydration.
export function LocalDate({ date, relative: allowRelative }: { date: string; relative?: boolean }) {
  const [text, setText] = useState(date);
  const [title, setTitle] = useState<string>();

  useEffect(() => {
    const [y, m, d] = date.split("-").map(Number);
    const value = new Date(y, m - 1, d);
    const absolute = value.toLocaleDateString(undefined, { dateStyle: "medium" });

    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    const recent = !!allowRelative && value > sixMonthsAgo && value <= now;

    setText(recent ? relative(value, now) : absolute);
    setTitle(recent ? absolute : undefined);
  }, [date, allowRelative]);

  return (
    <time dateTime={date} title={title}>
      {text}
    </time>
  );
}
