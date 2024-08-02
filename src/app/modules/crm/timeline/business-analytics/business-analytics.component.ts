import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe, DecimalPipe, JsonPipe } from "@angular/common";
import { Component, OnInit, OnDestroy, Input } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { MatSelectModule } from "@angular/material/select";
import { MatTooltipModule } from "@angular/material/tooltip";
import { Router } from "@angular/router";
import { ApexOptions } from "apexcharts";
import { NgApexchartsModule } from "ng-apexcharts";
import { Subject } from "rxjs";
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { CrmService } from "app/services/crm.service";

@Component({
    selector: 'app-business-analytics',
    templateUrl: './business-analytics.component.html',
    standalone: true,
    imports: [
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatButtonToggleModule,
        NgApexchartsModule,
        MatTooltipModule,
        DecimalPipe,
        NgIf,
        NgFor,
        NgClass,
        DatePipe,
        AsyncPipe,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        JsonPipe
    ]
})

export class BusinessAnalyticsComponent implements OnInit, OnDestroy {
    chartVisitors: ApexOptions;
    chartPlatform: ApexOptions;
    modeOfPayment: ApexOptions;
    chartService: ApexOptions;
    yearForList = [
        { viewValue: '3 Month', value: 3 },
        { viewValue: '6 Month', value: 6 },
        { viewValue: '9 Month', value: 9 },
        { viewValue: '1 Year', value: 12 }];

    serviceForList = [
        { viewValue: 'Volume', value: "Volume" },
        { viewValue: 'Bookings', value: "Bookings" },
        { viewValue: 'Pax', value: "Pax" }];

    selectedService: any;
    selectedYear: any;
    selectedBAService: string;
    baService: any;
    baYear: any;
    paService: any;
    paYear: any;
    selectedBAYear: any;
    selectedSeries: any;
    apiData: any = [];
    businessPerformanceAPIData: any = [];
    platformColorArray: any[] = [];
    platformLableArray: any[] = [];
    platformPerArray: any[] = [];
    mopColorArray: any[] = [];
    mopLableArray: any[] = [];
    mopPerArray: any[] = [];
    serviceColorArray: any[] = [];
    serviceLableArray: any[] = [];
    servicePerArray: any[] = [];
    record: any = {};
    colors: string[] = [];
    volumeMonths: string[] = [];
    volumeValues: number[] = [];
    chartName: string;
    businessPerformanceMonthsList: any[];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    @Input() basicDetails: any = {}
    constructor(
        private _router: Router,
        private crmService: CrmService
    ) {
    }

    ngOnInit(): void {
        this.selectedBAService = this.serviceForList[0].viewValue;
        this.selectedBAYear = this.yearForList[0].value;
        this.selectedService = this.serviceForList[0].viewValue;
        this.selectedYear = this.yearForList[0].value;
        // this.businessPerformanceAPI();
        // this.businessAnalyticsAPI();
        // window['Apex'] = {
        //     chart: {
        //         events: {
        //             mounted: (chart: any, options?: any): void => {
        //                 this._fixSvgFill(chart.el);
        //             },
        //             updated: (chart: any, options?: any): void => {
        //                 this._fixSvgFill(chart.el);
        //             },
        //         },
        //     },
        // };
        // this._prepareChartData();
    }

    ngAfterViewInit(): void {
        this.businessPerformanceAPI();
        this.businessAnalyticsAPI();
    }

    getStaticHexColors(count: number): string[] {
        return this.staticHexColors.slice(0, count);
    }

    staticHexColors: string[] = [
        '#0050FF', '#FFCB00', '#3AC977', '#BE262C', '#FF5C00', '#6009D1', '#FFFFFF', '#F8F8FF', '#DAA520', '#696969',
        '#123456', '#654321', '#FFFAF0', '#7FFF00', '#D2691E', '#FF7F50', '#6495ED', '#FFF8DC', '#DC143C', '#00FFFF',
        '#00008B', '#008B8B', '#B8860B', '#A9A9A9', '#006400', '#BDB76B', '#8B008B', '#556B2F', '#FF8C00', '#9932CC',
        '#8B0000', '#E9967A', '#8FBC8F', '#483D8B', '#2F4F4F', '#00CED1', '#9400D3', '#FF1493', '#00BFFF', '#696969',
        '#1E90FF', '#B22222', '#FFFAF0', '#228B22', '#FF00FF', '#DCDCDC', '#F8F8FF', '#FFD700', '#DAA520', '#3357FF'
    ];

