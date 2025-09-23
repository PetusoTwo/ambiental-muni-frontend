import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment-development';

@Injectable({
  providedIn: 'root'
})
export class ApiReniecService {

  private httpClient: HttpClient = inject(HttpClient);
  private BASE_URL: string = environment.API_RENIEC_URL;
  private headers: HttpHeaders = new HttpHeaders({
    'Authorization': `Bearer ${environment.API_RENIEC_TOKEN}`,
    'Content-Type': 'application/json'
  });

  constructor() {}

  public requestDataByDni(dni: number): Observable<ReniecNaturalPersonInformation> {

    const url: string = `${this.BASE_URL}/${environment.API_RENIEC_VERSION}/services/dni`;
    const payload: Request = { documento: dni.toString() };

    return this.httpClient.post<ReniecNaturalPersonInformation>(url, payload, { headers: this.headers, withCredentials: true });
  }

  public requestDataByRuc(ruc: number): Observable<ReniecJuridicPersonInformation> {

    const url: string = `${this.BASE_URL}/${environment.API_RENIEC_VERSION}/services/ruc`;
    const payload: Request = { documento: ruc.toString() };

    return this.httpClient.post<ReniecJuridicPersonInformation>(url, payload, { headers: this.headers, withCredentials: true });
  }

}

export type ReniecNaturalPersonInformation = {
  data: {
    numero: string;
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    nombre_completo: string;
    departamento: string;
    provincia: string;
    distrito: string;
    direccion: string;
    direccion_completa: string;
    ubigeo_reniec: string;
    ubigeo_sunat: string;
    ubigeo: string[];
  }
}

export type ReniecJuridicPersonInformation = {
  data: {
    numero: string;
    nombre_o_razon_social: string;
    departamento: string;
    provincia: string;
    distrito: string;
    direccion: string;
    direccion_completa: string;
    ubigeo_sunat: string;
    ubigeo: string[];
  }
}

type Request = {
  documento: string;
}