import Multer from "multer";
import logger from "../utils/logger";

const multer = (sizeInMb: number, fileTypes?: string[]) =>
  Multer({
    storage: Multer.memoryStorage(),
    limits: {
      fileSize: sizeInMb * 1024 * 1024,
      fieldSize: sizeInMb * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
      logger.debug("File received:", {
        originalname: file.originalname,
        mimetype: file.mimetype,
        fieldname: file.fieldname,
      });

      if (!fileTypes || fileTypes.length === 0) {
        const allowedMimes = [
          "text/csv",
          "application/csv",
          "application/vnd.ms-excel",
          "text/plain",
          "application/octet-stream",
        ];

        const isCsvExt = file.originalname.toLowerCase().endsWith(".csv");
        const isCsvMime = allowedMimes.includes(file.mimetype);

        if (isCsvExt || isCsvMime) {
          cb(null, true);
        } else {
          cb(
            new Error(
              `Invalid file type. Expected CSV, got: ${file.mimetype} for file: ${file.originalname}`
            )
          );
        }
      } else {
        // Custom file type validation
        const fileExt = file.originalname.toLowerCase().split(".").pop();
        const isValidMime = fileTypes.some((type) =>
          file.mimetype.includes(type)
        );
        const isValidExt = fileTypes.some((type) =>
          fileExt?.includes(type.split("/").pop() || type)
        );

        if (isValidMime || isValidExt) {
          cb(null, true);
        } else {
          cb(
            new Error(
              `Invalid file type. Allowed types: ${fileTypes.join(
                ", "
              )}, got: ${file.mimetype}`
            )
          );
        }
      }
    },
  });

export default multer;
