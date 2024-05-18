import { JsonPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
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
    JsonPipe,
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

  ngOnInit(): void {
    this.http.getCategories().subscribe({
      next: categories => {
        this.categories = categories;
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
      },
      error: (error: HttpErrorResponse) => {
        const detail =
          error.status === 0
            ? 'Ha ocurrido un error de conexión, no se obtuvieron las categorias. Intentalo de nuevo.'
            : 'Ha ocurrido un error con el servidor, no se obtuvieron las categorias. Intentalo de nuevo.';
        this.triggerToast({
          title: 'Error',
          severity: 'error',
          message: detail,
        });
        this.loading = false;
        console.error('Error:', error);
      },
    });
  }

  addCost() {
    this.loadingButton = true;
    const { category, date, description, value } = this.newCost;
    const formatedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    const id = this.idCost;
    if (id === null) {
      this.http
        .addNewFinance({
          category: category ?? 0,
          description,
          value: value ?? -1,
          date: formatedDate,
        })
        .subscribe({
          next: () => {
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
          },
          error: (error: HttpErrorResponse) => {
            let message = '';
            if (error.status === 0) {
              message =
                'Ha ocurrido un error con el servidor, intentalo de nuevo';
            } else if (error.status === 400) {
              message = 'Hay un error en el formato de la petición';
            } else if (error.status === 404) {
              message = 'No existe la categoria que deseas agregar';
            } else {
              message =
                'Ha ocurrido un error con el servidor, intentalo de nuevo';
            }
            this.triggerToast({
              title: 'Error',
              severity: 'error',
              message,
            });
            this.loadingButton = false;
            console.error('Error:', error);
          },
        });
    } else {
      this.http
        .editFinance(id, {
          category: category ?? 0,
          description,
          value: value ?? -1,
          date: formatedDate,
        })
        .subscribe({
          next: () => {
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
          },
          error: (error: HttpErrorResponse) => {
            let message = '';
            if (error.status === 0) {
              message =
                'Ha ocurrido un error con el servidor, intentalo de nuevo';
            } else if (error.status === 400) {
              message = 'Hay un error en el formato de la petición';
            } else if (error.status === 404) {
              message = 'No existe la categoria que deseas agregar';
            } else {
              message =
                'Ha ocurrido un error con el servidor, intentalo de nuevo';
            }
            this.triggerToast({
              title: 'Error',
              severity: 'error',
              message,
            });
            this.loadingButton = false;
            console.error('Error:', error);
          },
        });
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
      accept: () => {
        this.http.deleteFinance(id).subscribe({
          next: () => {
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
          error: (error: HttpErrorResponse) => {
            let message = '';
            if (error.status === 0) {
              message =
                'Ha ocurrido un error con el servidor, intentalo de nuevo';
            } else if (error.status === 400) {
              message = 'Hay un error en el formato de la petición';
            } else if (error.status === 404) {
              message = 'No existe la categoria que deseas agregar';
            } else {
              message =
                'Ha ocurrido un error con el servidor, intentalo de nuevo';
            }
            this.triggerToast({
              title: 'Error',
              severity: 'error',
              message,
            });
            this.loadingButton = false;
            console.error('Error:', error);
          },
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
