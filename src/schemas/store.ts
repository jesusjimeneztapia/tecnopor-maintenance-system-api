import { Store, Unit } from '@prisma/client'
import { z } from 'zod'
import { MACHINE_CODE_ZOD } from './machine'

const storeShapeUpdate = {
  amount: z
    .number({
      required_error: 'La cantidad de repuestos es requerida',
      invalid_type_error: 'La cantidad de repuestos debe ser un número',
    })
    .int('La cantidad de repuestos debe ser un número entero')
    .min(0, 'La cantidad de repuestos debe ser un número positivo'),
  minimumAmount: z
    .number({
      required_error: 'La cantidad minima de repuestos es requerida',
      invalid_type_error: 'La cantidad mínima de repuestos debe ser un número',
    })
    .int('La cantidad mínima de repuestos debe ser un número entero')
    .min(1, 'La cantidad mínima de repuestos debe ser mayor a 1'),
}

export const STORE_NAME_ZOD = z
  .string({
    required_error: 'El nombre del repuesto es requerido',
    invalid_type_error: 'El nombre de repuestos debe ser un texto',
  })
  .trim()
  .min(8, 'El nombre del repuesto debe tener al menos 8 caracteres')

const storeShapeCreate = {
  name: STORE_NAME_ZOD,
  unit: z
    .string({
      required_error: 'La unidad del repuesto es requerida',
      invalid_type_error: 'La unidad del repuesto es un texto',
    })
    .trim()
    .min(1, 'La unidad del repuesto debe tener al menos un carácter'),
  ...storeShapeUpdate,
}

export const createStoreDto = z.object(storeShapeCreate)
export type CreateStoreDto = z.infer<typeof createStoreDto>

export const updateStoreDto = z.object(storeShapeUpdate)
export type UpdateStoreDto = z.infer<typeof updateStoreDto>

const storeShapeVerify = {
  machineCode: MACHINE_CODE_ZOD,
  name: STORE_NAME_ZOD,
  amount: z
    .number({
      required_error: 'La cantidad de repuestos es requerida',
      invalid_type_error: 'La cantidad de repuestos debe ser un número',
    })
    .int('La cantidad de repuestos debe ser un número entero')
    .min(1, 'La cantidad de repuestos debe ser mayor a 1'),
}
export const verifyStoreDto = z.object(storeShapeVerify)
export type VerifyStoreDto = z.infer<typeof verifyStoreDto>

export interface StoreResponseDto
  extends Omit<Store, 'machineCode' | 'deleted' | 'unitId'> {
  unit: Pick<Unit, 'name'>
}
