import { DateTime } from 'luxon';
import { Linq } from 'app/utils/linq';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, HostListener, Inject, Input, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { FareRuleComponent } from '../fare-rule/fare-rule.component';
import { DomSanitizer } from '@angular/platform-browser';
import { MatRippleModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AirlineDashboardService } from 'app/services/airline-dashboard.service';

@Component({
    selector: 'app-booking-dialog',
    templateUrl: './booking-dialog.component.html',
    styleUrls: ['./booking-dialog.component.scss'],
    standalone: true,
    imports: [
        FormsModule,
        CommonModule,
        ReactiveFormsModule,
        MatRadioModule,
        MatFormFieldModule,
        MatInputModule,
        MatTooltipModule,
        MatDividerModule,
        MatButtonModule,
        MatIconModule,
        MatRippleModule,
        MatMenuModule,
        MatCheckboxModule,
    ],
})
export class BookingDialogComponent {
    retflight: any;
    depflight: any;
    selectedDFlight: any;
    selectedRFlight: any;

    @Input()
    searchdateTime: any;

    @Input()
    returnDate: any;

    selectedDepFlight: any;
    selectedRetFlight: any;

    isFilterVisibleDep = false;
    isFilterVisibleRet = false;
    @ViewChild('filterPopupDep') filterPopupRefDep!: ElementRef;
    @ViewChild('filterPopupRet') filterPopupRefRet!: ElementRef;
    selectedRefundableDep: string = 'all';
    selectedRefundableRet: string = 'all';
    uniqueFareTypesDep: any[] = [];
    uniqueFareTypesRet: any[] = [];
    holdOnlyDep: boolean = false;
    holdOnlyRet: boolean = false;


    allDepFares: any[] = [];
    depFlightAll: any[] = [];

    allRetFares: any[] = [];
    retFlightAll: any[] = [];

    constructor(
        public matDialogRef: MatDialogRef<BookingDialogComponent>,
        private matDialog: MatDialog,
        private airlineDashboardService: AirlineDashboardService,
        public sanitizer: DomSanitizer,
        private cdr: ChangeDetectorRef,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        console.log('data');
    }

    ngOnInit(): void {
        this.depFlightAll = this.data.depflight.moreFlights.data
        this.retFlightAll = this.data.retflight.moreFlights.data

        this.selectedDFlight = this.depFlightAll[0]?.id;
        this.selectedRFlight = this.retFlightAll[0]?.id;
        this.depflight = this.data.depflight;
        this.retflight = this.data.retflight;


        this.changePoint(this.selectedDFlight, 'departure');
        this.changePoint(this.selectedRFlight, 'return');



        this.allDepFares = this.depFlightAll; // Keep original unfiltered list
        this.allRetFares = this.retFlightAll; // Keep original unfiltered list
        this.extractUniqueFareTypesDep();
        this.extractUniqueFareTypesRet();
    }

    // Toggle visibility of the filter div
    fareFilterDep() {
        this.isFilterVisibleDep = !this.isFilterVisibleDep;
        this.isFilterVisibleRet = false
    }
    onFilterIconClickDep(event: MouseEvent) {
        event.stopPropagation(); // Prevent closing
        this.fareFilterDep();
    }

    fareFilterRet() {
        this.isFilterVisibleRet = !this.isFilterVisibleRet;
        this.isFilterVisibleDep = false
    }
    onFilterIconClickRet(event: MouseEvent) {
        event.stopPropagation(); // Prevent closing
        this.fareFilterRet();
    }

    // Detect clicks outside the popup
    @HostListener('document:click', ['$event'])
    onClickOutside(event: MouseEvent) {
        const clickedInsideDep = this.filterPopupRefDep?.nativeElement.contains(event.target);
        const clickedInsideRet = this.filterPopupRefRet?.nativeElement.contains(event.target);

        if (!clickedInsideDep && this.isFilterVisibleDep) {
            this.isFilterVisibleDep = false;
        }

        if (!clickedInsideRet && this.isFilterVisibleRet) {
            this.isFilterVisibleRet = false;
        }
    }

