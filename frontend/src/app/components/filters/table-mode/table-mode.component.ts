import { CalendarModule } from 'primeng/calendar';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { HttpService } from '@services/http.service';
import { LoaderComponent } from '@components/loader/loader.component';
import { TableModule } from 'primeng/table';
import {
  CategoryResponse,
  FinanceTableFormat,
  TiggerToastOptins,
} from '@types';
import { RouterLink } from '@angular/router';
import { getMonthStr } from '@utils';

@Component({
  selector: 'app-table-mode',
  standalone: true,
  imports: [
    CalendarModule,
    CurrencyPipe,
    DropdownModule,
    FormsModule,
    LoaderComponent,
    RouterLink,
    TableModule,
  ],
  providers: [HttpService],
  templateUrl: './table-mode.component.html',
})
export class TableModeComponent {
  @Output() toast = new EventEmitter<TiggerToastOptins>();
  private http = inject(HttpService);
  categories: CategoryResponse[] = [];
  currentView: 0 | 1 | 2 | 3 | null = null;
  categoryAndMonth: { id: number | null; date: Date | null } = {
    id: null,
    date: null,
  };
  options: { label: string; id: number }[] = [
    { label: 'Ver todos los registros', id: 0 },
    { label: 'Ver todos los registros de un mes específico', id: 1 },
    { label: 'Ver todos los registros de una categoria', id: 2 },
    {
      label: 'Ver todos los registros de una categoria en un mes específico',
      id: 3,
    },
  ];
  data: FinanceTableFormat[] = [];

  async changeSelect(event: DropdownChangeEvent) {
    const value = event.value;
    this.currentView = value;
    if (value === 0) {
      const { data, error } = await this.http.getAllFinances();
      if (error !== null) {
        this.toast.emit({
          title: 'Error',
          message:
            'Ha ocurrido un error con el servidor, no se obtuvieron los datos.',
          severity: 'error',
        });
        console.error('Error:', error);
        return;
      }
      if (data === null) return;
      if (data.length === 0) {
        this.toast.emit({
          title: 'Sin información',
          severity: 'info',
          message: 'Aún no hay datos registrados',
        });
        return;
      }
      this.data = data.map(finance => {
        return {
          ...finance,
          category: finance.category.category,
          b64: btoa(JSON.stringify({ ...finance })),
        };
      });
      return;
    }
    if ((value === 2 || value === 3) && this.categories.length === 0) {
      const { data, error } = await this.http.getCategories();
      if (error) {
        this.toast.emit({
          title: 'Error',
          message: `Ha ocurrido un error al obtener las categorias, intentalo de nuevo.`,
          severity: 'error',
        });
        console.error('Error:', error);
      }
      if (data === null) {
        this.toast.emit({
          title: 'Error',
          message: `Ha ocurrido un error al obtener las categorias, intentalo de nuevo.`,
          severity: 'error',
        });
        console.error('Error: No data received');
        return;
      }
      this.categories = data.sort(function (a, b) {
        if (a.category > b.category) {
          return 1;
        }
        if (a.category < b.category) {
          return -1;
        }
        return 0;
      });
    }
  }

  async getAllDatabyDate(date: Date) {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const { data, error } = await this.http.getFinancesByMonth({ month, year });
    if (error !== null) {
      this.toast.emit({
        title: 'Error',
        message:
          'Ha ocurrido un error con el servidor, no se obtuvieron los datos.',
        severity: 'error',
      });
      console.error('Error:', error);
      return;
    }
    if (data === null) return;
    if (data.length === 0) {
      this.toast.emit({
        title: 'Sin información',
        severity: 'info',
        message: `No se han encontrado datos para el mes de ${getMonthStr(month)}`,
      });
      return;
    }
    this.data = data.map(finance => {
      return {
        ...finance,
        category: finance.category.category,
        b64: btoa(JSON.stringify({ ...finance })),
      };
    });
  }

  async getAllDataByCategory(event: DropdownChangeEvent) {
    const categoryId = event.value;
    const { data, error } = await this.http.getAllFinanceByCategory(categoryId);
    if (error !== null) {
      this.toast.emit({
        title: 'Error',
        message:
          'Ha ocurrido un error con el servidor, no se obtuvieron los datos.',
        severity: 'error',
      });
      console.error('Error:', error);
      return;
    }
    if (data === null) return;
    if (data.length === 0) {
      this.toast.emit({
        title: 'Sin información',
        severity: 'info',
        message: `No se han encontrado datos para la categoria seleccionada.`,
      });
      return;
    }
    this.data = data.map(finance => {
      return {
        ...finance,
        category: finance.category.category,
        b64: btoa(JSON.stringify({ ...finance })),
      };
    });
  }

  async getAllDataByCategoryAndMonth() {
    const { date, id } = this.categoryAndMonth;
    if (id !== null && date !== null) {
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const { data, error } = await this.http.getFinancesByMonth({
        month,
        year,
        id,
      });
      if (error !== null) {
        this.toast.emit({
          title: 'Error',
          message:
            'Ha ocurrido un error con el servidor, no se obtuvieron los datos.',
          severity: 'error',
        });
        console.error('Error:', error);
        return;
      }
      if (data === null) return;
      if (data.length === 0) {
        this.toast.emit({
          title: 'Sin información',
          severity: 'info',
          message: `No se han encontrado datos para la categoria seleccionada y el mes de ${getMonthStr(month)}.`,
        });
        return;
      }
      this.data = data.map(finance => {
        return {
          ...finance,
          category: finance.category.category,
          b64: btoa(JSON.stringify({ ...finance })),
        };
      });
    }
  }
}
