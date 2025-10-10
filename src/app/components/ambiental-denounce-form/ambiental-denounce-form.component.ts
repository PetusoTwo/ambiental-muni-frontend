import { AfterContentInit, Component, Input } from '@angular/core';
import { Denounce } from '../../util/form-types';
import { FormsModule } from '@angular/forms';
import { basicAddressPattern, basicTextInputPattern } from '../../util/form-validators';
import { validateTextArea as validatorsValidateTextArea } from '../../util/form-validators';

@Component({
  selector: 'app-ambiental-denounce-form',
  imports: [FormsModule],
  templateUrl: './ambiental-denounce-form.component.html',
  styleUrl: './ambiental-denounce-form.component.css'
})
export class AmbientalDenounceFormComponent implements AfterContentInit {

  @Input({ required: true })
  denounce!: Denounce;

  textInputPattern: string = basicTextInputPattern;
  addressPattern: string = basicAddressPattern;

  causes: Causes[] = [
    {
      id: "emissions",
      description: "Emisiones de Gases y Humos"
    },
    {
      id: "liquids",
      description: "Vertimientos de Liquidos"
    },
    {
      id: "solids",
      description: "Vertimiento de Solidos"
    },
    {
      id: "material",
      description: "Material Particulado"
    },
    {
      id: "noise",
      description: "Ruidos"
    }
  ];

  processRadio(event: Event): void {

    const inputRef = event.target as HTMLInputElement;

    const causesRef = this.denounce.ambientalPromises.causes;

    if (inputRef.checked) {

      const index: number = causesRef.indexOf(parseInt(inputRef.value, 10));

      if (index > -1) {

        causesRef.splice(index, 1);
      
        inputRef.checked = !inputRef.checked;

        return;

      }

      causesRef.push(parseInt(inputRef.value, 10));

    }

  }

  ngAfterContentInit(): void {
    if (this.denounce.ambientalPromises.ambientalPromise === '') this.denounce.ambientalPromises.ambientalPromise = "agua";
  }

  isChecked(val: number): boolean {
    return this.denounce.ambientalPromises.causes.includes(val);
  }

  validateTextArea(e: Event): void {
    validatorsValidateTextArea(e);
  }

  /** Longitud actual de la descripción de los hechos */
  get factsDescriptionLength(): number {
    const txt = String(this.denounce?.ambientalPromises?.factsDescription ?? '');
    return txt.length;
  }

  /**
   * Handler para el textarea: recorta al max y mantiene el modelo sincronizado.
   */
  onFactsInput(e: Event): void {
    const ta = e.target as HTMLTextAreaElement;
    if (!ta) return;
    // recortar al maxlength si es necesario
    const max = 1000;
    if (ta.value.length > max) {
      ta.value = ta.value.slice(0, max);
    }
    // sincronizar con el modelo
    if (this.denounce && this.denounce.ambientalPromises) {
      this.denounce.ambientalPromises.factsDescription = ta.value;
    }
  }

}

type Causes = {
  id: string;
  description: string;
}