import { NgIf, NgFor, DatePipe, CommonModule } from '@angular/common';
import { Component, Inject, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { module_name } from 'app/security';
import { ToasterService } from 'app/services/toaster.service';
import { Subject } from 'rxjs';
import { CRMAgentProfileComponent } from '../agent-profile/agent-profile.component';
import { AppConfig } from 'app/config/app-config';
import { BusinessAnalyticsComponent } from '../business-analytics/business-analytics.component';
import { TimelineCallHistoryComponent } from '../call-history/call-history.component';
import { TimelinePurchaseProductComponent } from '../purchase-product/purchase-product.component';
import { TabAgentStatusChangeComponent } from '../agent-tab-status-change/agent-tab-status-change.component';
import { TabAgentRMChangeComponent } from '../agent-tab-rm-status-change/agent-tab-rm-change.component';

@Component({
    selector: 'app-agent-timeline',
    templateUrl: './agent-timeline.component.html',
    styles: [`
  .tbl-grid {
    grid-template-columns:  40px 234px 180px 230px 250px 180px;
  }
  `],
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        DatePipe,
        ReactiveFormsModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        MatProgressBarModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatFormFieldModule,
        MatMenuModule,
        MatDialogModule,
        MatTooltipModule,
        MatDividerModule,
        CommonModule,
        MatTabsModule,
        CRMAgentProfileComponent,
        BusinessAnalyticsComponent,
        TimelineCallHistoryComponent,
        TimelinePurchaseProductComponent,
        TabAgentStatusChangeComponent,
        TabAgentRMChangeComponent
    ]
})
export class CRMAgentTimelineComponent {
    module_name = module_name.crmagent
    dataList = [];
    total = 0;
    title = "Agent Timeline"

    @ViewChild('agentprofile') agentProfile: CRMAgentProfileComponent;
    @ViewChild('businessanalytics') businessAnalytics: BusinessAnalyticsComponent;
    @ViewChild('callhistory') callhistory: TimelineCallHistoryComponent;
    @ViewChild('techservice') techservice: TimelinePurchaseProductComponent;
    @ViewChild('statuschangedlogs') statuschangedlogs: TabAgentStatusChangeComponent;
    @ViewChild('rmchangelogs') rmchangelogs: TabAgentRMChangeComponent;

    public apiCalls: any = {};
    tabName: any = "Agent Profile";
    tabNameStr: any = 'Agent Profile'
    tab: string = 'Agent Profile';
    isSecound: boolean = true
    isThird: boolean = true
    filterData: any = {};
    searchInputControlInbox = new FormControl('');
    _unsubscribeAll: Subject<any> = new Subject<any>();
    searchInputControlpartners = new FormControl('');
    appConfig = AppConfig;
    filter: any = {}
    record: any = {};

    constructor(
        public alertService: ToasterService,
        public matDialogRef: MatDialogRef<CRMAgentTimelineComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any = {}
    ) {
        //   super(module_name.crmagent)
        this.record = data?.data ?? {}
    }

    public tabChanged(event: any): void {
        const tabName = event?.tab?.ariaLabel;
        this.tabNameStr = tabName;
        this.tabName = tabName;

        switch (tabName) {
            case 'Agent Profile':
                this.tabName = "Agent Profile";
                this.tab = 'agentProfile';
                this.agentProfile?.refreshItems();
                break;

            case 'Business Analytics':
                this.tabName = "Business Analytics";
                this.tab = 'businessAnalytics';
                this.businessAnalytics?.ngOnInit();
                break;

            case 'Tech Service':
                this.tabName = "Tech Service";
                this.tab = 'techService';
                this.techservice?.refreshItems();
                break;
            case 'Call History':
                this.tabName = "Call History";
                this.tab = 'callHistory';
                this.callhistory?.refreshItems();
                break;
            case 'Status Changed Logs':
                this.tabName = "Status Changed Logs";
                this.tab = 'statusChangedLogs';
                this.statuschangedlogs?.ngOnInit();
                break;
            case 'RM Change Logs':
                this.tabName = "RM Change Logs";
                this.tab = 'rMChangeLogs';
                this.rmchangelogs?.ngOnInit();
                break;
        }
    }
}
