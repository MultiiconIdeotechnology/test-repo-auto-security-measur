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
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FuseNavigationService } from '@fuse/components/navigation';
import { Routes } from 'app/common/const';
import { ClassyLayoutComponent } from 'app/layout/layouts/vertical/classy/classy.component';
import { SubAgentInfoComponent } from 'app/modules/masters/agent/sub-agent-info/sub-agent-info.component';
import { BusService } from 'app/services/bus.service';
import { FlightTabService } from 'app/services/flight-tab.service';
import { ToasterService } from 'app/services/toaster.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { AccountDetailsComponent } from '../account-details/account-details.component';
import { Linq } from 'app/utils/linq';
import { CommonUtils } from 'app/utils/commonutils';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { CompactLayoutComponent } from 'app/layout/layouts/vertical/compact/compact.component';
import { Security, busBookingPermissions, messages } from 'app/security';
import { CancellationPolicyComponent } from '../cancellation-policy/cancellation-policy.component';
import { LogsComponent } from '../../flight/flight/logs/logs.component';

@Component({
  selector: 'app-bus-booking-details',
  templateUrl: './bus-booking-details.component.html',
  styleUrls: ['./bus-booking-details.component.scss'],
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
  ]
})
export class BusBookingDetailsComponent {

  mainData: any;
  segmentList: any[] = [];
  travellerDataList: any[] = [];
  baggageDataList: any[] = [];
  Status: any;
  priceDetails: any[] = [];
  id: any;
  bookingDetail: any;
  accountDatail: any;

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
    private matDialog: MatDialog,
    private alertService: ToasterService,
    private busService: BusService

  ) {

  }

  busRoute = Routes.booking.bus_route;

  ngOnInit() {

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');

      this.busService.getBusBookingRecord(id).subscribe({
        next: res => {
          this.mainData = res.data;
          this.bookingBy = res.data.bookingByInfo;
          this.paymentBy = res.data.paymentByInfo;
          this.bookingDetail = res.data;
          this.mainDataAll = res.data;
          this.accountDatail = res.data.account
          this.Status = res.data.status
          this.priceDetails = res.data.priceDetail
          this.priceDetails = Linq.groupBy(this.priceDetails, x => x.box)
          // this.segmentList = data.data[0].segments;
          this.travellerDataList = res.data.travellerInfos;
          // this.baggageDataList = data.data[0].mealBaggages;
        }, error: err => {
          this.toastr.showToast('error', err)
        }
      })
    })

    this.classy.toggleNavigation('mainNavigation');

  }

  print(val): void {
    if (!Security.hasPermission(busBookingPermissions.voucherPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

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
        ServiceType: "Bus", //Airline,Bus,Hotel
        bookingId: this.mainData.id,
        is_customer: val === 'customer' ? true : false,
        is_with_price: res === 'confirmed' ? false : true
      }
      this.flighttabService.printBooking(json).subscribe({
        next: (res) => {
          CommonUtils.downloadPdf(res.data, 'Print.pdf');
        }, error: (err) => {
          this.toastr.showToast('error', err)
        }
      })
    });
  }

  cancellationPolicy(record){
    this.matDialog.open(CancellationPolicyComponent, {
      data:  record,
      disableClose: true
    })
  }


  invoice(): void {
    if (!Security.hasPermission(busBookingPermissions.invoicePermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    this.flighttabService.Invoice(this.mainData.invoice_id).subscribe({
      next: (res) => {
        CommonUtils.downloadPdf(res.data, 'invoice.pdf');
      }, error: (err) => {
        this.toastr.showToast('error', err)
      }
    })
  }

  Amendment(){
    if (!Security.hasPermission(busBookingPermissions.amendmentPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }
  }

  close() {
    this.router.navigate([this.busRoute])
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
            service: 'Bus'
          }
          this.flighttabService.checkPaymentStatus(json).subscribe({
            next: (res:any) => {
              this.toastr.showToast('success', res.status, 'top-right', true);
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
            service: 'Bus'
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
      data: {data: this.mainDataAll.id, service:'Bus'},
      disableClose: true
    }).afterClosed().subscribe(res => {
      // if(res)
      // this.refreshItems();
    })
  }

  agentInfo(data): void {
    if (data.is_master_agent == true) {
      this.router.navigate([Routes.customers.agent_entry_route + '/' + data.agent_id + '/readonly'])
    }
    else {
      this.matDialog.open(SubAgentInfoComponent, {
        data: { data: data, readonly: true, id: data.agent_id },
        disableClose: true
      })
    }
  }

  copyLink(link: string): void {
    this.clipboard.copy(link);
    this.toastr.showToast('success', 'Copied');
  }

  isSamePlanes(plan1, plan2): boolean {
    return `${plan1.airlineCode}${plan1.fareClass}${plan1.flightNumber}` === `${plan2.airlineCode}${plan2.fareClass}${plan2.flightNumber}`
  }

}
