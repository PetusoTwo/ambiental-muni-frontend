import { Component, inject } from '@angular/core';
import { GeneralAspectsComponent } from '../general-aspects/general-aspects.component';
import { CommonModule } from '@angular/common';
import { DenouncedAspectsComponent } from '../denounced-aspects/denounced-aspects.component';
import { Denounce, createEmptyDenounce, createTestDenounce } from '../../util/form-types';
import { AmbientalDenounceFormComponent } from '../ambiental-denounce-form/ambiental-denounce-form.component';
import { ProofsFormComponent } from '../proofs-form/proofs-form.component';
import { FormService } from '../../service/form.service';
import { getValidators, Validator, ValidationError } from '../../util/form-validators';
import { ZodError } from 'zod';

@Component({
  selector: 'app-form',
  imports: [GeneralAspectsComponent, DenouncedAspectsComponent, ProofsFormComponent, AmbientalDenounceFormComponent, CommonModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css'
})
export class FormComponent {

  private _formService: FormService = inject(FormService);
  private _validators: Validator[];
  formSended: boolean = false;
  modalErrorMsg: string = "";
  openModal: boolean = false;
  formActualStep = 0;
  denounce: Denounce = createEmptyDenounce();
  
  // Nueva propiedad para controlar el modal de datos del denunciado
  showDenouncedQuestionModal: boolean = false;
  skipDenouncedData: boolean = false;

  constructor() {
    this._validators = getValidators(this.denounce);
  }

  changeStep(): void {
    // Validación: si estamos en el paso 2 (DESCRIPCIÓN de hechos) no permitir avanzar si < 50 chars
    if (this.formActualStep === 2) {
        const desc = String(this.denounce?.ambientalPromises?.factsDescription ?? '').trim();
        if (desc.length < 50) {
            this.modalErrorMsg = 'La descripción de los hechos debe tener al menos 50 caracteres para continuar.';
            this.toggleModal(); // abre el modal de error ya presente en la plantilla
            return; // bloquea el avance
        }
    }

    // Si el usuario eligió no conocer los datos del denunciado y estamos en el paso 2,
    // no validar el paso 1 (denunciado)
    const stepToValidate = this.skipDenouncedData && this.formActualStep === 2 ? 0 : this.formActualStep;
    
    const result: ValidationError = this._validators[stepToValidate].validate();
  
    if (!result.success) {
      this.processValidationError(result.error);
      return;
    }
  
    // Si estamos en el paso 0 (denunciante), mostrar el modal para preguntar sobre datos del denunciado
    if (this.formActualStep === 0) {
      this.showDenouncedQuestionModal = true;
      return;
    }
  
    if (this.formActualStep === 3) {
      this.sendForm();
      return;
    };
  
    this.formActualStep++;
  }

  backStep(): void {
    if (this.formActualStep === 0) return;

    // Si estamos saltando el paso del denunciado y retrocedemos desde el paso 2,
    // ir directamente al paso 0
    if (this.skipDenouncedData && this.formActualStep === 2) {
      this.formActualStep = 0;
      return;
    }

    this.formActualStep--;
  }

  // Nueva función para manejar la respuesta del modal de datos del denunciado
  handleDenouncedDataQuestion(knowsData: boolean): void {
    this.showDenouncedQuestionModal = false;
    
    if (knowsData) {
      // Si conoce los datos, ir al paso 1 (denunciado)
      this.formActualStep = 1;
      this.skipDenouncedData = false;
    } else {
      // Si no conoce los datos, saltar al paso 2 (detalles)
      this.formActualStep = 2;
      this.skipDenouncedData = true;
    }
  }

  sendForm(): void {

    this.formActualStep++;

    this._formService.sendForm(this.denounce).subscribe(resp => {

      if (resp.success) this.formSended = true;

    }, error => {

      this.formActualStep--;
      this.modalErrorMsg = <string> error.error?.message;

      this.toggleModal();

    })

  }

  private processValidationError(error: ZodError): void {

    this.modalErrorMsg = error.errors[0].message;

    this.toggleModal();

  }

  processProofUploadError(errorMsg: string): void {
    this.modalErrorMsg = errorMsg;
    this.toggleModal();
  }

  toggleModal(): void {

    this.openModal = !this.openModal;

  }

  goToNewDenounce(): void {
    location.reload();
  }

}