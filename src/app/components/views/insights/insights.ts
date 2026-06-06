import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, finalize, map, switchMap, take } from 'rxjs/operators';
import {
  AnalyticsOverview,
  AnalyticsTrendDay,
  CalendarAnalytics,
  CalendarAnalyticsDay,
  HabitAnalytics,
  TrendAnalytics
} from '../../../models/analytics.model';
import { Habit } from '../../../models/habit.model';
import { AnalyticsService } from '../../../services/analytics-service';
import { HabitService } from '../../../services/habit-service';
import { UserService } from '../../../services/user-service';

interface InsightsLoadResult {
  overview: AnalyticsOverview;
  calendar: CalendarAnalytics;
  trends: TrendAnalytics;
  habitBreakdown: HabitAnalytics[];
}

interface InsightsViewModel extends InsightsLoadResult {
  insightMessages: string[];
}

@Component({
  selector: 'app-insights',
  templateUrl: './insights.html',
  styleUrl: './insights.scss',
  standalone: false,
})
export class Insights implements OnInit {
  view: InsightsViewModel | null = null;
  loading = false;
  errorMessage = '';

  constructor(
    private analyticsService: AnalyticsService,
    private habitService: HabitService,
    private userService: UserService,
    private changeDetectorRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.loadInsights();
  }

  loadInsights(): void {
    this.loading = true;
    this.errorMessage = '';

    this.userService.getUser().pipe(
      take(1),
      switchMap((user) => {
        if (!user?.id) {
          return of(null);
        }

        return forkJoin({
          overview: this.analyticsService.getOverview(user.id).pipe(take(1)),
          calendar: this.analyticsService.getCalendar(user.id).pipe(take(1)),
          trends: this.analyticsService.getTrends(user.id).pipe(take(1)),
          habits: this.habitService.getHabitsByUser(user.id).pipe(
            take(1),
            catchError(() => of([] as Habit[]))
          ),
        }).pipe(
          switchMap((result) =>
            this.loadHabitBreakdown(user.id, result.habits).pipe(
              map((habitBreakdown) => ({
                overview: result.overview,
                calendar: result.calendar,
                trends: result.trends,
                habitBreakdown,
              }))
            )
          )
        );
      }),
      catchError(() => {
        this.errorMessage = 'Could not load insights right now.';
        return of(null);
      }),
      finalize(() => {
        this.loading = false;
        this.changeDetectorRef.markForCheck();
      }),
    ).subscribe((result) => {
      this.loading = false;

      if (!result) {
        return;
      }

      this.view = {
        ...result,
        insightMessages: this.buildInsightMessages(result),
      };
      this.changeDetectorRef.markForCheck();
    });
  }

  hasInsightData(overview: AnalyticsOverview): boolean {
    return overview.totalActiveHabits > 0 && overview.totalCompletions > 0;
  }

  getBarHeight(day: AnalyticsTrendDay): number {
    if (!day.scheduledHabits) {
      return 8;
    }

    return Math.max(12, day.completionRate);
  }

  getTrendAverage(days: AnalyticsTrendDay[]): number {
    const scheduledHabits = days.reduce((total, day) => total + day.scheduledHabits, 0);
    const completedHabits = days.reduce((total, day) => total + day.completedHabits, 0);

    return scheduledHabits ? Math.round((completedHabits / scheduledHabits) * 100) : 0;
  }

  getCompletionCopy(rate: number): string {
    if (rate >= 85) {
      return 'Strong rhythm';
    }

    if (rate >= 60) {
      return 'Building consistency';
    }

    if (rate > 0) {
      return 'Needs attention';
    }

    return 'No data yet';
  }

  getCalendarTitle(day: CalendarAnalyticsDay): string {
    const label = this.formatDate(day.date);

    if (day.status === 'none') {
      return `${label}: no habits scheduled`;
    }

    return `${label}: ${day.completedCount}/${day.scheduledCount} completed`;
  }

  formatDate(date: string): string {
    return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  formatWeekday(dayOfWeek?: string | null): string {
    return dayOfWeek ?? 'No pattern';
  }

  formatWeekdayPlural(dayOfWeek?: string | null): string {
    if (!dayOfWeek) {
      return 'your scheduled days';
    }

    return dayOfWeek.endsWith('s') ? dayOfWeek : `${dayOfWeek}s`;
  }

  getMissedCountLabel(habit: HabitAnalytics): string {
    const missedCount = habit.missedScheduledDates.length;
    return missedCount === 1 ? '1 missed day' : `${missedCount} missed days`;
  }

  getLastCompletedLabel(habit: HabitAnalytics): string {
    return habit.lastCompletedDate ? this.formatDate(habit.lastCompletedDate) : 'No completions yet';
  }

  private loadHabitBreakdown(userId: number, habits: Habit[]): Observable<HabitAnalytics[]> {
    const activeHabits = habits.filter((habit) => !habit.isArchived);

    if (!activeHabits.length) {
      return of([]);
    }

    return forkJoin(
      activeHabits.map((habit) =>
        this.analyticsService.getHabitAnalytics(userId, habit.id).pipe(
          take(1),
          catchError(() => of(null))
        )
      )
    ).pipe(
      map((items) => items.filter((item): item is HabitAnalytics => item !== null))
    );
  }

  private buildInsightMessages(result: InsightsLoadResult): string[] {
    const overview = result.overview;

    if (!this.hasInsightData(overview)) {
      return [
        'Complete a few habits to unlock insights.',
        'Your patterns will appear here after a few days of tracking.',
      ];
    }

    const messages = [
      `You are most consistent on ${this.formatWeekdayPlural(overview.bestDayOfWeek?.dayOfWeek)}.`,
    ];

    if (overview.bestHabit) {
      messages.push(`${overview.bestHabit.title} has your strongest streak.`);
    }

    if (overview.weakestHabit) {
      messages.push(`${overview.weakestHabit.title} is your biggest opportunity.`);
    }

    messages.push(this.getTrendMessage(result.trends));

    return messages.slice(0, 4);
  }

  private getTrendMessage(trends: TrendAnalytics): string {
    if (trends.last7Days.scheduledHabits === 0 || trends.last30Days.scheduledHabits === 0) {
      return 'Your rhythm will become clearer as more scheduled days pass.';
    }

    if (trends.last7Days.completionRate > trends.last30Days.completionRate) {
      return 'Your completion rate improved this week.';
    }

    if (trends.last7Days.completionRate < trends.last30Days.completionRate) {
      return 'This week is softer than your 30-day rhythm.';
    }

    return 'This week is matching your 30-day rhythm.';
  }
}
