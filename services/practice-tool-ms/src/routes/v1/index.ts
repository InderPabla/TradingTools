import { HistorialRoute } from "./historical.route";
import { CommonRouter } from '../../../../../libs/common/service/common-router';
import { Logger } from "winston";
import { SessionRoute } from "./session.route";
import { HueColorRoute } from "./hue-color.route";

/**
 * class RoutesV1 
 */
export class RoutesV1 extends CommonRouter{

    constructor(logger:Logger) {
        super(logger,'v1');
    }

    public register() {
        let historicalRoutes = new HistorialRoute(this.logger);
        historicalRoutes.register();

        let sessionRoutes = new SessionRoute(this.logger);
        sessionRoutes.register();

        let hueColorRoutes = new HueColorRoute(this.logger);
        hueColorRoutes.register();

        this.addCommonRouter(historicalRoutes);
        this.addCommonRouter(sessionRoutes);
        this.addCommonRouter(hueColorRoutes);
    }

}