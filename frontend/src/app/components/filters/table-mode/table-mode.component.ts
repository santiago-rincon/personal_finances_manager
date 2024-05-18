import { CalendarModule } from 'primeng/calendar';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { getMonthStr } from '@utils';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpService } from '@services/http.service';
import { LoaderComponent } from '@components/loader/loader.component';
import { TableModule } from 'primeng/table';
import {
  CategoryResponse,
  FinanceTableFormat,
  TiggerToastOptins,
} from '@types';
import { RouterLink } from '@angular/router';

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

  changeSelect(event: DropdownChangeEvent) {
    const value = event.value;
    this.currentView = value;
    if (value === 0) {
      this.http.getAllFinances().subscribe({
        next: data => {
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
      return;
    }
    if ((value === 2 || value === 3) && this.categories.length === 0) {
      this.http.getCategories().subscribe({
        next: categories => {
          this.categories = categories;
        },
        error: (error: HttpErrorResponse) => {
          const detail =
            error.status === 0
              ? 'Ha ocurrido un error de conexión, no se obtuvieron los datos de las categorias.'
              : 'Ha ocurrido un error con el servidor, no se obtuvieron los datos de las categorias.';
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

  getAllDatabyDate(date: Date) {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    this.http.getFinancesByMonth({ month, year }).subscribe({
      next: finances => {
        if (finances.length === 0) {
          this.toast.emit({
            title: 'Sin información',
            severity: 'info',
            message: `No se han encontrado datos para el mes de ${getMonthStr(month)}`,
          });
          return;
        }
        this.data = finances.map(finance => {
          return {
            ...finance,
            category: finance.category.category,
            b64: btoa(JSON.stringify({ ...finance })),
          };
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

  getAllDataByCategory(event: DropdownChangeEvent) {
    const categoryId = event.value;
    this.http.getAllFinanceByCategory(categoryId).subscribe({
      next: finances => {
        if (finances.length === 0) {
          this.toast.emit({
            title: 'Sin información',
            severity: 'info',
            message: `No se han encontrado datos para la categoria seleccionada.`,
          });
          return;
        }
        this.data = finances.map(finance => {
          return {
            ...finance,
            category: finance.category.category,
            b64: btoa(JSON.stringify({ ...finance })),
          };
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

  getAllDataByCategoryAndMonth() {
    const { date, id } = this.categoryAndMonth;
    if (id !== null && date !== null) {
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      this.http.getFinancesByMonth({ month, year, id }).subscribe({
        next: finances => {
          if (finances.length === 0) {
            this.toast.emit({
              title: 'Sin información',
              severity: 'info',
              message: `No se han encontrado datos para la categoria seleccionada y el mes de ${getMonthStr(month)}.`,
            });
            return;
          }
          this.data = finances.map(finance => {
            return {
              ...finance,
              category: finance.category.category,
              b64: btoa(JSON.stringify({ ...finance })),
            };
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
  }
}
