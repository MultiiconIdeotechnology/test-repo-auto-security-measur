import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe, CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, ActivatedRoute } from '@angular/router';
import { Routes } from 'app/common/const';
import { OfflineserviceService } from 'app/services/offlineservice.service';
import { ToasterService } from 'app/services/toaster.service';
import { DateTime } from 'luxon';
import { PurchaseComponent } from '../purchase/purchase.component';
import { SalesComponent } from '../sales/sales.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { AuditedComponent } from 'app/modules/account/wallet/audited/audited.component';
import { PendingComponent } from 'app/modules/account/wallet/pending/pending.component';
import { RejectedComponent } from 'app/modules/account/wallet/rejected/rejected.component';
import { PaymentComponent } from '../payment/payment.component';
import { ReceiptComponent } from '../receipt/receipt.component';
import { InvoiceComponent } from '../invoice/invoice.component';

@Component({
  selector: 'app-offline-info',
  templateUrl: './offline-info.component.html',
  styleUrls: ['./offline-info.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    DatePipe,
    AsyncPipe,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    PurchaseComponent,
    SalesComponent,
    MatProgressBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDividerModule,
    CommonModule,
    MatTabsModule,
    PendingComponent,
    AuditedComponent,
    RejectedComponent,
    PaymentComponent,
    ReceiptComponent,
    InvoiceComponent
  ]
})
export class OfflineInfoComponent {

  @ViewChild('purchase') purchase: PurchaseComponent;
  @ViewChild('sales') sales: SalesComponent;

  isSecound: boolean = true
  isInvoiceGenerated: boolean = false;

  fieldList: {};
  tabName: any
  tabNameStr: any = 'Purchase'
  tab: string = 'Purchase';
  id: string
  agent_currency_id: string = '';
  currency_short_code: string = '';
  OfflineRoute = Routes.booking.offline_service_route;

  constructor(
    private router: Router,
    public route: ActivatedRoute,
    private offlineService: OfflineserviceService,
    private toastr: ToasterService,

  ) {
  }

  close() {
    this.router.navigate([this.OfflineRoute])
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.id = params.get('id');

      this.offlineService.getOfflineServiceBookingRecord(this.id).subscribe({
        next: (data) => {
          this.agent_currency_id = data.currency_id;
          this.currency_short_code = data.currency_short_code;
          this.isInvoiceGenerated = data.status.toLowerCase() == "completed";
          this.fieldList = [
            { name: 'Ref.No', value: data.booking_ref_number, },
            { name: 'Agency Name', value: data.agency_name, },
            { name: 'Status', value: data.status, },
            { name: 'Lead Pax Name', value: data.lead_pax_name, },
            { name: 'Lead Pax Email', value: data.lead_pax_email, },
            { name: 'Lead Pax Mobile', value: data.lead_pax_mobile, },
            { name: 'Invoice Generate Date', value: data.invoice_generate_date ? DateTime.fromISO(data.invoice_generate_date).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '', },
            { name: 'Operation Person', value: data.operation_person, },
            { name: 'Sales Person', value: data.sales_person, },
            { name: 'Entry Date Time', value: data.entry_date_time ? DateTime.fromISO(data.entry_date_time).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '', },
          ];
        },
        error: (err) => {
          this.toastr.showToast('error', err, 'top-right', true);
        },
      }
      )
    });
  }

  updateInvoiceGenerat(){
    this.isInvoiceGenerated = true;
  }

  public tabChanged(event: any): void {

    const tabName = event?.tab?.ariaLabel;
    this.tabNameStr = tabName
    this.tabName = tabName

    switch (tabName) {
      case 'Purchase':
        this.tab = 'Purchase';
        break;

      case 'Sales':
        this.tab = 'Sales';
        // if (this.isSecound) {
        //   this.sales.refreshItemsSales()
        //   this.isSecound = false
        // }
        break;

      case 'Payment':
        this.tab = 'Payment';
        break;
      case 'Receipt':
        this.tab = 'Receipt';
        break;
      case 'Invoice':
        this.tab = 'Invoice';
        break;
    }
  }

}
