import { Component, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { MatDialog } from '@angular/material/dialog';
import { Routes } from 'app/common/const';
import { HolidayLeadService } from 'app/services/holiday-lead.service';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { ToasterService } from 'app/services/toaster.service';
import { CompactLayoutComponent } from 'app/layout/layouts/vertical/compact/compact.component';
import { CommonUtils } from 'app/utils/commonutils';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-holiday-lead-booking-details',
  templateUrl: './holiday-lead-booking-details.component.html',
  styleUrls: ['./holiday-lead-booking-details.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    NgFor,
    DatePipe,
    AsyncPipe,
    RouterModule,
    ReactiveFormsModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatTooltipModule,
    MatMenuModule,
    MatSlideToggleModule,
    NgxMatTimepickerModule,
    NgxMatSelectSearchModule,
    NgClass,
    ClipboardModule,
    MatIconModule,
    MatDividerModule,
  ]
})
export class HolidayLeadBookingDetailsComponent {

  jsonParam: any;
  bookingDetail: any;

  constructor(
    private router: Router,
    public route: ActivatedRoute,
    private HolidayLeadService: HolidayLeadService,
    private alertService: ToasterService,
    private classy: CompactLayoutComponent,

  ) { }

  holidayRoute = Routes.booking.holiday_lead_route;


  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.HolidayLeadService.getHolidayBookingDetail(id).subscribe({
        next: (res: any) => {
          this.bookingDetail = res;
        }, error: (err) => {
          this.alertService.showToast('error', err);
        }
      });
    });
    this.classy.toggleNavigation('mainNavigation');
  }

  close() {
    this.router.navigate([this.holidayRoute])
  }

  getCopy(copyOf): void {
    this.HolidayLeadService.downloadQuotationV2(this.bookingDetail.id).subscribe({
      next: (res) => {
        this.bookingDetail.copy = res.copy;
        this.bookingDetail.customer_copy = res.customer_copy;
        if (copyOf === 'agent') {
          CommonUtils.downloadPdf(this.bookingDetail.copy, 'holiday_quotation.pdf');
        }
        else {
          CommonUtils.downloadPdf(this.bookingDetail.customer_copy, 'holiday_quotation.pdf');
        }
      }, error: (err) => {
      },
    })
  }

}
