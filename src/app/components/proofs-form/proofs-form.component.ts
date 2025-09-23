import { Component, Input, Output } from '@angular/core';
import { ProofInformation } from '../../util/form-types';
import { FormsModule } from '@angular/forms';
import { validateTextArea as validatorsValidateTextArea } from '../../util/form-validators';
import { Subject } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-proofs-form',
  imports: [FormsModule, CommonModule],
  templateUrl: './proofs-form.component.html',
  styleUrl: './proofs-form.component.css'
})
export class ProofsFormComponent {

  @Input({ required: true })
  proof!: ProofInformation;

  @Output()
  proofUploadErrorEmitter = new Subject<string>();

  isValidProofUpload: boolean = false;
  private MAX_BYTES: number = Math.pow(10, 8);
  private FILES_SIZE: number = 0;
  private MAX_FILES: number = 5;

  acceptedTypes: string[] = [
      'image/png',
      'image/jpeg',
      'video/mp4',
      'application/pdf'
  ]

  async checkFile(e: Event): Promise<void> {
    
    const input = (e.target as HTMLInputElement);

    if (input.files) {
      
      const file = input.files[0];

      if (this.proof.proofData.length >= this.MAX_FILES) {
        this.proofUploadErrorEmitter.next('Se alcanzo el numero maximo de 5 archivos.');
        input.value = '';
        return;
      }

      if (this.MAX_BYTES - this.FILES_SIZE < file.size) {
        this.proofUploadErrorEmitter.next('Se alcanzo el numero maximo de archivos 100MB');
        input.value = '';
        return;
      }

      const type = file.type.split('/');
      this.isValidProofUpload = this.acceptedTypes.map(t => t.split('/')[1]).includes(type[1]);

      if (this.isValidProofUpload) {
        
        const arrayBuffer: ArrayBuffer = await file.arrayBuffer();
        const buffer: Uint8Array = new Uint8Array(arrayBuffer);

        let fileBinaryData: string = '';

        for (let i = 0; i < buffer.byteLength; i++) {
          fileBinaryData += String.fromCharCode(buffer[i]);
        }

        this.proof.proofData.push({ 
          data: window.btoa(fileBinaryData), 
          proofPath: `/uploads/${crypto.randomUUID()}.${type[1]}`, 
          proofType: type[1],
          name: file.name,
          size: file.size
        });

        this.FILES_SIZE += file.size;

      } else {

        const types: string = this.acceptedTypes.map(t => t.split('/')[1]).join(', ');
        const msg: string = `Por favor ingrese un archivo valido. Formatos validos: ${types}`;

        this.proofUploadErrorEmitter.next(msg);

      }

      input.value = '';

    }

  }

  validateTextArea(e: Event): void {
    validatorsValidateTextArea(e);
  }

  deleteUploadedFile(index: number): void {
    this.FILES_SIZE -= this.proof.proofData[index].size;
    this.proof.proofData.splice(index, 1);
  }

}

export type FileData = {
  data: string;
  proofPath: string;
  proofType: string;
  name: string;
  size: number;
}