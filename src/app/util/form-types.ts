import { FileData } from "../components/proofs-form/proofs-form.component";

export type PersonInformation = {
    entity: DenounceableEntity;
    isNatural: boolean;
    legalRepresentator: string;
    address: string;
    fixedPhone: string;
    firstPhone: string;
    secondPhone: string;
    email: string;
}

export type DenounceableEntity = NaturalPersonInformation | JuridicPersonInformation;

export type NaturalPersonInformation = {
    name: string;
    paternalSurname: string;
    motherSurname: string;
    dni: number | string;
}

export type JuridicPersonInformation = {
    tradeName: string;
    ruc: number | string | null;
}

export type Denounce = {
    generalAspects: GeneralAspectsInformation;
    denouncer: PersonInformation;
    denounced: PersonInformation;
    previousDenounce: PreviousDenounceInformation;
    ambientalPromises: AmbientalPromisesInformation;
    proof: ProofInformation;
}

export type GeneralAspectsInformation = {
    denounceDate: string;
    code: string;
    receptionMedia: string;
}

export type PreviousDenounceInformation = {
    hasPreviousDenounce: boolean;
    hasResponseDenounce: boolean;
    keepIdentity: boolean;
    directedEntity: string;
    entityResponse: string;
    communicationMedia: string;
    source: string;
}

export type AmbientalPromisesInformation = {
  address: string;
  reference: string;
  factsDescription: string;
  ambientalPromise: string;
  causes: number[];
}

export type ProofInformation = {
  proofData: FileData[];
  proofDescription: string;
}

export type SummarizedDenounce = {
  idDenounce: number;
  denouncerDocNumber: string;
  denouncer: string;
  denouncedDocNumber: string,
  denounced: string;
  reason: string;
  proofDescription: string;
  anonymous: number;
  date: string;
  state: DenounceState;
}

export type DetailedDenounce = {
  code: string,
  receptionMedia: string,
  date: string,
  hasPreviousDenounce: number,
  hasResponse: number,
  directedEntity: string,
  entityResponse: string,
  comunicationMedia: string,
  source: string,
  keepIdentity: number,
  address: string,
  reference: string,
  factsDescription: string,
  ambientalPromise: string,
  proofDescription: string,
  proofs: string,
  ambientalCauses: string
}

export enum DenounceState {
  REGISTERED = "REGISTRADO",
  RECEIVED = "RECIBIDO",
  SERVED = "ATENDIDO"
}

export enum DenounceConsultant {
  ADMIN = "ADMIN",
  CIVIL = "CIVIL"
}

export type DenounceStateTrackingAdmin = {
  idTracking: number;
  idDenounce: number;
  date: string;
  state: DenounceState;
  description: string;
}

export type DenounceStateTrackingCivil = {
  idDenounce: number;
  date: string;
  state: DenounceState;
}

export type DenouncePublicInformation = {
  date: string;
  denouncedName: string;
  denouncedDocNumber: string;
  isNatural: number;
  ambientalPromise: string;
}

export function createTestDenounce(): Denounce {
  return {
    generalAspects: {
      denounceDate: "2025-29-04",
      code: "1234",
      receptionMedia: "Formularios Electronicos"
    },
    denouncer: {
      entity: {
        name: "Alvaro Sebastian",
        paternalSurname: "Perez",
        motherSurname: "Mendoza",
        dni: "12345678",
        tradeName: "",
        ruc: null
      },
      isNatural: true,
      legalRepresentator: "Representante de denunciante",
      address: "Calle Virrey Toledo 345",
      fixedPhone: "654321",
      firstPhone: "901232323",
      secondPhone: "",
      email: "alvespj1604@gmail.com"
    },
    denounced: {
      entity: { tradeName: "EMPRESA SAC", ruc: "12345678901" },
      isNatural: false,
      legalRepresentator: "Representante de denunciado",
      address: "Calle Virrey Toledo 123",
      fixedPhone: "123456",
      firstPhone: "987654321",
      secondPhone: "",
      email: "denunciado@gmail.com"
    },
    previousDenounce: {
      hasPreviousDenounce: false,
      hasResponseDenounce: true,
      keepIdentity: false,
      directedEntity: "entidad",
      entityResponse: "respuesta de entidad",
      communicationMedia: "Medio 1",
      source: "fuente 1"
    },
    ambientalPromises: {
      address: "Direccion de ambiente",
      reference: "-",
      factsDescription: "Hechos Descripcion",
      ambientalPromise: "Agua",
      causes: [3, 1, 2]
    },
    proof: {
      proofData: [],
      proofDescription: "Descripcion muestra"
    }
  };
}

export function createEmptyDenounce(): Denounce {
    return {
        generalAspects: {
          denounceDate: "",
          code: "",
          receptionMedia: ""
        },
        denouncer: {
          entity: { tradeName: "", ruc: null },
          isNatural: false,
          legalRepresentator: "",
          address: "",
          fixedPhone: "",
          firstPhone: "",
          secondPhone: "",
          email: ""
        },
        denounced: {
          entity: { tradeName: "", ruc: null },
          isNatural: false,
          legalRepresentator: "",
          address: "",
          fixedPhone: "",
          firstPhone: "",
          secondPhone: "",
          email: ""
        },
        previousDenounce: {
          hasPreviousDenounce: false,
          hasResponseDenounce: false,
          keepIdentity: false,
          directedEntity: "NO ESPECIFICA",
          entityResponse: "NO ESPECIFICA",
          communicationMedia: "internet",
          source: "sitio web"
        },
        ambientalPromises: {
          address: "",
          reference: "",
          factsDescription: "",
          ambientalPromise: "",
          causes: []
        },
        proof: {
          proofDescription: "",
          proofData: []
        }
    };
}