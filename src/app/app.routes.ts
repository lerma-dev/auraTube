import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { SearchComponent } from './pages/search/search.component';
import { WatchComponent } from './pages/watch/watch.component';

export const routes: Routes = [
  { path: '',          component: HomeComponent, pathMatch: 'full' },
  { path: 'search',    component: SearchComponent },
  { path: 'watch/:id', component: WatchComponent },
  { path: '**',        redirectTo: '' }
];