    businessAnalyticsAPI() {
        let payload = {
            agent_id: this.basicDetails?.id,
            month: this.baYear ? this.baYear : this.selectedBAYear,
            Filter: this.baService ? this.baService : this.selectedBAService
        }
        this.chartName = this.baService ? this.baService : this.selectedBAService;
        // let payload = {
        //     "agent_id": "ger23blzYXixsFpD2dL9cgaC0$aC0$",
        //     "month": 3,
        //     "Filter": this.baService ? this.baService : this.selectedBAService
        // }

        this.crmService.getBusinessAnalyticsApiData(payload).subscribe(data => {
            this.apiData = data;
            this.extractPlatformBusinessAnalytics();
            this.extractMOPBusinessAnalytics();
            this.extractServiceBusinessAnalytics();
        });
    }

    changePAService(event: any) {
        this.paService = event.value;
        this.businessPerformanceAPI();
    }

    changePAYear(event: any) {
        this.paYear = event.value;
        this.businessPerformanceAPI();
    }

    changeBAService(event: any) {
        this.baService = event.value;
        this.businessAnalyticsAPI();
    }

    changeBAYear(event: any) {
        this.baYear = event.value;
        this.businessAnalyticsAPI();
    }

    businessPerformanceAPI() {
        this.chartName = this.paService ? this.paService : this.selectedService;
        let payload = {
            agent_id: this.basicDetails?.id,
            month: this.paYear ? this.paYear : this.selectedYear,
            Filter: this.paService ? this.paService : this.selectedService
        }
        this.crmService.getBusinessPerformance(payload).subscribe(data => {
            this.businessPerformanceAPIData = data;

            if (this.selectedService == 'Volume') {
                if (this.businessPerformanceAPIData && this.businessPerformanceAPIData.monthlySaleAmounts) {
                    this.volumeMonths = Object.keys(this.businessPerformanceAPIData?.monthlySaleAmounts);
                    this.volumeValues = Object.values(this.businessPerformanceAPIData?.monthlySaleAmounts);
                }

                // let volumeMonths: string[] = this.businessPerformanceAPIData?.monthlySaleAmounts.map(item => item.key);
                // this.volumeMonths = volumeMonths;

                // let volumeValues: any[] = this.businessPerformanceAPIData?.monthlySaleAmounts.map(item => item.value);
                // this.volumeValues = volumeValues;
            }
            else if (this.selectedService == 'Pax') {
                if (this.businessPerformanceAPIData && this.businessPerformanceAPIData.monthlySaleAmounts) {
                    this.volumeMonths = Object.keys(this.businessPerformanceAPIData?.monthlySaleAmounts);
                    this.volumeValues = Object.values(this.businessPerformanceAPIData?.monthlySaleAmounts);
                }
                // this.volumeMonths = Object.keys(this.businessPerformanceAPIData?.monthWise_Pax);
                // this.volumeValues = Object.values(this.businessPerformanceAPIData?.monthWise_Pax);

                // let monthList: string[] = this.businessPerformanceAPIData?.monthWise_Pax.map(item => item.month);
                // this.volumeMonths = monthList;

                // let volumeList: any[] = this.businessPerformanceAPIData?.monthWise_Pax.map(item => item.pax);
                // this.volumeValues = volumeList;
            }
            else if (this.selectedService == 'Bookings') {
                // this.volumeMonths = Object.keys(this.businessPerformanceAPIData?.servicesWisePax);
                // this.volumeValues = Object.values(this.businessPerformanceAPIData?.servicesWisePax);

                if (this.businessPerformanceAPIData && this.businessPerformanceAPIData.monthlySaleAmounts) {
                    this.volumeMonths = Object.keys(this.businessPerformanceAPIData?.monthlySaleAmounts);
                    this.volumeValues = Object.values(this.businessPerformanceAPIData?.monthlySaleAmounts);
                }
                // let monthList: string[] = this.businessPerformanceAPIData?.servicesWisePax.map(item => item.month);
                // this.volumeMonths = monthList;

                // let volumeList: any[] = this.businessPerformanceAPIData?.servicesWisePax.map(item => item.booking);
                // this.volumeValues = volumeList;
            }
            this._prepareChartData();
            window['Apex'] = {
                chart: {
                    events: {
                        mounted: (chart: any, options?: any): void => {
                            this._fixSvgFill(chart.el);
                        },
                        updated: (chart: any, options?: any): void => {
                            this._fixSvgFill(chart.el);
                        },
                    },
                },
            };
        });
    }

