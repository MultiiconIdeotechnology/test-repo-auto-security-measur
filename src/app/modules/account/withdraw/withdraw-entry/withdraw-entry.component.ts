import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AgentService } from 'app/services/agent.service';
import { ToasterService } from 'app/services/toaster.service';
import { WithdrawService } from 'app/services/withdraw.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { filter, startWith, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

@Component({
    selector: 'app-withdraw-entry',
    templateUrl: './withdraw-entry.component.html',
    styleUrls: ['./withdraw-entry.component.scss'],
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        DatePipe,
        AsyncPipe,
        NgxMatSelectSearchModule,
        NgxMatTimepickerModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule,
        MatDatepickerModule,
        MatSlideToggleModule,
        MatChipsModule,
        MatTooltipModule,
        MatMenuModule,
        MatTabsModule,
    ],
})
export class WithdrawEntryComponent {
    record: any = {};
    formGroup: FormGroup;
    agentList: any[] = [];
    disableBtn: boolean = false
    readonly: boolean = false;
    title = "Create Withdraw"
    btnLabel = "Create"


    constructor(
        public matDialogRef: MatDialogRef<WithdrawEntryComponent>,
        public formBuilder: FormBuilder,
        public router: Router,
        public route: ActivatedRoute,
        public withdrawService: WithdrawService,
        public agentService: AgentService,
        public alertService: ToasterService,
        @Inject(MAT_DIALOG_DATA) public data: any = {}
    ) {
        this.record = data?.data ?? {};
    }

    ngOnInit(): void {
        this.formGroup = this.formBuilder.group({
            id: [''],
            agent_id: [''],
            agentfilter: [''],
            withdraw_amount: [''],
            agent_remark: [''],
        });

        this.formGroup
            .get('agentfilter')
            .valueChanges.pipe(
                filter((search) => !!search),
                startWith(''),
                debounceTime(200),
                distinctUntilChanged(),
                switchMap((value: any) => {
                    return this.agentService.getAgentComboMaster(value,true);
                })
            )
            .subscribe({
                next: data => {
                    this.agentList = data
                    this.formGroup.get("agent_id").patchValue(this.agentList[0].id);
                }
            });
    }

    public compareWith(v1: any, v2: any) {
        return v1 && v2 && v1.id === v2.id;
    }

    submit(): void {
        if(!this.formGroup.valid){
            this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
            this.formGroup.markAllAsTouched();
            return;
}

        const json = this.formGroup.getRawValue();
        this.disableBtn = true;
        this.withdrawService.create(json).subscribe({
            next: (value :any) => {
                // this.disableBtn = false;
                // this.matDialogRef.close(true);
                // this.alertService.showToast('success', 'Withdraw Created', 'top-right', true);

                if (value?.status == false)
                    this.alertService.showToast('error', value.warning);
                else {
                    this.disableBtn = false;
                    this.matDialogRef.close(true);
                    this.alertService.showToast('success', 'Withdraw Created', 'top-right', true);
                }
            },
            error: (err) => {
                this.alertService.showToast(
                    'error',
                    err,
                    'top-right',
                    true
                );
                this.disableBtn = false;
            },
        });
    }
}
