import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Header } from './header';
import { UserService } from '../../../services/user-service';
import { ResolvedTheme, ThemeMode, ThemeService } from '../../../services/theme-service';
import { UserResponse } from '../../../models/user-responde.model';

describe('Header', () => {
  let fixture: ComponentFixture<Header>;
  let userSubject: BehaviorSubject<UserResponse | null>;
  let themeService: {
    mode$: Observable<ThemeMode>;
    resolvedTheme$: Observable<ResolvedTheme>;
    toggleManualTheme: ReturnType<typeof vi.fn>;
  };

  const user: UserResponse = {
    id: 1,
    name: 'Victor Mendes',
    email: 'victor@example.com',
  };

  beforeEach(async () => {
    userSubject = new BehaviorSubject<UserResponse | null>(user);
    themeService = {
      mode$: of('system'),
      resolvedTheme$: of('light'),
      toggleManualTheme: vi.fn(),
    };

    await TestBed.configureTestingModule({
      declarations: [Header],
      imports: [CommonModule, MatMenuModule],
      providers: [
        {
          provide: UserService,
          useValue: {
            getUser: () => userSubject.asObservable(),
            logout: vi.fn(),
          },
        },
        {
          provide: MatDialog,
          useValue: {
            open: vi.fn(),
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: vi.fn(),
          },
        },
        {
          provide: ThemeService,
          useValue: themeService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    fixture.detectChanges();
  });

  it('calls ThemeService when the theme control is clicked', () => {
    const themeButton = fixture.nativeElement.querySelector('.theme-toggle') as HTMLButtonElement;

    themeButton.click();

    expect(themeService.toggleManualTheme).toHaveBeenCalledTimes(1);
  });

  it('keeps the authenticated user name and profile menu trigger rendered', () => {
    const header = fixture.nativeElement as HTMLElement;
    const profileButton = header.querySelector('.btn-avatar') as HTMLButtonElement;

    expect(header.textContent).toContain(user.name);
    expect(profileButton).toBeTruthy();
    expect(profileButton.getAttribute('aria-label')).toContain(user.name);
  });
});
