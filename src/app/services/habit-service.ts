import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Habit } from '../../models/habit.model';

@Injectable({
  providedIn: 'root'
})
export class HabitService {
  private readonly STORAGE_KEY = 'habitapp_data';
  private apiUrl = environment.apiUrl;

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
    return of(data ? JSON.parse(data) : []);
  }

  addHabit(habit: Habit): Observable<Habit> {
    const habits = this.getRawHabits();
    habit.id = habits.length > 0 ? Math.max(...habits.map(h => h.id)) + 1 : 1;
    habits.push(habit);
    this.saveRawHabits(habits);
    return of(habit);
  }

  updateHabit(updatedHabit: Habit): Observable<Habit> {
    let habits = this.getRawHabits();
    habits = habits.map(h => h.id === updatedHabit.id ? updatedHabit : h);
    this.saveRawHabits(habits);
    return of(updatedHabit);
  }

  deleteHabit(id: number): Observable<boolean> {
    let habits = this.getRawHabits();
    habits = habits.filter(h => h.id !== id);
    this.saveRawHabits(habits);
    return of(true);
  }

  private getRawHabits(): Habit[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveRawHabits(habits: Habit[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(habits));
  }
}
