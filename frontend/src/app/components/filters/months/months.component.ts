import { Component, EventEmitter, Output, inject } from '@angular/core';
import { ChartComponent } from '@components/chart/chart.component';
import { HttpService } from '@services/http.service';
import { TiggerToastOptins } from '@types';
import { getMonthStr, setPieChart } from '@utils';
import { ChartData, ChartOptions } from 'chart.js';
import { CalendarModule } from 'primeng/calendar';

@Component({
  selector: 'app-months',
  standalone: true,
  imports: [ChartComponent, CalendarModule],
  providers: [HttpService],
  templateUrl: './months.component.html',
})
export class MonthsComponent {
  @Output() toast = new EventEmitter<TiggerToastOptins>();
  private http = inject(HttpService);
  data: ChartData = { datasets: [{ data: [] }], labels: [] };
  options: ChartOptions = {};

  async getData(date: Date) {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const { data, error } = await this.http.getFinancesByMonth({ month, year });
    if (error) {
      this.toast.emit({
        title: 'Error',
        message:
          'Ha ocurrido un error de conexión, no se obtuvieron los datos.',
        severity: 'error',
      });
      console.error('Error:', error);
      return;
    }
    if (data === null || data.length === 0) {
      this.toast.emit({
        title: 'Sin informción',
        message:
          'No hay datos para mostrar en este mes, añade un gasto para ver el gráfico.',
        severity: 'info',
      });
      return;
    }
    const [dataChart, options] = setPieChart(data, date);
    if (dataChart !== null && options !== null) {
      this.data = dataChart;
      this.options = options;
    } else {
      this.data = { datasets: [{ data: [] }] };
      this.options = {};
      this.toast.emit({
        title: 'Sin información',
        severity: 'info',
        message: `No se han encontrado datos para el mes de ${getMonthStr(month)}`,
      });
    }
  }
}
