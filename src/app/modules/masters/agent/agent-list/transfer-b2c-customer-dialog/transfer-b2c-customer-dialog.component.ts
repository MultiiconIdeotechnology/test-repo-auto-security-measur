import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToasterService } from 'app/services/toaster.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { debounceTime, distinctUntilChanged, filter, map, Observable, startWith, switchMap } from 'rxjs';
import { AgentService } from 'app/services/agent.service';
import { PspSetupService } from 'app/services/psp-setup.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FuseConfirmationService } from '@fuse/services/confirmation';

@Component({
  selector: 'app-transfer-b2c-customer-dialog',
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
  templateUrl: './transfer-b2c-customer-dialog.component.html',
  styleUrls: ['./transfer-b2c-customer-dialog.component.scss']
})
export class TransferB2CDialogComponent implements OnInit {

  title: ''
  formGroup!: FormGroup;
  agentList: any = [];
  fromAgentList: any[] = [];
  toAgentList: any[] = [];
  record: any;

  constructor(
    public matDialogRef: MatDialogRef<TransferB2CDialogComponent>,
    private builder: FormBuilder,
    public alertService: ToasterService,
    private _filterService: CommonFilterService,
    private agentService: AgentService,
    private toasterService: ToasterService,
    private conformationService: FuseConfirmationService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.record = data.record;
    this.title = data.title;
  }

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      id: [''],
      from_agent_id: ['', Validators.required],
      to_agent_id: ['', Validators.required],
      fromAgentfilter: [''],
      toAgentfilter: ['']
    });

    /** FROM Agent Search */
    this.formGroup.get('fromAgentfilter')!.valueChanges.pipe(
      filter(x => !!x),
      startWith(''),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((value: string) => this.agentService.getAgentComboMaster(value, true))
    )
      .subscribe({
        next: (data) => {
          this.fromAgentList = data || [];
          this.updateFromAgentList(this.formGroup.get('to_agent_id')?.value);
        }
      });

    /** TO Agent Search */
    this.formGroup.get('toAgentfilter')!.valueChanges.pipe(
      filter(x => !!x),
      startWith(''),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((value: string) => this.agentService.getAgentComboMaster(value, true))
    )
      .subscribe({
        next: (data) => {
          this.toAgentList = data || [];
          this.updateToAgentList(this.formGroup.get('from_agent_id')?.value);
        }
      });

    /** When FROM agent changes */
    this.formGroup.get('from_agent_id')!.valueChanges.subscribe((fromId) => {
      const toId = this.formGroup.get('to_agent_id')!.value;
      if (fromId && fromId === toId) {
        this.formGroup.get('to_agent_id')!.setValue(null);
      }
      this.updateToAgentList(fromId);
    });

    /** When TO agent changes */
    this.formGroup.get('to_agent_id')!.valueChanges.subscribe((toId) => {
      const fromId = this.formGroup.get('from_agent_id')!.value;
      if (toId && toId === fromId) {
        this.formGroup.get('from_agent_id')!.setValue(null);
      }
      this.updateFromAgentList(toId);
    });

  }

  /** Disable same agent ID in TO list */
  updateToAgentList(selectedFromId?: number) {
    this.toAgentList = this.toAgentList.map(agent => ({
      ...agent,
      disabled: selectedFromId === agent.id
    }));
  }

  /** Disable same agent ID in FROM list */
  updateFromAgentList(selectedToId?: number) {
    this.fromAgentList = this.fromAgentList.map(agent => ({
      ...agent,
      disabled: selectedToId === agent.id
    }));
  }

  public compareWith(v1: any, v2: any) {
    return v1 && v2 && v1.id === v2.id;
  }

  /** Confirmation + API call */
  confirmTransfer() {
    const fromAgent = this.fromAgentList.find(a => a.id === this.formGroup.value.from_agent_id);
    const toAgent = this.toAgentList.find(a => a.id === this.formGroup.value.to_agent_id);

    const message = `Are you sure want to transfer all B2C customers from ${fromAgent.agency_name} to ${toAgent.agency_name}?`;

    this.conformationService.open({
      title: 'Confirm Transfer',
      message: message,
      actions: {
        confirm: { label: 'Yes' },
        cancel: { label: 'No' }
      }
    }).afterClosed().subscribe((res: string) => {
      if (res === 'confirmed') {
        const requestDto = {
          old_agent_id: fromAgent.id,
          new_agent_id: toAgent.id,
          is_b2c_user: true
        };

        this.agentService.transferB2Customer(requestDto).subscribe({
          next: () => {
            this.alertService.showToast('success', 'All B2C customers transferred successfully!', 'top-right', true);
            this.formGroup.reset();
      
          // Refresh both lists after success
          this.reloadAgentLists();
          },
          error: (err) => {
            this.alertService.showToast('error', 'Failed to transfer B2C customers: ' + err, 'top-right', true);
          }
        });
      }
    });
  }

  /**  Reload both dropdown lists after successful transfer */
  private reloadAgentLists() {
    // Fetch both agent lists fresh (empty search by default)
    this.agentService.getAgentComboMaster('', true).subscribe((data) => {
      this.fromAgentList = data || [];
      this.toAgentList = data || [];
    });
  }

}

