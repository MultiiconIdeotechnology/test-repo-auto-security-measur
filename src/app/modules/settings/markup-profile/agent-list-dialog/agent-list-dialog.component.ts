import { Component, Inject, ViewChild } from '@angular/core';
import { NgIf, NgFor, NgClass, CommonModule, AsyncPipe, DatePipe } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatSidenav } from '@angular/material/sidenav';
import { FuseConfig, FuseConfigService, Themes } from '@fuse/services/config';
import { Subject, takeUntil } from 'rxjs';
import { EntityService } from 'app/services/entity.service';

@Component({
  selector: 'app-agent-list-dialog',
  templateUrl: './agent-list-dialog.component.html',
  styles: [
    `
        app-agent-list-dialog {
            position: static;
            display: block;
            flex: none;
            width: auto;
        }
    `,
  ],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    RouterOutlet,
    MatTooltipModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    FuseDrawerComponent,
    MatDividerModule,
    DatePipe,
    AsyncPipe,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatSlideToggleModule,
    MatMenuModule,
    NgxMatSelectSearchModule,
    NgxMatTimepickerModule,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatNativeDateModule,

  ]
})
export class AgentListDialogComponent {
  agentsList: any[] = [];
  searchInputControl = new FormControl('');
  filteredAgentsList: any[] = [];

  @ViewChild('settingsDrawer') public settingsDrawer: MatSidenav;
  config: FuseConfig;
  layout: string;
  scheme: 'dark' | 'light';
  theme: string;
  themes: Themes;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    public entityService: EntityService,
    private _fuseConfigService: FuseConfigService,
  ) {

    this.entityService.onappliedOnCall().pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (item) => {
        this.settingsDrawer.toggle()
        this.agentsList = item.data;
        this.filteredAgentsList = this.agentsList;
      }
    })
  }

  closeBtn() {
    this.settingsDrawer.close();
    this.searchInputControl.setValue('');
  }

  ngOnInit(): void {
    this._fuseConfigService.config$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((config: FuseConfig) => {
        this.config = config;
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  ngAfterViewInit(): void {
    this.searchInputControl.valueChanges.subscribe((text) => {
      this.filteredAgentsList = this.filterAgents(text);
    });
  }

  filterAgents(searchText: string): any[] {
    if (!searchText) {
      return this.agentsList;
    }
    searchText = searchText.toLowerCase();
    return this.agentsList.filter(agent =>
      agent.name.toLowerCase().includes(searchText) ||
      agent.agent_code.toString().includes(searchText) ||
      agent.email.toLowerCase().includes(searchText)
    );
  }
}
