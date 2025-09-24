import { ButtonModule } from 'primeng/button';
import { CategoryEdit, CategoryResponse, SeverityToast } from '@types';
import { ChartComponent } from '@components/chart/chart.component';
import { ChartData, ChartOptions } from 'chart.js';
import { Component, OnInit, inject } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
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

  async ngOnInit() {
    const month = this.now.getMonth() + 1;
    const year = this.now.getFullYear();
    const { data: dataSupabase, error } = await this.http.getFinancesByMonth({
      month,
      year,
    });
    if (error) {
      this.loading = false;
      this.triggerToast({
        title: 'Error',
        message:
          'Ha ocurrido un error de conexión, no se obtuvieron los datos.',
        severity: 'error',
      });
      console.error('Error:', error);
      return;
    }
    if (dataSupabase === null || dataSupabase.length === 0) {
      this.loading = false;
      this.triggerToast({
        title: 'Sin informción',
        message:
          'No hay datos para mostrar en este mes, añade un gasto para ver el gráfico.',
        severity: 'info',
      });
      return;
    }
    const [data, options] = setPieChart(dataSupabase, this.now);
    if (data !== null && options !== null) {
      this.data = data;
      this.options = options;
    }
    this.loading = false;
  }

  async addCategory() {
    if (this.newCategory === '') {
      this.toastSrv.add({
        severity: 'info',
        summary: 'Formulario incorrecto',
        detail: 'La categoria no puede estar vacía',
      });
      return;
    }
    this.loadingButton = true;
    const error = await this.http.addNewCategory(this.newCategory);
    if (error.error !== null) {
      const message =
        error.error?.code === '23505'
          ? 'de duplicado. Intentalo con otro nombre.'
          : 'inesperado. Intentalo de nuevo.';
      this.toastSrv.add({
        severity: 'error',
        summary: 'Error',
        detail: `Ha ocurrido un error ${message}`,
      });
      this.loadingButton = false;
      console.error('Error:', error.error);
      return;
    }
    this.newCategory = '';
    this.toastSrv.add({
      severity: 'success',
      summary: 'Categoria añadida',
      detail: 'Se ha añadido la categoria correctamente',
    });
    this.visibleAdd = false;
    this.loadingButton = false;
  }

  async editCategory(id: number) {
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
    const { error } = await this.http.updateCategory(id, newCategory.category);
    if (error !== null) {
      this.toastSrv.add({
        severity: 'error',
        summary: 'Error',
        detail: `Ha ocurrido un error inesperado. Intentalo de nuevo.`,
      });
      this.loadingEdit = false;
      console.error('Error:', error);
      return;
    }
    this.categoriesOriginal[indexOldCategory].category = newCategory.category;
    this.toastSrv.add({
      severity: 'success',
      summary: 'Categoria editada',
      detail: 'Se ha editado la categoria correctamente',
    });
    this.categories[indexOldCategory].disabled = false;
  }

  async openEditCategories() {
    this.loadingEdit = true;
    this.visibleEdit = true;
    const { data, error } = await this.http.getCategories();
    if (error) {
      this.toastSrv.add({
        severity: 'error',
        summary: 'Error',
        detail: `Ha ocurrido un error al obtener las categorias, intentalo de nuevo.`,
      });
      this.loadingEdit = false;
      console.error('Error:', error);
      return;
    }
    if (data === null) {
      this.toastSrv.add({
        severity: 'info',
        summary: 'Sin categorias',
        detail: `No hay categorias para mostrar, añade una nueva.`,
      });
      this.loadingEdit = false;
      return;
    }
    const sortCategories = data.sort(function (a, b) {
      if (a.category > b.category) {
        return 1;
      }
      if (a.category < b.category) {
        return -1;
      }
      return 0;
    });
    this.categoriesOriginal = sortCategories;
    const newArray: CategoryEdit[] = sortCategories.map(category => ({
      ...category,
      disabled: true,
    }));
    this.categories = newArray;
    this.loadingEdit = false;
  }

  changedisabled(id: number) {
    this.categories.forEach(category => {
      category.disabled = !(category.id === id);
    });
  }

  private changeOptionsResize(width: number) {
    let position;
    if (width <= 768) {
      position = 'bottom';
    } else {
      position = 'right';
    }
    return position;
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
