// src/components/WorkoutLogForm.jsx
"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

const WorkoutLogForm = () => {
  const router = useRouter();
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);
  const [exercises, setExercises] = useState([
    { exercise_name: '', rawSets: [{ reps: '', weight: '' }], notes: '' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleExerciseChange = (index, field, value) => {
    const newExercises = [...exercises];
    newExercises[index][field] = value;
    setExercises(newExercises);
  };

  const handleSetChange = (exIndex, setIndex, field, value) => {
    const newExercises = [...exercises];
    newExercises[exIndex].rawSets[setIndex][field] = value;
    setExercises(newExercises);
  };

  const addSet = (exIndex) => {
    const newExercises = [...exercises];
    newExercises[exIndex].rawSets.push({ reps: '', weight: '' });
    setExercises(newExercises);
  };

  const removeSet = (exIndex, setIndex) => {
    const newExercises = [...exercises];
    if (newExercises[exIndex].rawSets.length > 1) {
      newExercises[exIndex].rawSets.splice(setIndex, 1);
      setExercises(newExercises);
    }
  };

  const addExercise = () => {
    setExercises([...exercises, { exercise_name: '', rawSets: [{ reps: '', weight: '' }], notes: '' }]);
  };

  const removeExercise = (index) => {
    if (exercises.length > 1) {
      const newExercises = exercises.filter((_, i) => i !== index);
      setExercises(newExercises);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .insert({ date: workoutDate })
        .select()
        .single();

      if (workoutError) throw workoutError;
      if (!workoutData) throw new Error("Failed to create workout entry.");

      const workoutId = workoutData.id;

      const exercisesToInsert = exercises.map(ex => ({
        workout_id: workoutId,
        exercise_name: ex.exercise_name,
        sets: ex.rawSets.length,
        reps_per_set: ex.rawSets.map(s => parseInt(s.reps, 10) || 0),
        weight_per_set: ex.rawSets.map(s => parseFloat(s.weight) || 0),
        notes: ex.notes,
      }));

      for (const ex of exercisesToInsert) {
        if (!ex.exercise_name.trim()) {
          throw new Error("Exercise name cannot be empty.");
        }
        if (ex.sets === 0) {
          throw new Error(`Exercise "${ex.exercise_name}" must have at least one set.`);
        }
        if (ex.reps_per_set.some(isNaN) || ex.weight_per_set.some(isNaN)) {
            throw new Error(`Invalid reps or weight for exercise "${ex.exercise_name}". Ensure they are numbers.`);
        }
      }

      const { error: exercisesError } = await supabase
        .from('workout_exercises')
        .insert(exercisesToInsert);

      if (exercisesError) throw exercisesError;

      setSuccessMessage('Workout logged successfully! Redirecting to dashboard...');
      setWorkoutDate(new Date().toISOString().split('T')[0]);
      setExercises([{ exercise_name: '', rawSets: [{ reps: '', weight: '' }], notes: '' }]);
      setTimeout(() => router.push('/'), 2000);

    } catch (err) {
      console.error("Error logging workout:", err);
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-neutral-800 rounded-lg shadow-xl">
      {error && <p className="text-red-500 bg-red-100 border border-red-500 p-3 rounded-md">{error}</p>}
      {successMessage && <p className="text-green-500 bg-green-100 border border-green-500 p-3 rounded-md">{successMessage}</p>}

      <div>
        <label htmlFor="workoutDate" className="block mb-2 text-sm font-medium text-neutral-300">
          Workout Date
        </label>
        <input
          type="date"
          id="workoutDate"
          value={workoutDate}
          onChange={(e) => setWorkoutDate(e.target.value)}
          className="input-field"
          required
        />
      </div>

      {exercises.map((exercise, exIndex) => (
        <div key={exIndex} className="p-4 border border-neutral-700 rounded-md space-y-3 relative">
          {exercises.length > 1 && (
             <button
                type="button"
                onClick={() => removeExercise(exIndex)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xs"
              >
                Remove Exercise
              </button>
          )}
          <h3 className="text-lg font-semibold text-red-500">Exercise #{exIndex + 1}</h3>
          <div>
            <label htmlFor={`exerciseName-${exIndex}`} className="block mb-1 text-sm text-neutral-400">
              Exercise Name
            </label>
            <input
              type="text"
              id={`exerciseName-${exIndex}`}
              placeholder="e.g., Bench Press"
              value={exercise.exercise_name}
              onChange={(e) => handleExerciseChange(exIndex, 'exercise_name', e.target.value)}
              className="input-field"
              required
            />
          </div>

          {exercise.rawSets.map((set, setIndex) => (
            <div key={setIndex} className="flex items-end space-x-2 p-2 bg-neutral-750 rounded">
              <div className="flex-1">
                <label htmlFor={`reps-${exIndex}-${setIndex}`} className="block mb-1 text-xs text-neutral-400">
                  Reps
                </label>
                <input
                  type="number"
                  id={`reps-${exIndex}-${setIndex}`}
                  placeholder="0"
                  min="0"
                  value={set.reps}
                  onChange={(e) => handleSetChange(exIndex, setIndex, 'reps', e.target.value)}
                  className="input-field !p-1.5"
                  required
                />
              </div>
              <div className="flex-1">
                <label htmlFor={`weight-${exIndex}-${setIndex}`} className="block mb-1 text-xs text-neutral-400">
                  Weight (kg/lb)
                </label>
                <input
                  type="number"
                  step="0.01"
                  id={`weight-${exIndex}-${setIndex}`}
                  placeholder="0"
                  min="0"
                  value={set.weight}
                  onChange={(e) => handleSetChange(exIndex, setIndex, 'weight', e.target.value)}
                  className="input-field !p-1.5"
                  required
                />
              </div>
              {exercise.rawSets.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSet(exIndex, setIndex)}
                  className="text-red-500 hover:text-red-700 p-1.5 text-xs"
                >
                  Remove Set
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addSet(exIndex)}
            className="text-sm btn btn-secondary !py-1 !px-3 mt-2"
          >
            Add Set
          </button>

          <div>
            <label htmlFor={`notes-${exIndex}`} className="block mb-1 text-sm text-neutral-400">
              Notes (Optional)
            </label>
            <textarea
              id={`notes-${exIndex}`}
              rows={2}
              placeholder="e.g., Felt strong, focused on form"
              value={exercise.notes}
              onChange={(e) => handleExerciseChange(exIndex, 'notes', e.target.value)}
              className="input-field"
            ></textarea>
          </div>
        </div>
      ))}

      <div className="flex justify-between items-center mt-4">
        <button
            type="button"
            onClick={addExercise}
            className="btn btn-secondary"
        >
            Add Another Exercise
        </button>
        <button
            type="submit"
            className="btn btn-primary text-lg"
            disabled={isLoading}
        >
            {isLoading ? 'Saving...' : 'Save Workout'}
        </button>
      </div>
    </form>
  );
};

export default WorkoutLogForm;