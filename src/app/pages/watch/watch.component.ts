import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PipedService, PipedStream, PipedVideo } from '../../services/piped.service';
import { VideoCardComponent } from '../../components/video-card/video-card.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-watch',
  standalone: true,
  imports: [CommonModule, VideoCardComponent],
  templateUrl: './watch.component.html',
  styleUrls: ['./watch.component.css']
})
export class WatchComponent implements OnInit {
  stream: PipedStream | null = null;
  loading = true;
  error = '';
  videoId = '';
  embedUrl: SafeResourceUrl = '';
  descExpanded = false;

  constructor(
    private route: ActivatedRoute,
    public piped: PipedService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(p => {
      this.videoId = p['id'];
      this.loadStream();
    });
  }

  loadStream(): void {
    this.loading = true;
    this.error = '';
    this.stream = null;

    this.embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${this.videoId}?autoplay=1&rel=0`
    );

    this.piped.getStream(this.videoId).subscribe({
      next: (s) => {
        this.stream = s;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'No se pudo cargar la información del video.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get relatedVideos(): PipedVideo[] {
    return this.stream?.relatedStreams?.slice(0, 12) ?? [];
  }

  get shortDescription(): string {
    const desc = this.stream?.description ?? '';
    return desc.length > 300 ? desc.substring(0, 300) + '...' : desc;
  }
}