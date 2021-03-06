/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ValidationChain, validationResult } from 'express-validator'
import express from 'express'
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
export const validate = (validations: Array<ValidationChain|Function>) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
    for (const validation of validations) {
      let result;
      // @ts-ignore
      if (validation.run == undefined) {
        result = await (validation(req,res,next).run(req))
      }else{
        // @ts-ignore
        result = await validation.run(req);
      }
      if (!result.isEmpty()) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      next();
    } else {
      res.status(400).send({ msg: errors.array()[0].msg })
    }
  }
};