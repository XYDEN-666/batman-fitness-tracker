// src/components/dashboard/WorkoutList.jsx

const WorkoutList = ({ workouts }) => {
    if (!workouts || workouts.length === 0) {
      return <p className="text-neutral-400 italic">No workouts logged for this day. Time to hit the Batcave!</p>;
    }
  
    return (
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {workouts.map((workout) => (
          <div key={workout.id} className="bg-neutral-700 p-4 rounded-md shadow">
            <h3 className="text-lg font-semibold text-red-500 mb-2">
              Workout on {new Date(workout.date + 'T00:00:00').toLocaleDateString()}
            </h3>
            {workout.exercises.length > 0 ? (
              <ul className="space-y-2">
                {workout.exercises.map((ex, index) => (
                  <li key={ex.id || index} className="border-b border-neutral-600 pb-2 last:border-b-0">
                    <p className="font-medium text-neutral-100">{ex.exercise_name}</p>
                    <div className="text-sm text-neutral-300">
                      {ex.sets} sets:
                      <ul className="list-disc list-inside ml-4">
                        {ex.reps_per_set.map((reps, i) => (
                          <li key={i}>
                            {reps} reps @ {ex.weight_per_set[i]} kg/lb
                          </li>
                        ))}
                      </ul>
                    </div>
                    {ex.notes && <p className="text-xs text-neutral-400 mt-1 italic">Notes: {ex.notes}</p>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-neutral-400">No exercises recorded for this workout.</p>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  export default WorkoutList;