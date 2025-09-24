import { Component, OnInit, inject, signal } from '@angular/core';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { HttpService } from '@services/http.service';
import { CategoryResponse, FinancesResponse, SeverityToast } from '@types';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-add',
  standalone: true,
  imports: [
    ConfirmDialogModule,
    InputNumberModule,
    InputTextareaModule,
    DropdownModule,
    CalendarModule,
    FormsModule,
    RouterLink,
    ProgressSpinnerModule,
    ToastModule,
  ],
  templateUrl: './add.component.html',
  providers: [HttpService, MessageService, ConfirmationService],
})
export class AddComponent implements OnInit {
  private http = inject(HttpService);
  private toastSrv = inject(MessageService);
  private activateRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  title = signal('');
  titleButton = signal('');
  categories: CategoryResponse[] = [];
  loading = true;
  loadingButton = false;
  newCost: {
    value: null | number;
    description: string;
    category: number | null;
    date: Date;
  } = {
    value: null,
    description: '',
    category: null,
    date: new Date(),
  };
  idCost: number | null = null;

  async ngOnInit() {
    const { data, error } = await this.http.getCategories();
    if (error) {
      this.triggerToast({
        title: 'Error',
        severity: 'error',
        message:
          'Ha ocurrido un error al obtener las categorias, intentalo de nuevo.',
      });
      this.loading = false;
      console.error('Error:', error);
      return;
    }
    if (data === null) {
      this.triggerToast({
        title: 'Error',
        severity: 'error',
        message:
          'Ha ocurrido un error al obtener las categorias, intentalo de nuevo.',
      });
      this.loading = false;
      console.error('Error: No data received');
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
    this.categories = sortCategories;
    this.activateRoute.queryParams.subscribe({
      next: params => {
        const { data } = params;
        if (data) {
          this.title.set('Editar un dato');
          this.titleButton.set('Editar');
          const obj = JSON.parse(atob(data)) as FinancesResponse;
          const dateSplit = obj.date.split('-');
          this.idCost = obj.id;
          this.newCost = {
            ...this.newCost,
            value: obj.value,
            category: obj.category.id,
            description: obj.description,
            date: new Date(
              parseInt(dateSplit[0]),
              parseInt(dateSplit[1]) - 1,
              parseInt(dateSplit[2])
            ),
          };
        } else {
          this.title.set('Añadir nuevos datos');
          this.titleButton.set('Añadir');
        }
        this.loading = false;
      },
    });
  }

  async addCost() {
    this.loadingButton = true;
    const { category, date, description, value } = this.newCost;
    const formatedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    const id = this.idCost;
    if (id === null) {
      const { error } = await this.http.addNewFinance({
        category: category ?? 0,
        description,
        value: value ?? -1,
        date: formatedDate,
      });
      if (error !== null) {
        this.triggerToast({
          title: 'Error',
          severity: 'error',
          message:
            'Ha ocurrido un error al agregar el dato, intentalo de nuevo',
        });
        this.loadingButton = false;
        console.error('Error:', error);
        return;
      }
      this.triggerToast({
        title: 'Agregado',
        severity: 'success',
        message: 'El dato ha sido agregado correctamente',
      });
      this.loadingButton = false;
      this.newCost = {
        ...this.newCost,
        value: null,
        category: null,
        description: '',
      };
    } else {
      const { error } = await this.http.editFinance(id, {
        category: category ?? 0,
        description,
        value: value ?? -1,
        date: formatedDate,
      });
      if (error) {
        this.triggerToast({
          title: 'Error',
          severity: 'error',
          message: 'Ha ocurrido un error al editar el dato, intentalo de nuevo',
        });
        this.loadingButton = false;
        console.error('Error:', error);
        return;
      }
      this.triggerToast({
        title: 'Ediatdo',
        severity: 'success',
        message: 'El dato ha sido editado correctamente',
      });
      this.loadingButton = false;
      this.newCost = {
        ...this.newCost,
        value: null,
        category: null,
        description: '',
      };
    }
  }

  deleteCost(id: number) {
    this.confirmationService.confirm({
      message: 'Se eliminará este registro ¿Estás seguro?',
      header: 'Confirmar eliminación',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-text',
      rejectLabel: 'No',
      acceptLabel: 'Si',
      acceptIcon: 'none',
      rejectIcon: 'none',
      accept: async () => {
        const { error } = await this.http.deleteFinance(id);
        if (error) {
          this.triggerToast({
            title: 'Error',
            severity: 'error',
            message:
              'Ha ocurrido un error al eliminar el dato, intentalo de nuevo',
          });
          this.loadingButton = false;
          console.error('Error:', error);
          return;
        }
        this.triggerToast({
          title: 'Eliminado',
          severity: 'success',
          message: 'El dato ha sido eliminado correctamente',
        });
        this.idCost = null;
        this.title.set('Añadir nuevos datos');
        this.titleButton.set('Añadir');
        this.newCost = {
          ...this.newCost,
          value: null,
          category: null,
          description: '',
        };
        this.router.navigate([], {
          relativeTo: this.activateRoute,
          queryParams: { data: null },
          queryParamsHandling: 'merge',
        });
      },
      reject: () => {},
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
