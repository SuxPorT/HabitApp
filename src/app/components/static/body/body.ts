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
    this.habitService.getHabits().subscribe({
      next: (data: Habit[]) => {
        this.habits = data;
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
    if (habitData.id) {
      this.habitService.updateHabit(habitData).subscribe();
    } else {
      this.habitService.addHabit(habitData).subscribe();
    }
  }

  toggleHabit(habitId: number, dayIndex: number): void {
    const habit = this.habits.find((h: Habit) => h.id === habitId);
    if (habit) {
      habit.completedDays[dayIndex] = !habit.completedDays[dayIndex];
      this.habitService.updateHabit(habit).subscribe();
    }
  }

  deleteHabit(id: number): void {
    if (confirm('Tem certeza que deseja excluir este hábito?')) {
      this.habitService.deleteHabit(id).subscribe();
    }
  }
}
