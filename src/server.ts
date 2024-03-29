import express, { Application } from 'express'
import cors from 'cors'
import fileUpload from 'express-fileupload'
import { PORT } from './config/environment'
import testRouter from './routes/test.routes'
import machineRouter, { machineRoute } from './routes/machine.routes'
import activityRouter, { activityRoute } from './routes/activity.route'
import workOrderRouter, { workOrderRoute } from './routes/workOrder.routes'
import draftWorkOrderRouter, {
  draftWorkOrderRoute,
} from './routes/draftWorkOrder.route'
import scheduleRouter, { scheduleRoute } from './routes/schedule.routes'
import indicatorRouter, { INDICATOR_ROUTE } from './routes/indicator.routes'
import maintenanceRequestRouter, {
  MAINTENANCE_REQUEST_ROUTE,
} from './routes/maintenanceRequest.route'
import failureReportRouter, {
  FAILURE_REPORT_ROUTE,
} from './routes/failureReport.route'
import engineRouter, { ENGINE_ROUTE } from './routes/engine.routes'
import storeRouter, { STORE_ROUTE } from './routes/store.routes'
import authRouter, { authRoute } from './routes/auth.route'

export class Server {
  private app: Application
  static route = '/api'

  constructor() {
    this.app = express()

    this.middlewares()
    this.routes()
  }

  private middlewares() {
    this.app.use(cors())
    this.app.use(express.json())
    this.app.use(
      fileUpload({
        useTempFiles: true,
        tempFileDir: './uploads',
      })
    )
  }

  private routes() {
    this.app.use(testRouter)
    this.app.use(this.createRoute(authRoute), authRouter)
    this.app.use(this.createRoute(machineRoute), machineRouter)
    this.app.use(this.createRoute(ENGINE_ROUTE), engineRouter)
    this.app.use(this.createRoute(activityRoute), activityRouter)
    this.app.use(this.createRoute(draftWorkOrderRoute), draftWorkOrderRouter)
    this.app.use(this.createRoute(workOrderRoute), workOrderRouter)
    this.app.use(this.createRoute(scheduleRoute), scheduleRouter)
    this.app.use(this.createRoute(INDICATOR_ROUTE), indicatorRouter)
    this.app.use(
      this.createRoute(MAINTENANCE_REQUEST_ROUTE),
      maintenanceRequestRouter
    )
    this.app.use(this.createRoute(FAILURE_REPORT_ROUTE), failureReportRouter)
    this.app.use(this.createRoute(STORE_ROUTE), storeRouter)
  }

  private createRoute(route: string) {
    return `${Server.route}${route}`
  }

  public listen() {
    return this.app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  }

  public getApp() {
    return this.app
  }
}

const server = new Server()
export default server
