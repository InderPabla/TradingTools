import { Router } from "express";
import { Logger } from "winston";
import { CommonRouter } from "../../../../../libs/common/service/common-router";
import { SessionValidation } from "../../validations/session.validation";
import { validationResult, param } from 'express-validator';
import { CommonValidatorMiddleware } from "../../../../../libs/common/service/common-middleware";
import { SessionController } from "../../controllers/session.controller";

export class SessionRoute extends CommonRouter {
    private controller:SessionController;

    constructor(logger:Logger) {
        super(logger,'session');
        this.controller = new SessionController(logger);
    }

    public register() {
        let router = this.getRouter();

        router.put(
            `/:sessionId/start`
            ,CommonValidatorMiddleware.validator(SessionValidation.validateGetSession)
            ,this.controller.unexpectedControllerErrorHandler(this.controller.startSession)
        );

        router.put(
            `/:sessionId/stop`
            ,CommonValidatorMiddleware.validator(SessionValidation.validateGetSession)
            ,this.controller.unexpectedControllerErrorHandler(this.controller.stopSession)
        );

        router.put(
            `/:sessionId/clockSpeed`
            ,CommonValidatorMiddleware.validator(SessionValidation.validateClockSpeed)
            ,this.controller.unexpectedControllerErrorHandler(this.controller.updateClockSpeed)
        );

        router.put(
            `/:sessionId/pnl`
            ,CommonValidatorMiddleware.validator(SessionValidation.validatePnl)
            ,this.controller.unexpectedControllerErrorHandler(this.controller.updatePnl)
        );

        router.get(
            `/:sessionId`
            ,CommonValidatorMiddleware.validator(SessionValidation.validateGetSession)
            ,this.controller.unexpectedControllerErrorHandler(this.controller.getSession)
        );

        router.post(
            `/`
            ,CommonValidatorMiddleware.validator(SessionValidation.validateCreateSession)
            ,this.controller.unexpectedControllerErrorHandler(this.controller.createSession)
        );
    }
}