import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import {
  AchievementSet,
  MonthlyChallengeSet,
  MotivationSummary
} from '../../../models/motivation.model';
import { MotivationService } from '../../../services/motivation-service';
import { UserService } from '../../../services/user-service';
import { Achievements } from './achievements';

describe('Achievements', () => {
  let fixture: ComponentFixture<Achievements>;
  let motivationServiceMock: {
    getSummary: ReturnType<typeof vi.fn>;
    getAchievements: ReturnType<typeof vi.fn>;
    getMonthlyChallenges: ReturnType<typeof vi.fn>;
  };

  const summary: MotivationSummary = {
    userId: 1,
    date: '2026-06-05',
    consistencyScore: 84,
    currentOverallStreak: 4,
    longestOverallStreak: 12,
    unlockedAchievements: 1,
    totalAchievements: 3,
    activeMonthlyChallenges: 2,
    mostAtRiskHabit: null,
    motivationalInsights: [
      'Your rhythm is improving this week.',
      'Monthly Consistency is 80% complete.',
    ],
  };

  const achievementSet: AchievementSet = {
    userId: 1,
    date: '2026-06-05',
    consistencyScore: 84,
    unlockedCount: 1,
    totalCount: 3,
    achievements: [
      {
        id: 'first-check',
        title: 'First Check',
        description: 'Complete your first scheduled habit.',
        icon: 'check_circle',
        category: 'Foundation',
        currentValue: 1,
        targetValue: 1,
        progressPercent: 100,
        isUnlocked: true,
        message: 'Unlocked',
      },
      {
        id: 'ten-checks',
        title: 'Ten Checks',
        description: 'Reach 10 total habit completions.',
        icon: 'done_all',
        category: 'Foundation',
        currentValue: 6,
        targetValue: 10,
        progressPercent: 60,
        isUnlocked: false,
        message: 'Build a visible base.',
      },
      {
        id: 'week-streak',
        title: 'Seven-Day Streak',
        description: 'Maintain a perfect overall streak for 7 scheduled days.',
        icon: 'local_fire_department',
        category: 'Streak',
        currentValue: 4,
        targetValue: 7,
        progressPercent: 57,
        isUnlocked: false,
        message: 'Protect every scheduled day for a week.',
      },
    ],
  };

  const monthlyChallenges: MonthlyChallengeSet = {
    userId: 1,
    monthLabel: 'June 2026',
    startDate: '2026-06-01',
    endDate: '2026-06-05',
    challenges: [
      {
        id: 'monthly-consistency',
        title: 'Monthly Consistency',
        description: 'Reach an 85% completion rate on scheduled habits this month.',
        icon: 'calendar_month',
        currentValue: 80,
        targetValue: 85,
        progressPercent: 94,
        isCompleted: false,
        message: 'Keep the month steady.',
      },
      {
        id: 'perfect-days',
        title: 'Perfect Days',
        description: 'Finish every scheduled habit on 10 days this month.',
        icon: 'verified',
        currentValue: 2,
        targetValue: 10,
        progressPercent: 20,
        isCompleted: false,
        message: 'Stack more perfect days.',
      },
    ],
  };

  function view(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  async function configureComponent(): Promise<void> {
    await TestBed.configureTestingModule({
      declarations: [Achievements],
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
      getSummary: vi.fn(() => of(summary)),
      getAchievements: vi.fn(() => of(achievementSet)),
      getMonthlyChallenges: vi.fn(() => of(monthlyChallenges)),
    };

    await configureComponent();
  });

  it('renders achievement progress and monthly challenges', () => {
    fixture = TestBed.createComponent(Achievements);
    fixture.detectChanges();

    expect(view().textContent).toContain('Progress worth noticing.');
    expect(view().textContent).toContain('1');
    expect(view().textContent).toContain('Monthly Consistency');
    expect(view().textContent).toContain('First Check');
    expect(view().textContent).toContain('Ten Checks');
    expect(view().querySelectorAll('[data-testid="monthly-challenge-card"]').length).toBe(2);
    expect(view().querySelectorAll('[data-testid="achievement-card"]').length).toBe(3);
  });

  it('shows loading while achievement requests are pending', async () => {
    TestBed.resetTestingModule();
    const pendingSummary = new Subject<MotivationSummary>();
    motivationServiceMock = {
      getSummary: vi.fn(() => pendingSummary.asObservable()),
      getAchievements: vi.fn(() => of(achievementSet)),
      getMonthlyChallenges: vi.fn(() => of(monthlyChallenges)),
    };
    await configureComponent();

    fixture = TestBed.createComponent(Achievements);
    fixture.detectChanges();

    expect(view().querySelector('[data-testid="achievements-loading"]')).toBeTruthy();
  });

  it('clears loading when achievement data emits before all requests complete', async () => {
    TestBed.resetTestingModule();
    const pendingSummary = new Subject<MotivationSummary>();
    motivationServiceMock = {
      getSummary: vi.fn(() => pendingSummary.asObservable()),
      getAchievements: vi.fn(() => of(achievementSet)),
      getMonthlyChallenges: vi.fn(() => of(monthlyChallenges)),
    };
    await configureComponent();

    fixture = TestBed.createComponent(Achievements);
    fixture.detectChanges();
    pendingSummary.next(summary);
    await fixture.whenStable();

    expect(fixture.componentInstance.loading).toBe(false);
    expect(fixture.componentInstance.view?.summary).toEqual(summary);
    expect(view().querySelector('[data-testid="achievements-loading"]')).toBeFalsy();
    expect(view().textContent).toContain('Progress worth noticing.');
  });

  it('shows an empty state when no achievement definitions are available', () => {
    motivationServiceMock.getAchievements.mockReturnValueOnce(of({
      ...achievementSet,
      unlockedCount: 0,
      totalCount: 0,
      achievements: [],
    }));

    fixture = TestBed.createComponent(Achievements);
    fixture.detectChanges();

    expect(view().querySelector('[data-testid="achievements-empty-state"]')).toBeTruthy();
    expect(view().textContent).toContain('Complete scheduled habits to unlock achievements.');
  });
});
