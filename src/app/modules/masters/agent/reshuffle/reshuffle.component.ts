import { Component, Inject } from '@angular/core';
import { AsyncPipe, CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
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
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { AgentService } from 'app/services/agent.service';
import { ToasterService } from 'app/services/toaster.service';
import { ReshuffleConfirmDetailsComponent } from '../reshuffle-confirm-details/reshuffle-confirm-details.component';
import { MatDividerModule } from '@angular/material/divider';

@Component({
    selector: 'app-reshuffle',
    templateUrl: './reshuffle.component.html',
    styleUrls: ['./reshuffle.component.scss'],
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
        MatCheckboxModule,
        MatDividerModule,
    ],
})
export class ReshuffleComponent {
    record: any = {};
    mode1Form: FormGroup;
    mode2Form: FormGroup;
    mode3Form: FormGroup;
    fromList: any = [];
    toList: any = [];
    toList2: any = [];
    toList3: any = [];
    fromListTemp: any = [];
    toListTemp: any = [];
    toListTemp2: any = [];
    toListTemp3: any = [];
    disableBtn: boolean = false;

    tabNameStr: any = 'Mode 1'
    tab: string = 'Mode 1';
    tabName: any;
    title: any;

    mode1leadStatusFromCount: any;
    mode1agentStatusFromCount: any;

    mode1leadStatusToCount: any;
    mode1agentStatusToCount: any;

    mode2leadStatusToCount: any;
    mode2agentStatusToCountNew: any;

    mode2agentStatusToCountNew1: any;
    mode2agentStatusToCountNew2: any;

    mode2statusToCount: any;
    mode2AgentstatusToCount: any;

    finalmode2statusToCount: any;
    finalagentmode2statusToCount: any;

    statusType: any[] = [
        { value: 'All', viewValue: 'All' },
        { value: 'New', viewValue: 'New' },
        { value: 'Active', viewValue: 'Active' },
        { value: 'Inactive', viewValue: 'Inactive' },
        { value: 'Dormant', viewValue: 'Dormant' },
    ];

    statusTypeLead: any[] = [
        { value: 'All', viewValue: 'All' },
        { value: 'New', viewValue: 'New' },
        { value: 'Live', viewValue: 'Live' },
        { value: 'Converted', viewValue: 'Converted' },
        { value: 'Dead', viewValue: 'Dead' },
    ];

    constructor(
        public matDialogRef: MatDialogRef<ReshuffleComponent>,
        private builder: FormBuilder,
        public alertService: ToasterService,
        public agentService: AgentService,
        private matDialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: any = {}
    ) {
        if (data)
            this.record = data;
        console.log("this.record", this.record);
    }

