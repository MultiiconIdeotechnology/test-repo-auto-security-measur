import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ToasterService } from 'app/services/toaster.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { debounceTime, distinctUntilChanged, filter, map, Observable, switchMap } from 'rxjs';
import { AgentService } from 'app/services/agent.service';
import { PspSetupService } from 'app/services/psp-setup.service';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-bulk-assign-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    NgxMatSelectSearchModule,
    ReactiveFormsModule,
    MatOptionModule,
    MatSelectModule,
    MatCheckboxModule,
  ],
  templateUrl: './bulk-assign-dialog.component.html',
  styleUrls: ['./bulk-assign-dialog.component.scss']
})
export class BulkAssignDialogComponent implements OnInit {

  title: ''
  formGroup!: FormGroup;
  agentList: any = []
  filteredAgentList: any = [];
  agentListCtrl = new FormControl("");
  agentSearchCtrl = new FormControl("")
  selectedListWithObj: any = []
  selectedListIds: any = []
  record: any;


  //variable for customer>agent 
  profileAgentCtrl = new FormControl();
  profileAgentFilterCtrl = new FormControl();
  profileAgentList: any[] = [];
  filteredProfileAgentList: any[] = [];

  constructor(
    public matDialogRef: MatDialogRef<BulkAssignDialogComponent>,
    private builder: FormBuilder,
    public alertService: ToasterService,
    private _filterService: CommonFilterService,
    private agentService: AgentService,
    private pspSetupService: PspSetupService,
    private toasterService: ToasterService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {

    this.record = data.record;
    this.title = data.title;

    if (data.key == 'customer-agent') {
      this.getAgentAssignedList()
    }
  }

  ngOnInit(): void {
    this.agentList = this._filterService.originalAgentList;
    this.filteredAgentList = this._filterService.originalAgentList;

    this.formGroup = this.builder.group({
      id: [''],
      is_all_agent: [false]
    });

    this.initAgentSearch();
    this.initMultiSelectAgentListener();

    if (this.data.key !== 'customer-agent') {
      if (this.record?.agents_count) {
        this.getAgentAssignedListbyId();
      }
    } else {
      this.initProfileAgentSearch();
      this.initProfileAgentSelection();
      // this.profileAgentFilterCtrl.patchValue('bharat');

    }

  }

  // ========================
  //  Bulk Assign Section
  // ========================

  // Initializes agent search with API and merges selected agents at the top
  private initAgentSearch() {
    this.agentSearchCtrl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        map((value: string) => value?.trim()), // Trim whitespace
        filter((search: string) => !!search),  // Only proceed if non-empty
        switchMap((searchText) => this.fetchAgentsFromAPI(searchText))
      )
      .subscribe((results: any[]) => {
        const filteredResults = results.filter(
          agent => !this.selectedListWithObj.some(sel => sel.id === agent.id)
        );

        // Merge selected + filtered results (selected stay on top)
        this.filteredAgentList = [...this.selectedListWithObj, ...filteredResults];
      });
  }

  // Handles selection in multi-select dropdown
  private initMultiSelectAgentListener() {
    this.agentListCtrl.valueChanges.subscribe((selectedValues: any) => {
      this.selectedListWithObj = selectedValues;
      this.selectedListIds = selectedValues.map(agent => agent.id);
    });
  }

  // Fetch agents from agent service for bulk assign (API search)
  fetchAgentsFromAPI(search: string): Observable<any[]> {
    return this.agentService.getAgentComboMaster(search, true);
  }

  getAgentAssignedListbyId(): void {
    this.pspSetupService.getAgentProfileFromId(this.record.id).subscribe({
      next: (resp: any) => {
        if (resp && resp.agents_list && resp.agents_list?.length) {
          this.filteredAgentList = resp?.agents_list;
          if (resp?.assign_type != 'All') {
            this.agentListCtrl.patchValue(this.filteredAgentList)
          }
          this.formGroup.get('is_all_agent').patchValue(resp?.assign_type == 'All')
        }
      },
      error: (err) => {
        this.toasterService.showToast('error', err)
      },
    });
  }

  // ==============================
  //  Single Profile Assign Section
  // ==============================

  // Initializes profile agent search via API based on input
  private initProfileAgentSearch() {
    this.profileAgentFilterCtrl.valueChanges
      .pipe(
        debounceTime(300),
        map((value: string) => value?.trim()), // Trim whitespace
        filter((search: string) => !!search),  // Only proceed if non-empty
        distinctUntilChanged(),
        switchMap((search: string) => this.searchProfileAgents(search))
      )
      .subscribe((res: any[]) => {
        this.filteredProfileAgentList = res;

        let obj = this.filteredAgentList.find((item) => item.id == this.data?.assignedPspAgentId)
        this.profileAgentCtrl.patchValue(obj)
      });
  }

  // Tracks selected profile agent for single-select dropdown
  private initProfileAgentSelection() {
    this.profileAgentCtrl.valueChanges.subscribe((selectedAgent: any) => {
      if (selectedAgent && selectedAgent.id) {
        this.selectedListIds = [selectedAgent.id];
      } else {
        this.selectedListIds = [];
      }

    });
  }

  // Profile agent API search
  searchProfileAgents(search: string): Observable<any[]> {
    const payload = { skip: 0, take: 10, filter: search };
    return this.pspSetupService.getPaymentGatewaySettingsList(payload).pipe(
      map((res: any) => res?.data || [])
    );
  }

  // Fetch full profile list (default list load)
  getAgentAssignedList() {
    const payload = { skip: 0, take: 10, filter: "" };

    this.pspSetupService.getPaymentGatewaySettingsList(payload).subscribe({
      next: (resp: any) => {
        if (resp?.data?.length) {
          this.profileAgentList = resp.data;
          this.filteredProfileAgentList = resp.data;
        }
      },
      error: (err) => {
        this.toasterService.showToast('error', err);
      },
    });
  }

  compareWithProfileAgents = (a: any, b: any) => a?.id === b?.id;

  // common submit api for customer > agent (single profile assingn) and  Bulk assign from psp Setup
  submit() {
    let payload = this.formGroup.value;

    if (this.data.key == 'customer-agent') {
      payload.profile_id = this.selectedListIds[0];
      payload.agent_ids = [this.record?.id];
    } else {
      payload.profile_id = this.record?.id;
      payload.agent_ids = this.selectedListIds;
    }

    this.pspSetupService.assignPgProfile(payload).subscribe({
      next: (resp: any) => {
        if (resp) {
          this.toasterService.showToast('success', 'Profile assigned successfully');
          if (this.data.key == 'bulk-assign') {
            this.matDialogRef.close({ key: 'bulk-assign', count: this.selectedListIds?.length, is_all_agent:this.formGroup.get('is_all_agent')?.value });
          }
        }
      },
      error: (err: any) => {
        this.toasterService.showToast('error', err)
      },
    });


  }

}
