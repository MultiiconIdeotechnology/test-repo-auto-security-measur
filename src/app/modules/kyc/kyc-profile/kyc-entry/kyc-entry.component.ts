import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Routes } from 'app/common/const';
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { filter, startWith, debounceTime, distinctUntilChanged, switchMap, ReplaySubject } from 'rxjs';
import { DocumentService } from 'app/services/document.service';
import { CityService } from 'app/services/city.service';
import { DesignationService } from 'app/services/designation.service';
import { ToastrService } from 'ngx-toastr';
import { KycService } from 'app/services/kyc.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Linq } from 'app/utils/linq';
import { DateTime } from 'luxon';
import { MatDialog } from '@angular/material/dialog';
import { AssignedInfoComponent } from '../assigned-info/assigned-info.component';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ToasterService } from 'app/services/toaster.service';
import { PspSettingService } from 'app/services/psp-setting.service';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-kyc-entry',
  templateUrl: './kyc-entry.component.html',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    AsyncPipe,
    RouterModule,
    ReactiveFormsModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatTooltipModule,
    MatMenuModule,
    MatSlideToggleModule,
    NgxMatTimepickerModule,
    NgxMatSelectSearchModule,
  ],
})
export class KycEntryComponent {

  readonly: boolean = false;
  record: any = {};
  btnTitle: string = 'Create';
  fieldList: {};
  DocumentList: any[] = []
  isfirst: boolean = true;
  TempDataList: any[] = [];
  tempDocumentList: any[] = [];
  documentGrpList: any[] = [];
  ismodify: boolean = false;
  index: number;
  kycProfileDocumentDto: any = {
    id: '',
    document_id: '',
    is_required: '',
    is_required_group: ''
  }
  profileforlist: any[] = [
    'Agent', 'Sub Agent', 'Distributor', 'Employee', 'Supplier'
  ]
  kycprofileRoute = Routes.kyc.kycprofile_route;
  disableBtn: boolean = false
  documentGrpListAll: any[] = [];
  routId: string = ''
  compnyList: any[] = [];


  constructor(
    public formBuilder: FormBuilder,
    public cityService: CityService,
    public router: Router,
    public route: ActivatedRoute,
    public designationService: DesignationService,
    private documentService: DocumentService,
    private kycService: KycService,
    private matDialog: MatDialog,
    private conformationService: FuseConfirmationService,
    private toasterService: ToasterService,
    private pspsettingService: PspSettingService,


  ) { }