    ngOnInit() {
        this.mode2statusToCount = 'All'
        this.mode2AgentstatusToCount = 'All'
        this.mode1Form = this.builder.group({
            FromId: [''],
            fromfilter: [''],
            tofilter: [''],
            ToId: [''],
            Mode: ['1'],
            Status: ['All'],
            noofAgent: ['0'],
            IncludeWLAgents: [false]
        });

        this.mode2Form = this.builder.group({
            FromId: [''],
            fromfilter: [''],
            tofilter2: [''],
            ToId: [''],
            Mode: ['2'],
            Status: ['All'],
            noofAgent: ['0'],
            IncludeWLAgents: [false]
        });

        this.mode3Form = this.builder.group({
            tofilter3: [''],
            ToId: [''],
            Mode: ['3'],
            Status: ['All'],
            noofAgent: ['0'],
            IncludeWLAgents: [false]
        });

        this.title = this.record.title

        this.agentService.getFromEmployee('Agents').subscribe({
            next: res => {
                this.fromList = JSON.parse(JSON.stringify(res['data']));
                this.toList = JSON.parse(JSON.stringify(res['data']));
                this.toList2 = JSON.parse(JSON.stringify(res['data']));
                this.toList3 = JSON.parse(JSON.stringify(res['data']));
                this.fromListTemp = JSON.parse(JSON.stringify(res['data']));
                this.toListTemp = JSON.parse(JSON.stringify(res['data']));
                this.toListTemp2 = JSON.parse(JSON.stringify(res['data']));
                this.toListTemp3 = JSON.parse(JSON.stringify(res['data']));

                this.toList.unshift({
                    id: '',
                    employee_name: 'All',
                });
                this.toList2.unshift({
                    id: '',
                    employee_name: 'All',
                });
                this.toList3.unshift({
                    id: '',
                    employee_name: 'All',
                });
                this.mode1Form.get('FromId').patchValue(this.fromList[0])
                this.mode1Form.get('ToId').patchValue(this.toList[0]);
                this.mode2Form.get('ToId').patchValue(this.toList2[0]);
                this.mode3Form.get('ToId').patchValue(this.toList3[0]);

                if (this.record.title === "Lead") {
                    this.getLeadStatusFromCount(this.mode1Form.get('FromId')?.value);
                    this.getLeadStatusToCount("");
                }

                if (this.record.title === "Agent") {
                    this.getAgentStatusFromCount(this.mode1Form.get('FromId')?.value);
                    this.getAgentStatusToCount("");
                }
            }
        })

        this.mode1Form.get('fromfilter').valueChanges.subscribe(data => {
            if (data.trim() == '') {
                this.fromList = this.fromListTemp
            }
            else {
                this.fromList = this.fromListTemp.filter(x => x.employee_name.toLowerCase().includes(data.toLowerCase()));
            }
        })

        this.mode1Form.get('tofilter').valueChanges.subscribe(data => {
            if (data.trim() == '') {
                this.toList = this.toListTemp
            }
            else {
                this.toList = this.toListTemp.filter(x => x.employee_name.toLowerCase().includes(data.toLowerCase()));
            }
        })

        this.mode2Form.get('tofilter2').valueChanges.subscribe(data => {
            if (data.trim() == '') {
                this.toList2 = this.toListTemp2
            }
            else {
                this.toList2 = this.toListTemp2.filter(x => x.employee_name.toLowerCase().includes(data.toLowerCase()));
            }
        })

        this.mode3Form.get('tofilter3').valueChanges.subscribe(data => {
            if (data.trim() == '') {
                this.toList3 = this.toListTemp3
            }
            else {
                this.toList3 = this.toListTemp3.filter(x => x.employee_name.toLowerCase().includes(data.toLowerCase()));
            }
        })
    }

    getAgentStatusFromCount(agentId: any) {
        let agentIdNew = agentId.id ? agentId.id : ""
        this.agentService.getAgentStatusCount(agentIdNew).subscribe({
            next: (res) => {
                this.mode1agentStatusFromCount = res;
                this.disableBtn = false;
            },
            error: (err) => {
                this.disableBtn = false;
                this.alertService.showToast('error', err, 'top-right', true);
            },
        });
    }

    getAgentStatusToCount(agentId: any) {
        let agentIdNew = agentId.id ? agentId.id : ""
        this.agentService.getAgentStatusCount(agentIdNew).subscribe({
            next: (res) => {
                this.mode1agentStatusToCount = res;
                this.disableBtn = false;
            },
            error: (err) => {
                this.disableBtn = false;
                this.alertService.showToast('error', err, 'top-right', true);
            },
        });
    }

    getLeadStatusFromCount(agentId: any) {
        let agentIdNew = agentId.id ? agentId.id : ""
        this.agentService.getLeadStatusCount(agentIdNew).subscribe({
            next: (res) => {
                this.mode1leadStatusFromCount = res;
                this.disableBtn = false;
            },
            error: (err) => {
                this.disableBtn = false;
                this.alertService.showToast('error', err, 'top-right', true);
            },
        });
    }

    getLeadStatusToCount(agentId: any) {
        let agentIdNew = agentId.id ? agentId.id : ""
        this.agentService.getLeadStatusCount(agentIdNew).subscribe({
            next: (res) => {
                this.mode1leadStatusToCount = res;
                this.disableBtn = false;
            },
            error: (err) => {
                this.disableBtn = false;
                this.alertService.showToast('error', err, 'top-right', true);
            },
        });
    }

