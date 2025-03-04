import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { SalesProductsService } from 'app/services/slaes-products.service';
import { ToasterService } from 'app/services/toaster.service';

@Component({
  selector: 'app-agent-dial-call',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatButtonModule
  ],
  templateUrl: './agent-dial-call.component.html',
  styleUrls: ['./agent-dial-call.component.scss']
})
export class AgentDialCallComponent {
  @Input() record: any
  @Output() remarkAddEvent = new EventEmitter<any>();
  formGroup: FormGroup;
  readonly: boolean = false;

  constructor(
    public matDialogRef: MatDialogRef<AgentDialCallComponent>,
    private builder: FormBuilder,
    private salesProductsService: SalesProductsService,
    private alertService: ToasterService,
  ) {
    this.formGroup = this.builder.group({
      rm_remark: ['', Validators.required],
    });

  }
  
  submit() {
    if(!this.formGroup.valid){
      this.alertService.showToast('error', 'Remark is required');
      return;
    }

    let payload = {
      feedback: "",
      master_for: "agent_signup",
      master_id: this.record?.agent_code_enc || "",
      call_purpose: "Follow-up",
      rm_remark: this.formGroup.get('rm_remark')?.value,
    }
    this.salesProductsService.createFollowupRemark(payload).subscribe({
      next: (res: any) => {
        if(res && res['status']){
          this.alertService.showToast('success', 'Your Remark has been added');
          this.remarkAddEvent.emit('remark-added');
          this.formGroup.reset();
        }
      },
      error: (err) => {
        this.alertService.showToast('error', err, 'top-right', true);
      },
    })
  }

}
