import { module_name } from 'app/security';
import { Component, OnDestroy } from '@angular/core';
import { DatePipe, NgFor, NgIf, CommonModule  } from '@angular/common';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { ReactiveFormsModule } from '@angular/forms';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { DocumentsEntryComponent } from '../documents-entry/documents-entry.component';
import { DocumentService } from 'app/services/document.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { ToasterService } from 'app/services/toaster.service';

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
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatMenuModule,
    MatDialogModule,
    MatTooltipModule,
    MatDividerModule,
    CommonModule
  ]
})
export class TypesOfDocumentsListComponent extends BaseListingComponent implements OnDestroy {

  total = 0;
  dataList = [];


  module_name = module_name.document
  columns = [
    { key: 'document_group', name: 'Group', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false,  align: '', indicator: false, tooltip: true },
    { key: 'document_name', name: 'Document', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false,  align: '', indicator: false , tooltip: true},
    { key: 'maximum_size', name: 'Max File Size [KB]', is_date: false, date_formate: '', is_sortable: true, class: 'header-center-view', is_sticky: false,  align: '', indicator: false },
    { key: 'file_extentions', name: 'File Extention', is_date: false, date_formate: '', is_sortable: true, class: 'header-center-view', is_sticky: false,  align: '', indicator: false },
    { key: 'entry_date_time', name: 'Entry Date Time', is_date: true, date_formate: 'dd-MM-yyyy HH:mm:ss', is_sortable: true, class: '', is_sticky: false,  align: '', indicator: false},

  ]
  cols = [];

  constructor(
    private documentsService: DocumentService,
    private toasterService: ToasterService,
    private conformationService: FuseConfirmationService,
    private matDialog: MatDialog,
  ) {
    super(module_name.document)
    this.cols = this.columns.map(x => x.key);
    this.key = this.module_name;
    this.sortColumn = 'document_group';
    this.sortDirection = 'asc';
    this.Mainmodule = this
  }

  refreshItems(): void {
    this.isLoading = true;
    this.documentsService.gettypesofdocumentsList(this.getFilterReq()).subscribe({
      next: data => {
        this.isLoading = false;
        this.dataList = data.data;
        this._paginator.length = data.total;
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
      if (res)
        {  this.alertService.showToast('success', "New record added", "top-right", true);
            this.refreshItems();
      }
    })
  }

  editInternal(record): void {
    this.matDialog.open(DocumentsEntryComponent, {
      data: {data: record, readonly: false},
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (res){
        this.alertService.showToast('success', "Record modified", "top-right", true);
        this.refreshItems();
      }
    })
  }

  viewInternal(record): void {
    this.matDialog.open(DocumentsEntryComponent, {
      data: {data: record, readonly: true},
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
    this.masterService.setData(this.key, this)
  }
}

