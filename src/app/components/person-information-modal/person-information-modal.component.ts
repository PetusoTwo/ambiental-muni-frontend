import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PersonInformationFormComponent } from '../person-information-form/person-information-form.component';

@Component({
  selector: 'app-person-information-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, PersonInformationFormComponent],
  templateUrl: './person-information-modal.component.html',
  styleUrl: './person-information-modal.component.css'
})
export class PersonInformationModalComponent {
  @Input() showModal: boolean = false;
  @Input() modalTitle: string = 'Agregar Denunciado';
  @Input() denounceId: number = 0;
  
  @Output() modalClosed = new EventEmitter<void>();
  @Output() personAdded = new EventEmitter<any>();
  
  @ViewChild(PersonInformationFormComponent) personForm!: PersonInformationFormComponent;
  
  isLoading: boolean = false;

  closeModal(): void {
    this.showModal = false;
    this.modalClosed.emit();
  }

  async savePerson(): Promise<void> {
    if (!this.personForm) {
      console.error('Form component not found');
      return;
    }

    this.isLoading = true;
    
    try {
      // Aquí puedes agregar la lógica para guardar el denunciado
      // usando los datos del formulario
      const personData = this.personForm.getPersonData();
      
      // Simular guardado (reemplaza con tu lógica real)
      await this.saveDenounced(personData);
      
      this.personAdded.emit(personData);
      this.closeModal();
      
    } catch (error) {
      console.error('Error saving person:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async saveDenounced(personData: any): Promise<void> {
    // Implementar la lógica para guardar el denunciado
    // Ejemplo:
    // return this.formService.addDenounced(this.denounceId, personData).toPromise();
    return new Promise(resolve => setTimeout(resolve, 1000)); // Simulación
  }
}