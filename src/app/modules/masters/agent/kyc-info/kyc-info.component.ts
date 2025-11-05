import { FormGroup } from '@angular/forms';
import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { ToasterService } from 'app/services/toaster.service';
import { KycDocumentService } from 'app/services/kyc-document.service';
import { MatDividerModule } from '@angular/material/divider';
import { Linq } from 'app/utils/linq';
import { MatIconModule } from '@angular/material/icon';
import { CommonUtils, DocValidationDTO } from 'app/utils/commonutils';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { RejectReasonComponent } from '../reject-reason/reject-reason.component';
import { imgExtantions } from 'app/common/const';
import { KycDashboardService } from 'app/services/kyc-dashboard.service';
import { KycRemarkComponent } from './kyc-remark/kyc-remark.component';

@Component({
  selector: 'app-kyc-info',
  templateUrl: './kyc-info.component.html',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    NgClass,
    MatButtonModule,
    MatIconModule,
    DatePipe,
    AsyncPipe,
    NgxMatSelectSearchModule,
    MatSnackBarModule,
    MatDividerModule,
    MatMenuModule,
    MatTooltipModule
  ]
})
export class KycInfoComponent {

  public formGroup: FormGroup;
  user: any = {};
  _unSubscribeAll: Subject<any> = new Subject();
  public statusType: string;
  public docs: any = {};

  isLoading = false;
  dataList = [];
  searchInputControl: any;
  datadocs = [];
  docsDetail = [];
  data: any;
  Agent: any;
  isAuditAvalable: boolean = true;
  convertAgent: boolean = false;
  title: string
  isLeadeConvert: boolean = false;
  isKycViewDetailFlag: boolean = false;
  closeDialog = ''
  from: string = ''
  kycDupAgentName: any;

  constructor(
    public matDialogRef: MatDialogRef<KycInfoComponent>,
    private matDialog: MatDialog,
    private kycDashboardService: KycDashboardService,
    private alertService: ToasterService,
    private kycdocService: KycDocumentService,
    private conformationService: FuseConfirmationService,
    @Inject(MAT_DIALOG_DATA) public datas: any = {},
    @Inject(MAT_DIALOG_DATA) public isKycViewDetail: any = {}
  ) {
    // this.convertAgent = this.datas.send
    this.data = datas.record;
    if (this.datas?.send)
      this.convertAgent = (this.datas.send == "agentKYC");

    this.from = this.datas?.from;

    if (this.datas?.send)
      this.isAuditAvalable = !(this.datas.send == "leadMaster");

    if (datas.agent) {
      this.Agent = "Agent";
    }
    else if (datas.subAgent) {
      this.Agent = "Sub Agent";
    }
    else if (datas.supplier) {
      this.Agent = "Supplier";
    }

    this.isKycViewDetailFlag = isKycViewDetail?.isKycViewDetail;
  }

  ngOnInit(): void {
    this.getKYCIsDuplicateAgentAllow();
    this.refreshItems();
    this.title = this.datas.record.agency_name

    if (this.datas.isLead == 'Supplier') {
      this.title = this.datas.record?.company_name;
    }
  }
  
  leadConverter(): void {
    const label: string = 'Convert to Travel Agent';

    // Case 1: If duplicate agency name found
    if (this.kycDupAgentName?.status === true) {
      this.conformationService.open({
        title: 'Duplicate Agency Name Detected',
        message: `An agency with this name already exists in the system.<br>
                Would you like to proceed using the ${this.title} - Agency Code below?`,
        actions: {
          confirm: {
            label: 'Yes, Continue'
          },
          cancel: {
            label: 'Cancel'
          }
        }
      }).afterClosed().subscribe(result => {
        if (result === 'confirmed') {
          this.callLeadConvertApi();
        }
      });

    } else {
      //  Case 2: Normal confirmation when no duplicate found
      this.conformationService.open({
        title: label,
        message: `Are you sure to ${label.toLowerCase()} ?`,
        actions: {
          confirm: {
            label: 'Ok'
          },
          cancel: {
            label: 'Cancel'
          }
        }
      }).afterClosed().subscribe(result => {
        if (result === 'confirmed') {
          this.callLeadConvertApi();
        }
      });
    }
  }


  private callLeadConvertApi(): void {
    const paylod = {
       id: this.datas.record.id ,
       is_duplicate_save : this.kycDupAgentName?.status 
      };
    this.kycDashboardService.leadConvert(paylod).subscribe({
      next: (res) => {
        if (res.status === true) {
          this.isLeadeConvert = true;
        }
        this.alertService.showToast('success', 'Lead has been converted to Travel Agent!', 'top-right', true);
        this.matDialogRef.close('confirmed');
        this.refreshItems();
      },
      error: (err) => {
        this.alertService.showToast('error', err, 'top-right', true);
      }
    });
  }


  hasRequiredField(group: any[]): boolean {
    return group.some(dataRecord => dataRecord.is_required_group);
  }

