import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Observable, combineLatest } from 'rxjs';
import { map, startWith, take } from 'rxjs/operators';
import { Habit } from '../../../models/habit.model';
import { UserResponse } from '../../../models/user-responde.model';
import { HabitDialog } from '../dialogs/habit-dialog/habit-dialog';
import { HabitService } from '../../../services/habit-service';
import { LoadingService } from '../../../services/loading-service';
import { UserService } from '../../../services/user-service';
import { ConfirmDialog } from '../dialogs/confirm-dialog/confirm-dialog';

interface HabitsViewModel {
  habits: Habit[];
  activeHabits: number;
  completedToday: number;
  completionPercent: number;
  currentStreak: number;
  successRate: number;
  totalCompletions: number;
  motivationalMessage: string;
}

@Component({
  selector: 'app-habits',
  templateUrl: './habits.html',
  styleUrl: './habits.scss',
  standalone: false
})
export class Habits implements OnInit {
  weekDays: string[] = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  currentDayIndex = new Date().getDay();
  greeting = this.buildGreeting(new Date());
  view$!: Observable<HabitsViewModel>;
  user$!: Observable<UserResponse | null>;
  loading$!: Observable<boolean>;
  filterControl = new FormControl('', { nonNullable: true });

  constructor(
    private habitService: HabitService,
    private userService: UserService,
    private dialog: MatDialog,
    private loadingService: LoadingService
  ) { }

  ngOnInit(): void {
    this.loading$ = this.loadingService.loading$;
    this.user$ = this.userService.getUser();

    this.triggerRefresh();

    this.view$ = combineLatest([
      this.habitService.habits$,
      this.filterControl.valueChanges.pipe(startWith(''))
    ]).pipe(
      map(([habits, filterValue]) => {
        const search = filterValue.toLowerCase().trim();
        const filteredHabits = search
          ? habits.filter(habit => habit.title.toLowerCase().includes(search))
          : habits;

        return this.createViewModel(filteredHabits);
      })
    );
  }

  getFirstName(name?: string): string {
    return name?.trim().split(/\s+/)[0] || 'Victor';
  }

  isHabitCompletedToday(habit: Habit): boolean {
    return Boolean(habit.completedDays?.[this.currentDayIndex]);
  }

  openNewHabitDialog(habit?: Habit, event?: Event): void {
    event?.stopPropagation();

    const dialogRef = this.dialog.open(HabitDialog, {
      width: '450px',
      data: habit ? { ...habit } : null,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe((result?: Habit) => {
      if (result) this.handleSave(result);
    });
  }

  handleSave(habit: Habit): void {
    if (habit.id) {
      this.habitService.update(habit).subscribe({
        next: () => this.triggerRefresh()
      });
    } else {
      this.userService.getUser().pipe(take(1)).subscribe({
        next: (user) => {
          if (user && user.id) {
            const payload = { ...habit, userId: user.id };
            this.habitService.add(payload).subscribe({
              next: () => this.triggerRefresh()
            });
          } else {
            console.error('Não foi possível criar o hábito: usuário não identificado.');
          }
        }
      });
    }
  }

  toggleHabit(habitId: number, dayIndex: number): void {
    this.habitService.toggleHabitDay(habitId, dayIndex).subscribe();
  }

  toggleToday(habit: Habit, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();

    this.toggleHabit(habit.id, this.currentDayIndex);
  }

  deleteHabit(habit: Habit, event?: Event): void {
    event?.stopPropagation();

    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      panelClass: 'custom-dialog-container',
      data: {
        title: 'Delete Habit',
        message: `Delete <strong>"${habit.title}"</strong>?<br />This action cannot be undone.`,
        confirmBtnText: 'Delete'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.habitService.delete(habit.id).subscribe({
          next: () => this.triggerRefresh()
        });
      }
    });
  }

  private createViewModel(habits: Habit[]): HabitsViewModel {
    const activeHabits = habits.length;
    const completedToday = habits.filter(habit => this.isHabitCompletedToday(habit)).length;
    const totalCompletions = habits.reduce(
      (total, habit) => total + habit.completedDays.filter(Boolean).length,
      0
    );
    const totalPossible = activeHabits * this.weekDays.length;
    const completionPercent = activeHabits ? Math.round((completedToday / activeHabits) * 100) : 0;
    const successRate = totalPossible ? Math.round((totalCompletions / totalPossible) * 100) : 0;
    const currentStreak = Math.max(0, ...habits.map(habit => habit.streak || 0));

    return {
      habits,
      activeHabits,
      completedToday,
      completionPercent,
      currentStreak,
      successRate,
      totalCompletions,
      motivationalMessage: this.getMotivationalMessage(activeHabits, completedToday)
    };
  }

  private getMotivationalMessage(activeHabits: number, completedToday: number): string {
    if (!activeHabits) {
      return 'Create your first habit and start a fresh streak today.';
    }

    if (completedToday === activeHabits) {
      return 'Perfect day. Your streak is protected.';
    }

    if (!completedToday) {
      return 'Start with one small win. Tap any habit to complete it.';
    }

    const remaining = activeHabits - completedToday;
    const label = remaining === 1 ? 'habit' : 'habits';

    return `${remaining} ${label} left for a perfect day.`;
  }

  private buildGreeting(date: Date): string {
    const hour = date.getHours();

    if (hour < 12) {
      return 'Good Morning';
    }

    if (hour < 18) {
      return 'Good Afternoon';
    }

    return 'Good Evening';
  }

  private triggerRefresh(): void {
    this.userService.getUser().pipe(take(1)).subscribe((user) => {
      if (user && user.id) {
        this.habitService.refreshByUserId(user.id);
      }
    });
  }
}
