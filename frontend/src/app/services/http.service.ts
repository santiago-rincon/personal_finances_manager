import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { CategoryResponse, FinanceRequest, FinancesResponse } from '@types';
import { isValidDate } from '@utils';
import { environment } from 'src/environments/environment';
import { createClient, PostgrestError } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private http = inject(HttpClient);
  private supabase = createClient(
    environment.supabaseUrl,
    environment.supabaseAnonKey
  );

  async getFinancesByMonth({
    month,
    year,
    id,
  }: {
    month: number;
    year: number;
    id?: number;
  }): Promise<{
    data: FinancesResponse[] | null;
    error: PostgrestError | null;
  }> {
    const baseDate = `${year.toString()}-${month.toString().padStart(2, '0')}-`;
    const initial = baseDate + '01';
    let flags = true;
    let day = 31;
    let end = '';
    let financesData;
    while (flags) {
      end = baseDate + day.toString();
      isValidDate(end) ? (flags = false) : day--;
    }
    const categoriesData = await this.getCategories();
    if (categoriesData.error) {
      return { data: null, error: categoriesData.error };
    }
    if (typeof id === 'undefined') {
      financesData = await this.supabase
        .from('finances')
        .select()
        .gte('date', initial)
        .lte('date', end);
    } else {
      financesData = await this.supabase
        .from('finances')
        .select()
        .gte('date', initial)
        .lte('date', end)
        .eq('category_id', id);
    }
    if (financesData.error) {
      return { data: null, error: financesData.error };
    }
    const data = financesData.data.map(finance => {
      const category = categoriesData.data!.find(
        cat => cat.id === finance.category_id
      );
      return {
        id: finance.id,
        value: finance.value,
        description: finance.description,
        date: finance.date,
        category: {
          id: category?.id ?? 0,
          category: category?.category ?? 'Unknown',
        },
      };
    });
    return { data, error: null };
  }

  async addNewCategory(category: string) {
    const { error } = await this.supabase
      .from('categories')
      .insert({ category });
    return { error };
  }

  async addNewFinance(finance: FinanceRequest): Promise<{
    error: PostgrestError | null;
  }> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { category, ...data } = { ...finance, category_id: finance.category };
    console.log(data);
    return this.supabase.from('finances').insert(data);
  }

  async getCategories(): Promise<{
    data: CategoryResponse[] | null;
    error: PostgrestError | null;
  }> {
    return await this.supabase.from('categories').select();
  }

  async updateCategory(
    id: number,
    category: string
  ): Promise<{ error: PostgrestError | null }> {
    return await this.supabase
      .from('categories')
      .update({ category })
      .eq('id', id);
  }

  async getAllFinances(): Promise<{
    data: FinancesResponse[] | null;
    error: PostgrestError | null;
  }> {
    const categoriesData = await this.getCategories();
    if (categoriesData.error) {
      return { data: null, error: categoriesData.error };
    }
    const financesData = await this.supabase.from('finances').select();
    if (financesData.error) {
      return { data: null, error: financesData.error };
    }
    const data = financesData.data.map(finance => {
      const category = categoriesData.data!.find(
        cat => cat.id === finance.category_id
      );
      return {
        id: finance.id,
        value: finance.value,
        description: finance.description,
        date: finance.date,
        category: {
          id: category?.id ?? 0,
          category: category?.category ?? 'Unknown',
        },
      };
    });
    return { data, error: null };
  }

  async getAllFinanceByCategory(id: number): Promise<{
    data: FinancesResponse[] | null;
    error: PostgrestError | null;
  }> {
    const categoriesData = await this.getCategories();
    if (categoriesData.error) {
      return { data: null, error: categoriesData.error };
    }
    const financesData = await this.supabase
      .from('finances')
      .select()
      .eq('category_id', id);
    if (financesData.error) {
      return { data: null, error: financesData.error };
    }
    const data = financesData.data.map(finance => {
      const category = categoriesData.data!.find(
        cat => cat.id === finance.category_id
      );
      return {
        id: finance.id,
        value: finance.value,
        description: finance.description,
        date: finance.date,
        category: {
          id: category?.id ?? 0,
          category: category?.category ?? 'Unknown',
        },
      };
    });
    return { data, error: null };
  }

  async editFinance(id: number, finance: FinanceRequest) {
    const { category, date, description, value } = finance;
    return this.supabase
      .from('finances')
      .update({
        value,
        description,
        category_id: category,
        date,
      })
      .eq('id', id);
  }

  async deleteFinance(id: number) {
    return this.supabase.from('finances').delete().eq('id', id);
  }
}
