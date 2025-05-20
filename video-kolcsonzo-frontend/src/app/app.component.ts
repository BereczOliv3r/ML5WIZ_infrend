// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // Fontos!
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule  // Ennek itt kell lennie a routerLink, routerLinkActive stb. direktívákhoz
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'] // vagy .scss
})
export class AppComponent {
  title = 'video-kolcsonzo-frontend';
  anioCorriente = new Date().getFullYear(); // Hozzáadva az aktuális év a lábléchez
}
