import { NgIf, NgFor, DatePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from 'app/core/auth/auth.service';
import { ToasterService } from 'app/services/toaster.service';
import { EmailSetupService } from 'app/services/email-setup.service';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-send-test-mail',
  templateUrl: './send-test-mail.component.html',
  styleUrls: ['./send-test-mail.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    DatePipe,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatMenuModule,
    MatDialogModule,
    MatTooltipModule,
    MatDividerModule
  ]
})
export class SendTestMailComponent {

  checked = false;
  labelPosition: 'before' | 'after' = 'after';
  disabled = false;

  dataForm: FormGroup;

  constructor(
    public matDialogRef: MatDialogRef<SendTestMailComponent>,
    private emailSetupService: EmailSetupService,
    private authService: AuthService,
    // private alertService: AlertService,
    public alertService: ToasterService,

    private builder: FormBuilder,
    // private confirmService :ConfirmService,
    @Inject(MAT_DIALOG_DATA) private data: any = {},
  ) {
  }

  ngOnInit(): void {
    this.dataForm = this.builder.group({
      id: [''],
      toMail: [''],
      body: [''],
    });
  }

  testSend(): void {
    if(!this.dataForm.valid){
      this.alertService.showToast('error', 'Please fill all required fields.', 'top-right', true);
      this.dataForm.markAllAsTouched();
      return;
}

    if (this.dataForm.invalid)
      return;

    const json = this.dataForm.getRawValue();
    json.id = this.data.id;
    this.emailSetupService.sendTestMail(json).subscribe({
      next: () => {
        // this.alertService.showToast('success', err, "top-right", true);
        this.matDialogRef.close(true);
      },
      //  error: (err) => this.alertService.error(err)
      error: (err) => {
        this.matDialogRef.close()
        this.alertService.showToast('error', err, "top-right", true);
      }
    })
  }
}
