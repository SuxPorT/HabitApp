import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
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
  habits$!: Observable<Habit[]>;

  constructor(
    private habitService: HabitService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.habits$ = this.habitService.habits$;
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

    action.subscribe();
  }

  toggleHabit(habitId: number, dayIndex: number): void {
    this.habitService.toggleHabitDay(habitId, dayIndex).subscribe();
  }

  deleteHabit(id: number): void {
    if (confirm('Deseja excluir este hábito?')) {
      this.habitService.deleteHabit(id).subscribe();
    }
  }
}
