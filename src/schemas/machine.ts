import { z } from 'zod'

const areaValues = [
  'PRE_EXPANDED',
  'RECYCLED',
  'LOCKED',
  'CUTTING',
  'JOISTS',
  'SERVICES',
  'GENERAL',
]

const technicalDocumentationValues = [
  'OPERATIONS_MANUAL',
  'MAINTENANCE_MANUAL',
  'ELECTRICAL_PLANS',
  'MECHANICAL_PLANS',
]

const criticalityValues = ['HIGH', 'MEDIUM', 'LOW']

const machineShapeUpdate = {
  name: z
    .string({ required_error: 'El nombre de la máquina es requerido' })
    .min(1, {
      message: 'El nombre de la máquina debe tener al menos 1 caracter',
    }),
  maker: z
    .string({
      required_error: 'El fabricante de la máquina es requerido',
    })
    .min(1, {
      message: 'El fabricante de la máquina debe tener al menos 1 caracter',
    }),
  location: z
    .string({
      required_error: 'La ubicación de la máquina es requerido',
    })
    .min(3, {
      message: 'La ubicación de la máquina debe tener al menos 3 caracteres',
    })
    .max(11, {
      message: 'La ubicación de la máquina debe tener máximo 11 caracteres',
    }),
  area: z.enum(
    [
      'PRE_EXPANDED',
      'RECYCLED',
      'LOCKED',
      'CUTTING',
      'JOISTS',
      'SERVICES',
      'GENERAL',
    ],
    {
      errorMap: () => {
        return {
          message: `El área de la máquina solo puede tener los valores: ${areaValues
            .map((t) => `'${t}'`)
            .join(' | ')}`,
        }
      },
    }
  ),
  model: z
    .string({ required_error: 'El modelo de la máquina es requerido' })
    .min(1, {
      message: 'El modelo de la máquina debe tener al menos 1 caracter',
    }),
  specificData: z
    .string({
      required_error: 'Los datos específicos de la máquina son requeridos',
    })
    .min(1, {
      message:
        'Los datos específicos de la máquina debe tener al menos 1 caracter',
    }),
  function: z
    .string({
      required_error: 'La función de la máquina es requerido',
    })
    .min(1, {
      message: 'La función de la máquina debe tener al menos 1 caracter',
    }),
  technicalDocumentation: z
    .array(
      z.enum(
        [
          'OPERATIONS_MANUAL',
          'MAINTENANCE_MANUAL',
          'ELECTRICAL_PLANS',
          'MECHANICAL_PLANS',
        ],
        {
          errorMap: () => {
            return {
              message: `La documentación técnica de la máquina solo puede tener los valores: ${technicalDocumentationValues
                .map((t) => `'${t}'`)
                .join(' | ')}`,
            }
          },
        }
      )
    )
    .max(4, {
      message:
        'La documentación técnica de la máquina debe tener máximo 4 valores',
    }),
  criticality: z.enum(['HIGH', 'MEDIUM', 'LOW'], {
    errorMap: () => {
      return {
        message: `La criticidad de la máquina solo puede tener los valores: ${criticalityValues
          .map((t) => `'${t}'`)
          .join(' | ')}`,
      }
    },
  }),
}

const machineShapeCreate = {
  ...machineShapeUpdate,
  code: z
    .string({ required_error: 'El código de la máquina es requerido' })
    .regex(/^[A-Z]{2}-[0-9]{2}-[A-Z]{3}-[0-9]{2}$/, {
      message:
        "El código de la máquina debe tener el formato: LL-NN-LLL-NN (donde 'L' es letra mayúscula y 'N' es número)",
    }),
}

export const createMachineDto = z.object(machineShapeCreate)

export const updateMachineDto = z.object(machineShapeUpdate)
