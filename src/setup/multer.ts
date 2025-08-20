import Multer from "multer";

const multer = (sizeInMb: number) =>
  Multer({
    storage: Multer.memoryStorage(),
    limits: {
      fileSize: sizeInMb * 1024 * 1024,
      fieldSize: sizeInMb * 1024 * 1024, // Add this for large files
    },
    fileFilter: (req, file, cb) => {
      console.log("File received:", {
        originalname: file.originalname,
        mimetype: file.mimetype,
        fieldname: file.fieldname,
      });

      // Accept CSV files
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
    },
  });

export default multer;
