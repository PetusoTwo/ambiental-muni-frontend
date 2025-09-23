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

  constructor() {
    this._validators = getValidators(this.denounce);
  }

  changeStep(): void {

    const result: ValidationError = this._validators[this.formActualStep].validate();

    if (!result.success) {
      this.processValidationError(result.error);
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

    this.formActualStep--;
    
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