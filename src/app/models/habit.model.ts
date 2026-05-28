export interface Habit {
  id: number;
  title: string;
  icon: string;
  streak: number;
  completedDays: boolean[];
  userId: number;
  createdAt: Date;
  modifiedAt?: Date;
  isDeleted: boolean;
}
