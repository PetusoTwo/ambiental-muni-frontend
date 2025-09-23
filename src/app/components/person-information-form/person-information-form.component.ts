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

    this.person.isNatural ? this.requestPersonInformationByDni() : this.requestPersonInformationByRuc(); 
    
  }

  private requestPersonInformationByDni(): void {
    this.apiReniec.requestDataByDni(this.naturalPerson.dni as number).subscribe(person => {

      if (Array.isArray(person.data)) {
        
        this.naturalPerson.name = person.data[0].nombres;
        this.naturalPerson.paternalSurname = person.data[0].apellido_paterno;
        this.naturalPerson.motherSurname = person.data[0].apellido_materno;
        this.person.address = person.data[0].direccion_completa ?? person.data[0].direccion;

      } else {

        this.naturalPerson.name = person.data.nombres;
        this.naturalPerson.paternalSurname = person.data.apellido_paterno;
        this.naturalPerson.motherSurname = person.data.apellido_materno;
        this.person.address = person.data.direccion_completa ?? person.data.direccion;

      }

      this.hasResponseInNatural = true;

    }, error => this.hasResponseInNatural = false);
  }

  private requestPersonInformationByRuc(): void {
    this.apiReniec.requestDataByRuc(this.juridicPerson.ruc as number).subscribe(person => {

      this.juridicPerson.tradeName = person.data.nombre_o_razon_social;
      this.person.address = person.data.direccion_completa;

      this.hasResponseInJuridic = true;

    }, error => this.hasResponseInJuridic = false);
  }

}

export enum PersonType {
  JURIDIC = "JURIDIC",
  NATURAL = "NATURAL"
}