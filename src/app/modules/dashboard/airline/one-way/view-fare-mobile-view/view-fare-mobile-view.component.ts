import { MatRadioModule } from '@angular/material/radio';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, OnDestroy, OnInit, Output, HostListener, ViewChild, ElementRef, NgModule, ChangeDetectorRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from 'app/core/user/user.service';
import { Subject, takeUntil } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
// import { FareRuleComponent } from '../../fare-rule/fare-rule.component';
import { AuthService } from 'app/core/auth/auth.service';
import { SlickCarouselComponent, SlickCarouselModule } from 'ngx-slick-carousel';
import { MatRippleModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonUtils } from 'app/utils/commonutils';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-view-fare-mobile-view',
    templateUrl: './view-fare-mobile-view.component.html',
    styleUrls: ['./view-fare-mobile-view.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        SlickCarouselModule,
        MatRippleModule,
        MatMenuModule,
        MatRadioModule,
        MatCheckboxModule,
        FormsModule,
    ]
})
export class ViewFareMobileViewComponent implements OnInit, OnDestroy {
    @Output() bookEvent: EventEmitter<any> = new EventEmitter();
    user: any = {};
    _unsubscribeAll: Subject<any> = new Subject<any>();
    slideConfig: any = null;
    showLeftArrow: boolean = false;
    showRightArrow: boolean = true;
    totalSlides: number;
    // isMobileView = CommonUtils.isMobileView()
    // moreFlightAll: any[]
    @ViewChild('slickModal') slickModal?: SlickCarouselComponent;
    showCarousel = true;
    isFilterVisible = false;
    @ViewChild('filterPopup') filterPopupRef!: ElementRef;
    uniqueFareTypes: any[] = [];
    fareTypeSelection: { [key: string]: boolean } = {};
    selectedRefundable: string = 'all';
    holdOnly: boolean = false;
    allFares: any[] = [];        // Unfiltered original data
    moreFlightAll: any[] = [];   // Filtered and displayed list (bound to the carousel)
    
    carouselKey = 0;
    constructor(
        public matDialogRef: MatDialogRef<ViewFareMobileViewComponent>,
        private _userService: UserService,
        private cdr: ChangeDetectorRef,
        private matDialog: MatDialog,
        public authService: AuthService,
        public sanitizer: DomSanitizer,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this._userService.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((user: any) => {
            this.user = user;
        });

        this.moreFlightAll = this.data?.moreFlights?.data

        // Get the total number of slides dynamically
        this.totalSlides = this.data?.moreFlights?.data?.length;
        this.updateSlideConfig();
    }

    ngOnInit() {
        // Initially show only the right arrow (if more than 1 slide)
        this.updateArrowVisibility(0);
        this.allFares = this.moreFlightAll; // Keep original unfiltered list
        this.extractUniqueFareTypes();
    }

    // Toggle visibility of the filter div
    fareFilter() {
        this.isFilterVisible = !this.isFilterVisible;
    }

    onFilterIconClick(event: MouseEvent) {
        event.stopPropagation(); // Prevent closing
        this.fareFilter();
    }

    // Detect clicks outside the popup
    @HostListener('document:click', ['$event'])
    onClickOutside(event: MouseEvent) {
        const clickedInside = this.filterPopupRef?.nativeElement.contains(event.target);
        if (!clickedInside && this.isFilterVisible) {
            this.isFilterVisible = false;
        }
    }

    extractUniqueFareTypes() {
        const types = this.moreFlightAll.map(fare => fare.fareClassString || '');

        // Remove duplicates, trim whitespace, and filter out empty strings
        const uniqueTypes = [...new Set(types.map(type => type.trim()))]
            .filter(type => type !== '');

        this.uniqueFareTypes = uniqueTypes.map(x => ({ name: x, is_selected: false }));

        this.uniqueFareTypes.unshift({ name: "All", is_selected: false })
    }

