import { Component } from '@angular/core';
import { AsyncPipe, CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ToasterService } from 'app/services/toaster.service';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Routes } from 'app/common/const';
import { Linq } from 'app/utils/linq';
import { AirlineBlockService } from 'app/services/airline-block.service';
import { CommonUtils } from 'app/utils/commonutils';
import { CompactLayoutComponent } from 'app/layout/layouts/vertical/compact/compact.component';
import { RejectReasonComponent } from '../reject-reason/reject-reason.component';
import { bookingAirlineBlockPermissions, messages, Security } from 'app/security';

@Component({
  selector: 'app-airline-block-lead-details',
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
    NgClass,
    MatDividerModule,
  ],
  templateUrl: './airline-block-lead-details.component.html',
  styleUrls: ['./airline-block-lead-details.component.scss']
})
export class AirlineBlockLeadDetailsComponent {

  bookingDetail: any;
  priceDetail: any[] = [];
  segmentList: any[] = [];
  clipboard: any;

  constructor(
    private router: Router,
    public route: ActivatedRoute,
    private airlineBlockService: AirlineBlockService,
    private alertService: ToasterService,
    private matDialog: MatDialog,
    private conformationService: FuseConfirmationService,
    private classy: CompactLayoutComponent,
  ) { }

  airlineBlockRoute = Routes.booking.airline_block_lead_route;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.airlineBlockService.getAirlineBlockLeadDetail(id).subscribe({
        next: (res: any) => {
          this.bookingDetail = res;
          this.bookingDetail.depTime = this.parseCustomDateTime(this.bookingDetail.depTime);
          this.bookingDetail.arrTime = this.parseCustomDateTime(this.bookingDetail.arrTime);
          this.priceDetail = res.priceDetail;
          this.segmentList = this.bookingDetail?.segment?.map((segment: any) => ({
            ...segment,
            departure_date_time: this.parseCustomDateTime(segment.departure_date_time),
            arrival_date_time: this.parseCustomDateTime(segment.arrival_date_time),
          })) ?? [];
          this.priceDetail = Linq.groupBy(this.priceDetail, x => x.box)
        }, error: (err) => {
          this.alertService.showToast('error', err);
        }
      });
      this.classy.toggleNavigation('mainNavigation');
    });
  }

  private parseCustomDateTime(dateTimeStr: string): Date {
    const [datePart, timePart] = dateTimeStr.split(' ');
    const [day, month, year] = datePart.split('-');
    return new Date(`${year}-${month}-${day}T${timePart}:00`);
  }

  isSamePlanes(plan1, plan2): boolean {
    return `${plan1.airline_name}${plan1.flight_no}` === `${plan2?.airline_name}${plan2?.flight_no}`
  }

  close() {
    this.router.navigate([this.airlineBlockRoute])
  }

  status(record: any, code: any): void {
   if (!Security.hasPermission(bookingAirlineBlockPermissions.statusPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }
    const label: string = code == 1 ? 'Airline Block Lead Completed' : 'Airline Block Lead Cancelled';
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + ' ?'
    }).afterClosed().subscribe({
      next: (res) => {
        if (res === 'confirmed') {
          const Fdata = {}
          Fdata['id'] = record.id,
            Fdata['status_code'] = code,
            Fdata['note'] = '',
            this.airlineBlockService.setLeadStatus(Fdata).subscribe({
              next: (res) => {
                if (res) {
                  this.alertService.showToast('success', code == 1 ? 'Airline Block Lead Completed' : 'Airline Block Lead Cancelled', "top-right", true);
                  this.bookingDetail.status = 'Completed'
                }
              }, error: (err) => this.alertService.showToast('error', err, "top-right", true)
            });
        }
      }
    })
  }

  Rejected(record: any, code: any): void {
    if (!Security.hasPermission(bookingAirlineBlockPermissions.rejectedPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }
    this.matDialog.open(RejectReasonComponent, {
      disableClose: true,
      data: record,
      panelClass: 'full-dialog'
    }).afterClosed().subscribe({
      next: (res) => {
        if (res) {
          const Fdata = {}
          Fdata['id'] = record.id,
            Fdata['status_code'] = code,
            Fdata['note'] = res,
            this.airlineBlockService.setLeadStatus(Fdata).subscribe({
              next: (response) => {
                if (response) {
                  this.alertService.showToast('success', "Airline Block Rejected", "top-right", true);
                  this.bookingDetail.status = 'Rejected'
                  this.bookingDetail.reject_reason = res
                }
              },
              error: (err) => this.alertService.showToast('error', err, "top-right", true)
            })
        }
      }
    })
  }

  copyBookingRef() {
    this.clipboard.copy(this.bookingDetail.booking_ref_no);
    this.alertService.showToast('success', 'Booking Refrence No. Copied');
  }

  getCopy(copyOf): void {
    this.airlineBlockService.downloadQuotationV2(this.bookingDetail.id).subscribe({
      next: (res) => {
        this.bookingDetail.copy = res.copy;
        this.bookingDetail.customer_copy = res.customer_copy;
        if (copyOf === 'agent') {
          CommonUtils.downloadPdf(this.bookingDetail.copy, this.bookingDetail?.reference_no + '.pdf');
        }
        else {
          CommonUtils.downloadPdf(this.bookingDetail.customer_copy, this.bookingDetail?.reference_no + '.pdf');
        }
      }, error: (err) => {
      },
    })
  }

}
