import { Component, Inject } from '@angular/core';
import { AsyncPipe, CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { AgentService } from 'app/services/agent.service';
import { filter, startWith, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CrmService } from 'app/services/crm.service';
import { ToasterService } from 'app/services/toaster.service';

@Component({
  selector: 'app-master-agent',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    DatePipe,
    AsyncPipe,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    NgxMatSelectSearchModule,
    MatTooltipModule
  ],
  templateUrl: './master-agent.component.html',
  styleUrls: ['./master-agent.component.scss']
})
export class MasterAgentComponent {

  formGroup: FormGroup;
  agentList: any[] = [];
  disableBtn: boolean = false;
  record: any

  constructor(
    public matDialogRef: MatDialogRef<MasterAgentComponent>,
    public formBuilder: FormBuilder,
    private agentService: AgentService,
    private crmService: CrmService,
    private alertService: ToasterService,
    @Inject(MAT_DIALOG_DATA) public data: any = {},
  ) {
    this.record = data;

  }

  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      AgentId: [''],
      agentfilter: [''],
    });

    this.formGroup
      .get('agentfilter')
      .valueChanges.pipe(
        filter((search) => !!search),
        startWith(''),
        debounceTime(200),
        distinctUntilChanged(),
        switchMap((value: any) => {
          return this.agentService.getAgentComboMaster(value, true);
        })
      )
      .subscribe({
        next: data => {
          this.agentList = data;
          this.formGroup.get("AgentId").patchValue(this.agentList[0]?.id);
        }
      });
  }

  submit() {
    let formData = this.formGroup.getRawValue()
    const json = {
      id: this.record.id,
      AgentId : formData.AgentId
    }
    this.crmService.shiftProduct(json).subscribe({
      next: () => {
        this.disableBtn = false;
        this.alertService.showToast('success', 'Product Shift', 'top-right', true);
      },
      error: (err) => {
        this.disableBtn = false;
        this.alertService.showToast('error', err, 'top-right', true);
      }
    });
  }

}
