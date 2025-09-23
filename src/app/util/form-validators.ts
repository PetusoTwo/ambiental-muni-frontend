import { Denounce, PersonInformation } from "./form-types";
import { RefinementCtx, z, ZodError } from 'zod';

export const basicTextInputPattern = '^[a-zA-ZáéíóúÁÉÍÓÚñÑ#&%°.,_\\- "]+$';
export const basicTextAreaPattern = '^[a-zA-ZáéíóúÁÉÍÓÚñÑ#&%°,._\\- "0-9]*$';
export const basicAddressPattern = '^[a-zA-ZáéíóúÁÉÍÓÚñÑ#&%,._\\- "°,.0-9]+$'

const regexTextArea: RegExp = new RegExp(basicTextAreaPattern);
const regexAddress: RegExp = new RegExp(basicAddressPattern, "g");
const regexInput: RegExp = new RegExp(basicTextInputPattern, "g");

export function validateTextArea(e: Event): void {

    const textArea: HTMLTextAreaElement = (e.target as HTMLTextAreaElement);
    const input: string = textArea.value;
    const classlist: DOMTokenList = textArea.classList;

    if (!regexTextArea.test(input)) {

        classlist.add('invalid');

        return;

    }

    classlist.remove('invalid');

}

export function getValidators(d: Denounce) {

    return [ 
        new GeneralAspectsValidator(d), 
        new DenounceAspectsValidator(d), 
        new AmbientalAspectsValidator(d),
        new ProofValidator(d)
    ];

}

export abstract class Validator {

    protected _denounce: Denounce;

    constructor(denounce: Denounce) {
        this._denounce = denounce;
    }

    abstract validate(): ValidationError;

}

class GeneralAspectsValidator extends Validator {

    private _personInformationValidator: PersonInformationValidator;

    constructor(denounce: Denounce) {
        super(denounce);
        this._personInformationValidator = new PersonInformationValidator(denounce.denouncer);
    }

    override validate(): ValidationError {

        return this._personInformationValidator.validate();

    }

}

class DenounceAspectsValidator extends Validator {
    
    private _personInformationValidator: PersonInformationValidator;
    private _previousDenounceSchema;

    constructor(denounce: Denounce) {
        super(denounce);
        this._personInformationValidator = new PersonInformationValidator(denounce.denounced, true);
        this._previousDenounceSchema = z.object({
            directedEntity: z.string().regex(regexInput, "Ingrese correctamente la entidad dirigida").min(5, "Debe especificar ante que entidades ha realizado una denuncia previa").max(50, "La entidad dirigida debe ser de maximo 50 caracteres"),
            entityResponse: z.string().regex(regexInput, "Ingrese correctamente la respuesta de la entidad").min(5, "Debe especificar la respuesta de la entidad").max(50, "La respuesta de la entidad debe ser de maximo 50 caracteres"),
        });
    }

    override validate(): ValidationError {

        const result: ValidationError = this._previousDenounceSchema.safeParse(this._denounce.previousDenounce) as ValidationError;

        if (!result.success) return result;

        return this._personInformationValidator.validate();

    }

}


class PersonInformationValidator {
    
    private _personInformation: PersonInformation;
    private personInformationSchema: any
    private _isDenounced: boolean;

    constructor(personInformation: PersonInformation, isDenounced: boolean = false) {
        this._personInformation = personInformation;
        this._isDenounced = isDenounced;
        this.personInformationSchema = this.initPersonInformationSchema();
    }

    validate(): ValidationError {

        return this.personInformationSchema.safeParse(this._personInformation);

    }

