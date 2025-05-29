// src/app/page.jsx (Dashboard)
"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import CalendarWidget from '@/app/components/dashboard/CalendarWidget';
import WeeklySummary from '@/app/components/dashboard/WeeklySummary';
import WorkoutList from '@/app/components/dashboard/WorkoutList';
import PersonalRecords from '@/app/components/dashboard/PersonalRecords';
import ExerciseProgressChart from '@/app/components/dashboard/ExerciseProgressChart';

const formatDateForSupabase = (date) => {
  return date.toISOString().split('T')[0];
};

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [workoutsForSelectedDate, setWorkoutsForSelectedDate] = useState([]);
  const [allWorkouts, setAllWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllWorkouts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          id,
          date,
          created_at,
          workout_exercises (
            id,
            exercise_name,
            sets,
            reps_per_set,
            weight_per_set,
            notes
          )
        `)
        .order('date', { ascending: false });

      if (error) throw error;
      
      const formattedWorkouts = data.map(w => ({
          id: w.id,
          date: w.date,
          created_at: w.created_at,
          exercises: w.workout_exercises || []
      }));
      setAllWorkouts(formattedWorkouts);

    } catch (err) {
      console.error("Error fetching all workouts:", err);
      setError("Failed to load workout data. The Joker might be interfering.");
    } finally {
      setIsLoading(false);
    }
  }, []);


  useEffect(() => {
    fetchAllWorkouts();
  }, [fetchAllWorkouts]);


  useEffect(() => {
    const dateString = formatDateForSupabase(selectedDate);
    const filtered = allWorkouts.filter(workout => workout.date === dateString);
    setWorkoutsForSelectedDate(filtered);
  }, [selectedDate, allWorkouts]);


  const handleDateChange = (date) => {
    setSelectedDate(Array.isArray(date) ? date[0] : date);
  };

  const [volumeChartData, setVolumeChartData] = useState(null);
  const [uniqueExerciseNames, setUniqueExerciseNames] = useState([]);


  useEffect(() => {
    if (allWorkouts.length > 0) {
      const exerciseNames = new Set();
      allWorkouts.forEach(workout => {
        workout.exercises.forEach(ex => exerciseNames.add(ex.exercise_name));
      });
      setUniqueExerciseNames(Array.from(exerciseNames).sort());

      const sortedByDate = [...allWorkouts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const labels = sortedByDate.map(w => new Date(w.date).toLocaleDateString('en-CA'));
      const dataPoints = sortedByDate.map(w =>
        w.exercises.reduce((totalVol, ex) => {
          const exerciseVolume = ex.reps_per_set.reduce((sum, reps, i) => {
            return sum + (reps * (ex.weight_per_set[i] || 0));
          }, 0);
          return totalVol + exerciseVolume;
        }, 0)
      );

      setVolumeChartData({
        labels,
        datasets: [
          {
            label: 'Total Workout Volume (Reps * Weight)',
            data: dataPoints,
            borderColor: '#dc2626',
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            fill: true,
            tension: 0.1,
          },
        ],
      });
    }
  }, [allWorkouts]);


  if (isLoading && !allWorkouts.length) return (
    <div className="flex justify-center items-center h-screen">
        <p className="text-2xl text-red-500 animate-pulse">Loading Bat-Data...</p>
    </div>
  );
  if (error) return <p className="text-center text-red-500 text-xl mt-10">{error}</p>;

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-neutral-800 p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-red-600 mb-3">Calendar</h2>
            <CalendarWidget
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              workouts={allWorkouts}
            />
          </div>
          <div className="bg-neutral-800 p-4 rounded-lg shadow-lg">
            <WeeklySummary allWorkouts={allWorkouts} currentDate={selectedDate} />
          </div>
        </div>
        <div className="md:col-span-2 space-y-6">
          <div className="bg-neutral-800 p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-red-600 mb-3">
              Workouts for {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </h2>
            <WorkoutList workouts={workoutsForSelectedDate} />
          </div>
        </div>
      </div>
      <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
        <PersonalRecords allWorkouts={allWorkouts} />
      </div>
      {volumeChartData && (
        <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-red-600 mb-3">Overall Workout Volume Trend</h2>
          <ExerciseProgressChart chartData={volumeChartData} />
        </div>
      )}
      {uniqueExerciseNames.length > 0 && (
         <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-red-600 mb-3">Exercise Specific Progression</h2>
          <p className="text-neutral-400">
            (Implement a dropdown to select an exercise and display its specific progression chart here)
          </p>
        </div>
      )}
       <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-red-600 mb-3">Weekly Comparison</h2>
          <p className="text-neutral-400">(Implement logic to compare current week stats with previous weeks here)</p>
      </div>
    </div>
  );
}