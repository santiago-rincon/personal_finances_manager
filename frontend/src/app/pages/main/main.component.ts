import { ButtonModule } from 'primeng/button';
import { CategoryEdit, CategoryResponse, SeverityToast } from '@types';
import { ChartComponent } from '@components/chart/chart.component';
import { ChartData, ChartOptions } from 'chart.js';
import { Component, OnInit, inject } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpService } from '@services/http.service';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { LoaderComponent } from '@components/loader/loader.component';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RouterLink } from '@angular/router';
import { setPieChart } from '@utils';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    ButtonModule,
    ChartComponent,
    DialogModule,
    FormsModule,
    InputGroupModule,
    InputTextModule,
    LoaderComponent,
    ProgressSpinnerModule,
    RouterLink,
    ToastModule,
    ToastModule,
  ],
  providers: [HttpService, MessageService],
  templateUrl: './main.component.html',
})
export class MainComponent implements OnInit {
  categories: CategoryEdit[] = [];
  categoriesOriginal: CategoryResponse[] = [];
  data: ChartData = { datasets: [{ data: [] }] };
  loading = true;
  loadingEdit = false;
  loadingButton = false;
  newCategory = '';
  now = new Date();
  options: ChartOptions = {};
  private http = inject(HttpService);
  private toastSrv = inject(MessageService);
  visibleAdd = false;
  visibleEdit = false;
  visibleAddCost = false;

  ngOnInit() {
    const result = this.http.getFinancesByMonth({
      month: this.now.getMonth() + 1,
      year: this.now.getFullYear(),
    });
    result.subscribe({
      next: finances => {
        const [data, options] = setPieChart(finances, this.now);
        if (data !== null && options !== null) {
          this.data = data;
          this.options = options;
        }
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        const detail =
          error.status === 0
            ? 'Ha ocurrido un error de conexión, no se obtuvieron los datos.'
            : 'Ha ocurrido un error con el servidor, no se obtuvieron los datos.';
        this.triggerToast({
          title: 'Error',
          message: detail,
          severity: 'error',
        });
        console.error('Error:', error);
      },
    });
  }

  addCategory() {
    if (this.newCategory === '') {
      this.toastSrv.add({
        severity: 'info',
        summary: 'Formulario incorrecto',
        detail: 'La categoria no puede estar vacía',
      });
      return;
    }
    this.loadingButton = true;
    this.http.addNewCategory(this.newCategory).subscribe({
      next: () => {
        this.newCategory = '';
        this.toastSrv.add({
          severity: 'success',
          summary: 'Categoria añadida',
          detail: 'Se ha añadido la categoria correctamente',
        });
        this.visibleAdd = false;
        this.loadingButton = false;
      },
      error: (error: HttpErrorResponse) => {
        let detail = '';
        if (error.status === 0) {
          detail = 'de conexión, intentalo de nuevo.';
        } else if (error.status === 409) {
          detail = 'con el servidor, la categoria ya existe.';
        } else {
          detail = 'con el servidor, intentalo de nuevo.';
        }
        this.toastSrv.add({
          severity: 'error',
          summary: 'Error',
          detail: `Ha ocurrido un error ${detail}`,
        });
        this.loadingButton = false;
        console.error('Error:', error.error);
      },
    });
  }

  editCategory(id: number) {
    const newCategory = this.categories.find(category => category.id === id);
    if (newCategory === undefined) return;
    if (newCategory.category === '') {
      this.toastSrv.add({
        severity: 'error',
        summary: 'Formulario incorrecto',
        detail: 'La categoria no puede estar vacía',
      });
      return;
    }
    const indexOldCategory = this.categoriesOriginal.findIndex(
      category => category.id === id
    );
    if (
      newCategory.category ===
      this.categoriesOriginal[indexOldCategory].category
    ) {
      this.toastSrv.add({
        severity: 'info',
        summary: 'Formulario incorrecto',
        detail: 'Debes cambiar el nombre de la categoria',
      });
      return;
    }
    this.categories[indexOldCategory].disabled = true;
    this.http.updateCategory(id, newCategory.category).subscribe({
      next: () => {
        this.categoriesOriginal[indexOldCategory].category =
          newCategory.category;
        this.toastSrv.add({
          severity: 'success',
          summary: 'Categoria editada',
          detail: 'Se ha editado la categoria correctamente',
        });
        this.categories[indexOldCategory].disabled = false;
      },
      error: (error: HttpErrorResponse) => {
        const detail =
          error.status === 0
            ? 'de conexión, no se actualizo la categoria. Intentalo de nuevo.'
            : 'con el servidor, no se actualizo la categoria. Intentalo de nuevo.';
        this.toastSrv.add({
          severity: 'error',
          summary: 'Error',
          detail: `Ha ocurrido un error ${detail}`,
        });
        this.loadingEdit = false;
        console.error('Error:', error.error);
      },
    });
  }

  openEditCategories() {
    this.loadingEdit = true;
    this.visibleEdit = true;
    this.http.getCategories().subscribe({
      next: categories => {
        this.categoriesOriginal = [...categories];
        const newArray: CategoryEdit[] = categories.map(category => ({
          ...category,
          disabled: true,
        }));
        this.categories = newArray;
        this.loadingEdit = false;
      },
      error: (error: HttpErrorResponse) => {
        const detail =
          error.status === 0
            ? 'de conexión, intentalo de nuevo'
            : 'con el servidor, intentalo de nuevo';
        this.toastSrv.add({
          severity: 'error',
          summary: 'Error',
          detail: `Ha ocurrido un error ${detail}`,
        });
        this.loadingEdit = false;
        console.error('Error:', error.error);
      },
    });
  }

  changedisabled(id: number) {
    this.categories.forEach(category => {
      category.disabled = !(category.id === id);
    });
  }

  private triggerToast({
    title,
    severity,
    message,
  }: {
    title: string;
    severity: SeverityToast;
    message?: string;
  }) {
    this.toastSrv.add({
      severity,
      summary: title,
      detail: message,
    });
  }
}
