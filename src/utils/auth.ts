import { randomBytes } from "crypto";
import { compare, hash } from "bcrypt";
import { JwtPayload, sign, verify } from "jsonwebtoken";

export const validateUserPassword = async (
  password: string,
  passwordHash: string
): Promise<boolean> => {
  return await compare(password, passwordHash);
};

export const generateRefreshToken = (size: number) => {
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
  sessionId:string
) => {
  const data = {
    id: userId,
    email: email,
    sessionId
  };

  return new Promise<string>((resolve, reject) => {
    sign(
      data,
      process.env.JWT_SECRET!,
      {
        expiresIn: "1d",
      },
      (err, token) => {
        if (err) {
          reject(err);
        }
        if (token) {
          resolve(token);
        }
        reject(`Token generation failed`);
      }
    );
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
