// import { AmendmentRequestsService } from './../../../../services/amendment-requests.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, EventEmitter, Inject, Output, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatDivider, MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToasterService } from 'app/services/toaster.service';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { ReplaySubject } from 'rxjs';
import { UpdateChargeComponent } from '../update-charge/update-charge.component';
import { AmendmentRequestsService } from 'app/services/amendment-requests.service';
import { Linq } from 'app/utils/linq';

@Component({
  selector: 'app-amendment-request-entry',
  templateUrl: './amendment-request-entry.component.html',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    NgClass,
    MatButtonModule,
    MatIconModule,
    DatePipe,
    AsyncPipe,
    NgxMatSelectSearchModule,
    MatDatepickerModule,
    NgxMatTimepickerModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatDividerModule
  ],
})
export class AmendmentRequestEntryComponent {
  record: any = {};
  agentInfoList: any[] = [];
  paymentInfoList: any[] = [];
  amendmentInfoList: any[] = [];
  paxInfoList: any;
  b2bchargesList: any[] = [];
  chargesList: any[] = [];
  booking_id: any
  recordList: any;
   titleCharge: any;
  isCharge: boolean =false;


  constructor(
    public matDialogRef: MatDialogRef<AmendmentRequestEntryComponent>,
    public alertService: ToasterService,
    public amendmentRequestsService: AmendmentRequestsService,
    private matDialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.record = data?.data ?? {}
  }

  title = "Amendment Request Info"
  

  ngOnInit(): void {
    if (this.record.id) {
      this.amendmentRequestsService.getAirAmendmentRecord(this.record.id).subscribe({
        next: (data) => {
          this.recordList = data
          this.booking_id = data?.amendment_info?.air_booking_id
          if (data) {
            this.agentInfoList = [
              { name: 'Name', value: data.agent_info.name },
              { name: 'Email', value: data.agent_info.email },
              { name: 'Contact', value: data.agent_info.contact },
            ];
            this.paymentInfoList = [
              { name: 'MOP', value: data.paymentbyInfo?.mop },
              { name: 'Wallet', value: data.paymentbyInfo?.wallet },
              { name: 'PG Name', value: data.paymentbyInfo?.pg_name || '-'},
              { name: 'PG Payment', value: data.paymentbyInfo?.pg_payment },
              { name: 'PG Ref No', value: data.paymentbyInfo?.pg_ref_no || '-' },
              { name: 'PG Status', value: data.paymentbyInfo?.pg_status || '-'},
              { name: 'PG Amount', value: data.paymentbyInfo?.pg_amount },
              { name: 'PG Charge', value: data.paymentbyInfo?.pg_charge },
              { name: 'PG Error', value: data.paymentbyInfo?.pg_error || '-'},
              { name: 'PG Settlement', value: data.paymentbyInfo?.pg_settlement },
              { name: 'Refund Amount', value: data.paymentbyInfo?.refund_amount },
              { name: 'Refund Date', value: data.paymentbyInfo?.refund_datetime  ? DateTime.fromISO(data.paymentbyInfo.refund_datetime).toFormat('dd-MM-yyyy HH:mm:ss').toString() : ''},
              { name: 'Refund Reason', value: data.paymentbyInfo?.refund_reason || '-'},
              { name: 'Refund Status', value: data.paymentbyInfo?.refund_status || '-'},
            ];
            this.amendmentInfoList = [
              { name: 'Type', value: data.amendment_info.type, classes: '' },
              { name: 'Supplier', value: data.amendment_info.supplier, classes: '' },
              {
                name: 'Status', value: data.amendment_info.status, classes: data.amendment_info.status === 'Pending' ? 'text-gray-500' :
                  data.amendment_info.status === 'Inprocess' ? 'text-orange-500' :
                    data.amendment_info.status === 'Cancelled' ? 'text-red-500' :
                      data.amendment_info.status === 'Rejected' ? 'text-red-500' :
                        data.amendment_info.status === 'Quotation Sent' ? 'text-blue-500' :
                          data.amendment_info.status === 'Expired' ? 'text-red-500' :
                            data.amendment_info.status === 'Completed' ? 'text-green-500' : ''
              },
              { name: 'Pax', value: data.amendment_info.information, classes: '', toPax: true },
              { name: 'Request Date', value: data.amendment_info.req_date ? DateTime.fromISO(data.amendment_info.req_date).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '', classes: '' },
              { name: 'Air Booking No', value: data.amendment_info.air_booking_no, classes: '', toFlight: true },
              { name: 'Remark', value: data.amendment_info.remark, classes: '' },
              { name: 'PNR', value: data.amendment_info.pnr, classes: '' },
              { name: 'GDS PNR', value: data.amendment_info.gds_pnr, classes: '' },
              { name: 'Agent Remark', value: data.remark, classes: '' },
            ];
            if (data.amendment_info.type === 'Reissue Quotation') {
              this.paxInfoList = data.pax_info.map(pax => [
                { name: 'Passenger Name', value: pax.passenger_name },
                { name: 'Traveller Detail', value: pax.traveller_detail },
                { name: 'Old Booking Date', value: pax.old_booking_date ? DateTime.fromISO(pax.old_booking_date).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
                { name: 'New Booking Date', value: pax.new_booking_date ? DateTime.fromISO(pax.new_booking_date).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
              ]);
            } else {
              let isFlag = true
              if(this.recordList.amendment_info.type == 'Correction Quotation') {
                isFlag = false;
              }
              this.paxInfoList = data.pax_info.map(pax => [
                { name: 'Passenger Name', value: pax.passenger_name, toCorrection:false },
                { name: 'New Passenger Name', value: pax.new_passenger_name, toCorrection: isFlag  },
                { name: 'Traveller Detail', value: pax.traveller_detail, toCorrection:false },
              ]);
            }
            let name1;
            let name2;
            if(this.recordList.is_refundable){
              name1 = 'Per Person Refund'
              name2 = 'Total Refund'
              this.titleCharge = 'Refund'
            }else{
              name1 = 'Per Person Charge'
              name2 = 'Charge'
              this.titleCharge = 'Charge'

            }
            this.b2bchargesList = [
              { name: name1, value: data.b2bcharges.per_person_charge },
              { name: name2, value: data.b2bcharges.charge },
            ];
            this.chargesList = [
              { name: name1, value: data.charges.per_person_charge },
              { name: name2, value: data.charges.charge },
            ];
            if(this.recordList.is_refundable){
              this.chargesList.unshift({ name: 'Cancellation Charge', value: data.charges.cancellation_charge })
            }
            
          }
        }, error: (err) => {
          this.alertService.showToast('error', err)

        },

      });
    }
  }

  flightDetails() {
    // if (!Security.hasViewDetailPermission(module_name.bookingsFlight)) {
    //   return this.alertService.showToast('error', messages.permissionDenied);
    // }
    Linq.recirect('/booking/flight/details/' + this.booking_id);

  }

  updateCharge(): void {
    this.matDialogRef.close();
    this.matDialog.open(UpdateChargeComponent, {
      data: this.record,
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (res) {
        this.alertService.showToast('success', "Charge has been Updated!", "top-right", true);
      }
    })
  }

  sendMail() {
    this.amendmentRequestsService.SendAmendmentEmailToSupplier(this.record.id).subscribe({
      next: (value: any) => {
        this.alertService.showToast('success', value.status, "top-right", true);
      }, error: (err) => {
        this.alertService.showToast('error', err, "top-right", true);
      },
    })
  }
}
