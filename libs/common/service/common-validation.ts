import { ValidationChain } from "express-validator";

export class CommonValidation {

    public static notEmptyStringChain(chain:ValidationChain) {
        return chain
        .notEmpty()
            .withMessage('Cannot be empty')
            .bail()
        .isString()
            .withMessage('Must be a string')
            .bail();
    }
}