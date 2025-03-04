import { Component, Inject, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentSummaryCallHistoryComponent } from './agent-summary-call-history/agent-summary-call-history.component';
import { AgentDialCallComponent } from './agent-dial-call/agent-dial-call.component';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { ToasterService } from 'app/services/toaster.service';
import { module_name } from 'app/security';
import { AppConfig } from 'app/config/app-config';


@Component({
  selector: 'app-agent-followup',
  standalone: true,
  imports: [
    CommonModule,
    AgentSummaryCallHistoryComponent,
    AgentDialCallComponent,
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
    MatDividerModule,
    MatMenuModule,
    NgxMatTimepickerModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    CommonModule,
  ],
  templateUrl: './agent-followup.component.html',
  styleUrls: ['./agent-followup.component.scss']
})
export class AgentFollowupComponent {
  @ViewChild('callHistoryComponent') callHistoryComponent:any;
  title = "Agent Followup";
  Mainmodule: any;
  isLoading = false;
  public key: any;
  public sortColumn: any;
  public sortDirection: any;

  // module_name = module_name.crmagent
  total = 0;
  appConfig = AppConfig;
  // data: any
  filter: any = {}
  record: any = {};
  is_schedule_call: FormControl;
  selectedTabIndex: any = 1;
  tabNameStr: any = 'Call History'
  tab: string = 'Call History';
  tabName: any;


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any = {},
    public matDialogRef: MatDialogRef<AgentSummaryCallHistoryComponent>
  ) {
    // this.key = this.module_name;
    this.Mainmodule = this,
      this.record = data?.data ?? {};
  }

  public tabChanged(event: any): void {
    this.selectedTabIndex = event?.index;
  }

  onRemarkAdd(key: any) {
    if(key == 'remark-added'){
      this.tab = 'Call History';
      this.selectedTabIndex = 1;
      this.callHistoryComponent.refreshItems();
    }
  }
}
