import { NgIf, NgFor, DatePipe, CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { BaseListingComponent, Column } from 'app/form-models/base-listing';
import { Security, companyPermissions, messages, module_name } from 'app/security';
import { CompnyService } from 'app/services/compny.service';
import { ToasterService } from 'app/services/toaster.service';
import { CompnyEntryComponent } from '../compny-entry/compny-entry.component';
import { CompanyToCompanyMarkupListComponent } from '../company-to-company-markup-list/company-to-company-markup-list.component';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';

@Component({
  selector: 'app-compny-list',
  templateUrl: './compny-list.component.html',
  styles: [],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    DatePipe,
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatTableModule,
    MatSortModule,
    MatMenuModule,
    MatDialogModule,
    MatTooltipModule,
    MatDividerModule,
    PrimeNgImportsModule
  ]

})
export class CompnyListComponent extends BaseListingComponent {

  module_name = module_name.compny
  dataList = [];
  total = 0;
  cols = [];
  isFilterShow: boolean = false;
  _selectedColumns: Column[];

  columns = [
    { key: 'company_name', name: 'Company Name', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: true, is_boolean: false, tooltip: true },
    { key: 'contact_no', name: 'Contact No', is_date: false, date_formate: '', is_sortable: false, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
    { key: 'contact_email', name: 'Contact Email', is_date: false, date_formate: '', is_sortable: false, class: 'header-center-center', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
    { key: 'website_url', name: 'Website URL', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
    { key: 'gst_vat_no', name: 'GST vat No', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
  ]


  constructor(
    private matDialog: MatDialog,
    public alertService: ToasterService,
    private conformationService: FuseConfirmationService,
    private compnyService: CompnyService
  ) {
    super(module_name.compny)
    // this.cols = this.columns.map(x => x.key);
    this.key = this.module_name;
    this.sortColumn = 'company_name';
    this.sortDirection = 'desc';
    this.Mainmodule = this
  }

  ngOnInit() {

    this.cols = [
      { field: 'base_currency', header: 'Currency' }
    ];
  }

  get selectedColumns(): Column[] {
    return this._selectedColumns;
  }

  set selectedColumns(val: Column[]) {
    this._selectedColumns = this.cols.filter((col) => val.includes(col));
  }

  create() {
    this.matDialog.open(CompnyEntryComponent, {
      data: null, disableClose: true
    }).afterClosed().subscribe(res => {
      if (res) {
        this.alertService.showToast('success', "New record added", "top-right", true);
        this.refreshItems()
      }
    })
  }

  viewInternal(record): void {
    this.matDialog.open(CompnyEntryComponent, {
      data: { data: record, readonly: true },
      disableClose: true
    })
  }

  editInternal(record): void {
    this.matDialog.open(CompnyEntryComponent, {
      data: { data: record, readonly: false },
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (res) {
        this.alertService.showToast('success', "Record modified", "top-right", true);
        this.refreshItems();
      }
    })
  }

  deleteInternal(record): void {
    const label: string = 'Delete Company'
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.company_name + ' ?'
    }).afterClosed().subscribe(res => {
      if (res === 'confirmed') {
        this.compnyService.delete(record.id).subscribe({
          next: () => {
            this.alertService.showToast('success', "Company has been deleted!", "top-right", true);
            this.refreshItems()
          }, error: (err) => { this.alertService.showToast('error', err, 'top-right', true) }
        })
      }
    })
  }

  companyList(record): void {
    if (!Security.hasPermission(companyPermissions.ctcMarkupPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }
    this.matDialog.open(CompanyToCompanyMarkupListComponent, {
      data: record,
      disableClose: true
    })
  }

  refreshItems(event?: any): void {
    this.isLoading = true;
    this.compnyService.getCompanyList(this.getNewFilterReq(event)).subscribe({
      next: data => {
        this.isLoading = false;
        this.dataList = data.data;
        this.totalRecords = data.total;
      }, error: err => {
        this.alertService.showToast('error', err, 'top-right', true)
        this.isLoading = false;
      }
    })
  }

  getNodataText(): string {
    if (this.isLoading)
      return 'Loading...';
    else if (this.searchInputControl.value)
      return `no search results found for \'${this.searchInputControl.value}\'.`;
    else return 'No data to display';
  }

}
