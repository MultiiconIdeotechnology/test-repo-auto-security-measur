import { CommonModule, NgIf, NgFor, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { module_name } from 'app/security';
import { MarkupprofileService } from 'app/services/markupprofile.service';
import { ToasterService } from 'app/services/toaster.service';


@Component({
  selector: 'app-markup-profile-list',
  templateUrl: './markup-profile-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatProgressBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    NgIf,
    NgFor,
    DatePipe,
    MatMenuModule,
    MatDialogModule,
    MatTooltipModule,
    MatDividerModule
  ]
})
export class MarkupProfileListComponent extends BaseListingComponent {
  module_name = module_name.markupProfile
  columns = [
    { key: 'actions', name: '#', is_date: false, date_formate: '', is_sortable: false, class: '', is_sticky: true, width: '10', align: 'center', indicator: false, is_required: false, is_included: false, is_boolean: false },
    { key: 'markup_profile_by', name: 'Markup Profile By', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, width: '80', align: '', indicator: true, is_required: false, is_included: false, is_boolean: false },
    // { key: 'particular_id', name: 'Particular Id', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, width: '80', align: '', indicator: false,is_required: false, is_included:false,is_boolean:false },
    { key: 'particular_name', name: 'Particular Name', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, width: '80', align: '', indicator: false, is_required: false, is_included: false, is_boolean: false },
    { key: 'profile_name', name: 'Profile Name', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, width: '80', align: '', indicator: false, is_required: false, is_included: false, is_boolean: false },
    { key: 'is_default_profile', name: 'Is Default Profile', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, width: '80', align: 'center', indicator: false, is_required: false, is_included: false, is_boolean: true },

  ]
  cols = [];

  constructor(
    private conformationService: FuseConfirmationService,
    private toasterService: ToasterService,
    private matDialog: MatDialog,
    private router: Router,
    private markupprofileService: MarkupprofileService
  ) {
    super(module_name.markupProfile)
    this.cols = this.columns.map(x => x.key);
    this.key = this.module_name;
    this.sortColumn = 'markup_profile_by';
    this.sortDirection = 'asc';
    this.Mainmodule = this
  }

  refreshItems(): void {
    this.isLoading = true;
    this.markupprofileService.getMarkupProfileList(this.getFilterReq()).subscribe({
      next: data => {
        this.isLoading = false;
        this.dataSource.data = data.data;
        this._paginator.length = data.total;
      }, error: err => {
        this.toasterService.showToast('error', err)
        this.isLoading = false;
      }
    })
  }

  // createInternal(model): void {
  // this.router.navigate([Routes.inventory.markup_profile_entry_route])
  // }

  editInternal(record): void {
    // this.router.navigate([Routes.inventory.markup_profile_entry_route], { queryParams: { id: record.id } })
  }

  viewInternal(record): void {
    // this.router.navigate([Routes.inventory.holiday_entry_route], { queryParams: { id: record.id, readonly: true } })
  }

  deleteInternal(record): void {
    const label: string = 'Delete Markup Profile'
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.destination_name + ' ?'
    }).afterClosed().subscribe(res => {
      if (res === 'confirmed') {
        this.markupprofileService.delete(record.id).subscribe({
          next: () => {
            this.alertService.showToast(
              'success',
              'Markup Profile has been deleted!',
              'top-right',
              true
            );
            this.refreshItems()
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
