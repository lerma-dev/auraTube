import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PipedVideo, PipedService } from '../../services/piped.service';

@Component({
  selector: 'app-video-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './video-card.component.html',
  styleUrls: ['./video-card.component.css']
})
export class VideoCardComponent {
  @Input() video!: PipedVideo;

  constructor(public piped: PipedService) {}

  get videoId(): string {
    return this.piped.extractVideoId(this.video.url);
  }
}