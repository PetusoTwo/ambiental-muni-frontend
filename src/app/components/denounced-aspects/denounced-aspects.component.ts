import { Component, Input } from '@angular/core';
import { Denounce } from '../../util/form-types';
import { PersonInformationFormComponent } from '../person-information-form/person-information-form.component';
import { basicTextInputPattern } from '../../util/form-validators';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-denounced-aspects',
  imports: [PersonInformationFormComponent, FormsModule],
  templateUrl: './denounced-aspects.component.html',
  styleUrl: './denounced-aspects.component.css'
})
export class DenouncedAspectsComponent {

  @Input({ required: true })
  denounce!: Denounce;

  textInputPattern: string = basicTextInputPattern;

  processRadio(event: Event): void {

    const inputRef: HTMLInputElement = (event.target as HTMLInputElement);

    const previousDenouncesRef: any = this.denounce.previousDenounce;

    previousDenouncesRef[inputRef.id] = !previousDenouncesRef[inputRef.id];

    inputRef.checked = previousDenouncesRef[inputRef.id];

    switch (inputRef.id) {
      case 'hasPreviousDenounce': {
        this.denounce.previousDenounce.directedEntity = inputRef.checked ? '' : 'NO ESPECIFICA';
        return;
      }
      case 'hasResponseDenounce': {
        this.denounce.previousDenounce.entityResponse = inputRef.checked ? '' : 'NO ESPECIFICA';
        return;
      }
    }

  }

  isChecked(id: string): boolean {
    return (this.denounce as any).previousDenounce[id];
  }

}