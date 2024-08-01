import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from "@angular/common";
import { Component } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatTooltipModule } from "@angular/material/tooltip";
import { Router, ActivatedRoute, RouterModule } from "@angular/router";
import { Routes } from "app/common/const";
import { ClassyLayoutComponent } from "app/layout/layouts/vertical/classy/classy.component";
import { ToasterService } from "app/services/toaster.service";
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import { MatMenuModule } from "@angular/material/menu";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { NgxMatTimepickerModule } from "ngx-mat-timepicker";
import { GroupInquiryService } from "app/services/group-inquiry.service";
import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { Linq } from "app/utils/linq";
import { CompactLayoutComponent } from "app/layout/layouts/vertical/compact/compact.component";

@Component({
    selector: 'app-group-inquiry-detail',
    templateUrl: './group-inquiry-detail.component.html',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        DatePipe,
        AsyncPipe,
        RouterModule,
        ReactiveFormsModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
        MatSelectModule,
        MatDatepickerModule,
        MatTooltipModule,
        MatMenuModule,
        MatSlideToggleModule,
        NgxMatTimepickerModule,
        NgxMatSelectSearchModule,
        NgClass,
        ClipboardModule
    ]
})
export class GroupInquiryComponent {

    mainData: any = {};
    segmentList: any[] = [];
    Status: any;
    priceDetails: any[] = [];
    id: any;
    priceInfoStatus: string = "";

    constructor(
        private router: Router,
        public route: ActivatedRoute,
        private groupInquiryService: GroupInquiryService,
        private clipboard: Clipboard,
        private toastr: ToasterService,
        private classy: CompactLayoutComponent,
    ) {
    }

    gropInqueryRoute = Routes.booking.group_inquiry_route;
    close() {
        this.router.navigate([this.gropInqueryRoute])
    }

    ngOnInit() {
        this.refreshData()
        this.classy.toggleNavigation('mainNavigation');
    }

    copyLink(link: string): void {
        this.clipboard.copy(link);
        this.toastr.showToast('success', 'Link Copied');
    }

    refreshData() {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            this.groupInquiryService.getGroupInquiryRecord(id).subscribe({
                next: (data: any) => {
                    this.mainData = data;
                    this.Status = data.status
                    this.priceDetails = data.priceDetail
                    // this.priceInfoStatus = this.priceDetails.find(x => x.is_header).key;
                    // this.priceDetails = this.priceDetails.filter(x => !x.is_header)
                    this.priceDetails = Linq.groupBy(this.priceDetails, x => x.box)
                    this.segmentList = data.segments;
                }, error: err => {
                    this.toastr.showToast('error', err, 'top-right', true);
                }
            })
        })
    }

    isSamePlanes(plan1, plan2): boolean {
        return `${plan1.airlineCode}${plan1.fareClass}${plan1.flightNumber}` === `${plan2.airlineCode}${plan2.fareClass}${plan2.flightNumber}`
    }

    getTooltip(data): string {
        if (Array.isArray(data)) {
            return data.join('\n').replace(/\|/g, '\n--------------------------------\n');
        } else {
            return String(data).replace(/\|/g, '\n');
        }
    }
}
