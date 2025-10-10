import { CommonModule } from '@angular/common';
import { AfterContentInit, Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JuridicPersonInformation, NaturalPersonInformation, PersonInformation } from '../../util/form-types';
import { basicAddressPattern, basicTextInputPattern } from '../../util/form-validators';
import { ApiReniecService } from '../../service/api-reniec.service';
@Component({
  selector: 'app-person-information-form',
  imports: [FormsModule, CommonModule],
  templateUrl: './person-information-form.component.html',
  styleUrl: './person-information-form.component.css'
})
export class PersonInformationFormComponent implements AfterContentInit {

  @Input({ required: true })
  person!: PersonInformation;

  @Input()
  isDenounced: boolean = false;

  private apiReniec: ApiReniecService = inject(ApiReniecService);

  tradeNamePattern: string = basicTextInputPattern;
  rucPattern: string = '^\\d{1,11}';
  dniPattern: string = '^\\d{1,8}';
  namesPattern: string = basicTextInputPattern;
  addressPattern: string = basicAddressPattern;
  // Validación exacta: fijo = 6 dígitos, celular = 9 dígitos
  fixedPhonePattern: string = '^\\d{6}$';
  phonePattern: string = '^\\d{9}$';

  hasResponseInNatural: boolean = true;
  hasResponseInJuridic: boolean = true;
  
  personType: PersonType = PersonType.JURIDIC;
  isLoading: boolean = false;

  // errores de formato para mostrar mensajes
  dniError: boolean = false;
  rucError: boolean = false;

  // Contadores de dígitos para mostrar en la UI
  get fixedPhoneLength(): number {
    const v = this.person?.fixedPhone ?? '';
    return v === null || v === undefined ? 0 : v.toString().length;
  }

  get firstPhoneLength(): number {
    const v = this.person?.firstPhone ?? '';
    return v === null || v === undefined ? 0 : v.toString().length;
  }

  get secondPhoneLength(): number {
    const v = this.person?.secondPhone ?? '';
    return v === null || v === undefined ? 0 : v.toString().length;
  }

  // Contadores para DNI y RUC (para mostrar X/8 y X/11)
  get dniLength(): number {
    return String(this.naturalPerson?.dni ?? '').replace(/\D/g, '').length;
  }

  get rucLength(): number {
    return String(this.juridicPerson?.ruc ?? '').replace(/\D/g, '').length;
  }

  updateIsNaturalEntity() {
    this.person.isNatural = this.personType === PersonType.NATURAL;
  }

  get naturalPerson(): NaturalPersonInformation {
    return this.person.entity as NaturalPersonInformation;
  }

  get juridicPerson(): JuridicPersonInformation {
    return this.person.entity as JuridicPersonInformation;
  }

  ngAfterContentInit(): void {
    this.personType = this.person.isNatural ? PersonType.NATURAL : PersonType.JURIDIC; 
  }

  requestInformation(): void {
    this.isLoading = true;
    this.person.isNatural ? this.requestPersonInformationByDni() : this.requestPersonInformationByRuc();
  }


  onDigitsInput(event: Event, field: 'dni' | 'ruc'): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '');
    input.value = digits; // actualiza valor mostrado

    if (field === 'dni') {
      // NO asignar a this.naturalPerson (getter). Asignar a this.person.entity
      if (!this.person.entity) {
        this.person.entity = {} as NaturalPersonInformation;
      }
      (this.person.entity as NaturalPersonInformation).dni = digits;
      this.dniError = (digits.length > 0 && digits.length !== 8);
    } else {
      // NO asignar a this.juridicPerson (getter). Asignar a this.person.entity
      if (!this.person.entity) {
        this.person.entity = {} as JuridicPersonInformation;
      }
      (this.person.entity as JuridicPersonInformation).ruc = digits;
      this.rucError = (digits.length > 0 && digits.length !== 11);
    }
  }

  /**
   * Valida si el identificador actual tiene la longitud correcta
   */
  isIdentifierValid(): boolean {
    if (this.personType === PersonType.NATURAL) {
      return /^\d{8}$/.test(String(this.naturalPerson?.dni ?? '').trim());
    } else {
      return /^\d{11}$/.test(String(this.juridicPerson?.ruc ?? '').trim());
    }
  }

  private requestPersonInformationByDni(): void {
    if (!this.naturalPerson.dni) {
      this.hasResponseInNatural = false;
      return;
    }

    this.apiReniec.requestDataByDni(this.naturalPerson.dni as number).subscribe({
      next: (person) => {
        this.isLoading = false;
        if (person.success && person.data) {
          this.naturalPerson.name = person.data.nombres;
          this.naturalPerson.paternalSurname = person.data.apellido_paterno;
          this.naturalPerson.motherSurname = person.data.apellido_materno;
          this.person.address = person.data.direccion_completa || person.data.direccion || '';
          this.hasResponseInNatural = true;
        } else {
          this.hasResponseInNatural = false;
          console.log('No se encontraron datos para el DNI');
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.hasResponseInNatural = false;
        console.error('Error al consultar DNI');
      }
    });
  }

  private requestPersonInformationByRuc(): void {
    if (!this.juridicPerson.ruc) {
      this.hasResponseInJuridic = false;
      return;
    }

    this.apiReniec.requestDataByRuc(this.juridicPerson.ruc as number).subscribe({
      next: (person) => {
        this.isLoading = false;
        if (person.success && person.data) {
          this.juridicPerson.tradeName = person.data.nombre_o_razon_social;
          this.person.address = person.data.direccion_completa || person.data.direccion || '';
          this.hasResponseInJuridic = true;
        } else {
          this.hasResponseInJuridic = false;
          console.log('No se encontraron datos para el RUC');
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.hasResponseInJuridic = false;
        console.error('Error al consultar RUC', );
      }
    });
  }

}

export enum PersonType {
  JURIDIC = "JURIDIC",
  NATURAL = "NATURAL"
}