    extractPlatformBusinessAnalytics(): void {
        if (this.apiData) {
            if (this.selectedBAService == 'Volume') {
                this.platformLableArray = this.apiData?.platformWiseList.map(item => item.platfrom);
                this.platformPerArray = this.apiData?.platformWiseList.map(item => item.percentage);

                if (this.apiData.platformWiseList.length > 0) {
                    this.colors = this.getStaticHexColors(this.apiData.platformWiseList.length);

                    this.apiData.platformWiseList = this.apiData.platformWiseList.map((item, index) => ({
                        ...item, backgroundColor: this.colors[index]
                    }));
                    this.platformColorArray = this.apiData.platformWiseList.map(item => item.backgroundColor);
                }
            }
            else if (this.selectedBAService == 'Pax') {
                this.platformLableArray = this.apiData?.platformWisePax.map(item => item.platform);
                this.platformPerArray = this.apiData?.platformWisePax.map(item => item.percentage);

                if (this.apiData.platformWisePax.length > 0) {
                    this.colors = this.getStaticHexColors(this.apiData.platformWisePax.length);

                    this.apiData.platformWisePax = this.apiData.platformWisePax.map((item, index) => ({
                        ...item, backgroundColor: this.colors[index]
                    }));
                    this.platformColorArray = this.apiData.platformWisePax.map(item => item.backgroundColor);
                }
            }
            else if (this.selectedBAService == 'Bookings') {
                this.platformLableArray = this.apiData?.platformWiseList.map(item => item.platfrom);
                this.platformPerArray = this.apiData?.platformWiseList.map(item => item.percentage);

                if (this.apiData.platformWiseList.length > 0) {
                    this.colors = this.getStaticHexColors(this.apiData.platformWiseList.length);

                    this.apiData.platformWiseList = this.apiData.platformWiseList.map((item, index) => ({
                        ...item, backgroundColor: this.colors[index]
                    }));
                    this.platformColorArray = this.apiData.platformWiseList.map(item => item.backgroundColor);
                }
            }
        }
    }

    extractMOPBusinessAnalytics(): void {
        if (this.apiData) {
            if (this.selectedBAService == 'Volume') {
                this.mopLableArray = this.apiData?.paymentMethodWiseList.map(item => item.modeOfPayment);
                this.mopPerArray = this.apiData?.paymentMethodWiseList.map(item => item.percentage);

                if (this.apiData.paymentMethodWiseList.length > 0) {
                    this.colors = this.getStaticHexColors(this.apiData.paymentMethodWiseList.length);

                    this.apiData.paymentMethodWiseList = this.apiData.paymentMethodWiseList.map((item, index) => ({
                        ...item, backgroundColor: this.colors[index]
                    }));
                    this.mopColorArray = this.apiData.paymentMethodWiseList.map(item => item.backgroundColor);
                }
            }
            else if (this.selectedBAService == 'Pax') {
                this.mopLableArray = this.apiData?.paymentMethodWisePax.map(item => item.paymentMethod);
                this.mopPerArray = this.apiData?.paymentMethodWisePax.map(item => item.percentage);

                if (this.apiData.paymentMethodWisePax.length > 0) {
                    this.colors = this.getStaticHexColors(this.apiData.paymentMethodWisePax.length);

                    this.apiData.paymentMethodWisePax = this.apiData.paymentMethodWisePax.map((item, index) => ({
                        ...item, backgroundColor: this.colors[index]
                    }));
                    this.mopColorArray = this.apiData.paymentMethodWisePax.map(item => item.backgroundColor);
                }
            }
            else if (this.selectedBAService == 'Bookings') {
                this.mopLableArray = this.apiData?.paymentMethodWiseList.map(item => item.modeOfPayment);
                this.mopPerArray = this.apiData?.paymentMethodWiseList.map(item => item.percentage);

                if (this.apiData.paymentMethodWiseList.length > 0) {
                    this.colors = this.getStaticHexColors(this.apiData.paymentMethodWiseList.length);

                    this.apiData.paymentMethodWiseList = this.apiData.paymentMethodWiseList.map((item, index) => ({
                        ...item, backgroundColor: this.colors[index]
                    }));
                    this.mopColorArray = this.apiData.paymentMethodWiseList.map(item => item.backgroundColor);
                }
            }
        }
    }

