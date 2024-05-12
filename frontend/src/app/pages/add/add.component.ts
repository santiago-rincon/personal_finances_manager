import { Component, OnInit, inject } from '@angular/core';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryResponse, SeverityToast } from '@types';
import { HttpService } from '@services/http.service';
import { RouterLink } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-add',
  standalone: true,
  imports: [
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
  providers: [HttpService, MessageService],
})
export class AddComponent implements OnInit {
  private http = inject(HttpService);
  private toastSrv = inject(MessageService);
  categories: CategoryResponse[] = [];
  loading = true;
  loadingButton = false;
  newCost = {
    value: null,
    description: '',
    category: null,
    date: new Date(),
  };

  ngOnInit(): void {
    this.http.getCategories().subscribe({
      next: categories => {
        this.categories = categories;
        this.loading = false;
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
    const { category, date, description, value } = this.newCost;
    this.loadingButton = true;
    const formatedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
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
