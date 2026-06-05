import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { BehaviorSubject, of } from 'rxjs';
import { Habit } from '../../../models/habit.model';
import { HabitService } from '../../../services/habit-service';
import { LoadingService } from '../../../services/loading-service';
import { UserService } from '../../../services/user-service';
import { Habits } from './habits';

describe('Habits', () => {
  let fixture: ComponentFixture<Habits>;
  let habitsSubject: BehaviorSubject<Habit[]>;
  let loadingSubject: BehaviorSubject<boolean>;

  const baseHabit: Habit = {
    id: 1,
    title: 'Beber água pela manhã',
    icon: '💧',
    streak: 5,
    completedDays: [true, false, false, false, false, false, false],
    userId: 1,
    createdAt: new Date('2026-06-01T08:30:00'),
    isDeleted: false,
  };

  function view(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  beforeEach(async () => {
    habitsSubject = new BehaviorSubject<Habit[]>([]);
    loadingSubject = new BehaviorSubject<boolean>(false);

    await TestBed.configureTestingModule({
      declarations: [Habits],
      imports: [CommonModule, ReactiveFormsModule, MatMenuModule],
      providers: [
        {
          provide: HabitService,
          useValue: {
            habits$: habitsSubject.asObservable(),
            refreshByUserId: vi.fn(),
            toggleHabitDay: vi.fn(() => of(baseHabit)),
            add: vi.fn(() => of(baseHabit)),
            update: vi.fn(() => of(baseHabit)),
            delete: vi.fn(() => of(true)),
          },
        },
        {
          provide: UserService,
          useValue: {
            getUser: vi.fn(() => of({ id: 1, name: 'Victor', email: 'victor@example.com' })),
          },
        },
        {
          provide: LoadingService,
          useValue: {
            loading$: loadingSubject.asObservable(),
          },
        },
        {
          provide: MatDialog,
          useValue: {
            open: vi.fn(() => ({ afterClosed: () => of(null) })),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Habits);
    fixture.componentInstance.currentDayIndex = 0;
    fixture.detectChanges();
  });

  it('renders habit cards with title, streak and compact weekly indicators', () => {
    habitsSubject.next([baseHabit]);
    fixture.detectChanges();

    const card = view().querySelector('[data-testid="habit-card"]') as HTMLElement;
    const weekIndicators = view().querySelectorAll('.week-indicator');

    expect(card).toBeTruthy();
    expect(card.textContent).toContain(baseHabit.title);
    expect(card.textContent).toContain('5 day streak');
    expect(weekIndicators.length).toBe(7);
  });

  it('renders the empty state when there are no habits', () => {
    habitsSubject.next([]);
    fixture.detectChanges();

    expect(view().querySelector('[data-testid="habits-empty-state"]')).toBeTruthy();
    expect(view().textContent).toContain('No habits yet');
  });

  it('toggles today when a habit card is clicked', () => {
    habitsSubject.next([baseHabit]);
    fixture.detectChanges();

    const card = view().querySelector('[data-testid="habit-card"]') as HTMLElement;
    const habitService = TestBed.inject(HabitService);

    card.click();

    expect(habitService.toggleHabitDay).toHaveBeenCalledWith(baseHabit.id, 0);
  });
});
