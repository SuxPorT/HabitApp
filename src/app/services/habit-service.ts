import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Habit } from '../models/habit.model';
import { BaseService } from './base-service';

@Injectable({ providedIn: 'root' })
export class HabitService extends BaseService<Habit> {

  public habits$ = this.data$;

  constructor(http: HttpClient) {
    super(http, `${environment.apiUrl}/habit`);
  }

  public override refresh(): void { }

  public refreshByUserId(userId: number): void {
    this.http.get<Habit[]>(`${this.apiUrl}/user/${userId}`).subscribe({
      next: (items: Habit[]) => this.dataSubject.next(items),
      error: (err) => console.error(`Erro ao carregar hábitos do usuário ${userId}: `, err)
    });
  }

  public toggleHabitDay(habitId: number, dayIndex: number): Observable<Habit | null> {
    const habits = this.getAll();
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
    const headers = new HttpHeaders({ 'X-Skip-Loading': 'true' });

    return this.http.put<Habit>(`${this.apiUrl}/${habitId}`, updatedHabit, { headers }).pipe(
      tap((updated: Habit) => {
        const currentHabits = this.getAll().map(h => h.id === updated.id ? updated : h);
        this.dataSubject.next(currentHabits);
      })
    );
  }

  public override add(item: Partial<Habit>): Observable<Habit> {
    return this.http.post<Habit>(this.apiUrl, item).pipe(
      tap((newHabit: Habit) => {
        const currentHabits = this.getAll();
        this.dataSubject.next([...currentHabits, newHabit]);
      })
    );
  }

  public override update(item: Habit): Observable<Habit> {
    return this.http.put<Habit>(`${this.apiUrl}/${item.id}`, item).pipe(
      tap((updatedHabit: Habit) => {
        const currentHabits = this.getAll().map(h => h.id === updatedHabit.id ? updatedHabit : h);
        this.dataSubject.next(currentHabits);
      })
    );
  }

  public override delete(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`).pipe(
      tap((success: boolean) => {
        if (success) {
          const currentHabits = this.getAll().filter(h => h.id !== id);
          this.dataSubject.next(currentHabits);
        }
      })
    );
  }

  private calculateStreak(completedDays: boolean[]): number {
    let currentStreak = 0;
    for (let i = completedDays.length - 1; i >= 0; i--) {
      if (completedDays[i]) {
        currentStreak++;
      } else if (currentStreak > 0) {
        break;
      }
    }
    return currentStreak;
  }
}
