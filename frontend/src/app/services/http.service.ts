import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { CategoryResponse, FinanceRequest, FinancesResponse } from '@types';
import { isValidDate } from '@utils';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private http = inject(HttpClient);

  getFinancesByMonth({
    month,
    year,
    id,
  }: {
    month: number;
    year: number;
    id?: number;
  }) {
    const baseDate = `${year.toString()}-${month.toString().padStart(2, '0')}-`;
    const initial = baseDate + '01';
    let flags = true;
    let day = 31;
    let end = '';
    while (flags) {
      end = baseDate + day.toString();
      isValidDate(end) ? (flags = false) : day--;
    }
    const options = {
      params: new HttpParams().set('initial', initial).set('end', end),
    };
    const url =
      typeof id === 'undefined'
        ? `${environment.mainUrl}/finances`
        : `${environment.mainUrl}/finances/${id}`;
    return this.http.get<FinancesResponse[]>(url, options);
  }

  addNewCategory(category: string) {
    return this.http.post<CategoryResponse>(
      `${environment.mainUrl}/categories`,
      { category }
    );
  }

  addNewFinance(finance: FinanceRequest) {
    return this.http.post<FinancesResponse>(
      `${environment.mainUrl}/finances`,
      finance
    );
  }

  getCategories() {
    return this.http.get<CategoryResponse[]>(
      `${environment.mainUrl}/categories`
    );
  }

  updateCategory(id: number, category: string) {
    return this.http.patch(`${environment.mainUrl}/categories/${id}`, {
      category,
    });
  }

  getAllFinances() {
    return this.http.get<FinancesResponse[]>(`${environment.mainUrl}/finances`);
  }

  getAllFinanceByCategory(id: number) {
    return this.http.get<FinancesResponse[]>(
      `${environment.mainUrl}/finances/${id}`
    );
  }
}
