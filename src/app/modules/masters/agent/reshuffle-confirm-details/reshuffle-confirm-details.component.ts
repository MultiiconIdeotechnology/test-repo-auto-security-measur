import { Component, Inject } from '@angular/core';
import { AsyncPipe, CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AgentService } from 'app/services/agent.service';
import { ToasterService } from 'app/services/toaster.service';
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
import { MatDividerModule } from '@angular/material/divider';

@Component({
    selector: 'app-reshuffle-confirm-details',
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
        MatDividerModule
    ],
    templateUrl: './reshuffle-confirm-details.component.html',
    styleUrls: ['./reshuffle-confirm-details.component.scss']
})
export class ReshuffleConfirmDetailsComponent {

    record: any = {};
    title: any;

    constructor(
        public matDialogRef1: MatDialogRef<ReshuffleConfirmDetailsComponent>,
        public alertService: ToasterService,
        public agentService: AgentService,
        @Inject(MAT_DIALOG_DATA) public data: any = {}
    ) {
        if (data)
            console.log(data, '111');
        this.record = data.data;
        this.title = data.send
    }

    Confirm() {
        if (this.title == "Agent") {
            if (this.record.Mode == 3) {

                // const agentJson = {
                //     FromId: this.record?.FromId?.id ? this.record?.FromId?.id : "",
                //     Status: this.record?.Status == 'All' ? '' : this.record?.Status,
                //     ToId: this.record?.ToId?.id ? this.record?.ToId?.id : "All",
                //     noofAgent: this.record?.noofAgent == 0 ? null : this.record?.noofAgent,
                //     Mode: this.record?.Mode,
                //     IncludeWLAgents: this.record?.IncludeWLAgents ? this.record?.IncludeWLAgents : false
                // }

                // this.agentService.reshuffleAgentMode3(agentJson).subscribe({
                //     next: () => {
                //         this.alertService.showToast('success', 'Agent Reshuffled', 'top-right', true);
                //         this.matDialogRef1.close(true);
                //     },
                //     error: (err) => {
                //         this.alertService.showToast('error', err, 'top-right', true);
                //     },
                // });

            } else {
                const agentJson = {
                    FromId: this.record?.FromId?.id ? this.record?.FromId?.id : "",
                    Status: this.record?.Status == 'All' ? '' : this.record?.Status,
                    ToId: this.record?.ToId?.id ? this.record?.ToId?.id : "All",
                    noofAgent: this.record?.noofAgent == 0 ? null : this.record?.noofAgent,
                    Mode: this.record?.Mode,
                    IncludeWLAgents: this.record?.IncludeWLAgents ? this.record?.IncludeWLAgents : false
                }
                this.agentService.TransferAgentRmToRm(agentJson).subscribe({
                    next: () => {
                        this.alertService.showToast('success', 'Agent Reshuffled', 'top-right', true);
                        this.matDialogRef1.close(true);
                    },
                    error: (err) => {
                        this.alertService.showToast('error', err, 'top-right', true);
                    },
                });
            }
        } else {
            const leadJson = {
                FromId: this.record?.FromId?.id ? this.record?.FromId?.id : "",
                Status: this.record?.Status == 'All' ? '' : this.record?.Status,
                ToId: this.record?.ToId?.id ? this.record?.ToId?.id : "All",
                noofAgent: this.record?.noofAgent == 0 ? null : this.record?.noofAgent,
                Mode: this.record?.Mode
            }
            this.agentService.TransferLeadRmToRm(leadJson).subscribe({
                next: () => {
                    this.alertService.showToast('success', 'Lead Reshuffled', 'top-right', true);
                    this.matDialogRef1.close(true);
                },
                error: (err) => {
                    this.alertService.showToast('error', err, 'top-right', true);
                },
            });
        }
    }
}
