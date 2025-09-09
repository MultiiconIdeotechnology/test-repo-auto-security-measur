import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { AccountDetailsComponent } from '../../bus/account-details/account-details.component';
import { InsuranceService } from 'app/services/insurance.service';
import { MatDialog } from '@angular/material/dialog';
import { FuseNavigationService } from '@fuse/components/navigation';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { CompactLayoutComponent } from 'app/layout/layouts/vertical/compact/compact.component';
import { ToasterService } from 'app/services/toaster.service';
import { Routes } from 'app/common/const';
import { Linq } from 'app/utils/linq';
import { SubAgentInfoComponent } from 'app/modules/masters/agent/sub-agent-info/sub-agent-info.component';
import { TravellerInfoComponent } from '../traveller-info/traveller-info.component';
import { CommonUtils } from 'app/utils/commonutils';
import { LogsComponent } from '../../flight/flight/logs/logs.component';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { FileLogsComponent } from '../../flight/flight/file-logs/file-logs.component';

@Component({
  selector: 'app-insurance-booking-details',
  standalone: true,
  templateUrl: './insurance-booking-details.component.html',
  styleUrls: ['./insurance-booking-details.component.scss'],
  imports: [
    CommonModule,
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
    ClipboardModule,
    MatTableModule,
    MatSliderModule,
    AccountDetailsComponent,
    PrimeNgImportsModule
  ]
})
export class InsuranceBookingDetailsComponent {

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
    private insuranceService: InsuranceService,
    private clipboard: Clipboard,
    private conformationService: FuseConfirmationService,
    private toastr: ToasterService,
    private _fuseNavigationService: FuseNavigationService,
    private classy: CompactLayoutComponent,
    private matDialog: MatDialog,
    private alertService: ToasterService,
  ) {

  }

  InsuranceRoute = Routes.booking.insurance_route;

  close() {
    this.router.navigate([this.InsuranceRoute])
  }

  ngOnInit() {

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.insuranceService.getInsuranceBookingRecord(id).subscribe({
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
          this.travellerDataList = res.data.travellerInfos;
        }, error: err => {
          this.toastr.showToast('error', err)
        }
      })
    })

    this.classy.toggleNavigation('mainNavigation');

  }

  copyLink(link: string): void {
    this.clipboard.copy(link);
    this.toastr.showToast('success', 'Copied');
  }

  viewPolicy(data) {
    window.open(data, '_blank')
    // Linq.recirect(data);
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

  info(model): void {
    this.matDialog.open(TravellerInfoComponent, {
      data: model,
      disableClose: true,
    })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          // this.refreshData()
        }
      });
  }

  B2BPartnerInfo() {
    this.matDialog.open(SubAgentInfoComponent, {
      data: { data: this.mainDataAll, readonly: true, id: this.mainDataAll.agent_id },
      disableClose: true
    })
  }

  // navigate to url
  goToData() {
    const routes = {
      'Airline': '/booking/flight/details/',
      'Hotel': '/booking/hotel/details/',
      'Bus': '/booking/bus/details/'
    };
    const route = routes[this.mainDataAll?.insurance_for];
    if (route) {
      Linq.recirect(route + this.mainDataAll?.insurance_for_id);
    }
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
        ServiceType: "Insurance", //Airline,Bus,Hotel
        bookingId: this.mainData.id,
        is_customer: val === 'customer' ? true : false,
        is_with_price: res === 'confirmed' ? false : true
      }
      this.insuranceService.printBooking(json).subscribe({
        next: (res) => {
          CommonUtils.downloadPdf(res.data, this.mainDataAll.booking_ref_no + '.pdf');
        }, error: (err) => {
          this.toastr.showToast('error', err)
        }
      })
    });
  }

  //Your Invoice
  invoice(record): void {
    const recordData = record == 'print' ? this.mainData.invoice_id : record
    this.insuranceService.printInvoice(recordData).subscribe({
      next: (res) => {
        CommonUtils.downloadPdf(res.data, this.mainData.invoice_no + '.pdf');
      }, error: (err) => {
        this.toastr.showToast('error', err)
      }
    })
  }

  //Agent Invoice
   agentInvoice(record): void {
    const recordData = record == 'print' ? this.mainData.agent_invoice_id : record
    this.insuranceService.printInvoice(recordData).subscribe({
      next: (res) => {
        CommonUtils.downloadPdf(res.data, this.mainData.agent_invoice_no + '.pdf');
      }, error: (err) => {
        this.toastr.showToast('error', err)
      }
    })
  }

  logs(): void {
    this.matDialog.open(LogsComponent, {
      data: { data: this.mainData.id, service: 'Insurance' },
      disableClose: true
    }).afterClosed().subscribe(res => {
      // if(res)
      // this.refreshItems();
    })
  }

  fileLogs() {
    this.matDialog.open(FileLogsComponent, {
      data: { id: this.mainData.id, send: 'Insurance' },
      disableClose: true
    }).afterClosed().subscribe(res => {
      // if(res)
      // this.refreshItems();
    })
  }

}
