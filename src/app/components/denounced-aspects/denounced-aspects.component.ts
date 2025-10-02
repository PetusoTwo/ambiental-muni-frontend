import { Component, Input, AfterViewInit } from '@angular/core';
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
export class DenouncedAspectsComponent implements AfterViewInit {

  @Input({ required: true })
  denounce!: Denounce;

  textInputPattern: string = basicTextInputPattern;

  processRadio(event: Event): void {
    const target = event.target as HTMLInputElement;
    const id = target.id;

    const previousDenouncesRef: any = this.denounce.previousDenounce;

    // Alternar el valor booleano
    previousDenouncesRef[target.id] = !previousDenouncesRef[target.id];

    // Actualizar el estado checked del input
    target.checked = previousDenouncesRef[target.id];

    switch (target.id) {
      case 'hasPreviousDenounce': {
        this.denounce.previousDenounce.directedEntity = target.checked ? '' : 'NO ESPECIFICA';
        break;
      }
      case 'hasResponseDenounce': {
        this.denounce.previousDenounce.entityResponse = target.checked ? '' : 'NO ESPECIFICA';
        break;
      }
    }

    setTimeout(() => {
      this.updateSwitchStates();
    }, 10);
  }

  private updateSwitchStates(): void {
    // actualizar estado visual del primer switch
    const label1 = document.querySelector('label[for="hasPreviousDenounce"]');
    const switch1 = label1?.querySelector('.switch');
    if (this.denounce.previousDenounce.hasPreviousDenounce) {
      label1?.classList.add('active');
      switch1?.classList.add('switch-active');
    } else {
      label1?.classList.remove('active');
      switch1?.classList.remove('switch-active');
    }

    // actualizar estado visual del segundo switch
    const label2 = document.querySelector('label[for="hasResponseDenounce"]');
    const switch2 = label2?.querySelector('.switch');
    if (this.denounce.previousDenounce.hasResponseDenounce) {
      label2?.classList.add('active');
      switch2?.classList.add('switch-active');
    } else {
      label2?.classList.remove('active');
      switch2?.classList.remove('switch-active');
    }

    // actualizar estado visual del tercer switch
    const label3 = document.querySelector('label[for="keepIdentity"]');
    const switch3 = label3?.querySelector('.switch');
    if (this.denounce.previousDenounce.keepIdentity) {
      label3?.classList.add('active');
      switch3?.classList.add('switch-active');
    } else {
      label3?.classList.remove('active');
      switch3?.classList.remove('switch-active');
    }
  }

  ngAfterViewInit(): void {
    // Aplicar estados iniciales
    setTimeout(() => {
      this.updateSwitchStates();
    }, 100);
  }

  isChecked(id: string): boolean {
    return (this.denounce as any).previousDenounce[id];
  }
}