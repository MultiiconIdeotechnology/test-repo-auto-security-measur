import { NgIf, NgFor, NgClass, DatePipe, JsonPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ToasterService } from 'app/services/toaster.service';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-account-details',
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    DatePipe,
    RouterLink,
    MatIconModule,
    MatTooltipModule,
    MatTableModule,
    RouterOutlet,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    JsonPipe
  ],
  styles: [
    `.mdc-data-table__cell, .mdc-data-table__header-cell {
          border-bottom-width: 0 !important;
      }
      .tbl-grid {
          grid-template-columns: 20px 170px 230px 140px 250px 150px;
      }`
  ]
})
export class AccountDetailsComponent {

  @Input()
  account: any;

  below: boolean = false;
  payments = new MatTableDataSource();
  receipts = new MatTableDataSource();
  column: string[] = ['action', 'request_date', 'ref_no', 'status', 'service', 'amount'];
  currentTab = 1;
  TabList: any[] = [
    { id: 1, name: 'Payment', isSelected: true },
    { id: 2, name: 'Receipt', isSelected: false },
  ];

  columns = [
    { key: 'request_date', name: 'Request Date', is_date: true, date_formate: 'dd-MM-yyyy HH:mm:ss', is_sortable: false, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
    { key: 'ref_no', name: 'Ref No', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true, iscolor: true },
    { key: 'status', name: 'Status', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: true, is_boolean: false, tooltip: false },
    { key: 'service', name: 'Service', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
    { key: 'amount', name: 'Amount', is_date: false, date_formate: '', is_sortable: true, class: 'justify-end text-right', is_sticky: false, indicator: false, is_boolean: false, tooltip: false, isamount: true },
  ]

  constructor(
    private alertService: ToasterService,
  ) { }


  ngOnInit(): void {
  }

  TabChange(tab: any) {
    this.TabList.forEach(x => x.isSelected = false);
    tab.isSelected = true;
    this.currentTab = tab.id;
  }

  belowt(ListItem): void {
    ListItem.below = !ListItem.below;

    ListItem.filedList = [
      { name: 'Service Ref No', value: ListItem.service_ref_no },
      { name: 'Service', value: ListItem.service },
      { name: 'Mode of Payment', value: ListItem.mode_of_payment },
      { name: 'Audit Date', value: ListItem.audit_date_time ? DateTime.fromISO(ListItem.audit_date_time).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
      { name: 'Payment Date', value: ListItem.request_date ? DateTime.fromISO(ListItem.request_date).toFormat('dd-MM-yyyy HH:mm:ss').toString() : '' },
      { name: 'ROE', value: ListItem.roe },
      { name: 'Amount', value: ListItem.currency + ' ' + ListItem.amount }
    ]
  }

  getStatusColor(status: string): string {
    if (status == 'Pending' || status == 'Offline Pending' || status == 'Confirmation Pending' || status == 'Hold') {
      return 'bg-orange-400';
    } else if (status == 'Waiting for Payment') {
      return 'bg-orange-600';
    } else if (status == 'Confirmed') {
      return 'bg-green-500';
    } else if (status == 'Payment Failed' || status == 'Transaction Failed' || status == 'Cancelled' || status == 'Failed') {
      return 'bg-red-500';
    } else {
      return '';
    }
  }


}
