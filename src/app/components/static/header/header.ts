import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { UserService } from '../../../services/user-service';
import { UserResponse } from '../../../models/user-responde.model';
import { UserDialog } from '../../views/dialogs/user-dialog/user-dialog';
import { ConfirmDialog } from '../../views/dialogs/confirm-dialog/confirm-dialog';
import { ResolvedTheme, ThemeMode, ThemeService } from '../../../services/theme-service';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrl: './header.scss',
  standalone: false,
})
export class Header implements OnInit {
  isLoggedIn$!: Observable<UserResponse | null>;
  readonly themeMode$: Observable<ThemeMode>;
  readonly resolvedTheme$: Observable<ResolvedTheme>;

  constructor(
    private userService: UserService,
    private router: Router,
    private dialog: MatDialog,
    private themeService: ThemeService,
  ) {
    this.themeMode$ = this.themeService.mode$;
    this.resolvedTheme$ = this.themeService.resolvedTheme$;
  }

  ngOnInit(): void {
    this.isLoggedIn$ = this.userService.getUser();
  }

  openEditUserDialog(user: UserResponse): void {
    this.dialog.open(UserDialog, {
      width: '450px',
      data: user,
      panelClass: 'custom-dialog-container',
    });
  }

  toggleTheme(): void {
    this.themeService.toggleManualTheme();
  }

  logout(): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      panelClass: 'custom-dialog-container',
      data: {
        title: 'Sign out',
        message: 'Do you want to sign out of your account?',
        confirmBtnText: 'Sign out',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.userService.logout();
        this.router.navigate(['/login']);
      }
    });
  }
}
