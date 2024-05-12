import { FinancesResponse } from '@types';
import { ChartData, ChartOptions } from 'chart.js';
import { Context } from 'chartjs-plugin-datalabels';
import { getMonthStr } from '@utils';

export function setPieChart(
  array: FinancesResponse[],
  date: Date
): [ChartData | null, ChartOptions | null] {
  if (array.length === 0) return [null, null];
  const labels: string[] = [];
  const data: number[] = [];
  let income = 0;
  array.forEach(finance => {
    if (finance.category.id === 1) {
      income += finance.value;
      return;
    }
    const index = labels.findIndex(
      label => label === finance.category.category
    );
    if (index === -1) {
      labels.push(finance.category.category);
      data.push(finance.value);
    } else {
      data[index] += finance.value;
    }
  });
  let title = '(No hay ingresos)';
  if (income !== 0) {
    labels.push('Restante');
    data.push(income - data.reduce((a, b) => a + b, 0));
    title = '';
  }
  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue('--text-color');
  const dataChart: ChartData = { labels, datasets: [{ data }] };
  const options: ChartOptions = {
    plugins: {
      legend: {
        align: 'center',
        position: 'right',
        labels: {
          usePointStyle: true,
          color: textColor,
          font: { size: 15 },
        },
      },
      datalabels: {
        formatter: (value: number, ctx: Context) => {
          let sum = 0;
          const dataArr = ctx.chart.data.datasets[0].data;
          dataArr.map(data => {
            if (typeof data === 'number') sum += data;
          });
          return `${((value * 100) / sum).toFixed(2)}%`;
        },
        color: textColor,
        font: { size: 16 },
      },
      title: {
        display: true,
        text: `Datos de ${getMonthStr(date.getMonth() + 1)} ${title}`,
        font: { size: 20 },
      },
    },
  };
  return [dataChart, options];
}
