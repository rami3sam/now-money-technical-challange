import type { Handler, NextFunction, Request, Response } from "express";
import { ZodType } from "zod"

const validate = (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    try {
        schema.parse(req.body);
        next();
    } catch (err: any) {
        res.status(400).json(err.message);
    }
};

export default validate