    applyFilters() {
        this.showCarousel = false;
        let filtered = [...this.allFares];

        // 1. Fare type filter
        const selectedTypes = this.uniqueFareTypes.filter((x: any) => x.is_selected);
        if (selectedTypes.length) {
            filtered = filtered.filter(f => selectedTypes.map(x => x.name).includes(f.fareClassString));
        }

        // 2. Refundable filter
        if (this.selectedRefundable !== 'all') {
            const isRef = this.selectedRefundable === 'true';
            filtered = filtered.filter(f => f.is_refundable === isRef);
        }

        // 3. Hold filter
        if (this.holdOnly) {
            filtered = filtered.filter(f => f.isHold);
        }

        // Update carousel data
        this.moreFlightAll = filtered;
        this.isFilterVisible = !this.isFilterVisible;

        this.updateSlideConfig();
        this.cdr.detectChanges();
        setTimeout(() => {
            this.showCarousel = true;
            this.cdr.detectChanges();

            // 4. Call arrow visibility manually after carousel is rendered
            setTimeout(() => {
                this.updateArrowVisibility(0);
            });
        });
    }

    onFareTypeChange(index: number) {
        const selectedType = this.uniqueFareTypes[index];

        if (selectedType.name === 'All') {
            // If 'All' checkbox was toggled
            const newState = selectedType.is_selected;
            this.uniqueFareTypes.forEach(type => type.is_selected = newState);
        } else {
            // If any individual checkbox was toggled
            const allChecked = this.uniqueFareTypes
                .filter(t => t.name !== 'All')
                .every(t => t.is_selected);

            this.uniqueFareTypes.find(t => t.name === 'All')!.is_selected = allChecked;
        }
    }

    clearAllFilters() {
        this.selectedRefundable = 'all';
        this.holdOnly = false;
        this.uniqueFareTypes.forEach(type => type.is_selected = false);
        this.applyFilters();
    }

    // Method that runs when the slide changes
    onSlideChange(slideIndex: number) {
        this.updateArrowVisibility(slideIndex['currentSlide']);
    }

    // Function to show/hide arrows based on the current slide
    updateArrowVisibility(currentSlideIndex: number) {
        let slidesToShow = this.getCurrentSlidesToShow();
        const total = this.totalSlides ?? 0;
        this.showLeftArrow = currentSlideIndex > 0;
        this.showRightArrow = currentSlideIndex < total - slidesToShow;
    }

    // Update Slide Config
    updateSlideConfig() {
        const faresCount = this.moreFlightAll?.length;
        this.totalSlides = faresCount;

        this.slideConfig = {
            "slidesToShow": faresCount >= 3 ? 3 : faresCount, // If fares are less than 3, show only that many slides
            "slidesToScroll": 1,
            'autoplay': false,
            'dots': false,
            'infinite': false,
            'arrows': false,
            // 'arrows': faresCount > 1,
            'responsive': [
                {
                    'breakpoint': 1600,
                    'settings': {
                        'slidesToShow': faresCount >= 3 ? 3 : faresCount,
                        'slidesToScroll': 1,
                    }
                },
                {
                    'breakpoint': 1000,
                    'settings': {
                        'slidesToShow': faresCount >= 2 ? 2 : faresCount,
                        'slidesToScroll': 1,
                    }
                },
                {
                    'breakpoint': 600,
                    'settings': {
                        'slidesToShow': 1,
                        'slidesToScroll': 1,
                    }
                }
            ]
        };
    }

    // Helper function to get the correct slidesToShow value based on the current screen size
    getCurrentSlidesToShow(): number {
        const screenWidth = window.innerWidth;
        if (screenWidth < 600) {
            return 1;
        } else if (screenWidth < 1000) {
            return 2;
        } else {
            return this.slideConfig.slidesToShow;
        }
    }

    // Booking Emit
    booking(fare: any) {
        this.bookEvent.emit(fare);
    }

    getTooltipFair(datalist: any) {
        // Replace <b> tags with empty string
        const withoutBTags = datalist?.replace(/<b[^>]*>/g, '').replace(/<\/b>/g, ',');

        // Replace multiple spaces with a single space
        const withoutMultipleSpaces = withoutBTags?.replace(/\s{2,}/g, ' ');

        // Replace comma-space with comma
        var convertedSentence = withoutMultipleSpaces?.replace(/, /g, ', ');
        return convertedSentence;
    }

    fareRule(dest: any, origin: any, val: any): void {
        // this.matDialog.open(FareRuleComponent, {
        //     data: { data: val, destination: dest, origin: origin },
        //     disableClose: true,
        //     panelClass: ["remove-dialog-pading"]
        // })
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.unsubscribe();
    }

}