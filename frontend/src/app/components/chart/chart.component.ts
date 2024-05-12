import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { ChartModule } from 'primeng/chart';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { LoaderComponent } from '@components/loader/loader.component';
import ChartDataLabels from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [ChartModule, ProgressSpinnerModule, ButtonModule, LoaderComponent],
  templateUrl: './chart.component.html',
})
export class ChartComponent {
  @Input({ required: true }) data: ChartData = { datasets: [{ data: [] }] };
  @Input({ required: true }) type: string = 'pie';
  @Input() options: ChartOptions = {};
  @Input() showReload = true;
  plugin = [ChartDataLabels];
  @Output() reload = new EventEmitter<null>();

  reloadMethod() {
    this.reload.emit();
  }
}
