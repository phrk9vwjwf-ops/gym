import { type Exercise, type SetEntry, type ProgramItem } from '@/db';

export const suggestWeightIncrement = async (
  sessionId: string,
  sets: SetEntry[],
  programItems: ProgramItem[],
  exercises: Exercise[]
) => {
  const suggestions: Record<string, string> = {};
  // Group sets by exerciseId
  const setsByExercise: Record<string, SetEntry[]> = {};
  sets.forEach(s => {
    if (!setsByExercise[s.exerciseId]) setsByExercise[s.exerciseId] = [];
    setsByExercise[s.exerciseId].push(s);
  });
  for (const exId in setsByExercise) {
    const exSets = setsByExercise[exId];
    const item = programItems.find(i => i.exerciseId === exId);
    // Open-ended items (to failure, ladder) have no top of range to reach
    if (!item || item.repsHigh == null) continue;
    const top = item.repsHigh;
    const unit = exercises.find(e => e.id === exId)?.unit;
    // Check if all sets reached top of rep range
    const allTop = exSets.every(s => s.reps >= top);
    if (allTop && exSets.length === item.sets) {
      // Suggest increment
      let incText = '';
      if (unit === 'kg') {
        incText = 'в следующий раз +2,5 кг';
      } else if (unit === 'bodyweight') {
        // bodyweight exercises: maybe add reps?
        incText = 'в следующий раз +1 повтор';
      } else {
        incText = 'в следующий раз +2,5 кг';
      }
      suggestions[exId] = incText;
    }
  }
  return suggestions;
};