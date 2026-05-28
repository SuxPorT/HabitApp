import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { UserService } from '../../../services/user-service';
import { UserResponse } from '../../../models/user-responde.model';
import { UserDialog } from '../../views/dialogs/user-dialog/user-dialog';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrl: './header.scss',
  standalone: false
})
export class Header implements OnInit {
  isLoggedIn$!: Observable<UserResponse | null>;

  constructor(
    private userService: UserService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.isLoggedIn$ = this.userService.getUser();
  }

  openEditUserDialog(user: UserResponse): void {
    this.dialog.open(UserDialog, {
      width: '450px',
      data: user,
      panelClass: 'custom-dialog-container'
    });
  }

  logout(): void {
    if (confirm('Deseja realmente sair do aplicativo?')) {
      this.userService.logout();
      this.router.navigate(['/login']);
    }
  }
}
