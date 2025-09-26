import { Component, Inject, Input, ViewChild } from '@angular/core';
import { AsyncPipe, CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { AppConfig } from 'app/config/app-config';
import { module_name } from 'app/security';
import { CrmService } from 'app/services/crm.service';
import { ToasterService } from 'app/services/toaster.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-product-logs',
  standalone: true,
  styles: [
    `
        .tbl-grid {
            grid-template-columns: 140px 140px 300px 310px;
        }
    `,
  ],
  imports: [
    NgIf,
    NgFor,
    NgClass,
    DatePipe,
    AsyncPipe,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    NgxMatSelectSearchModule,
    MatTooltipModule,
    MatAutocompleteModule,
    RouterOutlet,
    MatOptionModule,
    MatDividerModule,
    MatSortModule,
    MatTableModule,
    MatPaginatorModule,
    MatMenuModule,
    MatDialogModule,
    CommonModule,
    MatTabsModule,
    MatProgressBarModule,
  ],
  templateUrl: './product-logs.component.html',
  styleUrls: ['./product-logs.component.scss']
})
export class ProductLogsComponent {

  cols = [];
  total = 0;
  @Input() logsDetail: any[] = [];
  columns = [
     {
      key: 'activityDateTime',
      name: 'Time',
      is_date: true,
      date_formate: 'dd-MM-yyyy HH:mm',
      is_sortable: false,
      class: '',
      is_sticky: false,
      align: 'center',
      indicator: false,
      tooltip: false,
      lastLogin: true
    },
    {
      key: 'entryBy',
      name: 'Action',
      is_date: false,
      date_formate: '',
      is_sortable: false,
      class: '',
      is_sticky: false,
      align: '',
      indicator: false,
      tooltip: true,
      serviceName: false
    },
    {
      key: 'activityType',
      name: 'Activity',
      is_date: false,
      date_formate: '',
      is_sortable: false,
      class: '',
      is_sticky: false,
      align: 'center',
      indicator: false,
      tooltip: true,
    },
      {
      key: 'activity',
      name: 'Remark',
      is_date: false,
      date_formate: '',
      is_sortable: false,
      class: '',
      is_sticky: false,
      align: '',
      indicator: false,
      tooltip: true,
      toColor: false,
      isCombine: true
    },
    // {
    //   key: 'ipAddress',
    //   name: 'IP Address',
    //   is_date: false,
    //   date_formate: '',
    //   is_sortable: false,
    //   class: '',
    //   is_sticky: false,
    //   align: 'center',
    //   indicator: false,
    //   tooltip: false,
    // },
  ]

  dataList: any;
  dataListItems: any;
  appConfig = AppConfig;
  isLoading: any;
  searchInputControl = new FormControl('');
  @ViewChild('tabGroup') tabGroup;
  @ViewChild(MatPaginator) public _paginator: MatPaginator;
  @ViewChild(MatSort) public _sort: MatSort;

  Mainmodule: any;
  public _unsubscribeAll: Subject<any> = new Subject<any>();
  public key: any;
  public sortColumn: any;
  public sortDirection: any;

  module_name = module_name.crmagent
  filter: any = {}
  record: any;
  agentId: any;
  productId: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any = {},
    private alertService: ToasterService,
    private crmService: CrmService
  ) {
    this.record = data?.data ?? {}
    // this.dataList = this.record?.item;
    this.cols = this.columns.map(x => x.key);
    this.key = this.module_name;
    this.sortColumn = 'priorityid';
    this.sortDirection = 'desc';
    this.Mainmodule = this;
  }

  getNodataText(): string {
    if (this.isLoading)
      return 'Loading...';
    else if (this.searchInputControl.value)
      return `no search results found for \'${this.searchInputControl.value}\'.`;
    else return 'No data to display';
  }

}
