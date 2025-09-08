import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { NgIf, NgFor, DatePipe, AsyncPipe, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FuseNavigationService } from '@fuse/components/navigation';
import { Routes } from 'app/common/const';
import { ClassyLayoutComponent } from 'app/layout/layouts/vertical/classy/classy.component';
import { HotelBookingService } from 'app/services/hotel-booking.service';
import { ToasterService } from 'app/services/toaster.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { AccountDetailsComponent } from '../../flight/flight/account-details/account-details.component';
import { Linq } from 'app/utils/linq';
import { FlightTabService } from 'app/services/flight-tab.service';
import { CommonUtils } from 'app/utils/commonutils';
import { CompactLayoutComponent } from 'app/layout/layouts/vertical/compact/compact.component';
import { Security, bookingsHotelPermissions, messages } from 'app/security';
import { MatDivider, MatDividerModule } from '@angular/material/divider';
import { SubAgentInfoComponent } from 'app/modules/masters/agent/sub-agent-info/sub-agent-info.component';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { LogsComponent } from '../../flight/flight/logs/logs.component';
import { FileLogsComponent } from '../../flight/flight/file-logs/file-logs.component';


@Component({
  selector: 'app-hotel-booking-details',
  templateUrl: './hotel-booking-details.component.html',
  styleUrls: ['./hotel-booking-details.component.scss'],
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
    ClipboardModule,
    AccountDetailsComponent,
    MatTableModule,
    MatDividerModule
  ]
})
export class HotelBookingDetailsComponent {

  hotelData: any;
  loading: boolean = false;
  bookingDetail: any;
  accountsDetail: any;
  travellers = new MatTableDataSource();
  column: string[] = ['name', 'email', 'contact', 'passport_number'];
  jsonbook: string;
  priceDetails: any[] = [];
  Status: any;

  bookingBy: any;
  paymentBy: any;
  mainDataAll: any;
  roomsList: any;
  jsonParam:any



  constructor(
    private router: Router,
    public route: ActivatedRoute,
    private hotelBookingService: HotelBookingService,
    private flighttabService: FlightTabService,
    private clipboard: Clipboard,
    private conformationService: FuseConfirmationService,
    private alertService: ToasterService,
    private _fuseNavigationService: FuseNavigationService,
    private classy: CompactLayoutComponent,
    private matDialog: MatDialog,
  ) {

  }

  hotelRoute = Routes.booking.hotel_route;
  close() {
    this.router.navigate([this.hotelRoute])
  }

  ngOnInit() {

    this.route.paramMap.subscribe(params => {

      this.jsonParam = params.get('id');
      // if(jsonParam) {
      // const json = {
      //   code:jsonParam
      // }
      // this.commanService.raiseLoader(true);

      this.hotelBookingService.getHotelBookingRecord(this.jsonParam).subscribe({
        next: (res: any) => {
          this.bookingDetail = res.data;
          this.bookingBy = res.data.bookingByInfo;
          this.mainDataAll = res.data;
          this.paymentBy = res.data.paymentByInfo;
          this.roomsList = res.data.rooms;
          this.accountsDetail = res.data.accounts;
          this.Status = res.data.status
          this.travellers.data = res.data.guests;
          this.priceDetails = this.bookingDetail?.priceDetail
          this.priceDetails = Linq.groupBy(this.priceDetails, x => x.box)
        }, error: (err) => {
          this.alertService.showToast('error', err);
        }
      });
      // }
      this.jsonbook = params.get('code');
      // this.refreshItems();
    });

    this.classy.toggleNavigation('mainNavigation');


  }

  copyLink(link: string): void {
    this.clipboard.copy(link);
    this.alertService.showToast('success', 'Copied');
  }

  //Your Invoice
  invoice(record): void {
    if (!Security.hasPermission(bookingsHotelPermissions.invoicePermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }
    const recordData = record == 'DMCC' ? this.bookingDetail.invoice_id : this.bookingDetail.invoice_id_inr

    this.flighttabService.Invoice(recordData).subscribe({
      next: (res) => {
        CommonUtils.downloadPdf(res.data, record == 'DMCC' ? this.bookingDetail.invoice_no : this.bookingDetail.invoice_no_inr + '.pdf');
      }, error: (err) => {
        this.alertService.showToast('error', err)
      }
    })
  }

  //Agent Invoice
  agentInvoice(record): void {
    if (!Security.hasPermission(bookingsHotelPermissions.invoicePermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }
    const recordData = record == 'DMCC' ? this.bookingDetail.agent_invoice_id : this.bookingDetail.invoice_id_inr

    this.flighttabService.Invoice(recordData).subscribe({
      next: (res) => {
        CommonUtils.downloadPdf(res.data, record == 'DMCC' ? this.bookingDetail.agent_invoice_no : this.bookingDetail.invoice_no_inr + '.pdf');
      }, error: (err) => {
        this.alertService.showToast('error', err)
      }
    })
  }

     fileLogs() {
        this.matDialog.open(FileLogsComponent, {
          data: {id:this.bookingDetail.id, send: 'Hotel'},
          disableClose: true
        }).afterClosed().subscribe(res => {
          // if(res)
          // this.refreshItems();
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
        ServiceType: "Hotel", //Airline,Bus,Hotel
        bookingId: this.jsonParam,
        is_customer: val === 'customer' ? true : false,
        is_with_price: res === 'confirmed' ? false : true
      }
      this.flighttabService.printBooking(json).subscribe({
        next: (res) => {
          CommonUtils.downloadPdf(res.data, this.mainDataAll.booking_ref_no + '.pdf');
        }, error: (err) => {
          this.alertService.showToast('error', err)
        }
      })
    });
  }

  // agentInfo(data): void {
  //   if (data.is_master_agent == true) {
  //     this.router.navigate([Routes.customers.agent_entry_route + '/' + data.agent_id + '/readonly'])
  //   }
  //   else {
  //     this.matDialog.open(SubAgentInfoComponent, {
  //       data: { data: data, readonly: true, id: data.agent_id },
  //       disableClose: true
  //     })
  //   }
  // }

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
            service: 'Hotel'
          }
          this.flighttabService.checkPaymentStatus(json).subscribe({
            next: (res:any) => {
              this.alertService.showToast('success', res.status, 'top-right', true);
            },
            error: (err) => {
              this.alertService.showToast('error', err, 'top-right', true);

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
            service: 'Hotel'
          }
          this.flighttabService.generateRevertPayment(json).subscribe({
            next: (res:any) => {
              this.alertService.showToast('success', 'Refund is initiated!', 'top-right', true);
            },
            error: (err) => {
              this.alertService.showToast('error', err, 'top-right', true);

            },
          });
        }
      });
    })
  }

  logs(): void {
    this.matDialog.open(LogsComponent, {
      data: {data: this.mainDataAll.id, service:'Hotel'},
      disableClose: true
    }).afterClosed().subscribe(res => {
      // if(res)
      // this.refreshItems();
    })
  }

  voucher(): void {
    if (!Security.hasPermission(bookingsHotelPermissions.voucherPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }


  }

  amendment(): void {
    if (!Security.hasPermission(bookingsHotelPermissions.amendmentPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }
  }

  isSamePlanes(plan1, plan2): boolean {
    return `${plan1.airlineCode}${plan1.fareClass}${plan1.flightNumber}` === `${plan2.airlineCode}${plan2.fareClass}${plan2.flightNumber}`
  }

  getArrayWithLength(length: number): any[] {
    return new Array(length);
  }

}
