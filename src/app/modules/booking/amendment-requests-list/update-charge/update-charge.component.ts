// import { AmendmentRequestsService } from './../../../../services/amendment-requests.service';
import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToasterService } from 'app/services/toaster.service';
import { AmendmentRequestsService } from 'app/services/amendment-requests.service';
import { MatCardModule } from '@angular/material/card';
import { NumberDirective } from '@fuse/directives/numbers-only/numbers-only.directive';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Subject, takeUntil } from 'rxjs';
import { EntityService } from 'app/services/entity.service';

@Component({
    selector: 'app-update-charge',
    templateUrl: './update-charge.component.html',
    standalone: true,
    styleUrls: ['./update-charge.component.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        DatePipe,
        AsyncPipe,
        FormsModule,
        MatCardModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule,
        MatSlideToggleModule,
        MatTooltipModule,
        MatDividerModule,
        MatSidenavModule,
        FuseDrawerComponent,
        NumberDirective
    ]
})
export class UpdateChargeComponent implements OnInit {
    @ViewChild('updateChargeDrawer') public updateChargeDrawer: MatSidenav;

    disableBtn: boolean = false
    record: any = {};
    amendmentData: any = {};
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    // New code 
    formObj: any = {
        adult_charge: 0,
        child_charge: 0,
        Infant_charge: 0,
        bonton_markup_value: 0,
        addon_markup_value: 0,
        segment_amount: 0,
        company_remark: ''
    }

    // public matDialogRef: MatDialogRef<UpdateChargeComponent>,
    constructor(
        private alertService: ToasterService,
        private amendmentRequestsService: AmendmentRequestsService,
        private entityService: EntityService,
    ) {
        this.entityService.onUpdateChargeCall().pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (item) => {
                this.record = item?.data;
                this.formObj = {
                    adult_charge: 0,
                    child_charge: 0,
                    Infant_charge: 0,
                    bonton_markup_value: 0,
                    addon_markup_value: 0,
                    segment_amount: 0,
                    company_remark: ''
                }
                this.updateChargeDrawer.toggle();
                this.getAmendment();
            }
        })
    }


    ngOnInit(): void {

    }

    getAmendment() {
        this.amendmentRequestsService.initialAmendmentCharges(this.record.id).subscribe({
            next: (res) => {
                if (res && res.pax) {
                    this.amendmentData = JSON.parse(JSON.stringify(res));
                    
                    this.formObj.adult_charge = (this.amendmentData?.adult_price || 0);
                    this.formObj.child_charge = (this.amendmentData?.child_price || 0);
                    this.formObj.Infant_charge = (this.amendmentData?.infant_price || 0);
                    this.formObj.company_remark = (this.amendmentData?.company_remark || '');
                    this.formObj.addon_markup_value = (this.amendmentData?.addon_markup || 0);
                    this.formObj.segment_amount = (this.amendmentData?.segment_amount || 0);
                    this.calculation();
                }
            }, error: (err) => {
                this.disableBtn = false;
                this.alertService.showToast('error', err, "top-right", true);
            }
        })
    }

    // Calculation
    calculation(): void {
        switch (this.amendmentData.markup_type) {
            case 'Flat for Full Amendment':
                this.formObj.bonton_markup_value = this.amendmentData.markup_value || 0;
                break;
            case 'Flat Per Pax':
                this.formObj.bonton_markup_value = ((this.amendmentData.markup_value || 0) * this.amendmentData.pax || 1);
                break;
            case 'Percentage(%) for Full Amendment':
                let total_pax_amt = ((this.formObj.adult_charge || 0) + (this.formObj.child_charge || 0) + (this.formObj.Infant_charge || 0));
                this.formObj.bonton_markup_value = (total_pax_amt * 5 / 100);
                break;
            case 'Percentage(%) Per Pax':
                let total_pax_amount = ((this.formObj.adult_charge || 0) + (this.formObj.child_charge || 0) + (this.formObj.Infant_charge || 0));
                let totlaCalc = ((total_pax_amount * this.amendmentData.pax) * 5) / 100;
                this.formObj.bonton_markup_value = totlaCalc;
                break;
        }

        this.formObj.bonton_markup_value = Number(this.formObj.bonton_markup_value.toFixed(2));
    }

    // Update Data
    submit(form: any): void {
        if (!form.valid) {
            this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
            form.markAllAsTouched();
            return;
        }

        this.disableBtn = true;
        const json = {
            total_pax: this.amendmentData.pax,
            amendment_id: this.record.id,
            roe: this.amendmentData?.roe || '',
            company_remark: this.formObj.company_remark || '',
            isRefundAMDT: this.amendmentData.is_refund,
            amountType: this.amendmentData.amountType,
            addon_markup: this.formObj.addon_markup_value || 0,
            infant: this.formObj.Infant_charge || 0,
            child: this.formObj.child_charge || 0,
            adult: this.formObj.adult_charge || 0,
            segmentAmount: this.formObj.segment_amount || 0
        }
        this.amendmentRequestsService.amendmentCharges(json).subscribe({
            next: () => {
                this.alertService.showToast('success', 'Amendment charges updated!', "top-right", true);
                this.disableBtn = false;
                this.entityService.raiserefreshUpdateChargeCall(true);
                this.updateChargeDrawer.close();
            }, error: (err) => {
                this.disableBtn = false;
                this.alertService.showToast('error', err, "top-right", true);
            }
        })
    }
}