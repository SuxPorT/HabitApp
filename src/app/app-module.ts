import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Header } from './components/static/header/header';
import { Body } from './components/static/body/body';
import { Footer } from './components/static/footer/footer';
import { HabitDialog } from './components/views/habit-dialog/habit-dialog';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [App, Header, Body, Footer, HabitDialog],
  imports: [BrowserModule, AppRoutingModule, FormsModule, MatDialogModule],
  providers: [provideBrowserGlobalErrorListeners()],
  bootstrap: [App],
})
export class AppModule {}
