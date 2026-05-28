import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Habit } from '../../../models/habit.model';

@Component({
  selector: 'app-habit-dialog',
  templateUrl: './habit-dialog.html',
  styleUrl: './habit-dialog.scss',
  standalone: false
})
export class HabitDialog implements OnInit {
  formData: Partial<Habit> = {
    title: '',
    icon: '',
    completedDays: [false, false, false, false, false, false, false]
  };

  iconSuggestions: string[] = [
    '💧', '🏃', '📚', '🧘', '🍎', '💪', '💊', '🛌', '🚭', '🌱', '🎨', '💻'
  ];

  constructor(
    public dialogRef: MatDialogRef<HabitDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Habit | null
  ) { }

  ngOnInit(): void {
    if (this.data) {
      this.formData = { ...this.data };
    }
  }

  selectIcon(icon: string): void {
    this.formData.icon = icon;
  }

  onSave(): void {
    if (this.formData.title && this.formData.icon) {
      this.dialogRef.close(this.formData);
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
