import { GroupInquiryService } from './../../../../services/group-inquiry.service';
import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FlightTabService } from 'app/services/flight-tab.service';
import { KycDocumentService } from 'app/services/kyc-document.service';
import { ToasterService } from 'app/services/toaster.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ReplaySubject, debounceTime, distinctUntilChanged, filter, startWith, switchMap, Observable } from 'rxjs';

@Component({
    selector: 'app-update-charge',
    templateUrl: './update-charge.component.html',
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
        MatDatepickerModule,
        MatTooltipModule
    ]
})
export class UpdateChargeComponent {

    formGroup: FormGroup;
    SupplierList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
    IsFirst: boolean = true;

    constructor(
        public matDialogRef: MatDialogRef<UpdateChargeComponent>,
        private builder: FormBuilder,
        private groupInquiryService: GroupInquiryService,
        private alertService: ToasterService,
        private flighttabService: FlightTabService,
        @Inject(MAT_DIALOG_DATA) public data: any = {}
    ) {
    }

    ngOnInit(): void {
        this.formGroup = this.builder.group({
            id: [''],
            supplier_id: [''],
            agentfilter: [''],
            roe: [''],
            per_person_charge: [''],
        });

        this.formGroup.get('id').patchValue(this.data.id);

        this.formGroup.get('agentfilter').valueChanges.pipe(
            filter((search) => !!search),
            startWith(''),
            debounceTime(400),
            distinctUntilChanged(),
            switchMap((value: any) => {
                return this.flighttabService.getSupplierBoCombo('Airline');
            })).subscribe(data => {
                this.SupplierList.next(data);
                if (this.IsFirst) {
                    this.formGroup.get('supplier_id').patchValue(data[0]);
                    this.formGroup.get('roe').patchValue(data[0].roe);
                    this.IsFirst = false;
                }
            })
    }

    Submit() {
        if(!this.formGroup.valid){
            this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
            this.formGroup.markAllAsTouched();
            return;
}

        var FData = this.formGroup.getRawValue();
        FData.supplier_id = FData.supplier_id.id;

        this.groupInquiryService.groupInquiryUpdateCharges(FData).subscribe({
            next: (data: any) => {
                this.alertService.showToast('success', "Group inquiry update charges success");
                this.matDialogRef.close(true);
            },
            error: (err) => {
                this.alertService.showToast('error', err)
            },
        })
    }

    SupplierChange() {
        this.formGroup.get('roe').patchValue(this.formGroup.get('supplier_id').value.roe)
    }

    public compareWith(v1: any, v2: any) {
        return v1 && v2 && v1.id === v2.id;
    }
}