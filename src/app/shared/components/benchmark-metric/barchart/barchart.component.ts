import { Component, Input, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';

export enum Metric {
  'pay',
  'turnover',
  'qualification',
  'sickness',
}

@Component({
  selector: 'app-barchart',
  templateUrl: './barchart.component.html',
  styleUrls: ['./barchart.component.scss'],
})
export class BarchartComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts;

  @Input('yourworkplace') private yourworkplace: number = null;
  @Input('comparisongroup') private comparisongroup: number = null;
  @Input('goodcqc') private goodcqc: number = null;
  @Input('lowturnover') private lowturnover: number = null;
  @Input('altdescription') private altdescription: string = '';
  @Input('nodata') private nodata: string = '';
  @Input('type') private type: Metric;

  public barchart: Highcharts.Options;

  ngOnInit() {
    const type = this.type;
    const formatPay = (data) => {
      return '£' + (Number(data) / 100).toFixed(2);
    };
    const nodata = this.nodata;
    this.barchart = {
      chart: {
        type: 'column',
        margin: [20, 0, 90, 0],
        scrollablePlotArea: {
          minWidth: 700,
        },
        events: {
          load: function () {
            const categoryWidth = this.plotWidth / this.xAxis[0].series[0].data.length;
            let width = categoryWidth;

            this.series[0].points.forEach((point, index) => {
              if (point.y === null && (index === 0 || index === 1 || this.series[0].points[index - 1]?.y !== null)) {
                let message;
                if (point.name !== 'Your workplace') {
                  message = 'We do not have enough data to show this comparison yet.';
                  if (this.series[0].points[index + 1]?.y === null && this.series[0].points[index + 2]?.y === null) {
                    width = categoryWidth * 3;
                  } else if (this.series[0].points[index + 1]?.y === null) {
                    width = categoryWidth * 2;
                  }
                } else {
                  switch (nodata) {
                    case 'nopay':
                      message = "You've not added any data about hourly pay yet.";
                      break;
                    default:
                      '';
                  }
                }

                const offset = point.x * categoryWidth + width / 2;
                const text = this.renderer
                  .text('<span class="govuk-body">' + message + '</span>', -999, -999, true)
                  .css({
                    width,
                  })
                  .add();
                text.attr({
                  x: this.plotLeft + offset - text.getBBox().width / 2,
                  y: this.plotTop + this.plotHeight / 2,
                });
              }
            });
          },
        },
      },
      series: [
        {
          accessibility: {
            description: this.altdescription,
            enabled: true,
          },
          data: [
            { y: this.yourworkplace, color: '#28a197', name: 'Your workplace' },
            { y: this.comparisongroup, name: 'Comparison group' },
            { y: this.goodcqc, name: 'Good and outstanding CQC providers in your comparison group' },
            { y: this.lowturnover, name: 'Workplaces with a low turnover rate in your comparison group' },
          ],
          type: 'column',
          color: '#6F72AF',
          dataLabels: {
            enabled: true,
            align: 'left',
            padding: 0,
            useHTML: true,
            formatter: function () {
              let value;
              switch (type) {
                case Metric.pay:
                  value = formatPay(this.y);
                  break;
                case Metric.sickness:
                  value = this.y + ' days';
                  break;
                default:
                  value = this.y + '%';
              }
              const size = this.key === 'Your workplace' ? 'govuk-heading-xl' : 'govuk-heading-m';
              return '<span class="' + size + ' govuk-!-margin-bottom-2">' + value + '</span>';
            },
            nullFormatter: function () {
              return 'this value is null';
            },
            crop: false,
            overflow: 'allow',
          },
          showInLegend: false,
          groupPadding: 0,
          pointPadding: 0.03,
        },
      ],
      yAxis: {
        visible: false,
      },
      xAxis: {
        type: 'category',
        labels: {
          useHTML: true,
          formatter: function () {
            const bold = this.isFirst ? 'govuk-!-font-weight-bold' : 'govuk-!-font-weight-regular';
            return '<span class="govuk-body ' + bold + '">' + this.value + '</span>';
          },
        },
      },
      responsive: {
        rules: [
          {
            condition: {
              maxWidth: 500,
            },
            chartOptions: {
              xAxis: {},
            },
          },
        ],
      },
      tooltip: {
        enabled: false,
      },
      credits: {
        enabled: false,
      },
      title: {
        text: null,
      },
    };
  }
}
