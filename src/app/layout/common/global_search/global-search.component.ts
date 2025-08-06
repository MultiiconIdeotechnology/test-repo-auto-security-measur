import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { FuseAlertComponent } from '@fuse/components/alert';
import { InfoWalletComponent } from 'app/modules/account/wallet/info-wallet/info-wallet.component';
import { PaymentInfoComponent } from 'app/modules/reports/account/payment-list/payment-info/payment-info.component';
import { Security, module_name, messages } from 'app/security';
import { EntityService } from 'app/services/entity.service';
import { GlobalSearchService } from 'app/services/global-search.service';
import { ToasterService } from 'app/services/toaster.service';
import { Linq } from 'app/utils/linq';
import { InfoWithdrawComponent } from "../../../modules/account/withdraw/info-withdraw/info-withdraw.component";
import { Routes } from 'app/common/const';
import { ForexBookingDetailsComponent } from 'app/modules/booking/forex/forex-booking-details/forex-booking-details.component';

@Component({
    selector: 'app-global-search',
    templateUrl: './global-search.component.html',
    standalone: true,
    imports: [CommonModule, FuseAlertComponent, FormsModule, ReactiveFormsModule, MatFormFieldModule,
        MatInputModule, MatButtonModule, MatIconModule, RouterLink, MatIconModule, InfoWithdrawComponent, ForexBookingDetailsComponent
    ],
})
export class GlobalSearchComponent {
    formGroup: FormGroup;
    searchList: any = [];
    bookingRefNo: any;
    bookingRefValue: any;
    bookingRefKey: any;

    constructor(private globalService: GlobalSearchService,
        private alertService: ToasterService,
        private matDialog: MatDialog,
        private entityService: EntityService,
        private router: Router,
        private builder: FormBuilder) {
    }

    ngOnInit(): void {
        this.formGroup = this.builder.group({
            searchfilter: ['']
        });
    }

