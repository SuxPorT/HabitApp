import { Injectable } from '@angular/core';
import { BehaviorSubject, delay, Observable, of } from 'rxjs';
import { Habit } from '../../models/habit.model';

@Injectable({
  providedIn: 'root'
})
export class HabitService {
  private readonly STORAGE_KEY = 'habitapp_data';
  private habitsSubject = new BehaviorSubject<Habit[]>([]);

  constructor() {
    this.initStorage();
    this.refreshList();
  }

  private initStorage(): void {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
    }
  }

  private refreshList(): void {
    const habits = this.getRawHabits().filter((h: Habit) => !h.isDeleted);
    this.habitsSubject.next([...habits]);
  }

  getHabits(): Observable<Habit[]> {
    return this.habitsSubject.asObservable().pipe(delay(0));
  }

  addHabit(habit: Habit): Observable<Habit> {
    const habits = this.getRawHabits();
    const newHabit: Habit = {
      ...habit,
      id: habits.length > 0 ? Math.max(...habits.map(h => h.id)) + 1 : 1,
      createdAt: new Date(),
      modifiedAt: new Date(),
      isDeleted: false
    };
    habits.push(newHabit);
    this.saveRawHabits(habits);
    this.refreshList();
    return of(newHabit);
  }

  updateHabit(updatedHabit: Habit): Observable<Habit> {
    let habits = this.getRawHabits();
    updatedHabit.modifiedAt = new Date();
    habits = habits.map(h => h.id === updatedHabit.id ? updatedHabit : h);
    this.saveRawHabits(habits);
    this.refreshList();
    return of(updatedHabit);
  }

  deleteHabit(id: number): Observable<boolean> {
    const habits = this.getRawHabits();
    const habitIndex = habits.findIndex(h => h.id === id);
    if (habitIndex !== -1) {
      habits[habitIndex].isDeleted = true;
      habits[habitIndex].modifiedAt = new Date();
      this.saveRawHabits(habits);
      this.refreshList();
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
