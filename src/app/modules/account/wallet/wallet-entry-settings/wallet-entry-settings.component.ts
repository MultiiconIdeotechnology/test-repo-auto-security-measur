import { AsyncPipe, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenav } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { JsonFile } from 'app/common/jsonFile';
import { CurrencyRoeService } from 'app/services/currency-roe.service';
import { EntityService } from 'app/services/entity.service';
import { PspSettingService } from 'app/services/psp-setting.service';
import { ToasterService } from 'app/services/toaster.service';
import { WalletService } from 'app/services/wallet.service';
import { DocValidationDTO, CommonUtils } from 'app/utils/commonutils';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { Subject, takeUntil, distinctUntilChanged, debounceTime, startWith, filter, switchMap } from 'rxjs';

@Component({
    selector: 'wallet-entry-settings',
    templateUrl: './wallet-entry-settings.component.html',
    standalone: true,
    imports: [
        FuseDrawerComponent,
        MatDividerModule,
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
        MatDatepickerModule,
        MatSlideToggleModule,
        MatTooltipModule,
        MatMenuModule,
        NgxMatSelectSearchModule,
        NgxMatTimepickerModule,
        FormsModule,
        MatSnackBarModule,
        MatAutocompleteModule,
        RouterOutlet,
        MatOptionModule
    ]
})

export class WalletEnterySettingsComponent implements OnInit, OnDestroy {
    @ViewChild('settingsDrawer') public settingsDrawer: MatSidenav;
    disableBtn: boolean = false;
    record: any;
    readonly: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    create: boolean = false;
    agentList: any[] = [];
    CurrencyList: any[] = [];
    CurrencyListTemp: any[] = [];
    mopList: any = [];
    selectedFile: File;
    jFile: JsonFile;
    formGroup: FormGroup;
    title = 'Wallet Recharge';
    btnLabel = 'Top-up';

    constructor(
        private builder: FormBuilder,
        public alertService: ToasterService,
        private currencyRoeService: CurrencyRoeService,
        private walletService: WalletService,
        private pspsettingService: PspSettingService,
        private entityService: EntityService,
    ) {
        this.entityService.onwalletRechargeCall().pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (item) => {
                this.settingsDrawer.toggle()
                this.create = item?.create;
                this.mopList = item?.mopData;
                if (this.create) {
                    this.title = "Wallet Recharge"
                }
                
                // Only first time load both combo
                if(this.agentList && !this.agentList.length) {
                    this.getAgentCombo();
                }
                if(this.CurrencyList && !this.CurrencyList.length) {
                    this.getCurrencyCombo();
                }
            }
        })
    }

    ngOnInit(): void {
        this.formGroup = this.builder.group({
            recharge_for_id: [''],
            agentfilter: [''],
            currency_id: [''],
            currencyfilter: [''],
            recharge_amount: ['0', Validators.min(0)],
            settled_amount: ['0'],
            mop: [''],
            user_remark: [''],
            transaction_number: [''],
            request_from: ['Web'],
        });

        this.formGroup.get('mop').patchValue('NEFT')

    }
    
    /*************Agent combo**************/
    getAgentCombo() {
        this.formGroup.get('agentfilter').valueChanges.pipe(
            filter((search) => !!search),
            startWith(''),
            debounceTime(200),
            distinctUntilChanged(),
            switchMap((value: any) => {
                return this.pspsettingService.getAgentCombo(value, true);
            })
        )
            .subscribe({
                next: data => {
                    this.agentList = data
                    this.formGroup.get("recharge_for_id").patchValue(this.agentList[0]?.id || '');
                }
            });
    }

    /*************Currency combo**************/
    getCurrencyCombo() {
        this.currencyRoeService.getcurrencyCombo().subscribe({
            next: res => {
                this.CurrencyList = res;
                this.CurrencyListTemp = res;
                this.formGroup.get('currency_id').patchValue(this.CurrencyList.find(x => x.currency_short_code.includes("INR")).id)
            }
        })

        this.formGroup.get('currencyfilter').valueChanges.subscribe(data => {
            if (data.trim() == '') {
                this.CurrencyList = this.CurrencyListTemp
            }
            else {
                this.CurrencyList = this.CurrencyListTemp.filter(x => x.currency_short_code.toLowerCase().includes(data.toLowerCase()));
            }
        })
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    onFileSelected(event: any) {
        const file = (event.target as HTMLInputElement).files[0];
        const extantion: string[] = ["pdf", "jpg", "jpeg", "png", "webp"];
        var validator: DocValidationDTO = CommonUtils.isDocValid(file, extantion, 2024, null);
        if (!validator.valid) {
            this.alertService.showToast('error', validator.alertMessage, 'top-right', true);
            (event.target as HTMLInputElement).value = '';
            return;
        }
        this.selectedFile = event.target.files[0];
        CommonUtils.getJsonFile(file, (reader, jFile) => {
            this.jFile = jFile;
        });

        this.alertService.showToast('success', 'Attached file successfully');
        (event.target as HTMLInputElement).value = '';
    }

    submit(): void {
        if (this.formGroup.get('recharge_amount').value < 0) {
            this.alertService.showToast('error', 'Please enter positive number.', 'top-right', true);
            return;
        }
        if (!this.formGroup.valid) {
            this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
            this.formGroup.markAllAsTouched();
            return;
        }

        this.disableBtn = true;
        const json = this.formGroup.getRawValue();
        json.file = this.jFile ? this.jFile : ''
        this.walletService.offlineRecharge(json).subscribe({
            next: () => {
                this.disableBtn = false;
                this.settingsDrawer.close();
                this.entityService.raiserefreshWalletRechargeCall(true);
                this.alertService.showToast('success', 'Top-up wallet request added!', 'top-right', true);
            },
            error: (err) => {
                this.alertService.showToast('error', err, 'top-right', true);
                this.disableBtn = false;
            },
        });
    }

    public compareWith(v1: any, v2: any) {
        return v1 && v2 && v1.id === v2.id;
    }
}
