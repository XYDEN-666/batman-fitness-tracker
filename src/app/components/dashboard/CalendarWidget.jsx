// src/components/dashboard/CalendarWidget.jsx
"use client";

import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useMemo } from 'react';

// Remember to add CSS overrides for react-calendar in globals.css

const formatDateKey = (date) => date.toISOString().split('T')[0];

const CalendarWidget = ({ selectedDate, onDateChange, workouts }) => {
  const workoutDates = useMemo(() => {
    const dates = new Set();
    workouts.forEach(workout => {
      dates.add(formatDateKey(new Date(workout.date + 'T00:00:00')));
    });
    return dates;
  }, [workouts]);

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      if (workoutDates.has(formatDateKey(date))) {
        return 'workout-day';
      }
    }
    return null;
  };

  return (
    <Calendar
      onChange={onDateChange}
      value={selectedDate}
      className="react-calendar-batman"
      tileClassName={tileClassName}
      locale="en-CA"
    />
  );
};

export default CalendarWidget;