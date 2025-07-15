import { Component, ViewChild } from '@angular/core';
import { AsyncPipe, CommonModule, NgFor, NgIf } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatSidenav } from '@angular/material/sidenav';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { DataManagerService } from 'app/services/data-manager.service';
import { RefferralService } from 'app/services/referral.service';
import { SidebarCustomModalService } from 'app/services/sidebar-custom-modal.service';
import { ToasterService } from 'app/services/toaster.service';
import { debounceTime, distinctUntilChanged, filter, startWith, Subject, switchMap, takeUntil } from 'rxjs';
import { PspSettingService } from 'app/services/psp-setting.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { AccountService } from 'app/services/account.service';
import { DateTime } from 'luxon';
import { CommonFareTypeService } from 'app/services/commonFareType.service';

@Component({
    selector: 'app-common-fareType-entry',
    templateUrl: './common-fareType-entry.component.html',
    styles: [
        ` app-crm-lead-entry {
                  position: static;
                  display: block;
                  flex: none;
                  width: auto;
              }
  
              @media (screen and min-width: 1280px) {
                  empty-layout + app-crm-lead-entry .settings-cog {
                      right: 0 !important;
                  }
              }
          `,
    ],
    standalone: true,
    imports: [
        CommonModule,
        FuseDrawerComponent,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        FormsModule,
        MatSelectModule,
        MatCheckboxModule,
        NgxMatSelectSearchModule,
        MatTooltipModule,
        ReactiveFormsModule,
        NgIf,
        NgFor,
        AsyncPipe,
        RouterModule,
        MatDatepickerModule,
        MatMenuModule,
        NgxMatTimepickerModule,

    ],
    styleUrls: ['./common-fareType-entry.component.scss']
})
export class CommonFareTypeEntryComponent {
    @ViewChild('settingsDrawer') settingsDrawer: MatSidenav;
    private destroy$: Subject<any> = new Subject<any>();
    title: string = 'Add'
    formGroup: FormGroup;
    buttonLabel: string = 'Create';
    referralData: any = {};
    disableBtn: boolean = false;
    compnyAllList: any[] = [];
    compnyList: any[] = [];
    fareTypeAllList: any[] = [];
    fareTypeList: any[] = [];
    fieldList: any[] = [];
    isEdit:boolean = false;


    constructor(
        private sidebarDialogService: SidebarCustomModalService,
        private builder: FormBuilder,
        private accountService: AccountService,
        private _filterService: CommonFilterService,
        private dataManagerService: DataManagerService,
        private referralService: RefferralService,
        private alertService: ToasterService,
        private pspsettingService: PspSettingService,

        private commonFareTypeService: CommonFareTypeService
    ) {
        this.formGroup = this.builder.group({
            id: [''],
            fare_type: [''],
        })
    }

    ngOnInit(): void {

        // subscribing to modalchange on create and modify
        this.sidebarDialogService.onModalChange().pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
            if (res) {
                if (res['type'] == 'common-fareType-create') {
                    this.settingsDrawer.open();
                    this.title = 'Add';
                    this.buttonLabel = "Create";
                } else if (res['type'] == 'common-fareType-edit') {
                    this.settingsDrawer.open();
                    this.title = 'Modify';
                    this.buttonLabel = "Update";
                    if (res?.data) {
                        this.isEdit = true;                                           
                        this.formGroup.patchValue(res?.data?.data)                     
                    }
                }
            }
        });


    }

    // reseting form to default value
    resetForm() {
        this.formGroup?.patchValue({
            id: '',
            fare_type: '',

        })
        this.disableBtn = false;

    }

    submit(): void {
        if (!this.formGroup.valid) {
            this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
            this.formGroup.markAllAsTouched();
            return;
        }

        const json = this.formGroup.getRawValue();
        // return
        this.disableBtn = true
        this.commonFareTypeService.createCommonFareType(json).subscribe({
            next: (data) => {
               // this.alertService.showToast('success', 'Fare type created successfully');
               this.alertService.showToast('success', this.isEdit ? 'Fare type updated successfully' : 'Fare type created successfully');
                this.resetForm();
                if (data.id) {
                    let resData = {
                        id: data?.id,
                        fare_type: data?.fare_type,
                        entry_date_time: data?.entry_date_time,
                        modify_date_time: data?.modify_date_time,
                    }
                    this.sidebarDialogService.close({ data: resData, key: 'create-response-fareType' });
                    this.settingsDrawer.close();
                }

                this.disableBtn = false;
            }, error: (err) => {
                this.alertService.showToast('error', err)
                this.disableBtn = false
            }
        });

    }




}

