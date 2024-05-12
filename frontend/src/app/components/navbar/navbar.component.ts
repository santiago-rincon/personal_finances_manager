import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToggleThemeService } from '@services/toggle-theme.service';
import { Theme } from '@types';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [ButtonModule, SidebarModule],
  templateUrl: './navbar.component.html',
  providers: [ToggleThemeService],
  styles: `
    #navbar {
      view-transition-name: nabvar;
    }
  `,
})
export class NavbarComponent implements OnInit {
  private toggleScv = inject(ToggleThemeService);
  private router = inject(Router);
  sideBarVisible = false;
  themes: Theme[] = [
    { name: 'Azul verdoso', style: 'teal.css', color: '#14b8a6' },
    { name: 'Azul', style: 'blue.css', color: '#3b82f6' },
    { name: 'Cian', style: 'cyan.css', color: '#06b6d4' },
    { name: 'Indigo', style: 'indigo.css', color: '#6366f1' },
    { name: 'Lima', style: 'lime.css', color: '#84cc16' },
    { name: 'Metalizado', style: 'rhea.css', color: '#7b95a3' },
    { name: 'Naranja', style: 'amber.css', color: '#f59e0b' },
    { name: 'Negro', style: 'noir.css', color: '#020617' },
    { name: 'Purpura', style: 'purple.css', color: '#8b5cf6' },
    { name: 'Verde', style: 'green.css', color: '#10b981' },
  ];

  ngOnInit(): void {
    const theme = localStorage.getItem('theme');
    if (theme !== null) {
      this.toggleScv.switchTheme(theme);
    } else {
      const theme = 'purple.css';
      this.toggleScv.switchTheme(theme);
      localStorage.setItem('theme', theme);
    }
  }

  home() {
    this.router.navigate(['/']);
  }

  changeTheme(theme: string) {
    this.toggleScv.switchTheme(theme);
    this.sideBarVisible = false;
    localStorage.setItem('theme', theme);
  }
}
