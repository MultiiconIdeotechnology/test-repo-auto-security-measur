import { Component, Inject } from '@angular/core';
import { AsyncPipe, CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToasterService } from 'app/services/toaster.service';
import { SendMailService } from 'app/services/sent-mail.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-view-template',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    AsyncPipe,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    NgxMatSelectSearchModule,
  ],
  templateUrl: './view-template.component.html',
  styleUrls: ['./view-template.component.scss']
})
export class ViewTemplateComponent {

  dataList:any

  constructor(
    public matDialogRef: MatDialogRef<ViewTemplateComponent>,
    private toasterService: ToasterService,
    private sendMailService: SendMailService,
    public sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
  }

  ngOnInit() {
    this.sendMailService.getSendEmailMsgBody(this.data).subscribe({
      next: (res) => {
        this.dataList = res
      },
      error: (err) => {
        this.toasterService.showToast('error', err)
      },
    });
  }
}
