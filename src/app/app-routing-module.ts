import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './components/views/login/login';
import { authGuard } from './guards/auth-guard';
import { Habits } from './components/views/habits/habits';

const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'habits', component: Habits, canActivate: [authGuard] },
  { path: '', redirectTo: 'habits', pathMatch: 'full' },
  { path: '**', redirectTo: 'habits' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
