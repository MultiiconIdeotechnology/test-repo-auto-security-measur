import { Component, Inject } from '@angular/core';
import { NgIf, NgFor, CommonModule, NgClass, AsyncPipe } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
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


@Component({
  selector: 'app-kyc-filter',
  templateUrl: './kyc-filter.component.html',
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
  ],
})
export class KycFilterComponent {

  filterForm: FormGroup;
  title = 'Filter Criteria';
  selectMasterList = ['All', 'Agent', 'Sub Agent', 'Customer', 'Supplier', 'Employee'];
  constructor(
    public matDialogRef: MatDialogRef<KycFilterComponent>,
    private builder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {
  }

  ngOnInit(): void {
    this.filterForm = this.builder.group({
      profile_for: [''],
    });

    this.filterForm.get('profile_for').patchValue(this.data);
  }

  ngSubmit(): void {
    this.matDialogRef.close(this.filterForm.get('profile_for').value);
  }
}
