import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Habit } from '../../../../models/habit.model';
import { HabitDialog } from '../../views/habit-dialog/habit-dialog';
import { HabitService } from '../../../services/habit-service';

@Component({
  selector: 'app-body',
  standalone: false,
  templateUrl: './body.html',
  styleUrl: './body.scss',
})
export class Body implements OnInit {
  weekDays: string[] = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  habits: Habit[] = [];

  constructor(
    private habitService: HabitService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadHabits();
  }

  loadHabits(): void {
    this.habitService.getHabits().subscribe({
      next: (data: Habit[]) => {
        this.habits = [...data];
      }
    });
  }

  openNewHabitDialog(habit?: Habit): void {
    const dialogRef = this.dialog.open(HabitDialog, {
      width: '450px',
      data: habit ? { ...habit } : null,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe((result?: Habit) => {
      if (result) {
        this.handleSave(result);
      }
    });
  }

  handleSave(habitData: any): void {
    const action = habitData.id
      ? this.habitService.updateHabit(habitData)
      : this.habitService.addHabit(habitData);

    action.subscribe({
      next: () => this.loadHabits()
    });
  }

  toggleHabit(habitId: number, dayIndex: number): void {
    const habit = this.habits.find(h => h.id === habitId);
    if (habit) {
      const updatedHabit = {
        ...habit,
        completedDays: [...habit.completedDays]
      };

      updatedHabit.completedDays[dayIndex] = !updatedHabit.completedDays[dayIndex];
      updatedHabit.streak = this.calculateStreak(updatedHabit.completedDays);

      this.habitService.updateHabit(updatedHabit).subscribe({
        next: () => this.loadHabits()
      });
    }
  }

  calculateStreak(completedDays: boolean[]): number {
    let streak = 0;
    for (let i = completedDays.length - 1; i >= 0; i--) {
      if (completedDays[i]) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  deleteHabit(id: number): void {
    if (confirm('Deseja excluir este hábito?')) {
      this.habitService.deleteHabit(id).subscribe({
        next: () => this.loadHabits()
      });
    }
  }
}
