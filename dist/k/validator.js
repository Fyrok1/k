"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
// export const validateAll = (validations:any) => {
//   return async (req:express.Request, res:express.Response, next:express.NextFunction) => {
//     await Promise.all(validations.map((validation:any) => validation.run(req)));
//     const errors = validationResult(req);
//     if (errors.isEmpty()) {
//       return next();
//     }
//     res.status(400).send({msg:errors.array()[0].msg})
//   };
// };
// sequential processing, stops running validations chain if the previous one have failed.
exports.validate = (validations) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        for (const validation of validations) {
            const result = yield validation.run(req);
            if (!result.isEmpty())
                break;
        }
        const errors = express_validator_1.validationResult(req);
        if (errors.isEmpty()) {
            next();
        }
        else {
            res.status(400).send({ msg: errors.array()[0].msg });
        }
    });
};