    onFareTypeChangeDep(index: number) {
        const selectedType = this.uniqueFareTypesDep[index];

        if (selectedType.name === 'All') {
            // If 'All' checkbox was toggled
            const newState = selectedType.is_selected;
            this.uniqueFareTypesDep.forEach(type => type.is_selected = newState);
        } else {
            // If any individual checkbox was toggled
            const allChecked = this.uniqueFareTypesDep
                .filter(t => t.name !== 'All')
                .every(t => t.is_selected);

            this.uniqueFareTypesDep.find(t => t.name === 'All')!.is_selected = allChecked;
        }
    }

    onFareTypeChangeRet(index: number) {
        const selectedType = this.uniqueFareTypesRet[index];

        if (selectedType.name === 'All') {
            // If 'All' checkbox was toggled
            const newState = selectedType.is_selected;
            this.uniqueFareTypesRet.forEach(type => type.is_selected = newState);
        } else {
            // If any individual checkbox was toggled
            const allChecked = this.uniqueFareTypesRet
                .filter(t => t.name !== 'All')
                .every(t => t.is_selected);

            this.uniqueFareTypesRet.find(t => t.name === 'All')!.is_selected = allChecked;
        }
    }

    extractUniqueFareTypesDep() {
        const types = this.depFlightAll.map(fare => fare.fareClassString || '');

        // Remove duplicates, trim whitespace, and filter out empty strings
        const uniqueTypes = [...new Set(types.map(type => type.trim()))]
            .filter(type => type !== '');

        this.uniqueFareTypesDep = uniqueTypes.map(x => ({ name: x, is_selected: false }));

        this.uniqueFareTypesDep.unshift({ name: "All", is_selected: false })
    }

    extractUniqueFareTypesRet() {
        const types = this.retFlightAll.map(fare => fare.fareClassString || '');

        // Remove duplicates, trim whitespace, and filter out empty strings
        const uniqueTypes = [...new Set(types.map(type => type.trim()))]
            .filter(type => type !== '');

        this.uniqueFareTypesRet = uniqueTypes.map(x => ({ name: x, is_selected: false }));

        this.uniqueFareTypesRet.unshift({ name: "All", is_selected: false })
    }

    applyFiltersDep() {
        let filtered = [...this.allDepFares];

        // 1. Fare type filter
        const selectedTypes = this.uniqueFareTypesDep.filter((x: any) => x.is_selected);
        if (selectedTypes.length) {
            filtered = filtered.filter(f => selectedTypes.map(x => x.name).includes(f.fareClassString));
        }

        // 2. Refundable filter
        if (this.selectedRefundableDep !== 'all') {
            const isRef = this.selectedRefundableDep === 'true';
            filtered = filtered.filter(f => f.is_refundable === isRef);
        }

        // 3. Hold filter
        if (this.holdOnlyDep) {
            filtered = filtered.filter(f => f.isHold);
        }

        // Update carousel data
        this.depFlightAll = filtered;
        this.isFilterVisibleDep = !this.isFilterVisibleDep;

        this.cdr.detectChanges();

        this.selectedDFlight = this.depFlightAll[0]?.id;
        this.changePoint(this.selectedDFlight, 'departure');
    }

    clearAllFiltersDep() {
        this.selectedRefundableDep = 'all';
        this.holdOnlyDep = false;
        this.uniqueFareTypesDep.forEach(type => type.is_selected = false);
        this.applyFiltersDep();
    }

    applyFiltersRet() {
        let filtered = [...this.allRetFares];

        // 1. Fare type filter
        const selectedTypes = this.uniqueFareTypesRet.filter((x: any) => x.is_selected);
        if (selectedTypes.length) {
            filtered = filtered.filter(f => selectedTypes.map(x => x.name).includes(f.fareClassString));
        }

        // 2. Refundable filter
        if (this.selectedRefundableRet !== 'all') {
            const isRef = this.selectedRefundableRet === 'true';
            filtered = filtered.filter(f => f.is_refundable === isRef);
        }

        // 3. Hold filter
        if (this.holdOnlyRet) {
            filtered = filtered.filter(f => f.isHold);
        }

        // Update carousel data
        this.retFlightAll = filtered;
        this.isFilterVisibleRet = !this.isFilterVisibleRet;

        this.cdr.detectChanges();

        this.selectedRFlight = this.retFlightAll[0]?.id;
        this.changePoint(this.selectedRFlight, 'return');

    }

