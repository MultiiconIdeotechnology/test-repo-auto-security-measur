import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-select-pax',
  templateUrl: './select-pax.component.html',
  styleUrls: ['./select-pax.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,

  ],
})
export class SelectPaxComponent {

  form = { adult: 0, child: 0 }

  constructor(
    public matDialogRef: MatDialogRef<SelectPaxComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    Object.assign(this.form, this.data);
  }

  increment(value: string): void {
    
    if (value.includes('adult'))
    this.form.adult++;
  else
  this.form.child++;
}

  decrement(value): void {
    if (value.includes('adult'))
    this.form.adult > 1 ? this.form.adult-- : null;
  else
  this.form.child > 0 ? this.form.child-- : null;

  }

}
