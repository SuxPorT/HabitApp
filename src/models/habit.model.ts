export interface Habit {
  id: number;
  title: string;
  icon: string;
  streak: number;
  completedDays: boolean[];
}
