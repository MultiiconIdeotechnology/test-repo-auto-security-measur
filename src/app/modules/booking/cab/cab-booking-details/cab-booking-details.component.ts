import { Component } from '@angular/core';
import { AsyncPipe, CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Routes } from 'app/common/const';
import { CompactLayoutComponent } from 'app/layout/layouts/vertical/compact/compact.component';
import { CabService } from 'app/services/cab.service';
import { ToasterService } from 'app/services/toaster.service';
import { Linq } from 'app/utils/linq';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { RejectReasonComponent } from 'app/modules/masters/agent/reject-reason/reject-reason.component';
import { CancellationPolicyComponent } from '../../bus/cancellation-policy/cancellation-policy.component';
import { CommonUtils } from 'app/utils/commonutils';

@Component({
  selector: 'app-cab-booking-details',
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
  ],
  templateUrl: './cab-booking-details.component.html',
  styleUrls: ['./cab-booking-details.component.scss']
})
export class CabBookingDetailsComponent {

  jsonParam: any;
  bookingDetail: any;
  priceDetail: any[] = [];


  constructor(
    private router: Router,
    public route: ActivatedRoute,
    private cabService: CabService,
    private alertService: ToasterService,
    private classy: CompactLayoutComponent,
    private matDialog: MatDialog,
    private conformationService: FuseConfirmationService,
  ) { }

  cabRoute = Routes.booking.cab_route;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.cabService.getCabBookingDetail(id).subscribe({
        next: (res: any) => {
          this.bookingDetail = res;
          this.priceDetail = res.priceDetail;
          this.priceDetail = Linq.groupBy(this.priceDetail, x => x.box)
        }, error: (err) => {
          this.alertService.showToast('error', err);
        }
      });
    });
    this.classy.toggleNavigation('mainNavigation');
  }

  close() {
    this.router.navigate([this.cabRoute])
  }

  viewPolicy() {
    this.matDialog.open(CancellationPolicyComponent, {
      data: { data: this.bookingDetail.cancellatioon_policy, send: 'Cab' },
      disableClose: true
    })
  }

  status(record: any, code: any): void {
    const label: string = code == 1 ? 'Cab Completed' : 'Cab Cancelled';
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
            this.cabService.setLeadStatus(Fdata).subscribe({
              next: (res) => {
                if (res) {
                  this.alertService.showToast('success', code == 1 ? 'Cab Completed' : 'Cab Cancelled', "top-right", true);
                  this.bookingDetail.lead_status = 'Completed'
                }
              }, error: (err) => this.alertService.showToast('error', err, "top-right", true)
            });
        }
      }
    })
  }

  Rejected(record: any, code: any): void {

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
            this.cabService.setLeadStatus(Fdata).subscribe({
              next: (response) => {
                if (response) {
                  this.alertService.showToast('success', "Cab Rejected", "top-right", true);
                  this.bookingDetail.lead_status = 'Rejected'
                  this.bookingDetail.reject_reason = res
                }
              },
              error: (err) => this.alertService.showToast('error', err, "top-right", true)
            })
        }
      }
    })
  }

   getCopy(copyOf): void {
    this.cabService.downloadCabQuotationV2(this.bookingDetail.id).subscribe({
      next: (res) => {
        this.bookingDetail.copy = res.copy;
        this.bookingDetail.customer_copy = res.customer_copy;
        if (copyOf === 'agent') {
          CommonUtils.downloadPdf(this.bookingDetail.copy, this.bookingDetail?.reference_no + '.pdf');
        }
        else {
          CommonUtils.downloadPdf(this.bookingDetail.customer_copy, this.bookingDetail?.reference_no +  '.pdf');
        }
      }, error: (err) => {
      },
    })
  }

}
