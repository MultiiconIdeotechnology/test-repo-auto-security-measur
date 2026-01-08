import { filter_module_name, module_name } from 'app/security';
import { Component, OnDestroy } from '@angular/core';
import { DatePipe, NgFor, NgIf, CommonModule } from '@angular/common';
import { BaseListingComponent, Column } from 'app/form-models/base-listing';
import { ReactiveFormsModule } from '@angular/forms';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { DocumentsEntryComponent } from '../documents-entry/documents-entry.component';
import { DocumentService } from 'app/services/document.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { ToasterService } from 'app/services/toaster.service';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';


@Component({
  selector: 'app-types-of-documents-list',
  templateUrl: './types-of-documents-list.component.html',
  styles: [`
  .tbl-grid {
    grid-template-columns:  40px 220px 170px 180px 200px 180px ;
  }
  `],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    DatePipe,
    ReactiveFormsModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatMenuModule,
    MatDialogModule,
    MatTooltipModule,
    MatDividerModule,
    CommonModule,
    PrimeNgImportsModule
  ]
})
export class TypesOfDocumentsListComponent extends BaseListingComponent implements OnDestroy {

  total = 0;
  dataList = [];
  module_name = module_name.document;
  filter_table_name = filter_module_name.type_of_documents;
  private settingsUpdatedSubscription: Subscription;

  cols: any = [
    { field: 'remark_caption', header: 'Remark' },
  ];
  _selectedColumns: Column[];
  isFilterShow: boolean = false;

  constructor(
    private documentsService: DocumentService,
    private toasterService: ToasterService,
    private conformationService: FuseConfirmationService,
    private matDialog: MatDialog,
    public _filterService: CommonFilterService
  ) {
    super(module_name.document)
    this.key = this.module_name;
    this.sortColumn = 'document_group';

    this.sortDirection = 'asc';
    this.Mainmodule = this;
    this._filterService.applyDefaultFilter(this.filter_table_name);
  }

  ngOnInit() {
    this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
      this._filterService.updateSelectedOption('');
      // this.sortColumn = resp['sortColumn'];
      // this.primengTable['_sortField'] = resp['sortColumn'];    
      if (resp['table_config']['entry_date_time']?.value != null && resp['table_config']['entry_date_time'].value.length) {
        this._filterService.updateSelectedOption('custom_date_range');
        this._filterService.rangeDateConvert(resp['table_config']['entry_date_time']);
      }
      this.primengTable['filters'] = resp['table_config'];
      this._selectedColumns = resp['selectedColumns'] || [];
      this.isFilterShow = true;
      this.primengTable._filter();
    });
  }

  ngAfterViewInit() {
    // Defult Active filter show
    this._filterService.updateSelectedOption('');
    if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
      let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
     if (filterData['table_config']['entry_date_time']?.value != null && filterData['table_config']['entry_date_time'].value.length) {
        this._filterService.updateSelectedOption('custom_date_range');
        this._filterService.rangeDateConvert(filterData['table_config']['entry_date_time']);
      }
      this.primengTable['filters'] = filterData['table_config'];
      this._selectedColumns = filterData['selectedColumns'] || [];
      // this.primengTable['_sortField'] = filterData['sortColumn'];
      // this.sortColumn = filterData['sortColumn'];
      this.isFilterShow = true;
    }
  }

  get selectedColumns(): Column[] {
    return this._selectedColumns;
  }

  set selectedColumns(val: Column[]) {
    if (Array.isArray(val)) {
      this._selectedColumns = this.cols.filter(col =>
        val.some(selectedCol => selectedCol.field === col.field)
      );
    } else {
      this._selectedColumns = [];
    }
  }

  refreshItems(event?: any): void {
    this.isLoading = true;
    this.documentsService.gettypesofdocumentsList(this.getNewFilterReq(event)).subscribe({
      next: data => {
        this.isLoading = false;
        this.dataList = data.data;
        this.totalRecords = data.total;
        this.total = data.total;

      }, error: err => {
        this.toasterService.showToast('error', err)
        this.isLoading = false;
      }
    })
  }

  createInternal(model): void {
    this.matDialog.open(DocumentsEntryComponent, {
      data: null,
      disableClose: true
    }).afterClosed().subscribe((res) => {
      if (res) {
        this.alertService.showToast('success', "New record added", "top-right", true);
        this.refreshItems();
      }
    })
  }

  editInternal(record): void {
    this.matDialog.open(DocumentsEntryComponent, {
      data: { data: record, readonly: false },
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (res) {
        this.alertService.showToast('success', "Record modified", "top-right", true);
        this.refreshItems();
      }
    })
  }

  viewInternal(record): void {
    this.matDialog.open(DocumentsEntryComponent, {
      data: { data: record, readonly: true },
      disableClose: true
    })
  }

  deleteInternal(record): void {
    const label: string = 'Delete Document'
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.document_name + ' ?'
    }).afterClosed().subscribe(res => {
      if (res === 'confirmed') {
        this.documentsService.delete(record.id).subscribe({
          next: () => {
            this.alertService.showToast('success', "Document Type has been deleted!", "top-right", true);
            this.refreshItems();
          },
          error: err => {
            this.toasterService.showToast('error', err)
            this.isLoading = false;
          }
        })
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

  ngOnDestroy(): void {
    // this.masterService.setData(this.key, this);

    if (this.settingsUpdatedSubscription) {
      this.settingsUpdatedSubscription.unsubscribe();
      this._filterService.activeFiltData = {};
    }
  }
}

