// src/app/video-list/video-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // RouterModule importálása a routerLink-hez
import { VideoService } from '../services/video.services';
import { VideoDTO } from '../model'; // Vagy '../types', attól függően, hol vannak a DTO-k

@Component({
  selector: 'app-video-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule // RouterModule hozzáadása az imports tömbhöz
  ],
  templateUrl: './video-list.component.html',
  styleUrls: ['./video-list.component.css']
})
export class VideoListComponent implements OnInit {
  videos: VideoDTO[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  private videoService = inject(VideoService);

  constructor() { }

  ngOnInit(): void {
    this.loadVideos();
  }

  loadVideos(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.videoService.getVideos().subscribe({
      next: (data) => {
        this.videos = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = `Hiba a videók betöltésekor: ${err.message}`;
        console.error(err);
      }
    });
  }

  // A "selejtezés" itt csak egy példa, hogy a lista frissüljön
  // A valós törlési logika a VideoFormComponent-ben vagy egy dialógusablakban lehet
  deleteVideo(id: number, event: Event): void {
    event.stopPropagation(); // Megakadályozza, hogy a sorra kattintás eseménye is lefusson, ha van ilyen
    if (confirm(`Biztosan selejtezni szeretnéd ezt a videót (ID: ${id})? A művelet nem vonható vissza az adatbázisból ezen a felületen keresztül.`)) {
      this.isLoading = true; // Betöltésjelző a törlés idejére
      this.videoService.deleteVideo(id).subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log(response.message);
          this.loadVideos(); // Lista újratöltése a sikeres törlés után
          // Opcionálisan: Sikeres törlés üzenet megjelenítése a felhasználónak
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = `Hiba a videó selejtezésekor: ${err.message}`;
          console.error(err);
          alert(`Hiba a videó selejtezésekor: ${err.error?.message || err.message}`);
        }
      });
    }
  }
}
