import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { dateRange } from 'app/common/const';
import { AgentService } from 'app/services/agent.service';
import { WalletService } from 'app/services/wallet.service';
import { CommonUtils } from 'app/utils/commonutils';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { filter, startWith, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

@Component({
  selector: 'app-reject-wallet-reasone',
  templateUrl: './reject-wallet-reasone.component.html',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    DatePipe,
    AsyncPipe,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    NgxMatSelectSearchModule,
    MatDatepickerModule,
    MatTooltipModule
  ]
})
export class RejectWalletReasoneComponent {

  formGroup: FormGroup;

  constructor(
    public matDialogRef: MatDialogRef<RejectWalletReasoneComponent>,
    private builder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
  }

  ngOnInit(): void {
    this.formGroup = this.builder.group({
      reject_reasone: [''],
    });
  }

  apply(): void {
    this.matDialogRef.close({ reject_reasone: this.formGroup.get('reject_reasone').value });
  }
}
