import { Base } from "./base-model";

export interface Habit extends Base {
  title: string;
  icon: string;
  streak: number;
  completedDays: boolean[];
  userId: number;
}
