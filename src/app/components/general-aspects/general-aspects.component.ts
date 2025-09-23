import { CommonModule } from '@angular/common';
import { AfterContentInit, Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Temporal } from 'temporal-polyfill';
import { PersonInformationFormComponent } from "../person-information-form/person-information-form.component";
import { Denounce, GeneralAspectsInformation } from '../../util/form-types';

@Component({
  selector: 'app-general-aspects',
  imports: [CommonModule, FormsModule, PersonInformationFormComponent],
  templateUrl: './general-aspects.component.html',
  styleUrl: './general-aspects.component.css'
})
export class GeneralAspectsComponent implements AfterContentInit {

  @Input({ required: true })
  denounce!: Denounce;

  date: Temporal.PlainDate = Temporal.Now.zonedDateTimeISO().toPlainDate();

  ngAfterContentInit(): void {
    
    const generalAspects: GeneralAspectsInformation = this.denounce.generalAspects;
    
    generalAspects.denounceDate = `${this.date.year}-${String(this.date.day).padStart(2, '0')}-${String(this.date.month).padStart(2, '0')}`;
    generalAspects.code = crypto.randomUUID();
    generalAspects.receptionMedia = 'Formularios electrónicos';

  }

}