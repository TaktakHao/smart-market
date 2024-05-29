import { Response } from "express";

export const sendErrorRes = (res: Response, message: string, statusCode: number = 500) => {
    res.status(statusCode).json({ message });
}