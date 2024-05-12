import { FinancesResponse } from '@types';
import { ChartData, ChartDataset, ChartOptions } from 'chart.js';
import { getMonthStr } from './getMonthStr';

export function setBarchart(
  array: FinancesResponse[][]
): [ChartData | null, ChartOptions | null] {
  if (array.length === 0) return [null, null];
  const labels: string[] = [];
  const datasets: ChartDataset[] = [];
  array.forEach(finances => {
    if (finances.length === 0) return;
    let amount = 0;
    finances.forEach(finance => {
      const dateSplit = finance.date.split('-');
      const monthNumber = parseInt(dateSplit[1]);
      const month = getMonthStr(monthNumber) + '-' + dateSplit[0];
      labels.findIndex(label => label === month) === -1 && labels.push(month);
      const category = finance.category.category;
      const index = datasets.findIndex(dataset => dataset.label === category);
      if (index === -1) {
        datasets.push({ label: category, data: [] });
        amount += finance.value;
      } else {
        amount += finance.value;
      }
    });
    const index = datasets.findIndex(
      dataset => dataset.label === finances[0].category.category
    );
    datasets[index].data.push(amount > 0 ? amount : null);
  });
  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue('--text-color');
  const dataChart: ChartData = { labels, datasets };
  const options: ChartOptions = {
    plugins: {
      legend: {
        align: 'center',
        position: 'top',
        labels: {
          usePointStyle: true,
          color: textColor,
          font: { size: 15 },
        },
      },
      datalabels: {
        display: false,
      },
    },
  };
  return [dataChart, options];
}