    extractServiceBusinessAnalytics(): void {
        if (this.apiData) {
            if (this.selectedBAService == 'Volume') {
                this.serviceLableArray = this.apiData?.servicesWiseListing.map(item => item.serviceType);
                this.servicePerArray = this.apiData?.servicesWiseListing.map(item => item.percentage);

                if (this.apiData.servicesWiseListing.length > 0) {
                    this.colors = this.getStaticHexColors(this.apiData.servicesWiseListing.length);

                    this.apiData.servicesWiseListing = this.apiData.servicesWiseListing.map((item, index) => ({
                        ...item, backgroundColor: this.colors[index]
                    }));
                    this.serviceColorArray = this.apiData.servicesWiseListing.map(item => item.backgroundColor);
                }
            }
            else if (this.selectedBAService == 'Pax') {
                this.serviceLableArray = this.apiData?.serviceWisePax.map(item => item.serviceType);
                this.servicePerArray = this.apiData?.serviceWisePax.map(item => item.percentage);

                if (this.apiData.serviceWisePax.length > 0) {
                    this.colors = this.getStaticHexColors(this.apiData.serviceWisePax.length);

                    this.apiData.serviceWisePax = this.apiData.serviceWisePax.map((item, index) => ({
                        ...item, backgroundColor: this.colors[index]
                    }));
                    this.serviceColorArray = this.apiData.serviceWisePax.map(item => item.backgroundColor);
                }
            }
            else if (this.selectedBAService == 'Bookings') {
                this.serviceLableArray = this.apiData?.servicesWiseListing.map(item => item.serviceType);
                this.servicePerArray = this.apiData?.servicesWiseListing.map(item => item.percentage);

                if (this.apiData.servicesWiseListing.length > 0) {
                    this.colors = this.getStaticHexColors(this.apiData.servicesWiseListing.length);

                    this.apiData.servicesWiseListing = this.apiData.servicesWiseListing.map((item, index) => ({
                        ...item, backgroundColor: this.colors[index]
                    }));
                    this.serviceColorArray = this.apiData.servicesWiseListing.map(item => item.backgroundColor);
                }
            }
        }

        this._prepareChartData();
        window['Apex'] = {
            chart: {
                events: {
                    mounted: (chart: any, options?: any): void => {
                        this._fixSvgFill(chart.el);
                    },
                    updated: (chart: any, options?: any): void => {
                        this._fixSvgFill(chart.el);
                    },
                },
            },
        };
    }

    refreshItems() {
        // this.ngOnInit();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    private _fixSvgFill(element: Element): void {
        const currentURL = this._router.url;
        Array.from(element.querySelectorAll('*[fill]'))
            .filter(el => el.getAttribute('fill').indexOf('url(') !== -1)
            .forEach((el) => {
                const attrVal = el.getAttribute('fill');
                el.setAttribute('fill', `url(${currentURL}${attrVal.slice(attrVal.indexOf('#'))}`);
            });
    }

