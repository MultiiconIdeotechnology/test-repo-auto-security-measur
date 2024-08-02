import { AsyncPipe, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
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
import { Routes } from 'app/common/const';
import { FlightTabService } from 'app/services/flight-tab.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { ToasterService } from 'app/services/toaster.service';
import { FuseNavigationService, FuseVerticalNavigationComponent } from '@fuse/components/navigation';
import { ClassyLayoutComponent } from 'app/layout/layouts/vertical/classy/classy.component';
import { MatDialog } from '@angular/material/dialog';
import { SubAgentInfoComponent } from 'app/modules/masters/agent/sub-agent-info/sub-agent-info.component';
import { AmendmentInfoComponent } from '../amendment-info/amendment-info.component';
import { GdsPnrComponent } from '../gds-pnr/gds-pnr.component';
import { RefundableComponent } from '../refundable/refundable.component';
import { SegmentComponent } from '../segment/segment.component';
import { AccountDetailsComponent } from '../account-details/account-details.component';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { Linq } from 'app/utils/linq';
import { CommonUtils } from 'app/utils/commonutils';
import { AmendmentRequestComponent } from '../amendment-request/amendment-request.component';
import { LogsComponent } from '../logs/logs.component';
import { CompactLayoutComponent } from 'app/layout/layouts/vertical/compact/compact.component';
import { PaxComponent } from '../pax/pax.component';

@Component({
  selector: 'app-booking-details',
  templateUrl: './booking-details.component.html',
  styleUrls: ['./booking-details.component.scss'],
  standalone: true,
  imports: [
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
    AccountDetailsComponent,
    ClipboardModule
  ]
})
export class BookingDetailsComponent {

  mainData: any;
  segmentList: any[] = [];
  customerDataList: any[] = [];
  baggageDataList: any[] = [];
  amendmentsDataList: any[] = [];
  Status: any;
  priceDetails: any[] = [];
  id: any;
  datatotal: any
  bookingDetail: any;
  bookingBy: any;
  paymentBy: any;
  mainDataAll: any;

  constructor(
    private router: Router,
    public route: ActivatedRoute,
    private flighttabService: FlightTabService,
    private clipboard: Clipboard,
    private conformationService: FuseConfirmationService,
    private toastr: ToasterService,
    private _fuseNavigationService: FuseNavigationService,
    private classy: CompactLayoutComponent,
    private matDialog: MatDialog

  ) {

  }

  flightRoute = Routes.booking.flight_route;

  view(record) {
    this.matDialog.open(AmendmentInfoComponent, {
      data: { data: record, readonly: true },
      disableClose: true
    })
  }

  checkStatus(){
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
    const label: string = 'Check Status';
    this.conformationService
      .open({
        title: label,
        message: 'Are you sure want to ' + label.toLowerCase() + ' ?',
      })
      .afterClosed()
      .subscribe((res) => {
        if (res === 'confirmed') {
          const json = {
            id: id,
            service: 'Airline'
          }
          this.flighttabService.checkPaymentStatus(json).subscribe({
            next: (res:any) => {
              this.toastr.showToast('success', res.status, 'top-right', true);
              this.refreshData();
            },
            error: (err) => {
              this.toastr.showToast('error', err, 'top-right', true);

            },
          });
        }
      });
    })
  }

  refund(){
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
    const label: string = 'Refund';
    this.conformationService
      .open({
        title: label,
        message: 'Are you sure want to ' + label.toLowerCase() + ' ?',
      })
      .afterClosed()
      .subscribe((res) => {
        if (res === 'confirmed') {
          const json = {
            id: id,
            service: 'Airline'
          }
          this.flighttabService.generateRevertPayment(json).subscribe({
            next: (res:any) => {
              this.toastr.showToast('success', 'Refund is initiated!', 'top-right', true);
            },
            error: (err) => {
              this.toastr.showToast('error', err, 'top-right', true);

            },
          });
        }
      });
    })
  }

  close() {
    this.router.navigate([this.flightRoute])
  }

  copyLink(link: string): void {
    this.clipboard.copy(link);
    this.toastr.showToast('success', 'Link Copied');
  }

  agentInfo(data): void {
    if (data.master_agent_id) {
    //   this.router.navigate([Routes.customers.agent_entry_route + '/' + data.master_agent_id + '/readonly'])
    Linq.recirect([Routes.customers.agent_entry_route + '/' + data.master_agent_id + '/readonly'])
    }
    else {
      this.B2BPartnerInfo();
      // this.matDialog.open(SubAgentInfoComponent, {
      //   data: { data: data, readonly: true, id: data.agent_id },
      //   disableClose: true
      // })
    }
  }

  B2BPartnerInfo(){
    this.matDialog.open(SubAgentInfoComponent, {
          data: { data: this.mainDataAll, readonly: true, id: this.mainDataAll.agent_id },
          disableClose: true
        })
  }

  pnr(model, status): void {
    this.matDialog.open(GdsPnrComponent, {
      data: { data: model, title: status },
      disableClose: true,
    })
      .afterClosed()
      .subscribe((res) => {
        if(res)
        this.refreshData()
      });
  }

  refundable(model): void {
    this.matDialog.open(RefundableComponent, {
      data: { data: model },
      disableClose: true,
    })
      .afterClosed()
      .subscribe((res) => {
        this.refreshData()
      });
  }

  pax(model): void {
    this.matDialog.open(PaxComponent, {
      data:  model ,
      disableClose: true,
    })
      .afterClosed()
      .subscribe((res) => {
        if(res){
          this.refreshData()
        }
      });
  }

  info(model): void {
    this.matDialog.open(PaxComponent, {
      data:  {data:model, readonly: true,} ,
      disableClose: true,
    })
      .afterClosed()
      .subscribe((res) => {
        if(res){
          // this.refreshData()
        }
      });
  }

  segmentChange(model, status): void {
    this.matDialog.open(SegmentComponent, {
      data: { data: model, mainId: this.mainData[0].id, status: status },
      disableClose: true,
    })
      .afterClosed()
      .subscribe((res) => {
        if(res){
          this.refreshData()
        }
      });
  }

  segmentDelete(record) {
    const label: string = 'Delete Segment';
    this.conformationService
      .open({
        title: label,
        message: 'Are you sure want to ' + label.toLowerCase() + ' ?',
      })
      .afterClosed()
      .subscribe((res) => {
        if (res === 'confirmed') {
          this.flighttabService.deleteSegment(record.id).subscribe({
            next: () => {
              this.toastr.showToast('success', 'Segment has been deleted!', 'top-right', true);
              this.refreshData();
            },
            error: (err) => {
              this.toastr.showToast('error', err, 'top-right', true);

            },
          });
        }
      });
  }



  segmentAdd(): void {
    this.matDialog.open(SegmentComponent, {
      data: { mainId: this.mainData[0].id },
      disableClose: true,
    })
      .afterClosed()
      .subscribe((res) => {
        if(res){
          this.refreshData()
        }
      });
  }


  ngOnInit() {
    this.refreshData()
    this.classy.toggleNavigation('mainNavigation');
  }

  refreshData() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.flighttabService.getAirBookingRecord(id).subscribe({
        next: data => {
          this.mainData = data.data;
          this.mainDataAll = data.data[0]
          this.bookingBy = data.data[0].bookingByInfo;
          this.paymentBy = data.data[0].paymentByInfo;
          this.bookingDetail = data.data[0].accounts;
          this.Status = data.data[0].status
          this.priceDetails = data.data[0].priceDetail
          this.priceDetails = Linq.groupBy(this.priceDetails, x => x.box)
          this.segmentList = data.data[0].segments;
          this.customerDataList = data.data[0].travellers;
          this.baggageDataList = data.data[0].mealBaggages;
          this.amendmentsDataList = data.data[0].airAmendments;
        }, error: err => {
          this.toastr.showToast('error', err, 'top-right', true);


        }
      })
    })
  }

  print(val): void {

    this.conformationService.open({
      title: 'Print',
      message: `Do you want to print without price information ?`,
      actions: {
        confirm: {
          label: 'Yes',
        },
        cancel: {
          label: 'No',
        },
      },
    }).afterClosed().subscribe((res) => {
      const json = {
        ServiceType: "Airline", //Airline,Bus,Hotel
        bookingId: this.mainData[0].id,
        is_customer: val === 'customer' ? true : false,
        is_with_price: res === 'confirmed' ? false : true
      }
      this.flighttabService.printBooking(json).subscribe({
        next: (res) => {
          CommonUtils.downloadPdf(res.data, this.mainDataAll.booking_ref_no + '.pdf');
        }, error: (err) => {
          this.toastr.showToast('error', err)
        }
      })
    });
  }

  invoice(record): void {
    const recordData = record == 'print' ? this.mainData[0].invoice_id : record
    this.flighttabService.Invoice(recordData).subscribe({
      next: (res) => {
        CommonUtils.downloadPdf(res.data, this.mainDataAll.invoice_no + '.pdf');
      }, error: (err) => {
        this.toastr.showToast('error', err)
      }
    })
  }


  amendment(): void {
    this.matDialog.open(AmendmentRequestComponent, {
      data: { booking_id: this.mainData[0].id, departuteDate: this.mainData[0].departuteDate },
      disableClose: true
    }).afterClosed().subscribe(res => {
      // if(res)
      // this.refreshItems();
    })
  }



  logs(): void {
    this.matDialog.open(LogsComponent, {
      data: {data:this.mainData[0].id, service:'Airline'},
      disableClose: true
    }).afterClosed().subscribe(res => {
      // if(res)
      // this.refreshItems();
    })
  }

  isSamePlanes(plan1, plan2): boolean {
    return `${plan1.airlineCode}${plan1.fareClass}${plan1.flightNumber}` === `${plan2.airlineCode}${plan2.fareClass}${plan2.flightNumber}`
  }

  getTooltip(data): string {
    if (Array.isArray(data)) {
      return data.join('\n').replace(/\|/g, '\n--------------------------------\n');
    } else {
      return String(data).replace(/\|/g, '\n');
    }
  }

}


