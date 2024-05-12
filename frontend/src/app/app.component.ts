import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '@components/navbar/navbar.component';
import { calendarConfig } from '@config/calendarConfig';
import { PrimeNGConfig } from 'primeng/api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  private primengConfig = inject(PrimeNGConfig);
  ngOnInit(): void {
    this.primengConfig.ripple = true;
    this.primengConfig.setTranslation(calendarConfig);
  }
}