    private initPersonInformationSchema(): any {
        return z.object({
            entity: z.object({
                tradeName: z.string().optional(),
                ruc: z.string()
                .nullable()
                .optional(),
                dni: z.string()
                .optional(),
                name: z.string().optional(),
                paternalSurname: z.string().optional(),
                motherSurname: z.string().optional()
            }),
            isNatural: z.boolean(),
            legalRepresentator: z.string().optional(),
            address: z.string({
                required_error: "Debe insertar una dirección"
            })
            .min(5, "Debe especificar la dirección")
            .regex(regexAddress, "Ingrese correctamente la dirección"),
            fixedPhone: z.string()
            .regex(new RegExp('^\\d+$', "g"), 'Ingrese correctamente su telefono fijo')
            .min(6, 'El telefono fijo debe tener exactamente 6 dígitos')
            .max(6, 'El telefono fijo debe tener exactamente 6 dígitos')
            .optional()
            .or(z.literal('')),
            firstPhone: z.string()
            .regex(new RegExp('^\\d+$', "g"), 'Ingrese correctamente su primer numero')
            .min(9, 'El primer número debe tener exactamente 9 dígitos')
            .max(9, 'El primer número debe tener exactamente 9 dígitos')
            .optional()
            .or(z.literal('')),
            secondPhone: z.string()
            .regex(new RegExp('^\\d+$', "g"), 'Ingrese correctamente su segundo numero')
            .min(9, 'El segundo número debe tener exactamente 9 dígitos')
            .max(9, 'El segundo número debe tener exactamente 9 dígitos')
            .optional()
            .or(z.literal('')),
            email: z.string({
                required_error: "Debe insertar un email"
            }).email({ message: "Debe insertar un email valido" })
            .optional()
            .or(z.literal(''))
        }).superRefine((data, ctx) => {
  
            if (!data.isNatural) applySuperRefineToJuridicPerson(data, ctx, this._isDenounced);
            else applySuperRefineToNaturalPerson(data, ctx, this._isDenounced);

        });
    }
}



class AmbientalAspectsValidator extends Validator {

    private ambientalAspectsSchema;

    constructor(denounce: Denounce) {
        super(denounce);
        this.ambientalAspectsSchema = z.object({
            factsDescription: z.string().regex(regexTextArea, 'Ingrese correctamente la descripcion de los hechos').min(1, "Debe especificar una descripcion de los hechos").max(450, 'Solo puede ingresar como maximo 450 palabras'),
            address: z.string().regex(regexAddress, 'Ingrese correctamente la direccion').min(5, "Debe especificar la dirección"),
            reference: z.string().regex(regexInput, 'Ingrese correctamente la referencia').min(5, "Debe especificar una referencia"),
            causes: z.array(z.number()).min(1, "Debe especificar al menos una causa")
        })
    }

    override validate(): ValidationError {

        return this.ambientalAspectsSchema.safeParse(this._denounce.ambientalPromises) as ValidationError;

    }

}

class ProofValidator extends Validator {
    
    private proofSchema;

    constructor(denounce: Denounce) {
        super(denounce);
        this.proofSchema = z.object({
            proofData: z.array(z.object(
                {
                    data: z.string()
                }
            )),
            proofDescription: z.string().regex(regexTextArea, 'Ingrese correctamente la descripcion de la prueba').max(450, 'Solo puede ingresar como maximo 450 palabras').optional()
        })
    }

    override validate(): ValidationError {

        return this.proofSchema.safeParse(this._denounce.proof) as ValidationError;

    }

}
export type ValidationError = {
    error: ZodError;
    success: boolean;
}

function verifyInputEntityProperty(ctx: RefinementCtx, prop: string, val: string, msg1: string, msg2: string): void{

    if (!new RegExp(basicTextInputPattern).test(val)) {
        ctx.addIssue({
            path: ["entity", prop],
            message: msg1,
            code: z.ZodIssueCode.custom
        });
    }

    if (val.length <= 1) {
        ctx.addIssue({
            path: ["entity", prop],
            message: msg2,
            code: z.ZodIssueCode.custom
        });
    }

}