  refreshItems(): void {
    this.kycdocService.getKYCDisplay(this.data.kyc_profile_id).subscribe(data => {
      this.dataList = data;

      const Fdata = {}
      Fdata['id'] = this.data.id
      Fdata['for'] = this.datas.isMaster === true || this.Agent === 'Sub Agent' ? 'Sub Agent' : this.Agent === 'Supplier' ? 'Supplier' : 'Agent';
      Fdata['is_lead'] = this.datas.isLead === 'Lead' ? true : false;
      Fdata['from'] = this.from;


      this.kycdocService.getdocumentRecord(Fdata).subscribe(res => {
        if (res) {
          this.docs = res.doc_details;

          for (let datadocs of this.dataList) {

            const docRec = this.docs.find(x => x.kyc_profile_doc_id === datadocs.id)
            if (docRec) {
              datadocs.document_of_id = docRec.id;
              datadocs.kyc_profile_name = docRec.kyc_profile_name;
              datadocs.file_url = docRec.file_url;

              datadocs.kyc_profile_doc_name = docRec.kyc_profile_doc_name;
              datadocs.remarks = docRec.remarks;
              datadocs.is_rejected = docRec.is_rejected;
              datadocs.is_audited = docRec.is_audited;
              datadocs.rejection_note = docRec.rejection_note;
              datadocs.reject_date_time = docRec.reject_date_time;
              datadocs.entry_date_time = docRec.entry_date_time;
            }
          }
        }

        this.dataList = Linq.groupBy(this.dataList, (x: any) => x.document_group);
      });
    });
  }

  // Get Duplicate Agent Name finding
  getKYCIsDuplicateAgentAllow(): void {
    this.isLoading = true;
    this.kycdocService.getKYCIsDuplicateAgentAllow(this.data.id).subscribe({
      next: (response) => {
        this.kycDupAgentName = response;   
        this.isLoading = false;
      },
      error: (error) => {
        this.alertService.showToast('error', error, "top-right", true);
        this.isLoading = false;
      }
    });

  }


  getColor(dataRecord): string {
    if (dataRecord.is_audited)
      return 'border-l-green-500';
    else if (!dataRecord.is_rejected && !dataRecord.is_audited && dataRecord.file_url)
      return 'border-l-blue-500';
    else if (dataRecord.is_rejected)
      return 'border-l-red-500';
    else
      return 'border-l-gray-500'
  }

  uploadDocument(document, event: any): void {

    const file = (event.target as HTMLInputElement).files[0];

    const extantion: string[] = document.file_extentions.replaceAll('*.', '').split(',').map(x => x.trim());
    var validator: DocValidationDTO = CommonUtils.isDocValid(file, extantion, document.maximum_size, null);
    if (!validator.valid) {
      this.alertService.showToast('error', validator.alertMessage);
      (event.target as HTMLInputElement).value = '';
      return;
    }

    CommonUtils.getJsonFile(file, (reader, jFile) => {
      const doc = Object.assign({});
      doc.kyc_profile_id = document.kyc_profile_id;
      doc.document_of_id = this.data.id;
      doc.document_of = this.datas.isLead === 'Lead' ? 'Lead' : this.datas.isLead === 'Supplier' ? 'Supplier' : 'Agent';
      doc.doc_details = [
        {
          id: document.document_of_id,
          kyc_profile_doc_id: document.id,
          file: jFile,
        }
      ]

      if (document.is_remark_required)
        this.matDialog.open(KycRemarkComponent, {
          data: { title: document.remark_caption, remark: document?.remarks || '', document_name: document?.document_name },
          disableClose: true
        }).afterClosed().subscribe(res => {
          if (!res) {
            return
          }
          doc.doc_details[0].remark = res;
          this.docSave(doc)
        })
      else
        this.docSave(doc);

      (event.target as HTMLInputElement).value = '';
    });
  }

  docSave(doc: any) {
    this.kycdocService.create(doc).subscribe({
      next: (data) => {
        this.alertService.showToast('success', "Document Uploaded", "top-right", true);
        this.refreshItems();
      },
      error: (err) => {
        this.alertService.showToast('error', err, 'top-right', true);
        this.isLoading = false
      }
    });
  }

  Audit(data: any): void {
    const label: string = 'Audit Kyc Document'
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + ' ' + data.document_name + ' ?'
    }).afterClosed().subscribe({
      next: (res) => {
        if (res === 'confirmed') {
          var model = { is_lead: this.datas.isLead === 'Lead' ? true : false, id: data.document_of_id };
          this.kycdocService.verify(model).subscribe({
            next: (res: any) => {
              data.is_audited = true
              data.is_rejected = false

              this.alertService.showToast('success', "Document Audited", "top-right", true);
              // this.refreshItems();
              this.closeDialog = 'confirmed';
            }, error: (err) => this.alertService.showToast('error', err, "top-right", true)
          });
        }
      }, error: (err) => this.alertService.showToast('error', err, "top-right", true)
    })
  }

  Reject(record: any): void {
    this.matDialog.open(RejectReasonComponent, {
      disableClose: true,
      data: record,
      panelClass: 'full-dialog'
    }).afterClosed().subscribe({
      next: (res) => {
        if (res) {

          this.kycdocService.reject(record.document_of_id, res).subscribe({
            next: (result: any) => {
              record.is_rejected = true
              record.is_audited = false
              record.rejection_note = res
              this.alertService.showToast('success', "Document Rejected", "top-right", true);
              // this.refreshItems()
              this.closeDialog = 'confirmed';
            },
            error: (err) => this.alertService.showToast('error', err, "top-right", true)
          })
        }
      }, error: (err) => this.alertService.showToast('error', err, "top-right", true)
    })
  }

  getNodataText(): string {
    if (this.isLoading)
      return 'Loading...';
    else return 'No data to display';
  }
}
