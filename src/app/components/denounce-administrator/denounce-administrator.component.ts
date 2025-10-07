import { Component, inject, ViewChild } from '@angular/core';
import { FormService } from '../../service/form.service';
import { DenounceConsultant, DenounceState, DetailedDenounce, SummarizedDenounce } from '../../util/form-types';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import FileSaver from 'file-saver';
import { DenounceStateUpdateInformation, DenounceTrackingModalComponent } from '../denounce-tracking-modal/denounce-tracking-modal.component';
import { UserService } from '../../service/user.service';

@Component({
  selector: 'app-denounce-administrator',
  imports: [CommonModule, FormsModule, DenounceTrackingModalComponent],
  templateUrl: './denounce-administrator.component.html',
  styleUrl: './denounce-administrator.component.css'
})
export class DenounceAdministratorComponent {

  private formService: FormService = inject(FormService);
  private userService: UserService = inject(UserService);
  @ViewChild(DenounceTrackingModalComponent)
  private _trackingModal!: DenounceTrackingModalComponent;

  denounces!: SummarizedDenounce[];
  denounceDetails: DetailedDenounce = {
    code: "",
    receptionMedia: "",
    date: "",
    hasPreviousDenounce: 0,
    comunicationMedia: "",
    hasResponse: 0,
    directedEntity: "",
    entityResponse: "",
    source: "",
    keepIdentity: 0,
    address: "",
    reference: "",
    factsDescription: "",
    ambientalPromise: "",
    proofDescription: "",
    proofs: "",
    ambientalCauses: ""
  };
  filterInformation: DenounceFilterInformation = {
    denouncerDocNumber: "",
    denouncedDocNumber: "",
    date: "",
    denounceType: "null",
    offset: 0
  }
  showMoreInformationModal: boolean = false;
  showUpdateDenounceModal: boolean = false;
  actualModalView: number = 0;
  lastMarkedState: HTMLDivElement | null = null;
  updateDenounceModalInformation: UpdateDenounceInformation = { 
    idDenounce: 0, 
    oldState: DenounceState.REGISTERED, 
    newState: DenounceState.REGISTERED,
    description: "",
    $index: 0 
  };
  realRegisters: number = 0;
  actualOffset: number = 1;

  constructor() {
    this.processFilter();
  }

  logout(): void {
    this.userService.logout().subscribe(resp => {})
  }

  processIsNatural(docNumber: string): boolean {
    return docNumber.length === 8;
  }

  setStateStyle(denounceState: DenounceState): string {
    return Object.keys(DenounceState)[Object.values(DenounceState).indexOf(denounceState)].toLowerCase();
  }

  getAvailableStates(actualState: DenounceState): DenounceState[] {

    const states: DenounceState[] = [actualState];

    switch (actualState) {
      case DenounceState.REGISTERED:
        states.push(DenounceState.RECEIVED);
        return states;
      case DenounceState.RECEIVED:
        states.push(DenounceState.SERVED);
        return states;
      case DenounceState.SERVED:
        return states;
      default:
        return [];
    }

  }

  changeState(): void {

    const { newState, idDenounce, $index, description } = this.updateDenounceModalInformation;

    this.formService.updateDenounceState(newState, idDenounce, description).subscribe(resp => {
      this.denounces[$index].state = newState;
      this.toggleShowUpdateDenounceModal();
    });
  }

  processFocusOnChangeState(e: Event): void {

    const lastMarkedState: HTMLDivElement = (e.target as HTMLDivElement);

    if (this.lastMarkedState === lastMarkedState && this.lastMarkedState.classList.contains('focus')) {

      this.lastMarkedState.classList.remove('focus');

      return;
    }

    this.lastMarkedState?.classList.remove('focus');
    
    lastMarkedState.classList.add('focus');

    this.lastMarkedState = lastMarkedState;

  }

  showDenounceDetails(id: number): void {
    this.formService.getDenounceDetail(id).subscribe(denounceDetails => {
      this.denounceDetails = denounceDetails;
      this.toggleShowMoreInformationModal();
    })
  }

  toggleShowMoreInformationModal(): void {

    this.showMoreInformationModal = !this.showMoreInformationModal;

  }

  toggleShowUpdateDenounceModal(): void {
    this.showUpdateDenounceModal =!this.showUpdateDenounceModal;
  }

  prepareUpdateDenounceModal(newState: DenounceState, oldState: DenounceState, idDenounce: number, $index: number): void {

    this.updateDenounceModalInformation = { idDenounce, newState, oldState, $index, description: '' };

    this.toggleShowUpdateDenounceModal();
  }

