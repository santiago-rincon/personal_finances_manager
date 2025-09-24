import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartComponent } from '@components/chart/chart.component';
import { HttpService } from '@services/http.service';
import { PostgrestError } from '@supabase/supabase-js';
import { CategoryResponse, FinancesResponse, TiggerToastOptins } from '@types';
import { setBarchart } from '@utils';
import { ChartData, ChartOptions } from 'chart.js';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { InputSwitchChangeEvent, InputSwitchModule } from 'primeng/inputswitch';

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

  async ngOnInit() {
    const { data, error } = await this.http.getCategories();
    if (error) {
      this.toast.emit({
        title: 'Error',
        message:
          'Ha ocurrido un error al obtener las categorias, intentalo de nuevo.',
        severity: 'error',
      });
      console.error('Error:', error);
      return;
    }
    if (data === null) {
      this.toast.emit({
        title: 'Error',
        message:
          'Ha ocurrido un error al obtener las categorias, intentalo de nuevo.',
        severity: 'error',
      });
      console.error('Error: No data received');
      return;
    }
    this.filterForm.categories = data.sort(function (a, b) {
      if (a.category > b.category) {
        return 1;
      }
      if (a.category < b.category) {
        return -1;
      }
      return 0;
    });
  }

  async getDataTwo() {
    const promises: Promise<{
      data: FinancesResponse[] | null;
      error: PostgrestError | null;
    }>[] = [];
    for (const id of this.filterForm.selectedCategory) {
      for (const day of this.filterForm.dates) {
        promises.push(
          this.http
            .getFinancesByMonth({
              month: day.getMonth() + 1,
              year: day.getFullYear(),
              id,
            })
            .then(res => {
              if (res.data?.length === 0) {
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
                return { data: [finance], error: null };
              } else {
                return res;
              }
            })
        );
      }
    }
    try {
      const responses = await Promise.all(promises);
      const responsesArray = responses.map(res => {
        if (res.data !== null) return res.data;
        return [];
      });
      const [data, options] = setBarchart(responsesArray);
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
      console.error('Error:', error);
      this.toast.emit({
        title: 'Error',
        message: 'Ha ocurrido un error al obtener los datos.',
        severity: 'error',
      });
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