    getLeadStatusToCountMode2(agentId: any) {
        let agentIdNew = agentId.id ? agentId.id : ""
        this.agentService.getLeadStatusCount(agentIdNew).subscribe({
            next: (res) => {
                this.mode2leadStatusToCount = res;
            },
            error: (err) => {
                this.disableBtn = false;
                this.alertService.showToast('error', err, 'top-right', true);
            },
        });
    }

    getAgentStatusToCountMode2(agentId: any) {
        let agentIdNew = agentId.id ? agentId.id : ""
        this.agentService.getAgentStatusCount(agentIdNew).subscribe({
            next: (res) => {
                this.mode2agentStatusToCountNew = res;
                this.disableBtn = false;
            },
            error: (err) => {
                this.disableBtn = false;
                this.alertService.showToast('error', err, 'top-right', true);
            },
        });
    }

    getStatusToCountMode2(agentId: any) {
        let agentIdNew = agentId ? agentId : ""
        this.agentService.getLeadStatusCount(agentIdNew).subscribe({
            next: (res) => {
                this.mode2statusToCount = res;
                this.mode2AgentstatusToCount = res;
                this.disableBtn = false;
            },
            error: (err) => {
                this.disableBtn = false;
                this.alertService.showToast('error', err, 'top-right', true);
            },
        });
    }

    public tabChanged(event: any): void {
        const tabName = event?.tab?.ariaLabel;
        this.tabNameStr = tabName;
        this.tabName = tabName;

        let form2AgentCount = this.mode2Form.get('ToId')?.value
        switch (this.tabNameStr) {
            case 'Mode 1':
                this.tab = 'Mode 1';
                break;

            case 'Mode 2':
                this.tab = 'Mode 2';
                if (this.record.title === "Lead") {
                    this.getLeadStatusToCountMode2(form2AgentCount ? form2AgentCount?.id : "");
                    this.getLeadStatus();
                }

                if (this.record.title === "Agent") {
                    this.getAgentStatusToCountMode2(form2AgentCount ? form2AgentCount?.id : "");
                    this.getAgentStatus();
                }
                break;
        }
    }

    fromRMChanged(val: any) {
        if (this.record.title === "Lead") {
            this.getLeadStatusFromCount(val);
        }

        if (this.record.title === "Agent") {
            this.getAgentStatusFromCount(val);
        }
    }

    toRMChanged(val: any) {
        if (this.record.title === "Lead") {
            this.getLeadStatusToCount(val);
        }

        if (this.record.title === "Agent") {
            this.getAgentStatusToCount(val);
        }
    }

    mode2toRMChanged(val: any) {
        if (this.record.title === "Lead") {
            this.getLeadStatusToCountMode2(val);
        }

        if (this.record.title === "Agent") {
            this.getAgentStatusToCountMode2(val);
        }
    }

    mode2StatusChanged(val: any) {
        this.mode2statusToCount = val;
        this.mode2AgentstatusToCount = val;
        if (this.record.title === "Lead") {
            this.getLeadStatus();
        }

        if (this.record.title === "Agent") {
            this.getAgentStatus();
        }
    }

    getAgentStatus(){
        this.agentService.getAgentStatusCount1().subscribe({
            next: (res) => {
                this.mode2agentStatusToCountNew1 = res;
                if (this.mode2statusToCount == 'New') {
                    this.finalagentmode2statusToCount = this.mode2agentStatusToCountNew1?.newCount ? this.mode2agentStatusToCountNew1?.newCount : 0;
                }
                else if (this.mode2statusToCount == 'Active') {
                    this.finalagentmode2statusToCount = this.mode2agentStatusToCountNew1?.activeCount ? this.mode2agentStatusToCountNew1?.activeCount : 0;
                }
                else if (this.mode2statusToCount == 'Inactive') {
                    this.finalagentmode2statusToCount = this.mode2agentStatusToCountNew1?.inactiveCount ? this.mode2agentStatusToCountNew1?.inactiveCount : 0;
                }
                else if (this.mode2statusToCount == 'Dormant') {
                    this.finalagentmode2statusToCount = this.mode2agentStatusToCountNew1?.dormantCount ? this.mode2agentStatusToCountNew1?.dormantCount : 0;
                }
                else if (this.mode2statusToCount == 'All') {
                    const totalCount = this.mode2agentStatusToCountNew1?.activeCount + this.mode2agentStatusToCountNew1?.inactiveCount + this.mode2agentStatusToCountNew1?.newCount;
                    this.finalagentmode2statusToCount = totalCount;
                }
                this.disableBtn = false;
            },
            error: (err) => {
                this.disableBtn = false;
                this.alertService.showToast('error', err, 'top-right', true);
            },
        });
    }

