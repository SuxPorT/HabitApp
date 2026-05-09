import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Habit } from '../../models/habit.model';

@Injectable({
  providedIn: 'root'
})
export class HabitService {
  private readonly STORAGE_KEY = 'habitapp_data';

  constructor() {
    this.initStorage();
  }

  private initStorage(): void {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
    }
  }

  getHabits(): Observable<Habit[]> {
    const data = localStorage.getItem(this.STORAGE_KEY);
    const habits = data ? JSON.parse(data) : [];
    return of(habits.filter((h: Habit) => !h.isDeleted));
  }

  addHabit(habit: Habit): Observable<Habit> {
    const habits = this.getRawHabits();
    const newHabit: Habit = {
      ...habit,
      id: habits.length > 0 ? Math.max(...habits.map(h => h.id)) + 1 : 1,
      streak: 0,
      createdAt: new Date(),
      isDeleted: false
    };
    habits.push(newHabit);
    this.saveRawHabits(habits);
    return of(newHabit);
  }

  updateHabit(updatedHabit: Habit): Observable<Habit> {
    const habits = this.getRawHabits();
    updatedHabit.modifiedAt = new Date();
    const index = habits.findIndex(h => h.id === updatedHabit.id);
    if (index !== -1) {
      habits[index] = { ...updatedHabit };
      this.saveRawHabits(habits);
    }
    return of(updatedHabit);
  }

  deleteHabit(id: number): Observable<boolean> {
    const habits = this.getRawHabits();
    const index = habits.findIndex(h => h.id === id);
    if (index !== -1) {
      habits[index].isDeleted = true;
      habits[index].modifiedAt = new Date();
      this.saveRawHabits(habits);
      return of(true);
    }
    return of(false);
  }

  private getRawHabits(): Habit[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveRawHabits(habits: Habit[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(habits));
  }
}
