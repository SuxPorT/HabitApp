import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Header } from './components/static/header/header';
import { Body } from './components/static/body/body';
import { Footer } from './components/static/footer/footer';
import { HabitDialog } from './components/views/habit-dialog/habit-dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [App, Header, Body, Footer, HabitDialog],
  imports: [
    BrowserModule, AppRoutingModule, CommonModule, FormsModule,
    ReactiveFormsModule, MatDialogModule
  ],
  providers: [provideBrowserGlobalErrorListeners()],
  bootstrap: [App],
})
export class AppModule { }
