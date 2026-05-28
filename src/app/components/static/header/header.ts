import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user-service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrl: './header.scss',
  standalone: false
})
export class Header implements OnInit {
  isLoggedIn$!: Observable<any>;

  constructor(
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.isLoggedIn$ = this.userService.getUser();
  }

  logout(): void {
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}
