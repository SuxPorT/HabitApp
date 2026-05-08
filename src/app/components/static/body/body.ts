import { Component } from '@angular/core';
import { Habit } from '../../../../models/habit.model';

@Component({
  selector: 'app-body',
  standalone: false,
  templateUrl: './body.html',
  styleUrl: './body.scss',
})
export class Body {
  weekDays: string[] = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  habits: Habit[] = [
    {
      id: 1,
      title: 'Beber 2L de Água',
      icon: '💧',
      streak: 5,
      completedDays: [true, true, true, true, false, false, false]
    },
    {
      id: 2,
      title: 'Meditação 10min',
      icon: '🧘',
      streak: 12,
      completedDays: [true, true, true, true, true, true, false]
    },
    {
      id: 3,
      title: 'Ler 15 Páginas',
      icon: '📚',
      streak: 2,
      completedDays: [false, false, true, true, false, false, false]
    }
  ];

  toggleHabit(habitId: number, dayIndex: number) {
    const habit = this.habits.find(h => h.id === habitId);
    if (habit) {
      habit.completedDays[dayIndex] = !habit.completedDays[dayIndex];
    }
  }
}
