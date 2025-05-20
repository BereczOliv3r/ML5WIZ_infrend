// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { CustomerFormComponent } from './customer-form/customer-form.component';
import { VideoFormComponent } from './video-form/video-form.component';
import { VideoListComponent } from './video-list/video-list.component';

export const routes: Routes = [
  { path: 'add-customer', component: CustomerFormComponent },
  { path: 'videos', component: VideoListComponent },
  { path: 'add-video', component: VideoFormComponent },
  { path: 'edit-video/:id', component: VideoFormComponent },
  { path: '', redirectTo: '/videos', pathMatch: 'full' },
  // { path: '**', component: PageNotFoundComponent }, // Ha van
];
