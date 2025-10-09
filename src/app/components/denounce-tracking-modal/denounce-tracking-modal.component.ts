
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { DenounceConsultant, DenouncePublicInformation, DenounceState, DenounceStateTrackingAdmin, DenounceStateTrackingCivil } from '../../util/form-types';
import { FormService } from '../../service/form.service';

@Component({
  selector: 'app-denounce-tracking-modal',
  imports: [CommonModule],
  templateUrl: './denounce-tracking-modal.component.html',
  styleUrl: './denounce-tracking-modal.component.css'
})
export class DenounceTrackingModalComponent {

  @Input({ required: true })
  consultant!: DenounceConsultant

  @Output()
  stateUpdate: EventEmitter<DenounceStateUpdateInformation> = new EventEmitter<DenounceStateUpdateInformation>();

  private _show: boolean = false;
  private _showDeleteWarningModal: boolean = false;
  private selectedIdTrackingForDelete: number = 0;
  private _$localSelectedDenounceIndex: number = 0;
  private _deleteResponseStatusCode: DeleteStatusCode = DeleteStatusCode.IDLE;
  private formService: FormService = inject(FormService);
  private _denouncesInformation!: DenounceStateTrackingCivil[] | DenounceStateTrackingAdmin[];
  private _publicInformation: DenouncePublicInformation = {
    date: "",
    denouncedName: "",
    denouncedDocNumber: "",
    isNatural: 0,
    ambientalPromise: ""
  };

  prepareTrackingModal(idDenounce: number, localNumberDenounce?: number): void {

    this.formService.getPublicInformationByDenounceId(idDenounce).subscribe(resp => this._publicInformation = resp);

    this.formService.getDenounceTracking(idDenounce, this.consultant, true).subscribe(resp => {

      this._denouncesInformation = this.consultant === DenounceConsultant.ADMIN 
      ? resp as DenounceStateTrackingAdmin[] : resp as DenounceStateTrackingCivil[];

      this._$localSelectedDenounceIndex = localNumberDenounce ?? 0;

      this.toggleModal();
      
    })

  }

  setStateStyle(denounceState: DenounceState): string {
    return Object.keys(DenounceState)[Object.values(DenounceState).indexOf(denounceState)].toLowerCase();
  }

  toggleModal(): void {
    this._show = !this._show;
  }

  prepareDeleteWarningModal(idTracking: number, actualState: DenounceState): void {

    const isTopState: boolean = this._denouncesInformation[0].state === actualState;

    if (isTopState) {
      
      this.selectedIdTrackingForDelete = idTracking;

      this.toggleDeleteWarningModal();

    }

  }

  get denounceInformationAsCivil(): DenounceStateTrackingCivil[] {
    return this._denouncesInformation as DenounceStateTrackingCivil[];
  }

  get denounceInformationAsAdmin(): DenounceStateTrackingAdmin[] {
    return this._denouncesInformation as DenounceStateTrackingAdmin[];
  }

  get publicInformation(): DenouncePublicInformation {
    return this._publicInformation;
  }

  get showDeleteWarningModal(): boolean {
    return this._showDeleteWarningModal;
  }

  get deleteResponseStatusCode(): DeleteStatusCode {
    return this._deleteResponseStatusCode;
  }

  get show(): boolean {
    return this._show;
  }

  public toggleDeleteWarningModal(): void {

    this.selectedIdTrackingForDelete = this._showDeleteWarningModal ? 0 : this.selectedIdTrackingForDelete;

    this._deleteResponseStatusCode = DeleteStatusCode.IDLE;

    this._showDeleteWarningModal = !this._showDeleteWarningModal;
    
  }
  
  protected processDelete(): void {
    this.formService.deleteDenounceState(this.selectedIdTrackingForDelete).subscribe(resp => {

      this._deleteResponseStatusCode = DeleteStatusCode.SUCCESS;

      this._denouncesInformation.shift();
      
      const topState: DenounceState = this._denouncesInformation[0].state;

      this.stateUpdate.emit({
        $index: this._$localSelectedDenounceIndex,
        topState: topState
      });

    },
    error => {

      this._deleteResponseStatusCode = DeleteStatusCode.ERROR;

    });
  }

  // Método público para abrir el modal desde el padre
  public openModal(idDenounce: number, localNumberDenounce?: number): void {
    // Llamamos directamente al flujo interno que prepara y abre el modal
    try {
      this.prepareTrackingModal(idDenounce, localNumberDenounce);
    } catch (err) {
      console.warn('openModal: error al abrir modal de seguimiento', err);
      // Fallback: intentar mostrar el modal si existe toggleModal
      try { this.toggleModal(); } catch {}
    }
  }

}

enum DeleteStatusCode {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  IDLE = 'IDLE'
}

export type DenounceStateUpdateInformation = {
  $index: number;
  topState: DenounceState;
}