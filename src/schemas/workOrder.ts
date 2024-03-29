import {
  CheckList,
  WorkOrderActivityType,
  WorkOrderState,
} from '@prisma/client'
import { z } from 'zod'
import { STORE_NAME_ZOD } from './store'

export const NEXT_STATE = {
  [WorkOrderState.PLANNED]: WorkOrderState.VALIDATED,
  [WorkOrderState.VALIDATED]: WorkOrderState.DOING,
  [WorkOrderState.DOING]: WorkOrderState.DONE,
}
interface IsInspectionProps {
  activityName: string | null
  activityType: WorkOrderActivityType
  checkList: CheckList[]
}
export function isInspection({
  activityName,
  activityType,
  checkList,
}: IsInspectionProps) {
  return (
    checkList.length > 0 &&
    activityName?.replace('Ó', 'O') === 'INSPECCION' &&
    activityType === 'INSPECTION'
  )
}
interface GetNextStateProps extends IsInspectionProps {
  state: WorkOrderState
}
export function getNextState({
  activityName,
  activityType,
  checkList,
  state,
}: GetNextStateProps) {
  if (
    state === 'PLANNED' &&
    isInspection({ activityName, activityType, checkList })
  ) {
    return 'DOING'
  }
  return NEXT_STATE[state as keyof typeof NEXT_STATE]
}

const ACTIVITY_TYPE_VALUES = [
  'PLANNED_PREVENTIVE',
  'CORRECTIVE',
  'INSPECTION',
  'CONDITION_CHECK',
  'ROUTINE',
]
export const WORK_ORDER_ACTIVITY_TYPE_MAP = {
  PLANNED_PREVENTIVE: 'PREVENTIVO PLANIFICADO',
  CORRECTIVE: 'CORRECTIVO',
  INSPECTION: 'INSPECCIÓN',
  CONDITION_CHECK: 'VERIFICACIÓN DE CONDICIÓN',
  ROUTINE: 'RUTINARIO',
}
export const PRIORITY_VALUES = ['URGENT', 'IMPORTANT', 'NORMAL']
const SECURITY_MEASURE_START_VALUES = ['BLOCKED', 'LABELED', 'BLOCKED_LABELED']
export const WORK_ORDER_SECURITY_MEASURE_START_VALUES = {
  BLOCKED: 'SE BLOQUEÓ EL EQUIPO ANTES DE LA INTERVENCIÓN',
  LABELED: 'SE ETIQUETÓ EL EQUIPO ANTES DE LA INTERVENCIÓN',
  BLOCKED_LABELED: 'BLOQUEADO Y ETIQUETADO CORRECTO',
}

const PROTECTION_EQUIPMENT_VALUES = [
  'HELMET',
  'SECURITY_GLASSES',
  'GLOVES',
  'SECURITY_HARNESS',
  'ACOUSTIC_PROTECTORS',
  'SECURITY_BOOTS',
  'OTHERS',
]
export const WORK_ORDER_PROTECTION_EQUIPMENT_VALUES = {
  HELMET: 'CASCO',
  SECURITY_GLASSES: 'GAFAS DE SEGURIDAD',
  GLOVES: 'GUANTES',
  SECURITY_HARNESS: 'ARNÉS DE SEGURIDAD',
  ACOUSTIC_PROTECTORS: 'PROTECTORES ACÚSTICOS',
  SECURITY_BOOTS: 'BOTAS DE SEGURIDAD',
  OTHERS: 'OTROS',
}
const SECURITY_MEASURE_END_VALUES = ['RETIRE', 'REPORT', 'KEEP', 'CHECK']
export const WORK_ORDER_SECURITY_MEASURE_END_VALUES = {
  RETIRE: 'SE RETIRÓ EL BLOQUEO Y ETIQUETADO DEL EQUIPO',
  REPORT: 'SE INFORMÓ AL OPERADOR DEL RETIRO DEL BLOQUEO',
  KEEP: 'SE MANTIENE ORDEN Y LIMPIEZA EN EL ÁREA',
  CHECK: 'SE VERIFICÓ EL EQUIPO ANTES DE LA ENTREGA',
}
const STATE_VALUES = ['PLANNED', 'VALIDATED', 'DOING', 'DONE']

const dateSchema = z.preprocess((arg) => {
  if (typeof arg === 'string' || arg instanceof Date) return new Date(arg)
  return arg
}, z.date())

const WORK_ORDER_STATE_VALUES = ['PLANNED', 'VALIDATED', 'DOING', 'DONE']
export const WORK_ORDER_CHANGE_STATE = {
  PLANNED: { nextState: 'VALIDATED', previousState: undefined },
  VALIDATED: { nextState: 'DOING', previousState: 'PLANNED' },
  DOING: { nextState: 'DONE', previousState: 'VALIDATED' },
  DONE: { nextState: undefined, previousState: 'DOING' },
}

