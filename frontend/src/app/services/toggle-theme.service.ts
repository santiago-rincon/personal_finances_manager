import { inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
export class ToggleThemeService {
  private document = inject(DOCUMENT);
  switchTheme(theme: string) {
    const themeLink = this.document.getElementById('app-theme');
    if (!(themeLink instanceof HTMLLinkElement)) return;
    themeLink.href = theme;
  }
}
