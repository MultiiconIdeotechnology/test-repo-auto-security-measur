import { Component, HostBinding, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    MatIconModule
  ]

})
export class AlertComponent implements OnInit {

  @HostBinding('class') class = 'alert-root';
  
  constructor(
    public matDialogRef: MatDialogRef<AlertComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) { }

  bg_color = this.data.alert === 'success' ? 'bg-primary' : 'bg-red-600'

  ngOnInit(): void {
    setTimeout(() => {
      // this.matDialogRef.close();
    }, 5000)
  }
}
