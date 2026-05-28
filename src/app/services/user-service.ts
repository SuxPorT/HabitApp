import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';
import { UserResponse } from '../models/user-responde.model';
import { UserRequest } from '../models/user-request.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/user`;

  private usersSubject = new BehaviorSubject<User[]>([]);
  users$ = this.usersSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<UserResponse | null>(
    JSON.parse(localStorage.getItem('habitapp_user') || 'null')
  );

  constructor(private http: HttpClient) {
    if (this.getUserValue()) {
      this.refresh();
    }
  }

  private refresh(): void {
    this.http.get<User[]>(this.apiUrl).subscribe({
      next: (users: User[]) => this.usersSubject.next(users)
    });
  }

  getUser(): Observable<UserResponse | null> {
    return this.currentUserSubject.asObservable();
  }

  getUserValue(): UserResponse | null {
    return this.currentUserSubject.value;
  }

  login(userRequest: UserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.apiUrl}/login`, userRequest).pipe(
      tap((user: UserResponse) => {
        if (user) {
          localStorage.setItem('habitapp_user', JSON.stringify(user));
          this.currentUserSubject.next(user);
          this.refresh();
        }
      })
    );
  }

  register(userData: Partial<User>): Observable<User> {
    return this.http.post<User>(this.apiUrl, userData).pipe(
      tap((user: User) => {
        if (user) {
          localStorage.setItem('habitapp_user', JSON.stringify(user));
          this.currentUserSubject.next(user);
          this.refresh();
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('habitapp_user');
    this.currentUserSubject.next(null);
  }

  addUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user).pipe(
      tap(() => this.refresh())
    );
  }

  updateUser(updatedUser: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${updatedUser.id}`, updatedUser).pipe(
      tap(() => this.refresh())
    );
  }

  deleteUser(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.refresh())
    );
  }
}
