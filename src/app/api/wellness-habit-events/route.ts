import { jsonNoStore } from "@/lib/api-response";
import { combinedHabitEventsResponseSchema } from "@/lib/contracts/shusthota-p1";
import { shusthotaMotherDb } from "@/lib/shusthota/server";

export async function GET() {
  const auth = await shusthotaMotherDb();
  if (!auth.db) return jsonNoStore({ message: "Sign in as a mother to view habit history." }, auth.status);
  const result = await auth.db.from("wellness_habit_events")
    .select("id,habit_id,event_type,related_event_id,occurred_at,created_at")
    .order("occurred_at", { ascending: false }).limit(100);
  if (result.error) return jsonNoStore({ message: "Habit history is temporarily unavailable." }, 503);
  const habitIds = [...new Set(result.data.map(entry => entry.habit_id))];
  if (!habitIds.length) return jsonNoStore({ entries: [] }, 200);
  const habits = await auth.db.from("wellness_habits").select("id,label").in("id", habitIds);
  if (habits.error) return jsonNoStore({ message: "Habit history is temporarily unavailable." }, 503);
  const labels = new Map(habits.data.map(habit => [habit.id, habit.label]));
  const entries = result.data.flatMap(entry => {
    const habit_label = labels.get(entry.habit_id);
    return habit_label ? [{ ...entry, habit_label }] : [];
  });
  const parsed = combinedHabitEventsResponseSchema.safeParse({ entries });
  if (!parsed.success) return jsonNoStore({ message: "Habit history is temporarily unavailable." }, 503);
  return jsonNoStore(parsed.data, 200);
}
