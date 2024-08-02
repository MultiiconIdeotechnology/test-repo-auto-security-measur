import { Component, Inject } from '@angular/core';
import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
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
import { dateRangeLeadRegister } from 'app/common/const';
import { AgentService } from 'app/services/agent.service';
import { EmployeeService } from 'app/services/employee.service';
import { LeadsRegisterService } from 'app/services/leads-register.service';
import { CommonUtils, DocValidationDTO } from 'app/utils/commonutils';
import { FilterComponent } from '../filter/filter.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ToasterService } from 'app/services/toaster.service';
import { JsonFile } from 'app/common/jsonFile';
import { ExcelService } from 'app/services/excel.service';

@Component({
  selector: 'app-import-leads',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    DatePipe,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatMenuModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule,
    NgClass,
    RouterOutlet,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    NgxMatSelectSearchModule,
    MatTabsModule,
    MatCheckboxModule,
  ],
  templateUrl: './import-leads.component.html',
  styleUrls: ['./import-leads.component.scss']
})
export class ImportLeadsComponent {

  formGroup: FormGroup;
  selectedFile: File;
  jFile: JsonFile;
  incentiveData: any[] = [];
  disableBtn: boolean = false;
  errorMessage: any[]=[]


  constructor(
    public matDialogRef: MatDialogRef<ImportLeadsComponent>,
    private builder: FormBuilder,
    private employeeService: EmployeeService,
    private leadsRegisterService: LeadsRegisterService,
    private agentService: AgentService,
    public alertService: ToasterService,
    private excelService: ExcelService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
  }

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      Is_Email_Whatsapp: [false],
      // file: ['', Validators.required],
    });
  }

  public async onFileSelected(event: any) {

    const file = (event.target as HTMLInputElement).files[0];

    const extantion: string[] = ["csv"];
    var validator: DocValidationDTO = CommonUtils.isDocValid(file, extantion, 2024, null);
    if (!validator.valid) {
      this.alertService.showToast('error', validator.alertMessage, 'top-right', true);
      (event.target as HTMLInputElement).value = '';
      return;
    } else {

      this.selectedFile = event.target.files[0];

      CommonUtils.getJsonFile(file, (reader, jFile) => {
        this.jFile = jFile;
      });

      this.alertService.showToast('success', 'Attached file successfully');
      (event.target as HTMLInputElement).value = '';
    }


    // /*******Excal read file*******/
    // const file = event.target.files[0];
    // const jsonData = await this.excelService.readExcelFile(file);
    // this.incentiveData = [];

    // for (var i = 0; i < jsonData.length - 1; i++) {
    //   // Check if the row is entirely empty
    //   if (jsonData[i + 1].some(cell => cell !== undefined && cell !== '')) {
    //     this.incentiveData.push({
    //       agency_name: jsonData[i + 1][0] !== undefined ? jsonData[i + 1][0] : '',
    //       contact_person_email: jsonData[i + 1][1] !== undefined ? jsonData[i + 1][1] : '',
    //       contact_person_mobile_code: jsonData[i + 1][2] !== undefined ? jsonData[i + 1][2] : '',
    //       contact_person_mobile: jsonData[i + 1][3] !== undefined ? jsonData[i + 1][3] : '',
    //       lead_type: jsonData[i + 1][4] !== undefined ? jsonData[i + 1][4] : '',
    //       lead_source: jsonData[i + 1][5] !== undefined ? jsonData[i + 1][5] : '',
    //     });
    //   }
    // }
  }

  apply(): void {
    if (!this.jFile?.base64) {
      this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
      this.formGroup.markAllAsTouched();
      return;
    }

    const json = this.formGroup.getRawValue();
    json.file = this.jFile ? this.jFile : ''
    this.leadsRegisterService.leadBulkUpload(json).subscribe({
      next: (data) => {
        if (data.status) {
          this.alertService.showToast('success', 'Leads are imported!')
          this.matDialogRef.close(json);

        } else {
          this.errorMessage = []
          for (const key of Object.keys(data)) {
            this.errorMessage.push({value : data[key], key : key});
        }
        }

      }, error: (err) => {
        this.alertService.showToast('error', err);
      }
    });

  }
}
