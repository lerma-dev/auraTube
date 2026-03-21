import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PipedService, PipedVideo } from '../../services/piped.service';
import { VideoCardComponent } from '../../components/video-card/video-card.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, VideoCardComponent],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  query = '';
  videos: PipedVideo[] = [];
  loading = false;
  error = '';
  skeletons = Array(8).fill(0);

  constructor(
    private route: ActivatedRoute,
    private piped: PipedService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.query = params['q'] || '';
      if (this.query) this.search();
    });
  }

  search(): void {
    this.loading = true;
    this.error = '';
    this.videos = [];

    this.piped.search(this.query).subscribe({
      next: (res) => {
        this.videos = (res.items || []).filter(
          (v: any) => v.type === 'stream' || v.duration !== undefined
        ) as PipedVideo[];
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al buscar. Intenta de nuevo.';
        this.loading = false;
      }
    });
  }
}