import { HttpErrorResponse } from '@angular/common/http';
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

  getData(date: Date) {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    this.http.getFinancesByMonth({ month, year }).subscribe({
      next: finances => {
        const [data, options] = setPieChart(finances, date);
        if (data !== null && options !== null) {
          this.data = data;
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
      },
      error: (error: HttpErrorResponse) => {
        const detail =
          error.status === 0
            ? 'Ha ocurrido un error de conexión, no se obtuvieron los datos.'
            : 'Ha ocurrido un error con el servidor, no se obtuvieron los datos.';
        this.toast.emit({
          title: 'Error',
          message: detail,
          severity: 'error',
        });
        console.error('Error:', error.error);
      },
    });
  }
}
