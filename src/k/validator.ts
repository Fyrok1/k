import { ValidationChain, validationResult } from 'express-validator';
import express from 'express';

// eslint-disable-next-line @typescript-eslint/ban-types
export const validate = (validations: Array<ValidationChain | Function>) => {
  return async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> => {
    for (const validation of validations) {
      let result;
      if (validation['run'] == undefined) {
        result = await validation(req, res, next).run(req);
      } else if (typeof validation['run'] == 'function') {
        result = await validation['run'](req);
      }
      if (!result.isEmpty()) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      next();
    } else {
      res.status(400).send({ msg: errors.array()[0].msg });
    }
  };
};
