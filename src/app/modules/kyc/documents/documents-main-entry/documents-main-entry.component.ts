import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CityService } from 'app/services/city.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Routes } from 'app/common/const';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DesignationService } from 'app/services/designation.service';
import { ToastrService } from 'ngx-toastr';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import {
    filter,
    startWith,
    debounceTime,
    distinctUntilChanged,
    switchMap,
    ReplaySubject,
} from 'rxjs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { KycDocumentService } from 'app/services/kyc-document.service';
import { EmployeeService } from 'app/services/employee.service';
import { CommonUtils } from 'app/utils/commonutils';
import { ToasterService } from 'app/services/toaster.service';

@Component({
    selector: 'app-documents-main-entry',
    templateUrl: './documents-main-entry.component.html',
    standalone: true,
    imports: [
        MatIconModule,
        ReactiveFormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
        MatSelectModule,
        NgIf,
        NgFor,
        AsyncPipe,
        NgxMatSelectSearchModule,
        RouterModule,
        MatTooltipModule,
        MatMenuModule,
        MatSlideToggleModule,
    ],
})
export class DocumentsMainEntryComponent {
    readonly: boolean = false;
    record: any = {};
    title: string = 'Create Document';
    btnTitle: string = 'Create';
    fieldList: {};
    employeeList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
    AgentList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
    SupplierList: ReplaySubject<any[]> = new ReplaySubject<any[]>();
    File: any = {};
    DocList: any[] = [];

    TempDataList: any[] = [];
    tempDocumentList: any[] = [];
    ismodify: boolean = false;
    index: number;

    DocumentOfList: any[] = [
        'Agent',
        'Sub Agent',
        'Distributor',
        'Employee',
        'Supplier',
    ];
    kycprofileRoute = Routes.kyc.documents_route;
    disableBtn: boolean = false;

    constructor(
        public formBuilder: FormBuilder,
        public cityService: CityService,
        public router: Router,
        public route: ActivatedRoute,
        public designationService: DesignationService,
        private kycDocumentService: KycDocumentService,
        private toasterService: ToasterService,
        private employeeService: EmployeeService
    ) {}

    formGroup: FormGroup;
    protected alertService: ToastrService;

    ngOnInit(): void {
        this.formGroup = this.formBuilder.group({
            id: [''],
            document_of: ['Employee'],
            document_of_id: [''],
            document_group: [''],
            maximum_size: [''],
            file_extentions: [''],
            kyc_profile_id: [''],
            kyc_profile_doc_id: [''],
            remark: [''],
            empfilter: [''],
            agentfilter: [''],
            document_user_name: [''],
            kyc_profile_name: [''],
            kyc_profile_doc_name: [''],
            filedocument: [''],
            supplierfilter: [''],
        });

        // this.route.paramMap.subscribe(params => {
        //     const id = params.get('id');
        //     const readonly = params.get('readonly');
      
        //     if (id) {
        //       this.readonly = readonly ? true : false;
        //       this.btnTitle = readonly ? 'Close' : 'Save';

        //       this.kycDocumentService.getdocumentRecord(id).subscribe({
        //         next: data => {
        //           this.record = data;
        //           this.formGroup.patchValue(data);
      
        //           if (this.readonly) { 
        //             this.fieldList = [
        //               { name: 'Doc Of ', value: this.record.doc_of  - this.record.doc_user_name },
        //               { name: 'KYC Profile', value: this.record.kyc_profile_doc_name }, 
        //               { name: 'Status', value: this.record.company_email },
        //               { name: 'Entry', value: this.record.entry_date_time},
        //               { name: 'Document', value: this.record.personal_email }
        //             ]
        //           }
        //         }
        //       })
        //     }
        //   })

        this.formGroup
            .get('empfilter')
            .valueChanges.pipe(
                filter((search) => !!search),
                startWith(''),
                debounceTime(200),
                distinctUntilChanged(),
                switchMap((value: any) => {
                    return this.employeeService.getemployeeCombo(value);
                })
            )
            .subscribe((data) => this.employeeList.next(data));

        this.formGroup
            .get('agentfilter')
            .valueChanges.pipe(
                filter((search) => !!search),
                startWith(''),
                debounceTime(200),
                distinctUntilChanged(),
                switchMap((value: any) => {
                    return this.kycDocumentService.getAgentCombo(value);
                })
            )
            .subscribe((data) => this.AgentList.next(data));

        this.formGroup
            .get('supplierfilter')
            .valueChanges.pipe(
                filter((search) => !!search),
                startWith(''),
                debounceTime(200),
                distinctUntilChanged(),
                switchMap((value: any) => {
                    return this.kycDocumentService.getSupplierCombo(value);
                })
            )
            .subscribe((data) => this.SupplierList.next(data));
    }

    submit(): void {
        this.disableBtn = true;
        if (!this.File) {
            this.disableBtn = false;
            return;
        }
        var tempdata: any[] = [];
        this.DocList.forEach((x) => {
            x.docs.forEach((y) => {
                tempdata.push({
                    id: y.id || '',
                    kyc_profile_doc_id: y.document_id,
                    file: y.File,
                });
            });
        });
        const json: any = {
            document_of: this.formGroup.get('document_of').value,
            document_of_id: this.formGroup.get('document_of_id').value.id,
            kyc_profile_id:
                this.formGroup.get('document_of_id').value.kyc_profile_id,
            doc_details: tempdata,
        };
        this.kycDocumentService.create(json).subscribe({
            next: () => {
                this.router.navigate([this.kycprofileRoute]);
                this.disableBtn = false;
            },
            error: (err) => {
                this.toasterService.showToast('error',err)
                this.disableBtn = false;
            },
        });
    }

    public compareWith(v1: any, v2: any) {
        return v1 && v2 && v1.id === v2.id;
    }

    public onProfileInput(event: any, data: any, grop: string): void {
        const file = (event.target as HTMLInputElement).files[0];
        CommonUtils.getJsonFile(file, (reader, jFile) => {
            this.File = jFile;

            this.DocList.forEach((x) => {
                x.docs.forEach((y) => {
                    if (x.group == grop && y.document_id == data.document_id) {
                        y.File = jFile;
                        y.profile_picture = reader.result;
                    }
                });
            });
        });
    }

    ShowDocument(data: any) {
        window.open(data.profile_picture, '_blank');
    }

    changeDocument() {
        this.formGroup.get('document_of_id').patchValue('');
    }
    changeKYCProfile() {
        if (
            !this.formGroup.get('document_of_id').value.kyc_profile_id ||
            this.formGroup.get('document_of_id').value.kyc_profile_id == '' ||
            this.formGroup.get('document_of_id').value.kyc_profile_id == null
        ) {
            this.DocList = [];
            return;
        }
        this.kycDocumentService
            .getKYCDisplay(
                this.formGroup.get('document_of_id').value.kyc_profile_id
            )
            .subscribe({
                next: (value) => {
                    this.DocList = value;
                },
                error: (err) => {
                    this.toasterService.showToast('error',err)
                    this.disableBtn = false;
                },
            });
    }

    replacestar(data: string): string {
        return data.replaceAll('*', '');
    }
    openDocument(base64Data: string, mimeType: string) {
        // Create a Blob from the base64 data
        const byteCharacters = atob(base64Data);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, { type: mimeType });

        // Generate a URL for the Blob
        const url = URL.createObjectURL(blob);

        // Open the document in a new tab
        window.open(url, '_blank');
    }
}
