import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Habit } from '../../models/habit.model';

@Injectable({ providedIn: 'root' })
export class HabitService {
  private readonly apiUrl = `${environment.apiUrl}/habit`;
  private habitsSubject = new BehaviorSubject<Habit[]>([]);
  habits$ = this.habitsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.refresh();
  }

  private refresh(): void {
    this.http.get<Habit[]>(this.apiUrl).subscribe({
      next: (habits: Habit[]) => this.habitsSubject.next(habits)
    });
  }

  addHabit(habit: Habit): Observable<Habit> {
    return this.http.post<Habit>(this.apiUrl, habit).pipe(
      tap(() => this.refresh())
    );
  }

  updateHabit(updatedHabit: Habit): Observable<Habit> {
    return this.http.put<Habit>(`${this.apiUrl}/${updatedHabit.id}`, updatedHabit).pipe(
      tap(() => this.refresh())
    );
  }

  toggleHabitDay(habitId: number, dayIndex: number): Observable<Habit | null> {
    const habits = this.habitsSubject.getValue();
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return new BehaviorSubject<null>(null).asObservable();

    const updatedHabit = { ...habit, completedDays: [...habit.completedDays] };
    updatedHabit.completedDays[dayIndex] = !updatedHabit.completedDays[dayIndex];

    if (!updatedHabit.completedDays[dayIndex]) {
      for (let i = dayIndex + 1; i < updatedHabit.completedDays.length; i++) {
        updatedHabit.completedDays[i] = false;
      }
    }

    updatedHabit.streak = this.calculateStreak(updatedHabit.completedDays);

    return this.http.put<Habit>(`${this.apiUrl}/${habitId}`, updatedHabit).pipe(
      tap(() => this.refresh())
    );
  }

  deleteHabit(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.refresh())
    );
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
