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
  fixedPhonePattern: string = '^\\d{1,6}';
  phonePattern: string = '^\\d{1,9}';

  hasResponseInNatural: boolean = true;
  hasResponseInJuridic: boolean = true;
  
  personType: PersonType = PersonType.JURIDIC;
  isLoading: boolean = false;

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