    clearAllFiltersRet() {
        this.selectedRefundableRet = 'all';
        this.holdOnlyRet = false;
        this.uniqueFareTypesRet.forEach(type => type.is_selected = false);
        this.applyFiltersRet();
    }



    changePoint(v, name): void {
        if (name === 'departure') {
            this.selectedDepFlight = this.depflight.moreFlights.data.filter(y => v === y.id)
        } else if (name === 'return') {
            this.selectedRetFlight = this.retflight.moreFlights.data.filter(y => v === y.id)
        }
    }

    booking(): void {
        let retSalePrice: number = Number(this.selectedRetFlight[0]?.tempSalePrice || 0);
        let depSalePrice: number = Number(this.selectedDepFlight[0]?.tempSalePrice || 0);

        let purchasePrice: number = retSalePrice + depSalePrice;
        let formattedPurchasePrice: string = purchasePrice.toFixed(2);

        const json = {
            adultCount: this.depflight.adultCount,
            childCount: this.depflight.childCount,
            traceId: this.selectedDepFlight[0].traceId,
            resultIndex: this.airlineDashboardService.generateUniqueKey(), // This key to get resultIndex in detail page
            infantCount: this.depflight.infantCount,
            is_domestic: this.depflight.is_domestic,
            provider_id_enc: this.selectedDepFlight[0].provider_id_enc,
            returnId: '', // this.selectedRetFlight[0].id this is store in local data
            cabin_class: this.selectedDepFlight[0].cabinClass,
            trip_type: this.data.trip_type,
            returnProviderId: this.selectedRetFlight[0].provider_id_enc,
            returnTraceId: this.selectedRetFlight[0].traceId,
            returnWayFilename: this.selectedRetFlight[0].oneWayfilename,
            purchasePrice: formattedPurchasePrice,
            caching_file_name: this.selectedDepFlight[0].caching_file_name,
            return_caching_file_name: this.selectedRetFlight[0].caching_file_name
        };

        let queryParams: any = {
            flight: JSON.stringify(json),
            searchdateTime: DateTime.fromISO(this.data.searchdateTime.toString()).toFormat('yyyy-MM-dd'),
            returnDate: DateTime.fromISO(this.retflight.flightStopSegments[0].depTime.toString()).toFormat('yyyy-MM-dd'),
            filename: this.data.filename,
            travellClass: this.data.travellClass,
            caching_file_name: this.selectedDepFlight[0].caching_file_name,
            return_caching_file_name: this.selectedRetFlight[0].caching_file_name
        };

        this.airlineDashboardService.addFlightRecord(json.resultIndex, this.selectedDepFlight[0].id, this.selectedRetFlight[0].id);

        const selectedflightData = {
            baggageDetail: [{
                adultBaggage: this.depflight.flightStopSegments[0].adultBaggage,
                adultCabinBaggage: this.depflight.flightStopSegments[0].adultCabinBaggage,
                childBaggage: this.depflight.flightStopSegments[0].childBaggage,
                childCabinBaggage: this.depflight.flightStopSegments[0].childCabinBaggage,
                isRefundable: this.depflight.isRefundable,
            },
            {
                adultBaggage: this.retflight.flightStopSegments[0].adultBaggage,
                adultCabinBaggage: this.retflight.flightStopSegments[0].adultCabinBaggage,
                childBaggage: this.retflight.flightStopSegments[0].childBaggage,
                childCabinBaggage: this.retflight.flightStopSegments[0].childCabinBaggage,
                isRefundable: this.retflight.isRefundable,
            }],
            flightType: 'rt'
        };
        // this.cacheService.MainFilterChanged(selectedflightData, 'selected-flight');
        Linq.recirect('/flights/detail/booking', queryParams)
    }

    fareRule(dest: any, origin: any, val: any): void {
        this.matDialog.open(FareRuleComponent, {
            data: { data: val, destination: dest, origin: origin },
            disableClose: true,
            panelClass: ['remove-dialog-pading']
        }).afterClosed().subscribe(res => {
        });
    }

    addData(ReturnSalePrice, DepartureSalePrice) {
        return (Number(ReturnSalePrice || 0) + Number(DepartureSalePrice || 0)).toFixed(2)
    }

    purchaseData(ReturnPurchasePrice, DeparturePurchasePrice) {
        return (Number(ReturnPurchasePrice || 0) + Number(DeparturePurchasePrice || 0)).toFixed(2)
    }
}
