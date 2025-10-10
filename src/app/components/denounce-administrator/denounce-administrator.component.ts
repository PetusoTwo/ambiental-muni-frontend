import { Component, inject, ViewChild } from '@angular/core';
import { FormService } from '../../service/form.service';
import { DenounceConsultant, DenounceState, DetailedDenounce, SummarizedDenounce, PersonInformation, JuridicPersonInformation } from '../../util/form-types';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import FileSaver from 'file-saver';
import { DenounceStateUpdateInformation, DenounceTrackingModalComponent } from '../denounce-tracking-modal/denounce-tracking-modal.component';
import { UserService } from '../../service/user.service';
import { PersonInformationFormComponent } from '../person-information-form/person-information-form.component';
import { environment } from '../../environment/environment-development';

@Component({
  selector: 'app-denounce-administrator',
  imports: [
    CommonModule, 
    FormsModule, 
    DenounceTrackingModalComponent,
    PersonInformationFormComponent
  ],
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
  showUpdateDenouncedModal: boolean = false;
  denouncedToUpdate: PersonInformation | null = null;
  selectedDenounceIdForDenounced: number = 0;

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

    // extraer nombre de archivo 
    const parts = proof.split('/');
    const filename = parts[2] ?? parts[parts.length - 1] ?? proof;

    // URL del endpoint del backend (aca estaba el error jiji)
    const backendUrl = `${environment.PHP_BACKEND_URL}/requestProof?filename=${encodeURIComponent(filename)}`;

    // helper para descargar
    const downloadBlob = (blob: Blob, name: string) => {
      try {
        FileSaver.saveAs(blob, name);
      } catch {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(objectUrl);
        a.remove();
      }
    };

    // Primero: intentar por el servicio (flujo original)
    this.formService.requestProof(filename).subscribe({
      next: (resp: any) => {
        try {
          // 1) respuesta como Blob
          if (resp instanceof Blob) {
            downloadBlob(resp, filename);
            return;
          }

          // 2) respuesta con propiedad 'bytes' (base64)
          if (resp && resp.bytes) {
            const binary = window.atob(resp.bytes);
            const len = binary.length;
            const array = new Uint8Array(len);
            for (let i = 0; i < len; i++) array[i] = binary.charCodeAt(i);
            downloadBlob(new Blob([array]), filename);
            return;
          }

          // 3) respuesta con propiedad 'file' (base64) u otra
          if (resp && resp.file) {
            const binary = window.atob(resp.file);
            const len = binary.length;
            const array = new Uint8Array(len);
            for (let i = 0; i < len; i++) array[i] = binary.charCodeAt(i);
            downloadBlob(new Blob([array]), filename);
            return;
          }

          // 4) si la respuesta no es la esperada, fallback: abrir URL directa al backend
          const opened = window.open(backendUrl, '_blank');
          if (!opened) {
            fetch(backendUrl)
              .then(r => { if (!r.ok) throw r; return r.blob(); })
              .then(b => downloadBlob(b, filename))
              .catch(err => { console.error('requestProof fallback fetch error', err); alert('No se pudo descargar la prueba.'); });
          }
        } catch (err) {
          console.error('requestProof processing error', err);
          alert('Error procesando la prueba recibida.');
        }
      },
      error: err => {
        // Si falla el servicio, intentar abrir la URL directa al backend
        console.warn('requestProof service failed, fallback to direct URL', err);
        const opened = window.open(backendUrl, '_blank');
        if (!opened) {
          fetch(backendUrl)
            .then(r => { if (!r.ok) throw r; return r.blob(); })
            .then(b => downloadBlob(b, filename))
            .catch(e => {
              alert('Error al descargar la prueba.');
            });
        }
      }
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

  isDenounceWithoutDenouncedData(denounce: SummarizedDenounce): boolean {
    return denounce.denouncedDocNumber === 'SIN DATOS' || 
           !denounce.denouncedDocNumber || 
           denounce.denounced === 'SIN DATOS' || 
           !denounce.denounced;
  }

  openUpdateDenouncedModal(idDenounce: number): void {
    this.selectedDenounceIdForDenounced = idDenounce;
    
    // Crear un objeto PersonInformation vacío para el denunciado
    this.denouncedToUpdate = {
      entity: {
        tradeName: '',
        ruc: null
      } as JuridicPersonInformation,
      isNatural: false,
      legalRepresentator: '',
      address: '',
      fixedPhone: '',
      firstPhone: '',
      secondPhone: '',
      email: ''
    };

    this.showUpdateDenouncedModal = true;
  }

  closeUpdateDenouncedModal(): void {
    this.showUpdateDenouncedModal = false;
    this.denouncedToUpdate = null;
    this.selectedDenounceIdForDenounced = 0;
  }

  updateDenouncedData(): void {
    if (!this.denouncedToUpdate) return;

    // Preparar los datos para enviar
    const updateData = {
      id_denounce: this.selectedDenounceIdForDenounced,
      denounced: this.denouncedToUpdate
    };

    // Llamar al servicio para actualizar
    this.formService.updateDenouncedData(updateData).subscribe({
      next: (response) => {
        console.log('Denunciado actualizado correctamente', response);
        // Recargar la lista de denuncias
        this.processFilter(false);
        this.closeUpdateDenouncedModal();
      },
      error: (error) => {
        console.error('Error al actualizar denunciado', error);
      }
    });
  }

  get trackingModal(): DenounceTrackingModalComponent {
    return this._trackingModal;
  }

  // asegurar consultant para pasar al modal de tracking
  public consultant: DenounceConsultant = DenounceConsultant.ADMIN;

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