import { Logger } from "winston";
import { CommonRouter } from "../../../../../libs/common/service/common-router";
import { CommonValidatorMiddleware } from "../../../../../libs/common/service/common-middleware";
import { HueColorValidation } from "../../validations/hue-color.validation";
import { HueColorController } from "../../controllers/hue-color.controller";

export class HueColorRoute extends CommonRouter {
    private controller:HueColorController;

    constructor(logger:Logger) {
        super(logger,'hue-color');
        this.controller = new HueColorController(logger);
    }

    public register() {
        let router = this.getRouter();

        router.post(
            `/changeRgbColor`
            ,CommonValidatorMiddleware.validator(HueColorValidation.validatePostChangeHueRgbColor)
            ,this.controller.unexpectedControllerErrorHandler(this.controller.postChangeHueRgbColor)
        );
    }
}