import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { Habit } from '../../models/habit.model';

@Injectable({ providedIn: 'root' })
export class HabitService {
  private readonly STORAGE_KEY = 'habitapp_data';
  private habitsSubject = new BehaviorSubject<Habit[]>([]);
  habits$ = this.habitsSubject.asObservable();

  constructor() {
    this.initStorage();
    this.refresh();
  }

  private initStorage(): void {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
    }
  }

  private refresh(): void {
    const habits = this.getRawHabits().filter((h: Habit) => !h.isDeleted);
    this.habitsSubject.next(habits);
  }

  private getRawHabits(): Habit[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveRawHabits(habits: Habit[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(habits));
  }

  addHabit(habit: Habit): Observable<Habit> {
    const habits = this.getRawHabits();
    const newHabit: Habit = {
      ...habit,
      id: habits.length > 0 ? Math.max(...habits.map(h => h.id)) + 1 : 1,
      streak: this.calculateStreak(habit.completedDays),
      createdAt: new Date(),
      isDeleted: false
    };
    habits.push(newHabit);
    this.saveRawHabits(habits);
    this.refresh();
    return of(newHabit);
  }

  updateHabit(updatedHabit: Habit): Observable<Habit> {
    const habits = this.getRawHabits();
    const index = habits.findIndex(h => h.id === updatedHabit.id);
    if (index !== -1) {
      updatedHabit.streak = this.calculateStreak(updatedHabit.completedDays);
      habits[index] = { ...updatedHabit, modifiedAt: new Date() };
      this.saveRawHabits(habits);
      this.refresh();
    }
    return of(updatedHabit);
  }

  toggleHabitDay(habitId: number, dayIndex: number): Observable<Habit | null> {
    const habits = this.getRawHabits();
    const index = habits.findIndex(h => h.id === habitId);
    if (index !== -1) {
      const habit = habits[index];
      habit.completedDays[dayIndex] = !habit.completedDays[dayIndex];

      if (!habit.completedDays[dayIndex]) {
        for (let i = dayIndex + 1; i < habit.completedDays.length; i++) {
          habit.completedDays[i] = false;
        }
      }

      habit.streak = this.calculateStreak(habit.completedDays);
      this.saveRawHabits(habits);
      this.refresh();
      return of(habit);
    }
    return of(null);
  }

  deleteHabit(id: number): Observable<boolean> {
    const habits = this.getRawHabits();
    const index = habits.findIndex(h => h.id === id);
    if (index !== -1) {
      habits[index].isDeleted = true;
      this.saveRawHabits(habits);
      this.refresh();
      return of(true);
    }
    return of(false);
  }

  private calculateStreak(completedDays: boolean[]): number {
    let streak = 0;
    for (let done of completedDays) {
      if (done) streak++;
      else break;
    }
    return streak;
  }
}
