import { Component, Inject } from '@angular/core';
import { NgIf, NgFor, CommonModule, NgClass, AsyncPipe } from '@angular/common';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';
import {
    ReplaySubject,
    debounceTime,
    distinctUntilChanged,
    filter,
    startWith,
    switchMap,
} from 'rxjs';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { KycDocumentService } from 'app/services/kyc-document.service';
import { KycService } from 'app/services/kyc.service';
import { ToasterService } from 'app/services/toaster.service';

@Component({
    selector: 'app-documents-filter',
    templateUrl: './documents-filter.component.html',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        AsyncPipe,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        NgxMatSelectSearchModule,
        MatIconModule,
        MatMenuModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        MatInputModule,
        MatButtonModule,
        MatTooltipModule,
        RouterOutlet,
        MatProgressSpinnerModule,
        MatSelectModule,
        MatTabsModule,
    ],
})
export class DocumentsFilterComponent {
    filterForm: FormGroup;
    readonly: boolean;
    record: any = {};
    title = 'Filter Criteria';
    documentList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
    profileList: any[] = [];
    AllprofileList: any[] = [];
    Particular: any;
    selectMasterList = ['Agent', 'Sub Agent','Customer', 'Supplier', 'Employee'];
    selectStatusList = ['All','Audited', 'Rejected', 'Pending'];

    constructor(
        public matDialogRef: MatDialogRef<DocumentsFilterComponent>,
        private builder: FormBuilder,
        private kycDocService: KycDocumentService,
        private kycService: KycService,
        private alertService: ToasterService,
        @Inject(MAT_DIALOG_DATA) public data: any = {}
    ) {
        if (data) this.record = data;
    }

    ngOnInit(): void {

        this.filterForm = this.builder.group({
            MasterFor: [''],
            status: ['All'],
            Particular: [''],
            kycfilter: [''],
            DocName: [''],
            document_filter: [''],
        });

        this.filterForm.patchValue(this.data);

        
        this.filterForm.get("kycfilter").patchValue(this.record.Particular.profile_name);

        this.filterForm.get('kycfilter').valueChanges.subscribe((data) => {
            this.profileList = this.AllprofileList.filter((x) =>
                x.profile_name.toLowerCase().includes(data.toLowerCase())
            );
        });

        if(this.record.Particular)
        this.filterForm.get("Particular").patchValue(this.record.Particular.profile_name);


        this.filterForm
            .get('document_filter')
            .valueChanges.pipe(
                filter((search) => !!search),
                startWith(''),
                debounceTime(200),
                distinctUntilChanged(),
                switchMap((value: any) => {
                    return this.kycDocService.getDocumentTypeCombo(value);
                })
            )
            .subscribe((data) => this.documentList.next(data));


    }

    filterfrom(value: string) {
      this.kycService.getkycprofileCombo(value).subscribe({
        next: (res) => {
          this.profileList = res;
          this.AllprofileList = res;
        }
      });
    }

    changeVal(v) {
      this.kycService.getkycprofileCombo(v).subscribe({
        next: (res) => {
          this.profileList = res;
          this.AllprofileList.push(...res);
        },error: (err) => {
          this.alertService.showToast('error', err);
        }
      });
    }

    public compareWith(v1: any, v2: any) {
        return v1 && v2 && v1.id === v2.id;
    }

    ngSubmit(): void {
        const json = this.filterForm.getRawValue();
        json.MasterFor = json.MasterFor
        json.Status = json.status
        json.Particular = json.Particular
        json.DocName = json.DocName
        this.matDialogRef.close(json);
    }
}