    getLeadStatus(){
        this.agentService.getLeadStatusCount1().subscribe({
            next: (res) => {
                this.mode2agentStatusToCountNew2 = res;
                if (this.mode2AgentstatusToCount == 'New') {
                    this.finalmode2statusToCount = this.mode2agentStatusToCountNew2?.newCount ? this.mode2agentStatusToCountNew2?.newCount : 0;
                }
                else if (this.mode2AgentstatusToCount == 'Live') {
                    this.finalmode2statusToCount = this.mode2agentStatusToCountNew2?.liveCount ? this.mode2agentStatusToCountNew2?.liveCount : 0;
                }
                else if (this.mode2AgentstatusToCount == 'Converted') {
                    this.finalmode2statusToCount = this.mode2agentStatusToCountNew2?.convertedCount ? this.mode2agentStatusToCountNew2?.convertedCount : 0;
                }
                else if (this.mode2AgentstatusToCount == 'Dead') {
                    this.finalmode2statusToCount = this.mode2agentStatusToCountNew2?.Dead ? this.mode2agentStatusToCountNew2?.Dead : 0;
                }
                else if (this.mode2AgentstatusToCount == 'All') {
                    this.finalmode2statusToCount = this.mode2agentStatusToCountNew2?.newCount + this.mode2agentStatusToCountNew2?.liveCount + this.mode2agentStatusToCountNew2?.convertedCount + this.mode2agentStatusToCountNew2?.deadCount;
                }
                this.disableBtn = false;
            },
            error: (err) => {
                this.disableBtn = false;
                this.alertService.showToast('error', err, 'top-right', true);
            },
        });
    }

