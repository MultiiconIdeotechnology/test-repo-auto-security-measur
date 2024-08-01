import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe, CommonModule } from '@angular/common';
import { Component, Inject, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet, Router } from '@angular/router';
import { AppConfig } from 'app/config/app-config';
import { module_name} from 'app/security';
import { CrmService } from 'app/services/crm.service';
import { ToasterService } from 'app/services/toaster.service';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-marketing-materials-agent',
  templateUrl: './marketing-materials.component.html',
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
    MatSortModule,
    MatTableModule,
    MatPaginatorModule,
    MatMenuModule,
    MatDialogModule,
    CommonModule,
    MatTabsModule,
    MatCheckboxModule
]
})
export class MarketingMaterialsComponent{
    dataList = [];
    MasterId: any;
    searchInputControl = new FormControl('');
    @ViewChild('tabGroup') tabGroup;
    @ViewChild(MatPaginator) public _paginator: MatPaginator;
    @ViewChild(MatSort) public _sort: MatSort;

    title = "Marketing Materials";
    Mainmodule: any;
    isLoading = false;
    public _unsubscribeAll: Subject<any> = new Subject<any>();
    public key: any;
    public sortColumn: any;
    public sortDirection: any;

    module_name = module_name.lead
    total = 0;
    appConfig = AppConfig;
    filter: any = {}
    record: any = {};

    constructor(
        public matDialogRef: MatDialogRef<MarketingMaterialsComponent>,
        private crmService: CrmService,
        private alertService: ToasterService,
        @Inject(MAT_DIALOG_DATA) public data: any = {}
    ) {
        this.key = this.module_name;
        this.Mainmodule = this,
        this.record = data?.data ?? {}
    }

    ngOnInit(): void {
        this.searchInputControl.valueChanges
            .subscribe(() => {
                GridUtils.resetPaginator(this._paginator);
                this.refreshItems();
            });
        this.refreshItems();
    }

    refreshItems(): void {
        this.isLoading = true;
        const filterReq = GridUtils.GetFilterReq(
            this._paginator,
            this._sort,
            this.searchInputControl.value, ""
        );
        this.crmService.getMarketingMessageType(filterReq).subscribe({
            next: (data) => {
                this.isLoading = false;
                this.dataList = data;
            },
            error: (err) => {
                this.alertService.showToast('error', err, 'top-right', true);
                this.isLoading = false;
            },
        });
    }
}
