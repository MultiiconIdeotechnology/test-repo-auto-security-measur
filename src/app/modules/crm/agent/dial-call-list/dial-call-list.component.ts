import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe, CommonModule } from '@angular/common';
import { Component, Inject, Input } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { ToasterService } from 'app/services/toaster.service';
import { CRMDialCallEntryComponent } from '../dail-call-entry/dial-call-entry.component';
import { AgentCrmBasicDetailsComponent } from '../agent-crm-basic-details/agent-crm-basic-details.component';
import { AgentCallHistoryComponent } from '../call-history/call-history.component';

@Component({
    selector: 'app-dial-call-list',
    templateUrl: './dial-call-list.component.html',
    styleUrls: ['./dial-call-list.component.scss'],
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        DatePipe,
        AsyncPipe,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule,
        MatSlideToggleModule,
        NgxMatSelectSearchModule,
        MatTooltipModule,
        MatAutocompleteModule,
        RouterOutlet,
        MatOptionModule,
        MatDividerModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatMenuModule,
        NgxMatTimepickerModule,
        MatTabsModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatDialogModule,
        CommonModule,
        CRMDialCallEntryComponent,
        AgentCrmBasicDetailsComponent,
        AgentCallHistoryComponent,
    ]
})
export class DialAgentCallListComponent {
    searchInputControl = new FormControl('');
    tabNameStr: any = 'Basic Details'
    tab: string = 'Basic Details';
    tabName: any;
    title: any;
    @Input() basicDetails: any = {};
    record: any = {};
    tabIndex: any;
    selectedTabIndex: any = 0;

    constructor(
        public matDialogRef: MatDialogRef<CRMDialCallEntryComponent>,
        public formBuilder: FormBuilder,
        public alertService: ToasterService,
        @Inject(MAT_DIALOG_DATA) public data: any = {},
    ) {
        this.record = data ?? {}
    }

    ngOnInit(): void {
        if(this.data && this.data.selectedTabIndex == 3) {
            this.tab = 'Call History';
            this.selectedTabIndex = this.data.selectedTabIndex;
        }
    }

    public tabChanged(event: any): void {
        const tabName = event?.tab?.ariaLabel;
        this.tabNameStr = tabName;
        this.tabName = tabName;

        switch (this.tabNameStr) {
            case 'Basic Details':
                this.tab = 'Basic Details';
                break;
            case 'Dial Call':
                this.tab = 'Dial Call';
                break;
            case 'Call History':
                this.tab = 'Call History';
                break;
        }
    }
}
