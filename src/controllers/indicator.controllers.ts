import { Request, Response } from 'express'
import * as indicatorService from '../services/indicator.service'
import { ThrowError } from '../services'

export async function getIndicators(
  req: Request<never, never, never, { date?: string }>,
  res: Response
) {
  const { date } = req.query
  try {
    const workOrders = await indicatorService.getIndicators({ date })
    return res.json(workOrders)
  } catch (error) {
    const { status, message } = error as ThrowError
    return res.status(status).json({ message })
  }
}
