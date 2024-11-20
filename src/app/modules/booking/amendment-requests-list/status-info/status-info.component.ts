import { CommonModule, NgClass } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { AmendmentRequestsService } from 'app/services/amendment-requests.service';
import { EntityService } from 'app/services/entity.service';
import { ToasterService } from 'app/services/toaster.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-status-info',
  templateUrl: './status-info.component.html',
  standalone: true,
  imports: [
    CommonModule,
    NgClass,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatDividerModule,
    MatSidenavModule,
    FuseDrawerComponent
  ]
})
export class StatusInfoComponent implements OnInit {

  @ViewChild('amendmentInfoDrawer') public amendmentInfoDrawer: MatSidenav;
  title = "Amendment Status Info"
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  public statusList: any[] = [
    {
      title: "Request Sent to Supplier",
      desc: `Quotation Successfully Sent to Supplier.`
    },
    {
      title: "Request to Supplier Failed",
      desc: `Quotation Mail to Supplier Failed.`
    },
    {
      title: "Quotation Sent",
      desc: `Quotation Sent to TA.`
    },
    {
      title: "Quotation Confirmed By TA",
      desc: `Quotation Confirmed by TA.`
    },
    {
      title: "Quotation Rejected By TA",
      desc: `Quotation Rejected by TA.`
    },
    {
      title: "Confirmation Sent To Supplier",
      desc: `Amendment Confirmation Sent to Supplier.`
    },
    {
      title: "Payment Completed",
      desc: `Payment Successfully Collected for Particular Sales Addition Amendment.`
    },
    {
      title: "Refund Process",
      desc: `Refund Process Started for Particular Sales Return Amendment.`
    },
    {
      title: "Refund Completed",
      desc: `Refund Completed for Particular Sales Return Amendment.`
    },
    {
      title: "Partial Payment Completed",
      desc: `Half Payment Completed Thought Wallet and Rest of Payment Collection Pending From PG Side.`
    },
    {
      title: "Account Audit",
      desc: `Audit Pending From Account Team.`
    },
    {
      title: "Account Rejected",
      desc: `Audit Rejected By Account Team For Any Reason.`
    },
    {
      title: "Cancellation Pending",
      desc: `While We Gave Confirmation to Supplier Through API.`
    },
    {
      title: "Partial Cancellation Pending",
      desc: `While We Gave Confirmation to Supplier Through API for Particular Partial Cancellation.`
    },
    {
      title: "Completed",
      desc: `Amendment Process is Completed.`
    },
    {
      title: "Rejected",
      desc: `Amendment Process is Rejected.`
    },
    {
      title: "Cancelled",
      desc: `Amendment Process is Cancelled.`
    },
  ];

  constructor(
    public alertService: ToasterService,
    public amendmentRequestsService: AmendmentRequestsService,
    private entityService: EntityService,
  ) {
    this.entityService.onAmendmentStatusInfoCall().pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (item) => {
        this.amendmentInfoDrawer.toggle();
      }
    });
  }

  ngOnInit(): void {
  }
}
