import { inject, Injectable } from '@angular/core';
import { Denounce, DenounceConsultant, DenouncePublicInformation, DenounceState, DenounceStateTrackingAdmin, DenounceStateTrackingCivil, DetailedDenounce, SummarizedDenounce } from '../util/form-types';
import { map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/environment-development';
import { DenounceFilterInformation } from '../components/denounce-administrator/denounce-administrator.component';

@Injectable({
  providedIn: 'root'
})
export class FormService {

  private httpClient: HttpClient = inject(HttpClient);
  private BASE_URL: string = environment.PHP_BACKEND_URL;

  constructor() { }

  public sendForm(denounceForm: Denounce): Observable<ServerResponse> {
    return this.httpClient.post<ServerResponse>(`${this.BASE_URL}/saveForm`, denounceForm);
  }

  public getDenounces({ offset, denouncerDocNumber, denouncedDocNumber, date, denounceType }: DenounceFilterInformation ): Observable<{ denounces: SummarizedDenounce[], registers: number  }> {

    const params: string[]= [`?offset=${offset}`];

    if (denouncerDocNumber) params.push(`&denouncerDocNumber=${denouncerDocNumber}`);

    if (denouncedDocNumber) params.push(`&denouncedDocNumber=${denouncedDocNumber}`);

    if (date) params.push(`&date=${date}`);

    if (denounceType) params.push(`&denounceType=${denounceType}`);

    return this.httpClient.get<{ denounces: SummarizedDenounce[], registers: number  }>(`${this.BASE_URL}/findDenouncesByOffset${params.join('')}`);
  }

  public getDenounceDetail(id: number): Observable<DetailedDenounce> {
    return this.httpClient.get<DetailedDenounce[]>(`${this.BASE_URL}/findDetailDenounce?id=${id}`).pipe(map(resp => resp[0]));
  }

  public updateDenounceState(newState: DenounceState, idDenounce: number, description: string): Observable<ServerResponse> {

    let state: number = 0;

    switch (newState) {
      case DenounceState.REGISTERED:
        state = 1;
        break;
      case DenounceState.RECEIVED:
        state = 2;
        break;
      case DenounceState.SERVED:
        state = 3;
        break;
    }

    return this.httpClient.put<ServerResponse>(`${this.BASE_URL}/updateDenounceState`, { newState: state, idDenounce, description });


  }

  public requestProof(filename: string) {

    return this.httpClient.get<{ bytes: string }>(`${this.BASE_URL}/requestProof?filename=${filename}`);

  }

  public requestPDF(idDenounce: number) {
    return this.httpClient.get(`${this.BASE_URL}/requestPDF?id=${idDenounce}`, { responseType: 'blob' });
  }

  public getDenounceTracking(idDenounce: number, consultant: DenounceConsultant, showAll: boolean) {
    return this.httpClient.get<DenounceStateTrackingCivil[] | DenounceStateTrackingAdmin[]>(`${this.BASE_URL}/findDenounceTracking?idDenounce=${idDenounce}&consultant=${consultant}&showAll=${showAll}`);
  }

  public getPublicInformationByDenounceId(idDenounce: number): Observable<DenouncePublicInformation> {
    return this.httpClient.get<DenouncePublicInformation[]>(`${this.BASE_URL}/findPublicInformationByDenounceId?idDenounce=${idDenounce}`).pipe(map(resp => resp[0]));;
  }

  public deleteDenounceState(idTracking: number): Observable<ServerResponse> {
    return this.httpClient.delete<ServerResponse>(`${this.BASE_URL}/deleteDenounceState?idTracking=${idTracking}`);
  }

  updateDenouncedData(data: any): Observable<any> {
    return this.httpClient.post(`${this.BASE_URL}/update-denounced`, data);
  }

}

export type ServerResponse = {
  success: boolean;
  message: string;
}