export function validateWorkOrderState(
  currentState: WorkOrderState,
  stateUpdate: string
) {
  if (currentState === stateUpdate) {
    return stateUpdate
  }
  const validState =
    WORK_ORDER_CHANGE_STATE[
      currentState as keyof typeof WORK_ORDER_CHANGE_STATE
    ]
  const { nextState, previousState } = validState as {
    nextState?: string
    previousState?: string
  }
  return stateUpdate === previousState || stateUpdate === nextState
}

const workOrderShapeCreate = {
  activityType: z.enum(
    [
      'PLANNED_PREVENTIVE',
      'CORRECTIVE',
      'INSPECTION',
      'CONDITION_CHECK',
      'ROUTINE',
    ],
    {
      errorMap: () => {
        return {
          message: `El tipo de actividad de la orden de trabajo solo puede tener los valores: ${ACTIVITY_TYPE_VALUES.map(
            (t) => `'${t}'`
          ).join(' | ')}`,
        }
      },
    }
  ),
  priority: z.enum(['URGENT', 'IMPORTANT', 'NORMAL'], {
    errorMap: () => {
      return {
        message: `La prioridad de la orden de trabajo solo puede tener los valores: ${PRIORITY_VALUES.map(
          (t) => `'${t}'`
        ).join(' | ')}`,
      }
    },
  }),
  machineCode: z
    .string({ required_error: 'El código de la máquina es requerido' })
    .regex(/^[A-Z]{2}-[0-9]{2}-[A-Z]{3}-[0-9]{2}$/, {
      message:
        "El código de la máquina debe tener el formato: LL-NN-LLL-NN (donde 'L' es letra mayúscula y 'N' es número)",
    }),
  engineCode: z
    .string()
    .regex(/^[A-Z]{2}-[0-9]{2}-[A-Z]{3}-[0-9]{2}-MOT-[0-9]{3}$/, {
      message:
        "El código de motor de la orden de trabajo debe tener el formato: LL-NN-LLL-NN-MOT-NNN (donde 'L' es letra mayúscula y 'N' es número)",
    })
    .optional(),
  engineFunction: z
    .string({ required_error: 'La función del motor es requerido' })
    .min(1, { message: 'La función del motor debe tener al menos 1 caracter' })
    .optional(),
  activityCode: z
    .string()
    .regex(/^[A-Z]{3}[0-9]{2,3}$/, {
      message:
        "El código de actividad de la orden de trabajo debe tener el formato: LLLNN o LLLNNN (donde 'L' es letra mayúscula y 'N' es número)",
    })
    .optional(),
  activityName: z
    .string({
      required_error:
        'El nombre de actividad de la orden de trabajo es requerido',
    })
    .min(1, {
      message: 'El nombre de actividad debe tener al menos un caracter',
    })
    .optional(),
  createdAt: dateSchema.optional(),
  updatedAt: dateSchema.optional(),
}

const workOrderShapeUpdate = {
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  state: z.enum(['PLANNED', 'VALIDATED', 'DOING', 'DONE'], {
    errorMap: () => {
      return {
        message: `El estado de la orden de trabajo solo puede tener los valores: ${WORK_ORDER_STATE_VALUES.map(
          (t) => `'${t}'`
        ).join(' | ')}`,
      }
    },
  }),
  failureCause: z
    .string()
    .min(1, {
      message:
        'La causa de falla de la orden de trabajo debe tener al menos 1 caracter',
    })
    .optional(),
}

const workOrderShapeUpdateToDoing = {
  securityMeasureStarts: z
    .array(
      z.enum(['BLOCKED', 'LABELED', 'BLOCKED_LABELED'], {
        errorMap: () => {
          return {
            message: `Las medidas de seguridad inicio de trabajo de la orden de trabajo solo puede tener los valores: ${SECURITY_MEASURE_START_VALUES.map(
              (t) => `'${t}'`
            ).join(' | ')}`,
          }
        },
      })
    )
    .max(3, {
      message:
        'Las medidas de seguridad inicio de trabajo de la orden de trabajo debe tener máximo 3 valores',
    }),
  protectionEquipments: z
    .array(
      z.enum(
        [
          'HELMET',
          'SECURITY_GLASSES',
          'GLOVES',
          'SECURITY_HARNESS',
          'ACOUSTIC_PROTECTORS',
          'SECURITY_BOOTS',
          'OTHERS',
        ],
        {
          errorMap: () => {
            return {
              message: `Los riesgos de trabajo de la orden de trabajo solo puede tener los valores: ${PROTECTION_EQUIPMENT_VALUES.map(
                (t) => `'${t}'`
              ).join(' | ')}`,
            }
          },
        }
      )
    )
    .max(7, {
      message:
        'Los riesgos de trabajo de la orden de trabajo debe tener máximo 7 valores',
    }),
  startDate: dateSchema,
}
export const updateWorkOrderToDoingDto = z.object(workOrderShapeUpdateToDoing)
const checkListVerifiedShape = {
  field: z.string({
    required_error: 'El campo del check list a validar es requerido',
  }),
  options: z
    .array(
      z.string().min(1, {
        message: 'La opción del check list debe tener al menos 1 caracter',
      })
    )
    .optional(),
  value: z
    .string()
    .min(1, {
      message: 'El valor del check list debe tener al menos 1 caracter',
    })
    .optional(),
}
export const checkListVerified = z.object({
  checkListVerified: z.array(z.object(checkListVerifiedShape)),
  endDate: dateSchema,
})