  formGroup: FormGroup;
  // protected alertService: ToastrService;

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      id: [""],
      profile_for: [""],
      profile_name: [""],
      is_required: [false],
      is_required_group: [false],
      document_id: [''],
      documentfilter: [''],
      document_group: [''],
      company_id: [''],
      companyfilter: [''],
    });

    /*************Company combo**************/
    this.formGroup
      .get('companyfilter')
      .valueChanges.pipe(
        filter((search) => !!search),
        startWith(''),
        debounceTime(200),
        distinctUntilChanged(),
        switchMap((value: any) => {
          return this.pspsettingService.getCompanyCombo(value);
        })
      )
      .subscribe({
        next: data => {
          this.compnyList = data
        }
      });

    //   this.formGroup.get('profile_name').valueChanges.subscribe(text => {
    //     this.formGroup.get('profile_name').patchValue(Linq.convertToTitleCase(text), { emitEvent: false });
    //  }) 

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.routId = params.get('id');
      const readonly = params.get('readonly');

      if (id) {
        this.readonly = readonly ? true : false;
        this.btnTitle = readonly ? 'Close' : 'Save';
        this.kycService.getkycprofileRecord(this.routId).subscribe({
          next: data => {
            this.record = data;
            this.formGroup.patchValue(data);
            this.formGroup.get('companyfilter').patchValue(this.record.company_name)
            this.formGroup.get('company_id').patchValue(this.record.company_id)


            if (this.record.kycProfileDocument?.length > 0) {
              this.record.kycProfileDocument.forEach(x => {
                this.TempDataList.push({ id: x.id, document_id: x.document_id, document_name: x.document_name, document_group: x.document_group, is_required: x.is_required, is_required_group: x.is_required_group })
              });
            }

            if (this.readonly) {
              this.fieldList = [
                { name: 'Profile For', value: this.record.profile_for },
                { name: 'Profile Name', value: this.record.profile_name },
                { name: 'Date', value: this.record.entry_date_time ? DateTime.fromISO(this.record.entry_date_time).toFormat('dd-MM-yyyy').toString() : '' },
                { name: 'Assigned', value: this.record.assigned.length },
              ]
            }
          },
          error: (err) => {
            this.toasterService.showToast('error', err)
            this.disableBtn = false;
          },
        })
      }
    })



    this.documentService.gettypesofdocumentsCombo().subscribe((data) => {
      this.DocumentList = data
      const filterkey = Linq.groupBy(data, x => x.document_group);
      this.documentGrpList = filterkey;
      this.documentGrpListAll = filterkey;
    });
  }

  assigned() {
    if (this.record.assigned.length < 1)
      return;
    this.matDialog.open(AssignedInfoComponent, {
      data: this.record.assigned,
      disableClose: true
    }).afterClosed().subscribe(res => {
      // this.refreshItems();
    })
  }


  filterDocumentGroup(value: string) {
    this.documentGrpList = this.documentGrpListAll.filter(x => x.key.toLowerCase().includes(value.toLowerCase()));
  }

  getDocs(value): void {
    this.DocumentList = this.documentGrpList.find(x => x.key == value).value;

  }

  // filterDocumentName(value: string) {
  //   const dnFilter = this.docFilter.filter(x => x.document_name?.toString().toLowerCase().includes(value.toLowerCase()));
  //   this.documentFiltered = dnFilter;
  // }

  submit(): void {
    if (!this.formGroup.valid) {
      this.toasterService.showToast('error', 'Please fill all required fields.', 'top-right', true);
      this.formGroup.markAllAsTouched();
      return;
    }

    if (this.readonly) {
      this.router.navigate([this.kycprofileRoute])
      return
    }
    const json = {
      id: this.routId,
      // id: this.formGroup.get('id').value,
      profile_for: this.formGroup.get('profile_for').value,
      profile_name: this.formGroup.get('profile_name').value,
      company_id: this.formGroup.get('company_id').value,
      kycProfileDocumentDto: this.TempDataList
    }
    this.disableBtn = true
    this.kycService.create(json).subscribe({
      next: () => {
        if (!json.id) {
          this.toasterService.showToast('success', 'New record added', "top-right", true);
        }
        else {
          this.toasterService.showToast('success', 'Record modified', "top-right", true);
        }
        this.router.navigate([this.kycprofileRoute])
        this.disableBtn = false;
      }, error: err => {
        this.toasterService.showToast('error', err, "top-right", true);
        this.disableBtn = false;
      }
    })
  }
  submitDoc(add?): void {
    const json = {
      id: this.ismodify ? this.formGroup.get('id').value : '',
      kyc_profile_id: this.routId,
      document_id: this.formGroup.get('document_id').value.id,
      is_required: this.formGroup.get('is_required').value,
      is_required_group: this.formGroup.get('is_required_group').value
    }
    this.disableBtn = true
    this.kycService.documentsCreate([json]).subscribe({
      next: (res) => {
        if (!json.id) {
          this.toasterService.showToast('success', 'New record added', "top-right", true);
        }
        else {
          this.TempDataList[this.index].document_id = this.formGroup.get('document_id').value.id;
          this.TempDataList[this.index].document_name = this.formGroup.get('document_id').value.document_name;
          this.TempDataList[this.index].document_group = this.formGroup.get('document_id').value.document_group;
          this.TempDataList[this.index].is_required = this.formGroup.get('is_required').value;
          this.TempDataList[this.index].is_required_group = this.formGroup.get('is_required_group').value;

          this.toasterService.showToast('success', 'Record modified', "top-right", true);
        }

        this.disableBtn = false;
        if (add && res) {
          this.formGroup.get('document_group').patchValue('')
          this.formGroup.get('documentfilter').patchValue('')
          this.formGroup.get('document_id').patchValue('')
          this.formGroup.get('is_required').patchValue(false)
          this.formGroup.get('is_required_group').patchValue(false)
        }
      }, error: (err) => {
        this.disableBtn = false;
        this.toasterService.showToast('error', err)
      }
    })
  }
  // AddData() {
  //   const isalreadyexist = this.TempDataList.find(x => x.document_id == this.formGroup.get('document_id').value.id && x.document_name == this.formGroup.get('document_id').value.document_name && x.document_group == this.formGroup.get('document_group').value)
  //   if (this.ismodify) {
  //     this.TempDataList[this.index].document_id = this.formGroup.get('document_id').value.id;
  //     this.TempDataList[this.index].document_name = this.formGroup.get('document_id').value.document_name;
  //     this.TempDataList[this.index].document_group = this.formGroup.get('document_id').value.document_group;
  //     this.TempDataList[this.index].is_required = this.formGroup.get('is_required').value;
  //     this.TempDataList[this.index].is_required_group = this.formGroup.get('is_required_group').value;
  //     this.ismodify = false;
  //   } else {
  //     if (isalreadyexist == '' || isalreadyexist == null) {
  //       this.TempDataList.push({ id: '', document_id: this.formGroup.get('document_id').value.id, document_name: this.formGroup.get('document_id').value.document_name, document_group: this.formGroup.get('document_group').value, is_required: this.formGroup.get('is_required').value, is_required_group: this.formGroup.get('is_required_group').value })

  //       const json = {}
  //       json['id'] = ""
  //       json['kyc_profile_id'] = this.routId
  //       json['document_id'] = this.formGroup.get('document_id').value.id,
  //       json['is_required'] = this.formGroup.get('is_required').value
  //       json['is_required_group'] = this.formGroup.get('is_required_group').value
  //       this.kycService.documentsCreate([json]).subscribe({
  //         next: () => {
  //           this.disableBtn = false;
  //            this.formGroup.get('document_group').patchValue('')
  //           this.formGroup.get('document_id').patchValue('')
  //           this.formGroup.get('is_required').patchValue(false)
  //           this.formGroup.get('is_required_group').patchValue(false)
  //         }, error: err => {
  //           this.disableBtn = false;
  //         }
  //       })
  //       }
  //   }
  //   // this.formGroup.get('document_group').patchValue('')
  //   // this.formGroup.get('document_id').patchValue('')
  //   // this.formGroup.get('is_required').patchValue(false)
  //   // this.formGroup.get('is_required_group').patchValue(false)

  //   // const json = {}
  //   // json['id'] = this.routId
  //   // json['document_id'] = this.formGroup.get('document_id').value.id,
  //   // json['is_required'] = this.formGroup.get('is_required').value
  //   // json['is_required_group'] = this.formGroup.get('is_required_group').value
  //   // this.kycService.documentsCreate(json).subscribe({
  //   //   next: () => {
  //   //     // this.alertService.success('Employee Created');
  //   //     this.disableBtn = false;
  //   //   }, error: err => {
  //   //     this.disableBtn = false;
  //   //   }
  //   // })
  // }
  AddData() {

    if (!this.formGroup.valid) {
      this.toasterService.showToast('error', 'Please fill all required fields.', 'top-right', true);
      this.formGroup.markAllAsTouched();
      return;
    }


    const isalreadyexist = this.TempDataList.find(x => x.document_id == this.formGroup.get('document_id').value.id && x.document_name == this.formGroup.get('document_id').value.document_name && x.document_group == this.formGroup.get('document_group').value)


    if (this.ismodify) {

      // this.TempDataList[this.index].document_id = this.formGroup.get('document_id').value.id;
      // this.TempDataList[this.index].document_name = this.formGroup.get('document_id').value.document_name;
      // this.TempDataList[this.index].document_group = this.formGroup.get('document_id').value.document_group;
      // this.TempDataList[this.index].is_required = this.formGroup.get('is_required').value;
      // this.TempDataList[this.index].is_required_group = this.formGroup.get('is_required_group').value;
      this.submitDoc('add');
      this.ismodify = false;
    } else {
      if (isalreadyexist == '' || isalreadyexist == null) {
        this.TempDataList.push({ id: '', document_id: this.formGroup.get('document_id').value.id, document_name: this.formGroup.get('document_id').value.document_name, document_group: this.formGroup.get('document_group').value, is_required: this.formGroup.get('is_required').value, is_required_group: this.formGroup.get('is_required_group').value })
        this.submitDoc('add');
      } else {
        this.toasterService.showToast('error', 'Record already exists!', "top-right", true);
      }
    }

  }

  // editrecord(data: any) {
  //   this.ismodify = true;
  //   this.index = this.TempDataList.indexOf(
  //     this.TempDataList.find(
  //       (x) =>
  //         x.document_id == data.document_id &&
  //         x.is_required == data.is_required &&
  //         x.is_required_group == data.is_required_group &&
  //         x.document_name == data.document_name &&
  //         x.document_group == data.document_group 
  //     )
  //   );
  //   this.formGroup.get('documentfilter').patchValue(data.document_group);
  //   this.formGroup.get('document_id').patchValue({ id: data.document_id, document_name: data.document_name, document_group: data.document_group });
  //   this.formGroup.get('document_group').patchValue(data.document_group);

  //   this.formGroup.get('is_required').patchValue(data.is_required ? true : false);
  //   this.formGroup.get('is_required_group').patchValue(data.is_required_group ? true : false);
  // }
  editrecord(data: any) {
    this.ismodify = true;
    this.index = this.TempDataList.indexOf(
      this.TempDataList.find(
        (x) =>
          x.id == data.id &&
          x.document_id == data.document_id &&
          x.is_required == data.is_required &&
          x.is_required_group == data.is_required_group &&
          x.document_name == data.document_name &&
          x.document_group == data.document_group
      )
    );
    var dt = cloneDeep(data);
    this.formGroup.get('id').patchValue(dt.id);
    this.formGroup.get('documentfilter').patchValue(dt.document_group);
    this.formGroup.get('document_id').patchValue({ id: dt.document_id, document_name: dt.document_name, document_group: dt.document_group });
    this.formGroup.get('document_group').patchValue(dt.document_group);

    this.formGroup.get('is_required').patchValue(dt.is_required ? true : false);
    this.formGroup.get('is_required_group').patchValue(dt.is_required_group ? true : false);
    this.getDocs(this.formGroup.get('document_group').value)
  }



  deleterecord(data: any) {

    const label: string = 'Delete Kyc Profile'
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + ' ?'
    }).afterClosed().subscribe(res => {
      if (res === 'confirmed') {
        this.kycService.documentdelete(data.id).subscribe({
          next: () => {
            // this.alertService.showToast('success', "KYC has been deleted!", "top-right", true);
            this.toasterService.showToast(
              'success',
              'KYC has been deleted!',
              "top-right",
              true
            );

            const index = this.TempDataList.indexOf(
              this.TempDataList.find(
                (x) =>
                  x.document_id == data.document_id &&
                  x.is_required == data.is_required &&
                  x.is_required_group == data.is_required_group &&
                  x.document_name == data.document_name &&
                  x.document_group == data.document_group
              )
            );
            this.TempDataList.splice(index, 1);

          },
          error: (err) => {
            this.toasterService.showToast('error', err)
            this.disableBtn = false;
          },
        })
      }
    })

  }

  public compareWith(v1: any, v2: any) {
    return v1 && v2 && v1.id === v2.id;
  }
}