  closeDenounceDetailsModal(): void {
    this.toggleShowMoreInformationModal();
    this.actualModalView = 0;
  }

  nextModalView(): void {

    if (this.actualModalView === 2) return;

    this.actualModalView++;
  }

  backModalView(): void {
    if (this.actualModalView === 0) return;

    this.actualModalView--;
  }

  processFilter(newFilter: boolean = true): void {

    const { denouncerDocNumber, denouncedDocNumber, date, denounceType } = this.filterInformation;

    const sanitizedDenouncerDocNumber = /^\d+$/.test(denouncerDocNumber!) ? denouncerDocNumber : '';
    const sanitizedDenouncedDocNumber = /^\d+$/.test(denouncedDocNumber!) ? denouncedDocNumber : '';

    if (newFilter) this.actualOffset = 1;

    const filter: DenounceFilterInformation = {
      denouncerDocNumber: sanitizedDenouncerDocNumber?.length === 8 || sanitizedDenouncerDocNumber?.length === 11 ? sanitizedDenouncerDocNumber : null,
      denouncedDocNumber: sanitizedDenouncedDocNumber?.length === 8 || sanitizedDenouncedDocNumber?.length === 11 ? sanitizedDenouncedDocNumber : null,
      date: date === '' ? null : date,
      denounceType: denounceType === 'null' ? null : denounceType,
      offset: (this.actualOffset - 1) * 10
    }

    this.formService.getDenounces(filter).subscribe(resp => {
      this.denounces = resp.denounces;
      this.realRegisters = newFilter ? resp.registers : this.realRegisters;

      if (this.realRegisters === 0) this.actualOffset = 0;

    });

  }

  processArrowPaginationForward(): void {

    if (this.actualOffset < this.getTotalPagination()) {
      this.actualOffset++;
      this.processFilter(false);
    }

  }

  processArrowPaginationBackward(): void {

    if (this.actualOffset > 1) {
      this.actualOffset--;
      this.processFilter(false);
    }

  }

  processPaginationInput(): void {

    const totalPagination: number = this.getTotalPagination();

    if (this.actualOffset >= 1 && this.actualOffset <= totalPagination) {
      this.processFilter(false);
      return;
    }

    if (this.actualOffset < 1 && totalPagination !== 0) {
      this.actualOffset = 1;
      this.processFilter(false);
      return;
    }

    if (this.actualOffset > totalPagination && totalPagination !== 0) {
      this.actualOffset = totalPagination;
      this.processFilter(false);
      return;
    }

    this.actualOffset = 0;

  }

  getPagination(): number[] {

    return Array.from({length: this.getTotalPagination()}, (_, i) => i + 1);

  }

  getTotalPagination(): number {
    return Math.ceil(this.realRegisters / 10);
  }

  requestProof(proof: string): void {

    const [ _, __, filename ] = proof.split('/');

    this.formService.requestProof(filename).subscribe(resp => {

      const fileRawBytes: string = window.atob(resp.bytes);
      const fileArrBuffer: ArrayBuffer = new ArrayBuffer(fileRawBytes.length);
      const buffer: Uint8Array = new Uint8Array(fileArrBuffer);
      for (let i = 0; i < fileRawBytes.length; i++) buffer[i] = fileRawBytes.charCodeAt(i);
      const blob: Blob = new Blob([buffer]);

      FileSaver.saveAs(blob, filename);

    });

  }

  requestPDF(idDenounce: number): void {
    this.formService.requestPDF(idDenounce).subscribe(blob => {

      const url: string = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      /*
      WITH DOWNLOAD
      const url = window.URL.createObjectURL(blob);
      const link: HTMLAnchorElement = document.createElement('a');
      link.style.display = 'none';
      link.href = url;
      link.download = `Denuncia_${idDenounce}.pdf`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      */

    });
  }

  processDenounceStateUpdate(updateInformation: DenounceStateUpdateInformation): void {

    const { $index, topState } = updateInformation;

    this.denounces[$index].state = topState;

  }

  get trackingModal(): DenounceTrackingModalComponent {
    return this._trackingModal;
  }

  get consultant(): DenounceConsultant {
    return DenounceConsultant.ADMIN;
  }

}

export type DenounceFilterInformation = {
  denouncerDocNumber: string | null;
  denouncedDocNumber: string | null;
  date: string | null;
  denounceType: string | null;
  offset: number;
}

export type UpdateDenounceInformation = {
  idDenounce: number;
  newState: DenounceState;
  oldState: DenounceState;
  description: string;
  $index: number;
}