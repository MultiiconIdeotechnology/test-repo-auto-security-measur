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
import { debounceTime, distinctUntilChanged, Observable, switchMap } from 'rxjs';
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

  title: 'Bulk Assign Profile'
  formGroup!: FormGroup;
  agentList: any = []
  filteredAgentList: any = [];
  agentListCtrl = new FormControl("");
  agentSearchCtrl = new FormControl("")
  selectedListWithObj: any = []
  selectedListIds: any = []
  record: any;

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
    this.title = "Bulk Assign Profile"
    console.log("data for bulk assing dialog", data)
    this.record = data;
  }

  ngOnInit(): void {
    this.agentList = this._filterService.originalAgentList;
    this.filteredAgentList = this._filterService.originalAgentList;

    this.agentSearchCtrl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((searchText) => this.fetchAgentsFromAPI(searchText))
      )
      .subscribe((results: any[]) => {
        const filteredResults = results.filter(
          agent => !this.selectedListWithObj.some(sel => sel.id === agent.id)
        );
    
        // Merge with selected agents on top
        this.filteredAgentList = [...this.selectedListWithObj, ...filteredResults];
      });

    this.formGroup = this.builder.group({
      id: [''],
      is_all_agent: [false]
    });

    this.agentListCtrl.valueChanges.subscribe((selectedValues: any) => {
      this.selectedListWithObj = selectedValues;
      this.selectedListIds = selectedValues.map(agent => agent.id);
      console.log("this.selectedListWithObj", this.selectedListWithObj)
      console.log("this.selectedList", this.selectedListIds)

    });
  }

  fetchAgentsFromAPI(search: string): Observable<any[]> {
    return this.agentService.getAgentComboMaster(search, true);
  }


  submit() {
    let payload = this.formGroup.value;
    payload.profile_id = this.record?.id,
    payload.agent_ids = this.selectedListIds,
    console.log("payuload", payload)

      this.pspSetupService.assignPgProfile(payload).subscribe({
        next: (resp: any) => {
          if (resp) {
            console.log("resp from bulk assign", resp);
            this.toasterService.showToast('success', 'Profile assigned successfully');
            this.matDialogRef.close();
          }
        },
        error: (err) => {
          this.toasterService.showToast('error', err)
        },
      });
  }

}
