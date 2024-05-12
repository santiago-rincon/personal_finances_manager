export interface Theme {
  name: string;
  style: `${string}.css`;
  color: `#${string}`;
}

export interface FinanceRequest {
  value: number;
  description: string;
  date: string;
  category: number;
}

export interface FinanceTableFormat {
  value: number;
  description: string;
  date: string;
  category: string;
}

export interface FinancesResponse {
  id: number;
  value: number;
  description: string;
  date: string;
  category: CategoryResponse;
}

type SeverityToast =
  | 'success'
  | 'info'
  | 'warning'
  | 'primary'
  | 'help'
  | 'error'
  | 'secondary'
  | 'contrast';

export interface CategoryResponse {
  id: number;
  category: string;
}

export interface CategoryEdit extends CategoryResponse {
  disabled: boolean;
}

export interface TiggerToastOptins {
  title: string;
  severity: SeverityToast;
  message?: string;
}
