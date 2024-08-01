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
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AgentService } from 'app/services/agent.service';
import { filter, startWith, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { ToasterService } from 'app/services/toaster.service';
import { mode } from 'crypto-js';

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
  ],
})
export class ReshuffleComponent {

  record: any = {};
  mode1Form: FormGroup;
  mode2Form: FormGroup;
  fromList: any = [];
  toList: any = [];
  toList2: any = [];
  fromListTemp: any = [];
  toListTemp: any = [];
  toListTemp2: any = [];
  disableBtn: boolean = false;

  tabNameStr: any = 'Mode 1'
  tab: string = 'Mode 1';
  tabName: any
  title: any


  statusType: any[] = [
    { value: 'New', viewValue: 'New' },
    { value: 'Active', viewValue: 'Active' },
    { value: 'InActive', viewValue: 'InActive' },
  ];

  statusTypeLead: any[] = [
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
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
    if (data)
      this.record = data;
  }

  ngOnInit() {
    this.mode1Form = this.builder.group({
      FromId: [''],
      fromfilter: [''],
      tofilter: [''],
      ToId: [''],
      Mode: ['1'],
      lead_status: ['New'],
    });

    this.mode2Form = this.builder.group({
      FromId: [''],
      fromfilter: [''],
      tofilter2: [''],
      ToId: [''],
      Mode: ['2'],
      lead_status: ['New'],
    });

    this.title = this.record

    this.agentService.getFromEmployee('Agents').subscribe({
      next: res => {
        this.fromList = JSON.parse(JSON.stringify(res['data']));
        this.toList = JSON.parse(JSON.stringify(res['data']));;
        this.toList2 = JSON.parse(JSON.stringify(res['data']));;
        this.fromListTemp = JSON.parse(JSON.stringify(res['data']));
        this.toListTemp = JSON.parse(JSON.stringify(res['data']));
        this.toListTemp2 = JSON.parse(JSON.stringify(res['data']));
        this.toList.unshift({
          id: '',
          employee_name: 'All',
        });
        this.toList2.unshift({
          id: '',
          employee_name: 'All',
        });
        this.mode1Form.get('FromId').patchValue(this.fromList[0].id)
        this.mode1Form.get('ToId').patchValue('');
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

  }

  Submit() {

    this.disableBtn = true;
    const json1 = this.mode1Form.getRawValue();
    const json2 = this.mode2Form.getRawValue();
    let mode = {}
    if (this.tabNameStr == 'Mode 1') {
      mode = {
        "FromId": json1.FromId,
        "lead_status": json1.lead_status,
        "ToId": json1.ToId,
        "Mode": "1"
      }
    } else {
      mode = {
        "FromId": '',
        "lead_status": json2.lead_status,
        "ToId": json2.ToId,
        "Mode": "2"
      }
    }

    if (this.record == 'Agent') {
      this.agentService.TransferAgentRmToRm(mode).subscribe({
        next: () => {
          this.alertService.showToast('success', 'Agent Reshuffled', 'top-right', true);
          this.matDialogRef.close(true);
          this.disableBtn = false;
        },
        error: (err) => {
          this.disableBtn = false;
          this.alertService.showToast('error', err, 'top-right', true);
        },
      });

    } else {
      this.agentService.TransferLeadRmToRm(mode).subscribe({
        next: () => {
          this.alertService.showToast('success', 'Lead Reshuffled', 'top-right', true);
          this.matDialogRef.close(true);
          this.disableBtn = false;
        },
        error: (err) => {
          this.disableBtn = false;
          this.alertService.showToast('error', err, 'top-right', true);
        },
      });
    }

  }

  public tabChanged(event: any): void {
    const tabName = event?.tab?.ariaLabel;
    this.tabNameStr = tabName;
    this.tabName = tabName;

    switch (this.tabNameStr) {
      case 'Mode 1':
        this.tab = 'Mode 1';
        break;

      case 'Mode 2':
        this.tab = 'Mode 2';
        break;
    }
  }

}
