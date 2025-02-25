import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { FlightTabService } from 'app/services/flight-tab.service';
import { ToasterService } from 'app/services/toaster.service';

@Component({
    selector: 'app-airline-fare-rules',
    templateUrl: './airline-fare-rules.component.html',
    standalone: true,
    imports: [CommonModule, MatIconModule, MatButtonModule, MatIconModule,]
})
export class AirlineFareRulesComponent implements OnInit {

    fareRuledata: any = '';
    isLoding: boolean = false;
    constructor(
        public matDialogRef: MatDialogRef<AirlineFareRulesComponent>,
        public sanitizer: DomSanitizer,
        private flightService: FlightTabService,
        private alertService: ToasterService,
        @Inject(MAT_DIALOG_DATA) public datas: any,
    ) {
    }

    ngOnInit(): void {
        this.getFareRules();
    }

    getFareRules(): void {
        this.isLoding = true;
        this.flightService.fareRuleRes({ id: this.datas.id }).subscribe({
            next: res => {
                if (res && res.data) {
                    this.fareRuledata = this.sanitizer.bypassSecurityTrustHtml(res.data);
                }
                this.isLoding = false;
            }, error: err => {
                this.alertService.showToast('error', err)
                this.isLoding = false;
            }
        })
    }

}