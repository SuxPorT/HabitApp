import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Observable, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Habit } from '../../../../models/habit.model';
import { HabitDialog } from '../../views/habit-dialog/habit-dialog';
import { HabitService } from '../../../services/habit-service';
import { LoadingService } from '../../../services/loading-service';

@Component({
  selector: 'app-body',
  standalone: false,
  templateUrl: './body.html',
  styleUrl: './body.scss',
})
export class Body implements OnInit {
  weekDays: string[] = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  currentDayIndex: number = new Date().getDay();
  filteredHabits$!: Observable<Habit[]>;
  loading$!: Observable<boolean>;
  filterControl = new FormControl('', { nonNullable: true });

  constructor(
    private habitService: HabitService,
    private dialog: MatDialog,
    private loadingService: LoadingService
  ) { }

  ngOnInit(): void {
    this.loading$ = this.loadingService.loading$;
    this.filteredHabits$ = combineLatest([
      this.habitService.habits$,
      this.filterControl.valueChanges.pipe(startWith(''))
    ]).pipe(
      map(([habits, filterString]) => {
        const search = filterString.toLowerCase().trim();
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
    if (confirm('Excluir hábito?')) {
      this.habitService.deleteHabit(id).subscribe();
    }
  }
}
