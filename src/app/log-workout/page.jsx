// src/app/log-workout/page.jsx
"use client";

import WorkoutLogForm from '@/components/WorkoutLogForm';

export default function LogWorkoutPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-red-600 border-b-2 border-neutral-700 pb-2">
        Log New Workout
      </h1>
      <WorkoutLogForm />
    </div>
  );
}