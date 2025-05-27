import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApexOptions } from "apexcharts";
import { NgApexchartsModule } from "ng-apexcharts";
import { MatTooltipModule } from '@angular/material/tooltip';
import { commonUseService } from 'app/services/common-use.service';

@Component({
  selector: 'app-campaign-summary-chart',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    NgApexchartsModule,
    MatTooltipModule
  ],
  templateUrl: './campaign-summary-chart.component.html',
  styleUrls: ['./campaign-summary-chart.component.scss']
})
export class CampaignSummaryChartComponent {
  areaChartConfig: ApexOptions;
  barChartConfig: ApexOptions;

  selectedTab: string = 'area';
  key: string = "";
  record: any = {};
  montWiseData: any = [];
  xAxisData: any[] = [];
  yAxisData: any[] = [];
  theme: any = 'dark';

  chartThemeMap = {
    light: {
      arrayColor:'#a7a2a287',
      borderColor: '#a7a2a287',
      fillColor: '#312E81',
      textColor: '#222831',
      tooltipTheme: 'light',
    },
    dark: {
      arrayColor:'#818CF8',
      borderColor: '#334155',
      fillColor: '#312E81',
      textColor: '#ffffff',
      tooltipTheme: 'dark',
    }
  };

  constructor(
    // private refferralService: RefferralService,
    public matDialogRef: MatDialogRef<CampaignSummaryChartComponent>,
    private commonUseService: commonUseService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.record = data?.record;
    this.montWiseData = this.record?.monthWiseData;
    this.key = data?.key;
  }

  ngOnInit(): void {
    this.commonUseService.currentTheme$.subscribe((theme: any) => {
      this.theme = theme;
      this.initializingChart(this.selectedTab, this.theme)
    });

    this.manageData();
  }

  manageData() {
    for (let el of this.montWiseData) {
      this.yAxisData.push(el[this.key]);
      this.xAxisData.push(this.monthYearFormat(el['monthName'], el['year']));
    }
    this.initializingChart(this.selectedTab, this.theme);
    console.log("yAxisData", this.yAxisData);
    console.log("xAxisData", this.xAxisData);
  }

  initializingChart(chartType: any, theme: 'light' | 'dark') {
    const themeColors = this.chartThemeMap[theme];

    this.areaChartConfig = {
      chart: {
        animations: {
          speed: 400,
          animateGradually: {
            enabled: false,
          },
        },
        fontFamily: 'inherit',
        foreColor: 'inherit',
        width: '100%',
        height: 300,
        type: chartType,
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      colors: [themeColors.arrayColor],
      dataLabels: {
        enabled: false,
      },
      fill: {
        colors: [themeColors.fillColor],
      },
      grid: {
        show: true,
        borderColor: themeColors.borderColor,
        padding: {
          top: 15,
          bottom: 0,
          left: 34,
          right: 14,
        },
        position: 'back',
        xaxis: {
          lines: {
            show: true,
          },
        },
      },
      series: [
        {
          name: this.data.hoverName,
          data: this.yAxisData,
        },
      ],
      stroke: {
        width: 2,
      },
      tooltip: {
        followCursor: true,
        theme: themeColors.tooltipTheme,
        x: {
          format: 'MMM dd, yyyy',
        },
        y: {
          formatter: (value: number): string => `${value}`,
        },
      },
      xaxis: {
        categories: this.xAxisData,
        labels: {
          show: true,
          style: {
            colors: themeColors.textColor,
            fontSize: '12px',
          },
        },
      },
      yaxis: {
        labels: {
          show: true,
          style: {
            colors: themeColors.textColor,
            fontSize: '12px',
          },
        },
      },
    };
  }


  onTabChange(tabName: string) {
    this.selectedTab = tabName;
    this.initializingChart(this.selectedTab, this.theme)
  }

  monthYearFormat(month: string, year: any): string {
    const monthMap: { [key: string]: string } = {
      january: 'jan',
      february: 'feb',
      march: 'mar',
      april: 'apr',
      may: 'may',
      june: 'jun',
      july: 'jul',
      august: 'aug',
      september: 'sep',
      october: 'oct',
      november: 'nov',
      december: 'dec'
    };

    const shortMonth = monthMap[month.toLowerCase()];

    const shortYear = year.slice(-2);
    return `${shortMonth}-${shortYear}`;
  }

}
