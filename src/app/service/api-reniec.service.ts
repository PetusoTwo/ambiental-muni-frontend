import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment-development';

@Injectable({
  providedIn: 'root'
})
export class ApiReniecService {

  private httpClient: HttpClient = inject(HttpClient);
  private BASE_URL: string = environment.PHP_BACKEND_URL;

  constructor() {}

  public requestDataByDni(dni: number): Observable<ReniecNaturalPersonInformation> {
    // Usar la ruta del backend de CodeIgniter
    const url: string = `${this.BASE_URL}/../dni/${dni}`;
    return this.httpClient.get<ReniecNaturalPersonInformation>(url);
  }

  public requestDataByRuc(ruc: number): Observable<ReniecJuridicPersonInformation> {
    // Usar la ruta del backend de CodeIgniter
    const url: string = `${this.BASE_URL}/../ruc/${ruc}`;
    return this.httpClient.get<ReniecJuridicPersonInformation>(url);
  }
}

export type ReniecNaturalPersonInformation = {
  success: boolean;
  data: {
    numero?: string;
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    nombre_completo?: string;
    departamento?: string;
    provincia?: string;
    distrito?: string;
    direccion?: string;
    direccion_completa?: string;
    ubigeo_reniec?: string;
    ubigeo_sunat?: string;
    ubigeo?: string[];
  }
}

export type ReniecJuridicPersonInformation = {
  success: boolean;
  data: {
    numero?: string;
    nombre_o_razon_social: string;
    departamento?: string;
    provincia?: string;
    distrito?: string;
    direccion?: string;
    direccion_completa?: string;
    ubigeo_sunat?: string;
    ubigeo?: string[];
  }
}