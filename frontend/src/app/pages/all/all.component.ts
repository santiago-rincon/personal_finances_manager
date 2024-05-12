import { CategoriesComponent } from '@components/filters/categories/categories.component';
import { Component, inject } from '@angular/core';
import { HttpService } from '@services/http.service';
import { MessageService } from 'primeng/api';
import { MonthsComponent } from '@components/filters/months/months.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModeComponent } from '@components/filters/table-mode/table-mode.component';
import { TabViewModule } from 'primeng/tabview';
import { TiggerToastOptins } from '@types';
import { ToastModule } from 'primeng/toast';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-all',
  standalone: true,
  imports: [
    CategoriesComponent,
    MonthsComponent,
    ProgressSpinnerModule,
    TableModeComponent,
    TabViewModule,
    ToastModule,
    RouterLink,
  ],
  templateUrl: './all.component.html',
  providers: [HttpService, MessageService],
})
export class AllComponent {
  private toastSrv = inject(MessageService);

  triggerToast(opt: TiggerToastOptins) {
    this.showToast(opt);
  }

  private showToast(event: TiggerToastOptins) {
    const { severity, title, message } = event;
    this.toastSrv.add({
      severity,
      summary: title,
      detail: message,
    });
  }
}
