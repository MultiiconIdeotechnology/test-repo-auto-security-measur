import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { FlightTabService } from 'app/services/flight-tab.service';
import { OfflineserviceService } from 'app/services/offlineservice.service';
import { ToasterService } from 'app/services/toaster.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { filter, startWith, debounceTime, distinctUntilChanged, switchMap, Observable, ReplaySubject } from 'rxjs';

@Component({
  selector: 'app-offline-entry',
  templateUrl: './offline-entry.component.html',
  styleUrls: ['./offline-entry.component.scss'],
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
    NgxMatSelectSearchModule,
    MatTooltipModule
  ]
})
export class OfflineEntryComponent {

  disableBtn: boolean = false
  readonly: boolean = false;
  record: any = {};
  fieldList: {};

  agentList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
  isFirsAgent: boolean = true;
  isFirstSubAgent: boolean = true;

  constructor(
    public matDialogRef: MatDialogRef<OfflineEntryComponent>,
    private builder: FormBuilder,
    private matSnackBar: MatSnackBar,
    private offlineService: OfflineserviceService,
    private flighttabService: FlightTabService,
    private alertService: ToasterService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    this.record = data?.data ?? {}
  }

  formGroup: FormGroup;
  title = "Create Offline Service"
  btnLabel = "Create"

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      id: [''],
      agent_id: [''],
      agentfilter: [''],
      lead_pax_name: [''],
      lead_pax_email: ['', Validators.email],
      lead_pax_mobile: [''],
    });

    this.formGroup
      .get('agentfilter')
      .valueChanges.pipe(
        filter((search) => !!search),
        startWith(''),
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((value: any) => {
          return this.flighttabService.getAgentCombo({
            filter: value,
            MasterAgentId: '',
            is_master_agent: true,
          });
        })
      )
      .subscribe({
        next: (data: any) => {
          this.agentList.next(data);
          if (this.isFirsAgent == true) {
            this.formGroup.get('agent_id').patchValue(data[0].id);
            this.isFirsAgent = false;
          }
        },
      });

    if (this.record.id) {
      this.formGroup.patchValue(this.record)
      this.formGroup.get("agentfilter").patchValue(this.record.master_agent_name)
      this.formGroup.get("agent_id").patchValue(this.record.agent_id);

      // this.formGroup.get("agentfilterSub").patchValue(this.record.agent_name);
      // this.formGroup.get("agent_id").patchValue(this.record.agent_id);
      this.title = "Modify Offline Service"
      this.btnLabel = "Save"
    }

  }

  isValidEmail(email: string): boolean {
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }

  submit(): void {
    if (!this.formGroup.valid) {
      this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
      this.formGroup.markAllAsTouched();
      return;
    }
    this.disableBtn = true;
    const json = this.formGroup.getRawValue();
    this.offlineService.create(json).subscribe({
      next: () => {
        this.matDialogRef.close(true);
        this.disableBtn = false;
      }, error: (err) => {
        this.disableBtn = false;
        this.alertService.showToast('error', err, "top-right", true);
      }
    })
  }

}
