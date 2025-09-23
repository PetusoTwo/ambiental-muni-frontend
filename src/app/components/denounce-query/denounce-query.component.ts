import { Component, inject, ViewChild } from '@angular/core';
import { FormService } from '../../service/form.service';
import { DenounceConsultant, DenounceState, DenounceStateTrackingCivil } from '../../util/form-types';
import { FormsModule } from '@angular/forms';
import { DenounceTrackingModalComponent } from '../denounce-tracking-modal/denounce-tracking-modal.component';

@Component({
  selector: 'app-denounce-query',
  imports: [FormsModule, DenounceTrackingModalComponent],
  templateUrl: './denounce-query.component.html',
  styleUrl: './denounce-query.component.css'
})
export class DenounceQueryComponent {

  private formService: FormService = inject(FormService);
  @ViewChild(DenounceTrackingModalComponent)
  private _trackingModal!: DenounceTrackingModalComponent
  denouncesInformation: DenounceStateTrackingCivil[] = [];
  idDenounce!: number;

  public getDenounceTrack(): void {

    if (!this.idDenounce) return;

    this.formService.getDenounceTracking(this.idDenounce, this.consultant, false).subscribe(resp => {

      this.denouncesInformation = resp as DenounceStateTrackingCivil[];

    })
  }

  get trackingModal(): DenounceTrackingModalComponent {
    return this._trackingModal;
  }

  get consultant(): DenounceConsultant {
    return DenounceConsultant.CIVIL;
  }

  setStateStyle(denounceState: DenounceState): string {
      return Object.keys(DenounceState)[Object.values(DenounceState).indexOf(denounceState)].toLowerCase();
  }

}
