import { Component } from '@angular/core';
import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatDialog } from '@angular/material/dialog';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { BaseListingComponent, Column, Types } from 'app/form-models/base-listing';
import { module_name, filter_module_name } from 'app/security';
import { AgentService } from 'app/services/agent.service';
import { EntityService } from 'app/services/entity.service';
import { SendMailService } from 'app/services/sent-mail.service';
import { ToasterService } from 'app/services/toaster.service';
import { Subscription } from 'rxjs';
import { Excel } from 'app/utils/export/excel';
import { DateTime } from 'luxon';
import { ViewTemplateComponent } from '../view-template/view-template.component';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-sent-mail-list',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    NgFor,
    DatePipe,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatMenuModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule,
    NgClass,
    RouterOutlet,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    NgxMatSelectSearchModule,
    PrimeNgImportsModule,
  ],
  templateUrl: './sent-mail-list.component.html',
  styleUrls: ['./sent-mail-list.component.scss']
})
export class SentMailListComponent extends BaseListingComponent {

  module_name = module_name.sent_mail;
  filter_table_name = filter_module_name.sent_mail;
  private settingsUpdatedSubscription: Subscription;
  dataList = [];
  total = 0;
  isFilterShow: boolean;
  agentList: any[];
  selectedAgent: any;
  _selectedColumns: any;

  statusList = ['Success', 'Pending', 'Failed']

  types = Types;
  cols: Column[] = [];
  selectedColumns: Column[] = [];
  exportCol: Column[] = [];
  activeFiltData: any = {};

  constructor(
    private matDialog: MatDialog,
    private agentService: AgentService,
    private sendMailService: SendMailService,
    private toasterService: ToasterService,
    public _filterService: CommonFilterService,
    private conformationService: FuseConfirmationService,
    private entityService: EntityService,
  ) {
    super(module_name.sent_mail);
    this.key = this.module_name;
    this.sortColumn = 'send_date_time';
    this.sortDirection = 'desc';
    this.Mainmodule = this;
    this._filterService.applyDefaultFilter(this.filter_table_name);

    this.selectedColumns = [
      { field: 'id', header: '#', type: Types.link, isHideFilter: true, isDisableSort: true },
      { field: 'sender_email_address', header: 'Sender Email', type: Types.text },
      { field: 'status', header: 'Status', type: Types.select, isCustomColor: true },
      { field: 'email_send_to', header: 'Email Send To', type: Types.text },
      { field: 'msg_subject', header: 'Subject', type: Types.text },
      { field: 'fail_reason', header: 'Fail Reason', type: Types.text },
      { field: 'send_date_time', header: 'Send Date', type: Types.date, dateFormat: 'dd-MM-yyyy HH:mm:ss' },
    ];
    this.cols.unshift(...this.selectedColumns);
    this.exportCol = cloneDeep(this.cols);
  }

