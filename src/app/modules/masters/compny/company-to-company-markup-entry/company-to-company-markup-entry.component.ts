import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, startWith, switchMap, take } from 'rxjs/operators';
import { ToasterService } from 'app/services/toaster.service';
import { PspSettingService } from 'app/services/psp-setting.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CompanyToCompanyMarkupService } from 'app/services/company-to-company-markup.service';
import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';

@Component({
    selector: 'app-company-to-company-markup-entry',
    templateUrl: './company-to-company-markup-entry.component.html',
    standalone: true,
    imports: [
        NgIf, NgFor, NgClass, DatePipe, AsyncPipe, ReactiveFormsModule,
        MatInputModule, MatFormFieldModule, MatSelectModule, MatButtonModule,
        MatIconModule, MatDatepickerModule, MatSlideToggleModule, MatTooltipModule,
        NgxMatTimepickerModule, NgxMatSelectSearchModule
    ],
})
export class CompanyToCompanyEntryComponent implements OnInit {
    disableBtn: boolean = false;
    readonly: boolean = false;
    record: any = {};
    fromCompanyList: any[] = [];
    toCompanyList: any[] = [];
    filteredToCompanyList: any[] = [];
    formGroup: FormGroup;

    constructor(
        public matDialogRef: MatDialogRef<CompanyToCompanyEntryComponent>,
        private builder: FormBuilder,
        public alertService: ToasterService,
        public companyToCompanyMarkupService: CompanyToCompanyMarkupService,
        private pspsettingService: PspSettingService,
        @Inject(MAT_DIALOG_DATA) public data: any = {}
    ) {
        this.record = data?.data ?? {};
    }

    title = "Create Company To Company Markup";
    btnLabel = "Create";
    fieldList: {};
    records: any = {};

    ngOnInit(): void {
        this.formGroup = this.builder.group({
            id: [''],
            company_id: [''],
            companyfilter: [''],
            to_company_id: [''],
            tocompanyfilter: [''],
            markup_percentage: ['']
        });

        this.setupCompanyFilter('companyfilter', 'fromCompanyList');
        this.setupCompanyFilter('tocompanyfilter', 'toCompanyList');

        if (this.record.id) {
            this.companyToCompanyMarkupService.getCompanyToCompanyMarkupRecord(this.record?.id).subscribe({
                next: (data) => {
                    this.records = data;
                    this.readonly = this.data.readonly;

                    this.formGroup.patchValue(data);
                    this.formGroup.get("company_id").patchValue(this.record?.fromCompanyId);
                    this.formGroup.get("to_company_id").patchValue(this.record?.toCopmanyId);
                    this.title = this.readonly
                        ? 'Company to Company Markup - ' + this.record?.company
                        : 'Modify Company to Company Markup';
                    this.btnLabel = this.readonly ? 'Close' : 'Save';
                }, error: (err) => { this.alertService.showToast('error', err, 'top-right', true) }
            });
        }
    }

    numberOnly(event): boolean {
        const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode > 31 && (charCode < 46 || charCode > 57)) {
            return false;
        }
        return true;
    }

    setupCompanyFilter(controlName: string, listName: string): void {
        this.formGroup.get(controlName).valueChanges.pipe(
            filter((search) => !!search),
            startWith(''),
            debounceTime(200),
            distinctUntilChanged(),
            switchMap((value: any) => this.pspsettingService.getCompanyCombo(value)),
            take(1)
        ).subscribe({
            next: data => {
                this[listName] = data;
                this.filterToCompanyList();
            }
        });
    }

    onCompanyFromChange(selectedCompanyId: any): void {
        this.filterToCompanyList(selectedCompanyId);
    }

    private filterToCompanyList(selectedCompanyId?: any): void {
        if (selectedCompanyId) {
            this.filteredToCompanyList = this.toCompanyList.filter(
                company => company.company_id !== selectedCompanyId
            );
        } else {
            const selectedCompanyId = this.formGroup.get('company_id')?.value;
            this.filteredToCompanyList = this.toCompanyList.filter(
                company => company.company_id !== selectedCompanyId
            );
        }
    }

    submit(): void {
        if (!this.formGroup.valid) {
            this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
            this.formGroup.markAllAsTouched();
            return;
        }

        this.disableBtn = true;
        const json = this.formGroup.getRawValue();
        const newJson = {
            id: this.record?.id ? this.record?.id : "",
            company_id: json.company_id ? json.company_id : "",
            to_company_id: json.to_company_id ? json.to_company_id : "",
            markup_percentage: json.markup_percentage ? json.markup_percentage : ""
        };

        this.companyToCompanyMarkupService.create(newJson).subscribe({
            next: () => {
                this.matDialogRef.close(true);
                this.disableBtn = false;
            },
            error: (err) => {
                this.disableBtn = false;
                this.alertService.showToast('error', err, "top-right", true);
            }
        });
    }
}