    search(): void {
        const searchValue = this.formGroup.get('searchfilter').value;
        if (searchValue) {
            var json = {
                value: searchValue.trim()
            }
            this.globalService.getInputDetails(json).subscribe({
                next: data => {
                    this.searchList = data;
                    this.bookingRefNo = this.searchList?.items[0]?.display_value;
                    this.bookingRefValue = this.searchList?.items[0]?.value;
                    this.bookingRefKey = this.searchList?.items[0]?.key;

                    if (this.searchList?.items?.length === 0) {
                        this.alertService.showToast('error', "No Record found", "top-right", true);
                        return;
                    }

                    if (this.bookingRefKey == 'flight_booking') {
                        if (!Security.hasViewDetailPermission(module_name.bookingsFlight)) {
                            return this.alertService.showToast('error', messages.permissionDenied);
                        }
                        this.formGroup.get('searchfilter').patchValue("");
                        // this.router.navigate([Routes.booking.booking_details_route + '/' + this.bookingRefValue])
                        //Linq.recirect('/booking/flight/details/' + this.bookingRefValue);
                        let uri = '/booking/flight/details/' + this.bookingRefValue
                        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => this.router.navigate([uri]));
                        this.matDialog.closeAll();
                    }
                    else if (this.bookingRefKey == 'bus_booking') {
                        if (!Security.hasViewDetailPermission(module_name.bus)) {
                            return this.alertService.showToast('error', messages.permissionDenied);
                        }
                        this.formGroup.get('searchfilter').patchValue("");

                        let uri = '/booking/bus/details/' + this.bookingRefValue
                        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => this.router.navigate([uri]));
                        // this.router.navigate(['/booking/bus/details/' + this.bookingRefValue])
                        // Linq.recirect('/booking/bus/details/' + this.bookingRefValue);
                        this.matDialog.closeAll();
                    }
                    else if (this.bookingRefKey == 'hotel_booking') {
                        if (!Security.hasViewDetailPermission(module_name.bookingsHotel)) {
                            return this.alertService.showToast('error', messages.permissionDenied);
                        }
                        this.formGroup.get('searchfilter').patchValue("");
                        // this.router.navigate(['/booking/hotel/details/' + this.bookingRefValue])
                        // Linq.recirect('/booking/hotel/details/' + this.bookingRefValue);
                        let uri = '/booking/hotel/details/' + this.bookingRefValue
                        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => this.router.navigate([uri]));
                        this.matDialog.closeAll();
                    }
                    else if (this.bookingRefKey == 'holiday_booking') {
                        if (!Security.hasViewDetailPermission(module_name.bookingsHotel)) {
                            return this.alertService.showToast('error', messages.permissionDenied);
                        }
                        this.formGroup.get('searchfilter').patchValue("");
                        let uri = '/booking/holiday-lead/details/' + this.bookingRefValue
                        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => this.router.navigate([uri]));
                        this.matDialog.closeAll();
                    }
                    else if (this.bookingRefKey == 'visa_booking') {
                        if (!Security.hasViewDetailPermission(module_name.bookingsVisa)) {
                            return this.alertService.showToast('error', messages.permissionDenied);
                        }
                        this.formGroup.get('searchfilter').patchValue("");
                        // Linq.recirect('/booking/visa/details/' + this.bookingRefValue);
                        // this.router.navigate(['/booking/visa/details/' + this.bookingRefValue])
                        let uri = 'booking/visa/details/' + this.bookingRefValue
                        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => this.router.navigate([uri]));
                        this.matDialog.closeAll();
                    }
                    else if (this.bookingRefKey == 'offline_service_booking') {
                        if (!Security.hasViewDetailPermission(module_name.offlineService)) {
                            return this.alertService.showToast('error', messages.permissionDenied);
                        }
                        this.formGroup.get('searchfilter').patchValue("");
                        // Linq.recirect('/booking/offline-service/entry/' + this.bookingRefValue + '/readonly');
                        // this.router.navigate(['/booking/offline-service/entry/' + this.bookingRefValue + '/readonly'])
                        let uri = '/booking/offline-service/entry/' + this.bookingRefValue + '/readonly'
                        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => this.router.navigate([uri]));
                        this.matDialog.closeAll();
                    }
                    else if (this.bookingRefKey == 'agent_detail') {
                        if (!Security.hasViewDetailPermission(module_name.agent)) {
                            return this.alertService.showToast('error', messages.permissionDenied);
                        }
                        this.formGroup.get('searchfilter').patchValue("");
                        // Linq.recirect('/customers/agent/entry/' + this.bookingRefValue + '/readonly');
                        // this.router.navigate([])
                        let uri = '/customers/agent/entry/' + this.bookingRefValue + '/readonly'
                        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => this.router.navigate([uri]));
                        this.matDialog.closeAll();
                    }
                    else if (this.bookingRefKey == 'payment_detail') {
                        if (!Security.hasViewDetailPermission(module_name.payment)) {
                            return this.alertService.showToast('error', messages.permissionDenied);
                        }
                        this.formGroup.get('searchfilter').patchValue("");
                        this.matDialog.open(PaymentInfoComponent, {
                            data: { payment: this.bookingRefValue },
                            disableClose: true
                        });
                    }
                    else if (this.bookingRefKey == 'receipt_detail') {
                        if (!Security.hasViewDetailPermission(module_name.receipts)) {
                            return this.alertService.showToast('error', messages.permissionDenied);
                        }
                        this.formGroup.get('searchfilter').patchValue("");
                        this.matDialog.open(PaymentInfoComponent, {
                            data: { receipt: this.bookingRefValue },
                            disableClose: true
                        });
                    }
                    else if (this.bookingRefKey == 'recharge_detail') {
                        if (!Security.hasViewDetailPermission(module_name.wallet)) {
                            return this.alertService.showToast('error', messages.permissionDenied);
                        }
                        this.formGroup.get('searchfilter').patchValue("");
                        this.matDialog.open(InfoWalletComponent, {
                            data: { data: this.bookingRefValue, readonly: true },
                            disableClose: true
                        })
                    }

                    else if (this.bookingRefKey == 'withdraw_detail') {
                        if (!Security.hasViewDetailPermission(module_name.wallet)) {
                            return this.alertService.showToast('error', messages.permissionDenied);
                        }
                        this.formGroup.get('searchfilter').patchValue("");
                        this.router.navigate(['/account/withdraw'])
                        setTimeout(() => {
                            this.entityService.raiseInfoWithdraw({ data: this.bookingRefValue, global_withdraw: true })
                        }, 300);
                        this.matDialog.closeAll();
                    }

                    else if (this.bookingRefKey == 'forex_lead') {
                        if (!Security.hasViewDetailPermission(module_name.bookingsForex)) {
                            return this.alertService.showToast('error', messages.permissionDenied);
                        }
                        this.formGroup.get('searchfilter').patchValue("");
                        this.router.navigate(['/booking/forex'])
                        setTimeout(() => {
                            this.entityService.raiseForexEntityCall({ data: this.bookingRefValue, global_withdraw: true })
                        }, 300);
                        this.matDialog.closeAll();
                    }

                    else if (this.bookingRefKey == 'air_group_inqury') {
                        if (!Security.hasViewDetailPermission(module_name.groupInquiry)) {
                            return this.alertService.showToast('error', messages.permissionDenied);
                        }
                        this.formGroup.get('searchfilter').patchValue("");
                        // Linq.recirect('/booking/group-inquiry/details/' + this.bookingRefValue);
                        // this.router.navigate(['/booking/group-inquiry/details' + this.bookingRefValue])
                        let uri = '/booking/group-inquiry/details' + this.bookingRefValue
                        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => this.router.navigate([uri]));
                        this.matDialog.closeAll();
                    }
                    
                    else if (this.bookingRefKey == 'insurance') {
                        if (!Security.hasViewDetailPermission(module_name.bookingsFlight)) {
                            return this.alertService.showToast('error', messages.permissionDenied);
                        }
                        this.formGroup.get('searchfilter').patchValue("");
                        let uri = '/booking/insurance/details/' + this.bookingRefValue
                        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => this.router.navigate([uri]));
                        this.matDialog.closeAll();
                    }

                    else if (this.bookingRefKey == 'air_amendment') {
                        if (!Security.hasViewDetailPermission(module_name.wallet)) {
                            return this.alertService.showToast('error', messages.permissionDenied);
                        }
                        this.formGroup.get('searchfilter').patchValue("");
                        this.router.navigate(['/booking/amendment-requests'])
                        setTimeout(() => {
                            this.entityService.raiseAmendmentInfoCall({ data: {id:this.bookingRefValue}, global_withdraw: true })
                        }, 1000);
                        this.matDialog.closeAll();
                    }

                    else if (this.bookingRefKey == 'cab_booking') {
                        if (!Security.hasViewDetailPermission(module_name.cab_lead)) {
                            return this.alertService.showToast('error', messages.permissionDenied);
                        }
                        this.formGroup.get('searchfilter').patchValue("");

                        let uri = '/booking/cab/details/' + this.bookingRefValue
                        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => this.router.navigate([uri]));
                        this.matDialog.closeAll();
                    }
                },
                error: err => {
                    this.alertService.showToast('error', err, "top-right", true);
                }
            });
        }
    }
}