  ngOnInit() {
    this.agentList = this._filterService.agentListById;

    // common filter
    this._filterService.updateSelectedOption('');
    this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp: any) => {
      this._filterService.updateSelectedOption('');
      this.selectedAgent = resp['table_config']['agent_id_filters']?.value;
      if (this.selectedAgent && this.selectedAgent.id) {
        const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
        if (!match) {
          this.agentList.push(this.selectedAgent);
        }
      }

      if (resp['table_config']['entry_date_time']?.value != null && resp['table_config']['entry_date_time'].value.length) {
        this._filterService.updateSelectedOption('custom_date_range');
        this._filterService.rangeDateConvert(resp['table_config']['entry_date_time']);
      }

      this.primengTable['filters'] = resp['table_config'];
      this._selectedColumns = resp['selectedColumns'] || [];
      this.isFilterShow = true;
      this.selectedColumns = this.checkSelectedColumn(resp['selectedColumns'] || [], this.selectedColumns);
      this.primengTable._filter();
    });
  }

  ngAfterViewInit() {
    // Defult Active filter show
    if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
      let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
      this.selectedAgent = filterData['table_config']['agent_id_filters']?.value;
      if (this.selectedAgent && this.selectedAgent.id) {
        const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
        if (!match) {
          this.agentList.push(this.selectedAgent);
        }
      }

      if (filterData['table_config']['entry_date_time']?.value != null && filterData['table_config']['entry_date_time'].value.length) {
        this._filterService.updateSelectedOption('custom_date_range');
        this._filterService.rangeDateConvert(filterData['table_config']['entry_date_time']);
      }

      this.primengTable['filters'] = filterData['table_config'];
      //this._selectedColumns = filterData['selectedColumns'] || [];
      this.isFilterShow = true;
      this.selectedColumns = this.checkSelectedColumn(filterData['selectedColumns'] || [], this.selectedColumns);
      this.onColumnsChange();
    } else {
      this.selectedColumns = this.checkSelectedColumn([], this.selectedColumns);
      this.onColumnsChange();
    }
  }

  onColumnsChange(): void {
    this._filterService.setSelectedColumns({ name: this.filter_table_name, columns: this.selectedColumns });
  }

  checkSelectedColumn(col: any[], oldCol: Column[]): any[] {
    if (col.length) return col;
    else {
      var Col = this._filterService.getSelectedColumns({ name: this.filter_table_name })?.columns || [];
      if (!Col.length)
        return oldCol;
      else
        return Col;
    }
  }

  isDisplayHashCol(): boolean {
    return this.selectedColumns.length > 0;
  }

  onSelectedColumnsChange(): void {
    this._filterService.setSelectedColumns({ name: this.filter_table_name, columns: this.selectedColumns });
  }

  refreshItems(event?: any) {
    this.isLoading = true;
    let model = this.getNewFilterReq(event)
    this.sendMailService.getSendEmailSmsList(model).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.dataList = data.data;
        this.totalRecords = data.total;
        // if (this.dataList && this.dataList.length) {
        //   setTimeout(() => {
        //     this.isFrozenColumn('', ['', 'reference_no']);
        //   }, 200);
        // } else {
        //   setTimeout(() => {
        //     this.isFrozenColumn('', ['', 'reference_no'], true);
        //   }, 200);
        // }
      },
      error: (err) => {
        this.toasterService.showToast('error', err)
        this.isLoading = false;
      },
    });
  }

  template(record: any) {
    this.matDialog.open(ViewTemplateComponent, {
      panelClass: 'app-view-for-template',
      data: record,
      disableClose: true,
    });
  }

  getStatusColor(status: string): string {
    if (status == 'Pending') {
      return 'text-orange-600';
    } else if (status == 'Success') {
      return 'text-green-600';
    } else if (status == 'Failed') {
      return 'text-red-600';
    } else {
      return '';
    }
  }


  getNodataText(): string {
    if (this.isLoading) return 'Loading...';
    else if (this.searchInputControl.value)
      return `no search results found for \'${this.searchInputControl.value}\'.`;
    else return 'No data to display';
  }

  exportExcel(): void {

    let newModel = this.getNewFilterReq({})
    newModel['Take'] = this.totalRecords;

    this.sendMailService.getSendEmailSmsList(newModel).subscribe(data => {
      for (var dt of data.data) {
        dt.send_date_time = dt.entry_date_time ? DateTime.fromISO(dt.send_date_time).toFormat('dd-MM-yyyy HH:mm:ss') : '';
      }
      Excel.export(
        'Sent Mail',
        [
          { header: 'Sender Email', property: 'sender_email_address' },
          { header: 'Status', property: 'status' },
          { header: 'Email Send To', property: 'email_send_to' },
          { header: 'Subject', property: 'msg_subject' },
          { header: 'Fail Reason', property: 'fail_reason' },
          { header: 'Send Date Time', property: 'send_date_time' },
        ],
        data.data, "Sent Mail", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 19 } }]);
    });
  }

  displayColCount(): number {
    return this.selectedColumns.length + 1;
  }

  isValidDate(value: any): boolean {
    const date = new Date(value);
    return value && !isNaN(date.getTime());
  }
}