    private _prepareChartData(): void {
        this.chartVisitors = {
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
                type: 'area',
                toolbar: {
                    show: false,
                },
                zoom: {
                    enabled: false,
                },
            },
            colors: ['#818CF8'],
            dataLabels: {
                enabled: false,
            },
            fill: {
                colors: ['#312E81'],
            },
            grid: {
                show: true,
                borderColor: '#334155',
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
                    name: this.chartName,
                    data: this.volumeValues
                    // data: [501, 101, 250],
                },
            ],
            stroke: {
                width: 2,
            },
            tooltip: {
                followCursor: true,
                theme: 'dark',
                x: {
                    format: 'MMM dd, yyyy',
                },
                y: {
                    formatter: (value: number): string => `${value}`,
                },
            },
            xaxis: {
                // categories: ['January 2024', 'Feb 2024', 'Mar 2024'],
                categories: this.volumeMonths,
                labels: {
                    show: true,
                    style: {
                        colors: '#FFFFFF',
                        fontSize: '12px',
                    },
                },
            },
            yaxis: {
                show: false
            },
        };

        // Platform
        this.chartPlatform = {
            chart: {
                animations: {
                    speed: 400,
                    animateGradually: {
                        enabled: false,
                    },
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'donut',
                sparkline: {
                    enabled: true,
                },
            },
            colors: this.platformColorArray,
            // colors: ['#FF0000'],
            labels: this.platformLableArray,
            plotOptions: {
                pie: {
                    customScale: 0.9,
                    expandOnClick: false,
                    donut: {
                        size: '70%',
                    },
                },
            },
            series: this.platformPerArray,
            states: {
                hover: {
                    filter: {
                        type: 'none',
                    },
                },
                active: {
                    filter: {
                        type: 'none',
                    },
                },
            },
            tooltip: {
                enabled: true,
                fillSeriesColor: false,
                theme: 'dark',
                custom: ({
                    seriesIndex,
                    w,
                }): string => `<div class="flex items-center h-8 min-h-8 max-h-8 px-3">
                                                        <div class="w-3 h-3 rounded-full" style="background-color: ${w.config.colors[seriesIndex]};"></div>
                                                        <div class="ml-2 text-md leading-none">${w.config.labels[seriesIndex]}:</div>
                                                        <div class="ml-2 text-md font-bold leading-none">${w.config.series[seriesIndex]}%</div>
                                                    </div>`,
            },
        };

        // mop
        this.modeOfPayment = {
            chart: {
                animations: {
                    speed: 400,
                    animateGradually: {
                        enabled: false,
                    },
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'donut',
                sparkline: {
                    enabled: true,
                },
            },
            colors: this.mopColorArray,
            labels: this.mopLableArray,
            plotOptions: {
                pie: {
                    customScale: 0.9,
                    expandOnClick: false,
                    donut: {
                        size: '70%',
                    },
                },
            },
            series: this.mopPerArray,
            states: {
                hover: {
                    filter: {
                        type: 'none',
                    },
                },
                active: {
                    filter: {
                        type: 'none',
                    },
                },
            },
            tooltip: {
                enabled: true,
                fillSeriesColor: false,
                theme: 'dark',
                custom: ({
                    seriesIndex,
                    w,
                }): string => `<div class="flex items-center h-8 min-h-8 max-h-8 px-3">
                                                     <div class="w-3 h-3 rounded-full" style="background-color: ${w.config.colors[seriesIndex]};"></div>
                                                     <div class="ml-2 text-md leading-none">${w.config.labels[seriesIndex]}:</div>
                                                     <div class="ml-2 text-md font-bold leading-none">${w.config.series[seriesIndex]}%</div>
                                                 </div>`,
            },
        };

        // Service
        this.chartService = {
            chart: {
                animations: {
                    speed: 400,
                    animateGradually: {
                        enabled: false,
                    },
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'donut',
                sparkline: {
                    enabled: true,
                },
            },
            // colors: ['#FF0000'],
            colors: this.serviceColorArray,
            labels: this.serviceLableArray,
            plotOptions: {
                pie: {
                    customScale: 0.9,
                    expandOnClick: false,
                    donut: {
                        size: '70%',
                    },
                },
            },
            series: this.servicePerArray,
            states: {
                hover: {
                    filter: {
                        type: 'none',
                    },
                },
                active: {
                    filter: {
                        type: 'none',
                    },
                },
            },
            tooltip: {
                enabled: true,
                fillSeriesColor: false,
                theme: 'dark',
                custom: ({
                    seriesIndex,
                    w,
                }): string => `<div class="flex items-center h-8 min-h-8 max-h-8 px-3">
                                                    <div class="w-3 h-3 rounded-full" style="background-color: ${w.config.colors[seriesIndex]};"></div>
                                                    <div class="ml-2 text-md leading-none">${w.config.labels[seriesIndex]}:</div>
                                                    <div class="ml-2 text-md font-bold leading-none">${w.config.series[seriesIndex]}%</div>
                                                </div>`,
            },
        };
    }
}