function applySuperRefineToJuridicPerson(data: any, ctx: RefinementCtx, isDenounced: boolean) {


    if (!data.entity.tradeName) {

        ctx.addIssue({
          path: ["entity", "tradeName"],
          message: "Debe insertar una razón social",
          code: z.ZodIssueCode.custom
        });

    } else verifyInputEntityProperty(ctx, "tradeName", data.entity.tradeName, "Inserte correctamente la razón social", "Debe especificar una razon social")
  
    if (!data.entity.ruc) {

        ctx.addIssue({
          path: ["entity", "ruc"],
          message: "Debe insertar un RUC",
          code: z.ZodIssueCode.custom
        });

    } else {

        if (data.entity.ruc.length !== 11) {

            ctx.addIssue({
              path: ["entity", "ruc"],
              message: "El RUC debe tener exactamente 11 dígitos",
              code: z.ZodIssueCode.custom
            });

        }

        if (!new RegExp('^\\d+$', "g").test(data.entity.ruc)) {

            ctx.addIssue({
                path: ["entity", "ruc"],
                message: "Inserte correctamente el RUC",
                code: z.ZodIssueCode.custom
            });

        }

    }

    if (data.legalRepresentator.length > 0 && !new RegExp(basicTextInputPattern).test(data.legalRepresentator)) {
            
        ctx.addIssue({
            path: ["legalRepresentator"],
            message: "Ingrese correctamente el nombre del representador legal",
            code: z.ZodIssueCode.custom
        });
        
    }

    if (!isDenounced) {

        if (!data.firstPhone) {

            ctx.addIssue({
                path: ["firstPhone"],
                message: "Debe insertar un número telefonico",
                code: z.ZodIssueCode.custom
            });
    
        } else {
    
            if (data.firstPhone.length !== 9) {
    
                ctx.addIssue({
                    path: ["firstPhone"],
                    message: "Su primer número debe tener exactamente 9 dígitos",
                    code: z.ZodIssueCode.custom
                });
    
            }
    
            if (!new RegExp('^\\d+$', "g").test(data.firstPhone)) {
    
                ctx.addIssue({
                    path: ["firstPhone"],
                    message: "Inserte correctamente su primer número telefonico",
                    code: z.ZodIssueCode.custom
                });
    
            }
        }

        if (!data.email) {

            ctx.addIssue({
              path: ["email"],
              message: "Debe insertar un correo",
              code: z.ZodIssueCode.custom
            });
    
        } else {

            if (data.email.length < 1) {
    
                ctx.addIssue({
                    path: ["email"],
                    message: "Debe insertar un correo valido",
                    code: z.ZodIssueCode.custom
                });
    
            }

        }
    
    }
}

function applySuperRefineToNaturalPerson(data: any, ctx: RefinementCtx, isDenounced: boolean) {

    if (!data.entity.dni) {

        ctx.addIssue({
            path: ["entity", "dni"],
            message: "Debe insertar un DNI",
            code: z.ZodIssueCode.custom
        });

    } else {

        if (data.entity.dni.length !== 8) {

            ctx.addIssue({
                path: ["entity", "dni"],
                message: "El DNI debe tener exactamente 8 dígitos",
                code: z.ZodIssueCode.custom
            });

        }

        if (!new RegExp('^\\d+$', "g").test(data.entity.dni)) {

            ctx.addIssue({
                path: ["entity", "ruc"],
                message: "Inserte correctamente su dni",
                code: z.ZodIssueCode.custom
            });

        }
    }

    if (!data.entity.name) {
        ctx.addIssue({
            path: ["entity", "name"],
            message: "Debe insertar un nombre",
            code: z.ZodIssueCode.custom
        });
    } else verifyInputEntityProperty(ctx, "name", data.entity.name, "Inserte correctamente su nombre", "Debe especificar un nombre")
    
    if (!data.entity.paternalSurname) {
        ctx.addIssue({
            path: ["entity", "paternalSurname"],
            message: "Debe insertar un apellido paterno",
            code: z.ZodIssueCode.custom
        });
    } else verifyInputEntityProperty(ctx, "paternalSurname", data.entity.paternalSurname, "Inserte correctamente su apellido paterno", "Debe especificar un apellido paterno")
    
    if (!data.entity.motherSurname) {
        ctx.addIssue({
            path: ["entity", "motherSurname"],
            message: "Debe insertar un apellido materno",
            code: z.ZodIssueCode.custom
        });
    } else verifyInputEntityProperty(ctx, "motherSurname", data.entity.motherSurname, "Inserte correctamente su apellido materno", "Debe especificar un apellido materno")

    if (!isDenounced) {

        if (!data.firstPhone) {

            ctx.addIssue({
                path: ["firstPhone"],
                message: "Debe insertar un número telefonico",
                code: z.ZodIssueCode.custom
            });
    
        } else {
    
            if (data.firstPhone.length !== 9) {
    
                ctx.addIssue({
                    path: ["firstPhone"],
                    message: "Su primer número debe tener exactamente 9 dígitos",
                    code: z.ZodIssueCode.custom
                });
    
            }
    
            if (!new RegExp('^\\d+$', "g").test(data.firstPhone)) {
    
                ctx.addIssue({
                    path: ["firstPhone"],
                    message: "Inserte correctamente su primer número telefonico",
                    code: z.ZodIssueCode.custom
                });
    
            }
        }

        if (!data.email) {

            ctx.addIssue({
              path: ["email"],
              message: "Debe insertar un correo",
              code: z.ZodIssueCode.custom
            });
    
        } else {

            if (data.email.length < 1) {
    
                ctx.addIssue({
                    path: ["email"],
                    message: "Debe insertar un correo valido",
                    code: z.ZodIssueCode.custom
                });
    
            }

        }

    }

}