const STORE_ZOD = {
  name: STORE_NAME_ZOD,
  amount: z
    .number({
      required_error: 'La cantidad de repuestos es requerida',
      invalid_type_error: 'La cantidad de repuestos debe ser un número',
    })
    .int('La cantidad de repuestos debe ser un número entero')
    .min(1, 'La cantidad de repuestos debe ser mayor a 1'),
}

const workOrderShapeUpdateToDone = {
  activityDescription: z.string({
    required_error:
      'La descripción de la actividad de la orden de trabajo es requerida',
  }),
  stores: z.object(STORE_ZOD).array(),
  failureCause: z.string().optional(),
  endDate: dateSchema,
  securityMeasureEnds: z
    .array(
      z.enum(['RETIRE', 'REPORT', 'KEEP', 'CHECK'], {
        errorMap: () => {
          return {
            message: `Las medidas de seguridad fin de trabajo de la orden de trabajo solo puede tener los valores: ${SECURITY_MEASURE_END_VALUES.map(
              (t) => `'${t}'`
            ).join(' | ')}`,
          }
        },
      })
    )
    .max(4, {
      message:
        'Las medidas de seguridad fin de trabajo de la orden de trabajo debe tener máximo 4 valores',
    }),
  totalHours: z.number(),
  observations: z
    .string()
    .min(3, {
      message:
        'Las observaciones de la orden de trabajo debe tener al menos 3 caracteres',
    })
    .optional(),
}
export const updateWorkOrderToDoneDto = z.object(workOrderShapeUpdateToDone)
const workOrderShapeUpdateGeneral = {
  securityMeasureStarts: z
    .array(
      z.enum(['BLOCKED', 'LABELED', 'BLOCKED_LABELED'], {
        errorMap: () => {
          return {
            message: `Las medidas de seguridad inicio de trabajo de la orden de trabajo solo puede tener los valores: ${SECURITY_MEASURE_START_VALUES.map(
              (t) => `'${t}'`
            ).join(' | ')}`,
          }
        },
      })
    )
    .max(3, {
      message:
        'Las medidas de seguridad inicio de trabajo de la orden de trabajo debe tener máximo 3 valores',
    })
    .optional(),
  protectionEquipments: z
    .array(
      z.enum(
        [
          'HELMET',
          'SECURITY_GLASSES',
          'GLOVES',
          'SECURITY_HARNESS',
          'ACOUSTIC_PROTECTORS',
          'SECURITY_BOOTS',
          'OTHERS',
        ],
        {
          errorMap: () => {
            return {
              message: `Los riesgos de trabajo de la orden de trabajo solo puede tener los valores: ${PROTECTION_EQUIPMENT_VALUES.map(
                (t) => `'${t}'`
              ).join(' | ')}`,
            }
          },
        }
      )
    )
    .max(7, {
      message:
        'Los riesgos de trabajo de la orden de trabajo debe tener máximo 7 valores',
    })
    .optional(),
  activityDescription: z.string().optional().nullable(),
  stores: z.array(z.object(STORE_ZOD)).optional(),
  failureCause: z.string().optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  totalHours: z.number().optional().nullable(),
  securityMeasureEnds: z
    .array(
      z.enum(['RETIRE', 'REPORT', 'KEEP', 'CHECK'], {
        errorMap: () => {
          return {
            message: `Las medidas de seguridad fin de trabajo de la orden de trabajo solo puede tener los valores: ${SECURITY_MEASURE_END_VALUES.map(
              (t) => `'${t}'`
            ).join(' | ')}`,
          }
        },
      })
    )
    .max(4, {
      message:
        'Las medidas de seguridad fin de trabajo de la orden de trabajo debe tener máximo 4 valores',
    })
    .optional(),
  state: z.enum(['PLANNED', 'VALIDATED', 'DOING', 'DONE'], {
    errorMap: () => {
      return {
        message: `El estado de la orden de trabajo solo puede tener los valores: ${STATE_VALUES.map(
          (t) => `'${t}'`
        ).join(' | ')}`,
      }
    },
  }),
  observations: z
    .string()
    .min(3, {
      message:
        'Las observaciones de la orden de trabajo debe tener al menos 3 caracteres',
    })
    .optional()
    .nullable(),
  checkListVerified: z.array(z.object(checkListVerifiedShape)).optional(),
}
export const updateWorkOrderGeneralDto = z.object(workOrderShapeUpdateGeneral)
export type UpdateWorkOrderGeneralDto = z.infer<
  typeof updateWorkOrderGeneralDto
>

export const createWorkOrderDto = z.object(workOrderShapeCreate)
export type CreateWorkOrderDto = z.infer<typeof createWorkOrderDto>

export const updateWorkOrderDto = z.object(workOrderShapeUpdate)
export type UpdateWorkOrderDto = z.infer<typeof updateWorkOrderDto>
