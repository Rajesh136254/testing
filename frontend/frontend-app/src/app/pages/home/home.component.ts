
import { Component, inject } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  http = inject(HttpClient);
  message: string | null = null;

  constructor() {
    this.http.get<{message: string}>('/api/hello').subscribe({
      next: (r) => this.message = r.message,
      error: () => this.message = 'Backend not reachable',
    });
  }

}
