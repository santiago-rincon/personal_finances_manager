import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@pages/main/main.component').then(m => m.MainComponent),
  },
  {
    path: 'add',
    loadComponent: () =>
      import('@pages/add/add.component').then(m => m.AddComponent),
  },
  {
    path: 'all',
    loadComponent: () =>
      import('@pages/all/all.component').then(m => m.AllComponent),
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];