    Submit() {
        this.disableBtn = true;
        const json1 = this.mode1Form.getRawValue();
        const json2 = this.mode2Form.getRawValue();
        const json3 = this.mode3Form.getRawValue();
        let mode: any = {}
        if (this.tabNameStr == 'Mode 1') {
            mode = {
                "FromId": json1.FromId,
                "Status": json1.Status,
                "ToId": json1.ToId,
                "noofAgent": json1.noofAgent,
                "Mode": "1",
                "IncludeWLAgents": json1.IncludeWLAgents ? json1.IncludeWLAgents : false,

                "FromNew": this.mode1agentStatusFromCount?.newCount ? this.mode1agentStatusFromCount?.newCount: 0,
                "FromActive": this.mode1agentStatusFromCount?.activeCount ? this.mode1agentStatusFromCount?.activeCount: 0,
                "FromInActive": this.mode1agentStatusFromCount?.inactiveCount ? this.mode1agentStatusFromCount?.inactiveCount: 0,
                "ToNew": this.mode1agentStatusToCount?.newCount ? this.mode1agentStatusToCount?.newCount: 0,
                "ToActive": this.mode1agentStatusToCount?.activeCount ? this.mode1agentStatusToCount?.activeCount: 0,
                "ToInActive": this.mode1agentStatusToCount?.inactiveCount ? this.mode1agentStatusToCount?.inactiveCount: 0,

                "LeadFromNew": this.mode1leadStatusFromCount?.newCount ? this.mode1leadStatusFromCount?.newCount: 0,
                "LeadFromLive": this.mode1leadStatusFromCount?.liveCount ? this.mode1leadStatusFromCount?.liveCount: 0,
                "LeadFromConverted": this.mode1leadStatusFromCount?.convertedCount ? this.mode1leadStatusFromCount?.convertedCount: 0,
                "LeadFromDead": this.mode1leadStatusFromCount?.deadCount ? this.mode1leadStatusFromCount?.deadCount: 0,
                "LeadToNew": this.mode1leadStatusToCount?.newCount ? this.mode1leadStatusToCount?.newCount: 0,
                "LeadToLive": this.mode1leadStatusToCount?.liveCount ? this.mode1leadStatusToCount?.liveCount: 0,
                "LeadToConverted": this.mode1leadStatusToCount?.convertedCount ? this.mode1leadStatusToCount?.convertedCount: 0,
                "LeadToDead": this.mode1leadStatusToCount?.deadCount ? this.mode1leadStatusToCount?.deadCount: 0
            }
        } else if(this.tabNameStr == 'Mode 2') {
            mode = {
                "FromId": '',
                "Status": json2.Status,
                "ToId": json2.ToId,
                "noofAgent": json2.noofAgent,
                "Mode": "2",
                "IncludeWLAgents": json2.IncludeWLAgents ? json2.IncludeWLAgents : false,


                "ToNew": this.mode2agentStatusToCountNew?.newCount ? this.mode2agentStatusToCountNew?.newCount: 0,
                "ToActive": this.mode2agentStatusToCountNew?.activeCount ? this.mode2agentStatusToCountNew?.activeCount: 0,
                "ToInActive": this.mode2agentStatusToCountNew?.inactiveCount ? this.mode2agentStatusToCountNew?.inactiveCount: 0,
                "Count" : this.finalagentmode2statusToCount,

                "LeadToNew": this.mode2leadStatusToCount?.newCount ? this.mode2leadStatusToCount?.newCount: 0,
                "LeadToLive": this.mode2leadStatusToCount?.liveCount ? this.mode2leadStatusToCount?.liveCount: 0,
                "LeadToConverted": this.mode2leadStatusToCount?.convertedCount ? this.mode2leadStatusToCount?.convertedCount: 0,
                "LeadToDead": this.mode2leadStatusToCount?.deadCount ? this.mode2leadStatusToCount?.deadCount: 0,
                "LeadCount" : this.finalmode2statusToCount
            }

            if(mode && mode['Status'] == 'All') {
                this.alertService.showToast('error', "Please select any one status", 'top-right', true);
                return;
            }
        }else{
            mode = {
                "columeFilters" : this.record.columeFilters.columeFilters, 
                "Filter" : this.record.columeFilters.Filter, 
                "Status": json3.Status,
                "ToId": json3.ToId,
                "noofAgent": json3.noofAgent,
                "Mode": "3",
                "IncludeWLAgents": json3.IncludeWLAgents ? json3.IncludeWLAgents : false,
                // "ToNew": this.record.new_agent_count,
                // "ToActive": this.record.active_agent_count,
                // "ToInActive": this.record.inactive_agent_count,
                "ToNew": this.mode1agentStatusToCount?.newCount ? this.mode1agentStatusToCount?.newCount: 0,
                "ToActive": this.mode1agentStatusToCount?.activeCount ? this.mode1agentStatusToCount?.activeCount: 0,
                "ToInActive": this.mode1agentStatusToCount?.inactiveCount ? this.mode1agentStatusToCount?.inactiveCount: 0,
            }
            console.log("mode", mode);
        }

        if (this.record.title == 'Agent') {
            this.matDialog.open(ReshuffleConfirmDetailsComponent, {
                data: {data:mode, send : 'Agent'},
                disableClose: true,
            }).afterClosed().subscribe(res => {
                if (res) {
                    this.matDialogRef.close(true);
                }
            })
        } else {
            this.matDialog.open(ReshuffleConfirmDetailsComponent, {
                data: {data:mode, send : 'Lead'},
                disableClose: true,
            }).afterClosed().subscribe(res => {
                if (res) {
                    this.matDialogRef.close(true);
                }
            })
        }
    }
}
