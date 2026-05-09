import { Component, OnInit } from '@angular/core';
import { Habit } from '../../../../models/habit.model';
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

  constructor(private habitService: HabitService) { }

  ngOnInit(): void {
    this.listHabits();
  }

  listHabits(): void {
    this.habitService.getHabits().subscribe({
      next: (data: Habit[]) => this.habits = data,
      error: (err: any) => console.error('Erro ao carregar hábitos: ', err)
    });
  }

  toggleHabit(habitId: number, dayIndex: number): void {
    const habit = this.habits.find(h => h.id === habitId);

    if (habit) {
      habit.completedDays[dayIndex] = !habit.completedDays[dayIndex];

      this.habitService.updateHabit(habit).subscribe({
        next: (updated: Habit) => console.log('Hábito atualizado: ', updated.title),
        error: (err: any) => {
          habit.completedDays[dayIndex] = !habit.completedDays[dayIndex];
          console.error('Erro ao salvar alteração: ', err);
        }
      });
    }
  }
}
