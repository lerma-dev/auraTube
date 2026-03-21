import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of, timeout, switchMap } from 'rxjs';

export interface PipedVideo {
  url: string;
  title: string;
  thumbnail: string;
  uploaderName: string;
  uploaderUrl: string;
  uploaderAvatar?: string;
  uploadedDate?: string;
  duration: number;
  views: number;
  isShort?: boolean;
}

export interface PipedStream {
  title: string;
  description: string;
  uploader: string;
  uploaderUrl: string;
  uploaderAvatar: string;
  uploaderSubscriberCount: number;
  thumbnailUrl: string;
  duration: number;
  views: number;
  likes: number;
  dislikes: number;
  relatedStreams: PipedVideo[];
}

export interface SearchResponse {
  items: PipedVideo[];
  nextpage: string;
  suggestion: string;
}

@Injectable({ providedIn: 'root' })
export class PipedService {
  private readonly BASE = '/youtube/v3';
  private readonly KEY = 'AIzaSyDSr_645BHkDVCSofq5amS95n4LVF9nXAQ';

  constructor(private http: HttpClient) {}

  getTrending(region = 'MX'): Observable<PipedVideo[]> {
    return this.http.get<any>(`${this.BASE}/videos`, {
      params: {
        part: 'snippet,statistics,contentDetails',
        chart: 'mostPopular',
        regionCode: region,
        maxResults: '20',
        key: this.KEY
      }
    }).pipe(
      timeout(10000),
      map(res => res.items.map((v: any) => this.mapVideo(v))),
      catchError(() => of([]))
    );
  }

  search(query: string): Observable<SearchResponse> {
    return this.http.get<any>(`${this.BASE}/search`, {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: '20',
        key: this.KEY
      }
    }).pipe(
      timeout(10000),
      map(res => ({
        items: res.items.map((v: any) => ({
          url: `/watch?v=${v.id.videoId}`,
          title: v.snippet.title,
          thumbnail: this.getBestThumb(v.id.videoId),
          uploaderName: v.snippet.channelTitle,
          uploaderUrl: v.snippet.channelId,
          uploadedDate: v.snippet.publishedAt?.substring(0, 10),
          duration: 0,
          views: 0
        })),
        nextpage: '',
        suggestion: ''
      })),
      catchError(() => of({ items: [], nextpage: '', suggestion: '' }))
    );
  }

  getStream(videoId: string): Observable<PipedStream> {
    return this.http.get<any>(`${this.BASE}/videos`, {
      params: {
        part: 'snippet,statistics,contentDetails',
        id: videoId,
        key: this.KEY
      }
    }).pipe(
      timeout(10000),
      map(vRes => {
        const v = vRes.items[0];
        return {
          title: v.snippet.title,
          description: v.snippet.description,
          uploader: v.snippet.channelTitle,
          uploaderUrl: v.snippet.channelId,
          uploaderAvatar: v.snippet.thumbnails?.default?.url ?? '',
          uploaderSubscriberCount: 0,
          thumbnailUrl: this.getBestThumb(videoId),
          duration: this.parseDuration(v.contentDetails?.duration),
          views: parseInt(v.statistics?.viewCount ?? '0'),
          likes: parseInt(v.statistics?.likeCount ?? '0'),
          dislikes: 0,
          relatedStreams: []
        };
      }),
      catchError(() => of({
        title: '', description: '', uploader: '', uploaderUrl: '',
        uploaderAvatar: '', uploaderSubscriberCount: 0, thumbnailUrl: '',
        duration: 0, views: 0, likes: 0, dislikes: 0, relatedStreams: []
      }))
    );
  }

  private getBestThumb(videoId: string): string {
    return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
  }

  private mapVideo(v: any): PipedVideo {
    return {
      url: `/watch?v=${v.id}`,
      title: v.snippet.title,
      thumbnail: this.getBestThumb(v.id),
      uploaderName: v.snippet.channelTitle,
      uploaderUrl: v.snippet.channelId,
      uploadedDate: v.snippet.publishedAt?.substring(0, 10),
      duration: this.parseDuration(v.contentDetails?.duration),
      views: parseInt(v.statistics?.viewCount ?? '0')
    };
  }

  private parseDuration(iso: string): number {
    if (!iso) return 0;
    const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!m) return 0;
    return (parseInt(m[1] ?? '0') * 3600) +
           (parseInt(m[2] ?? '0') * 60) +
            parseInt(m[3] ?? '0');
  }

  formatViews(n: number): string {
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
    return n?.toString() ?? '0';
  }

  formatDuration(seconds: number): string {
    if (!seconds) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    return `${m}:${s.toString().padStart(2,'0')}`;
  }

  extractVideoId(url: string): string {
    if (!url) return '';
    return url.replace('/watch?v=', '');
  }
}