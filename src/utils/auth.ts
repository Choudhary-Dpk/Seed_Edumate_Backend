import { randomBytes } from "crypto";
import { compare, hash } from "bcrypt";
import { JwtPayload, sign, verify } from "jsonwebtoken";
import { JWT_SECRET } from "../setup/secrets";

export const validateUserPassword = async (
  password: string,
  passwordHash: string
): Promise<boolean> => {
  return await compare(password, passwordHash);
};

export const generateEmailToken = (size: number) => {
  return new Promise<string>((resolve, reject) => {
    randomBytes(size, (err, buf) => {
      if (err) {
        reject(err);
      }
      resolve(buf.toString("hex"));
    });
  });
};

export const generateJWTToken = (
  userId: number,
  email: string,
  portalType?: string,
  sessionId?: string
): Promise<string> => {
  const payload = { id: userId, email, portalType, sessionId };

  return new Promise((resolve, reject) => {
    sign(payload, JWT_SECRET!, { expiresIn: "30m" }, (err, token) => {
      if (err) {
        return reject(err);
      }
      if (!token) {
        return reject("Token generation failed");
      }
      resolve(token);
    });
  });
};

export const generateRefreshToken = async (
  userId: number,
  email: string
): Promise<string> => {
  const payload = { id: userId, email };

  return new Promise((resolve, reject) => {
    sign(payload, JWT_SECRET!, { expiresIn: "15d" }, (err, token) => {
      if (err) {
        return reject(err);
      }
      if (!token) {
        return reject("Refresh token generation failed");
      }
      resolve(token);
    });
  });
};

export const hashPassword = async (password: string): Promise<string> => {
  const hashedPassword = await hash(password, 10);
  return hashedPassword;
};

export const decodeToken = (token: string) => {
  if (!token) {
    throw new Error("Missing token");
  }
  return new Promise<JwtPayload>((resolve, reject) => {
    verify(token, process.env.JWT_SECRET!, (err, decoded) => {
      if (err) {
        reject(err);
      }
      resolve(decoded as JwtPayload);
    });
  });
};
