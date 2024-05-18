import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartComponent } from '@components/chart/chart.component';
import { HttpService } from '@services/http.service';
import { CategoryResponse, FinancesResponse, TiggerToastOptins } from '@types';
import { setBarchart } from '@utils';
import { ChartData, ChartOptions } from 'chart.js';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { InputSwitchChangeEvent, InputSwitchModule } from 'primeng/inputswitch';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    ChartComponent,
    CalendarModule,
    FormsModule,
    CheckboxModule,
    InputSwitchModule,
  ],
  providers: [HttpService],
  templateUrl: './categories.component.html',
})
export class CategoriesComponent implements OnInit {
  @Output() toast = new EventEmitter<TiggerToastOptins>();
  private http = inject(HttpService);
  dataTwo: ChartData = { datasets: [{ data: [] }], labels: [] };
  optionsTwo: ChartOptions = {};
  filterForm: {
    dates: Date[];
    categories: CategoryResponse[];
    selectedCategory: number[];
  } = {
    dates: [],
    categories: [],
    selectedCategory: [],
  };

  ngOnInit(): void {
    this.http.getCategories().subscribe({
      next: categories => {
        this.filterForm.categories = categories.sort(function (a, b) {
          if (a.category > b.category) {
            return 1;
          }
          if (a.category < b.category) {
            return -1;
          }
          return 0;
        });
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

  async getDataTwo() {
    const promises: Promise<FinancesResponse[]>[] = [];
    for (const id of this.filterForm.selectedCategory) {
      for (const day of this.filterForm.dates) {
        promises.push(
          firstValueFrom(
            this.http.getFinancesByMonth({
              month: day.getMonth() + 1,
              year: day.getFullYear(),
              id,
            })
          ).then(res => {
            if (res.length === 0) {
              const cat = this.filterForm.categories.find(
                category => category.id === id
              );
              const finance: FinancesResponse = {
                id: 0,
                value: 0,
                description: '',
                date: `${day.getFullYear()}-${(day.getMonth() + 1).toString().padStart(2, '0')}-01`,
                category: {
                  id,
                  category: cat?.category ?? '',
                },
              };
              return [finance];
            } else {
              return res;
            }
          })
        );
      }
    }
    try {
      const responses = await Promise.all(promises);
      const [data, options] = setBarchart(responses);
      if (data === null || options === null) {
        this.dataTwo = { datasets: [{ data: [] }], labels: [] };
        this.optionsTwo = {};
        this.toast.emit({
          severity: 'info',
          title: 'Ha ocurrido un error',
          message: 'Vuleve a intentarlo.',
        });
        return;
      }
      this.dataTwo = data;
      this.optionsTwo = options;
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        console.error('Error:', error);
        const detail =
          error.status === 0
            ? 'Ha ocurrido un error de conexión, no se obtuvieron los datos.'
            : 'Ha ocurrido un error con el servidor, no se obtuvieron los datos.';
        this.toast.emit({
          title: 'Error',
          message: detail,
          severity: 'error',
        });
        throw new Error(error.message);
      }
    }
  }

  selectAllCategories(event: InputSwitchChangeEvent) {
    if (event.checked) {
      this.filterForm.selectedCategory = this.filterForm.categories.map(
        category => category.id
      );
    } else {
      this.filterForm.selectedCategory = [];
    }
  }

  showLabels(event: InputSwitchChangeEvent) {
    console.log(this.optionsTwo);
    if (this.optionsTwo.plugins === undefined) return;
    if (this.optionsTwo.plugins.datalabels === undefined) return;
    this.optionsTwo = {
      ...this.optionsTwo,
      plugins: {
        ...this.optionsTwo.plugins,
        datalabels: { display: event.checked },
      },
    };
  }
}
