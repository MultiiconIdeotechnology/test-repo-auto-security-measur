import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApexOptions } from "apexcharts";
import { NgApexchartsModule } from "ng-apexcharts";
import { MatTooltipModule } from '@angular/material/tooltip';
import { commonUseService } from 'app/services/common-use.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import cloneDeep from "lodash/cloneDeep";
import { Subject, takeUntil } from 'rxjs';
import { FuseConfig, FuseConfigService } from '@fuse/services/config';

@Component({
  selector: 'app-campaign-summary-chart',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    NgApexchartsModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatSelectModule,
    DropdownModule,
    FormsModule
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
  yearArr: any[] = [];
  uiqueYearArr: any[] = [];
  selectedYear: any;
  showDropdownYear: boolean = false;
  originalXAxisData: any = [];
  originalYAxisData: any = [];

  chartThemeMap = {
    light: {
      arrayColor: '#a7a2a287',
      borderColor: '#a7a2a287',
      fillColor: '#312E81',
      textColor: '#222831',
      tooltipTheme: 'light',
    },
    dark: {
      arrayColor: '#818CF8',
      borderColor: '#334155',
      fillColor: '#312E81',
      textColor: '#ffffff',
      tooltipTheme: 'dark',
    }
  };
    private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    // private refferralService: RefferralService,
    public matDialogRef: MatDialogRef<CampaignSummaryChartComponent>,
    private commonUseService: commonUseService,
    private _fuseConfigService: FuseConfigService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.record = data?.record;
    this.montWiseData = this.record?.monthWiseData;
    this.key = data?.key;
  }

  ngOnInit(): void {
     this._fuseConfigService.config$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((config: FuseConfig) => {
                    // Store the config
                    this.theme= config.scheme;
                    this.initializingChart(this.selectedTab, this.theme)
      this.manageData();
                });
                
    // this.commonUseService.currentTheme$.subscribe((theme: any) => {
    //   console.log("theme1234", theme);
      
    //   this.theme = theme;
      
    // });

  }

  manageData() {
    for (let el of this.montWiseData) {
      this.yAxisData.push(el[this.key]);
      this.yearArr.push(el['year']);
      this.xAxisData.push(this.monthYearFormat(el['monthName'], el['year']));
    }

    this.originalXAxisData = cloneDeep(this.xAxisData);
    console.log("originalXAxisData", this.originalXAxisData);
    this.originalYAxisData = cloneDeep(this.yAxisData);
    let maxYear = Math.max(...this.yearArr);
    let minYear = Math.min(...this.yearArr);
    console.log("xAxisData", this.xAxisData);

    if (maxYear != minYear) {
      this.showDropdownYear = true;
    }
    this.uiqueYearArr = cloneDeep([...new Set(this.yearArr)]);
    this.initializingChart(this.selectedTab, this.theme);
  }

  onYearSelect(event: any) {
    
    this.xAxisData = [];
    this.yAxisData = [];
    if(event.value){
      this.xAxisData = this.originalXAxisData.filter((item: any) => {
        let slicedYear = item ? item.split('-')[1]: null;
        return slicedYear === event.value.slice(-2);
      });
  
      this.montWiseData.forEach((item: any) => {
        if (item?.year == event.value) {
          this.yAxisData.push(item[this.key]);
        }
      })

    } else {
      this.onClearYear()
    }
    this.initializingChart(this.selectedTab, this.theme);
  }

  onClearYear() {
    this.xAxisData = this.originalXAxisData;
    this.yAxisData = this.originalYAxisData;
    this.selectedYear = '';
    this.initializingChart(this.selectedTab, this.theme)
  }

  initializingChart(chartType: any, theme: 'light' | 'dark') {
    const themeColors = this.chartThemeMap[theme];

    this.areaChartConfig = {
      chart: {
        animations: {
          enabled: true,
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 50
          },
          dynamicAnimation: {
            enabled: true,
            speed: 50
          }
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
          rotate: -45,
          rotateAlways: false,
          hideOverlappingLabels: true,
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
    this.selectedYear = '';
    this.selectedTab = tabName;
    this.xAxisData = this.originalXAxisData;
    this.yAxisData = this.originalYAxisData;
    this.initializingChart(this.selectedTab, this.theme)
  }

  monthYearFormat(month: string, year: any): string {
    const monthMap: { [key: string]: string } = {
      january: 'Jan',
      february: 'Feb',
      march: 'Mar',
      april: 'Apr',
      may: 'May',
      june: 'Jun',
      july: 'Jul',
      august: 'Aug',
      september: 'Sep',
      october: 'Oct',
      november: 'Nov',
      december: 'Dec'
    };

    const shortMonth = monthMap[month.toLowerCase()];

    const shortYear = year.slice(-2);
    return `${shortMonth}-${shortYear}`;
  }

      ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

}
