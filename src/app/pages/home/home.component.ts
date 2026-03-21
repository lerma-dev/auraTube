import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PipedService, PipedVideo } from '../../services/piped.service';
import { VideoCardComponent } from '../../components/video-card/video-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, VideoCardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  videos: PipedVideo[] = [];
  loading = true;
  error = '';

  selectedRegion = 'MX';
  regions = [
    { code: 'MX', label: '🇲🇽 MX' },
    { code: 'US', label: '🇺🇸 US' },
    { code: 'ES', label: '🇪🇸 ES' },
    { code: 'GB', label: '🇬🇧 GB' },
    { code: 'JP', label: '🇯🇵 JP' },
  ];

  private timeoutId: any;

  constructor(
    private piped: PipedService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = '';
    this.videos = [];

    this.timeoutId = setTimeout(() => {
      if (this.loading) {
        this.loading = false;
        this.error = 'La API tardó demasiado. Intenta de nuevo.';
        this.cdr.detectChanges();
      }
    }, 10000);

    this.piped.getTrending(this.selectedRegion).subscribe({
      next: (data) => {
        clearTimeout(this.timeoutId);
        this.videos = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        clearTimeout(this.timeoutId);
        console.log('Error:', err);
        this.error = 'No se pudo conectar. Intenta de nuevo.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  setRegion(code: string): void {
    this.selectedRegion = code;
    this.load();
  }
}