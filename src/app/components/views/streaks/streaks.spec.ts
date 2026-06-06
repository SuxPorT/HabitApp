import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { StreakCenter } from '../../../models/motivation.model';
import { MotivationService } from '../../../services/motivation-service';
import { UserService } from '../../../services/user-service';
import { Streaks } from './streaks';

describe('Streaks', () => {
  let fixture: ComponentFixture<Streaks>;
  let motivationServiceMock: {
    getStreakCenter: ReturnType<typeof vi.fn>;
  };

  const streakCenter: StreakCenter = {
    userId: 1,
    date: '2026-06-05',
    consistencyScore: 82,
    currentOverallStreak: 4,
    longestOverallStreak: 12,
    habitsAtRisk: [
      {
        habitId: 2,
        title: 'Workout',
        icon: '🏋️',
        color: '',
        category: 'Health',
        currentStreak: 0,
        lastCompletedDate: '2026-06-04',
        nextScheduledDate: '2026-06-05',
        missedScheduledDatesCount: 1,
        riskLevel: 'high',
        message: 'Workout is scheduled today and still open.',
      },
    ],
    habitStreaks: [
      {
        habitId: 1,
        title: 'Reading',
        icon: '📖',
        color: '',
        category: 'Mind',
        currentStreak: 8,
        longestStreak: 12,
        completionRate: 93,
        totalCompletions: 18,
        lastCompletedDate: '2026-06-05',
        status: 'protected',
        message: 'Reading is protected today.',
      },
      {
        habitId: 2,
        title: 'Workout',
        icon: '🏋️',
        color: '',
        category: 'Health',
        currentStreak: 0,
        longestStreak: 4,
        completionRate: 55,
        totalCompletions: 6,
        lastCompletedDate: '2026-06-04',
        status: 'at-risk',
        message: 'Workout is scheduled today and still open.',
      },
    ],
    motivationalInsights: [
      'You are on a 4-day overall streak.',
      'Workout needs attention today.',
    ],
  };

  function view(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  async function configureComponent(): Promise<void> {
    await TestBed.configureTestingModule({
      declarations: [Streaks],
      imports: [CommonModule],
      providers: [
        {
          provide: MotivationService,
          useValue: motivationServiceMock,
        },
        {
          provide: UserService,
          useValue: {
            getUser: vi.fn(() => of({ id: 1, name: 'Victor', email: 'victor@example.com' })),
          },
        },
      ],
    }).compileComponents();
  }

  beforeEach(async () => {
    motivationServiceMock = {
      getStreakCenter: vi.fn(() => of(streakCenter)),
    };

    await configureComponent();
  });

  it('renders streak score, habits at risk and habit streak cards', () => {
    fixture = TestBed.createComponent(Streaks);
    fixture.detectChanges();

    expect(view().textContent).toContain('Keep the chain alive.');
    expect(view().textContent).toContain('82');
    expect(view().textContent).toContain('Workout is scheduled today and still open.');
    expect(view().querySelectorAll('[data-testid="habit-risk-card"]').length).toBe(1);
    expect(view().querySelectorAll('[data-testid="habit-streak-card"]').length).toBe(2);
  });

  it('shows loading while streak center request is pending', async () => {
    TestBed.resetTestingModule();
    const pendingStreakCenter = new Subject<StreakCenter>();
    motivationServiceMock = {
      getStreakCenter: vi.fn(() => pendingStreakCenter.asObservable()),
    };
    await configureComponent();

    fixture = TestBed.createComponent(Streaks);
    fixture.detectChanges();

    expect(view().querySelector('[data-testid="streaks-loading"]')).toBeTruthy();
  });

  it('clears loading when streak center emits before the request completes', async () => {
    TestBed.resetTestingModule();
    const pendingStreakCenter = new Subject<StreakCenter>();
    motivationServiceMock = {
      getStreakCenter: vi.fn(() => pendingStreakCenter.asObservable()),
    };
    await configureComponent();

    fixture = TestBed.createComponent(Streaks);
    fixture.detectChanges();
    pendingStreakCenter.next(streakCenter);
    await fixture.whenStable();

    expect(fixture.componentInstance.loading).toBe(false);
    expect(fixture.componentInstance.streakCenter).toEqual(streakCenter);
    expect(view().querySelector('[data-testid="streaks-loading"]')).toBeFalsy();
    expect(view().textContent).toContain('Keep the chain alive.');
  });

  it('shows an empty state when no habit streaks exist', () => {
    motivationServiceMock.getStreakCenter.mockReturnValueOnce(of({
      ...streakCenter,
      currentOverallStreak: 0,
      longestOverallStreak: 0,
      habitsAtRisk: [],
      habitStreaks: [],
      motivationalInsights: ['Complete a scheduled habit to begin a new streak.'],
    }));

    fixture = TestBed.createComponent(Streaks);
    fixture.detectChanges();

    expect(view().querySelector('[data-testid="streaks-empty-state"]')).toBeTruthy();
    expect(view().textContent).toContain('Complete a scheduled habit to start a streak.');
  });
});
