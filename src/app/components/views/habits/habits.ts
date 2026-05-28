import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Observable, combineLatest } from 'rxjs';
import { map, startWith, take } from 'rxjs/operators';
import { Habit } from '../../../models/habit.model';
import { HabitDialog } from '../dialogs/habit-dialog/habit-dialog';
import { HabitService } from '../../../services/habit-service';
import { LoadingService } from '../../../services/loading-service';
import { UserService } from '../../../services/user-service';
import { ConfirmDialog } from '../dialogs/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-habits',
  templateUrl: './habits.html',
  styleUrl: './habits.scss',
  standalone: false
})
export class Habits implements OnInit {
  weekDays: string[] = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  currentDayIndex: number = new Date().getDay();
  filteredHabits$!: Observable<Habit[]>;
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

    this.triggerRefresh();

    this.filteredHabits$ = combineLatest([
      this.habitService.habits$,
      this.filterControl.valueChanges.pipe(startWith(''))
    ]).pipe(
      map(([habits, filterValue]) => {
        const search = filterValue.toLowerCase().trim();
        return search ? habits.filter(h => h.title.toLowerCase().includes(search)) : habits;
      })
    );
  }

  openNewHabitDialog(habit?: Habit): void {
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

  deleteHabit(habit: Habit): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      panelClass: 'custom-dialog-container',
      data: {
        title: '🗑️ Excluir Hábito',
        message: `Tem certeza que deseja excluir o hábito <strong>"${habit.title}"</strong>?<br />Esta ação não poderá ser desfeita.`,
        confirmBtnText: 'Excluir'
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

  private triggerRefresh(): void {
    this.userService.getUser().pipe(take(1)).subscribe((user) => {
      if (user && user.id) {
        this.habitService.refreshByUserId(user.id);
      }
    });
  }
}
