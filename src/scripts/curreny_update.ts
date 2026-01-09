import dotenv from "dotenv";
import axios from "axios";
import {
  EXCHANGE_RATE_API_KEY,
  EXCHANGE_RATE_BASE_URL,
} from "../setup/secrets";
import { emailQueue } from "../utils/queue";

dotenv.config();

// Configuration
const API_KEY = EXCHANGE_RATE_API_KEY;
const BASE_URL = EXCHANGE_RATE_BASE_URL || "https://v6.exchangerate-api.com/v6";

const CURRENCIES = [
  "USD",
  "AED",
  "AFN",
  "ALL",
  "AMD",
  "ANG",
  "AOA",
  "ARS",
  "AUD",
  "AWG",
  "AZN",
  "BAM",
  "BBD",
  "BDT",
  "BGN",
  "BHD",
  "BIF",
  "BMD",
  "BND",
  "BOB",
  "BRL",
  "BSD",
  "BTN",
  "BWP",
  "BYN",
  "BZD",
  "CAD",
  "CDF",
  "CHF",
  "CLP",
  "CNY",
  "COP",
  "CRC",
  "CUP",
  "CVE",
  "CZK",
  "DJF",
  "DKK",
  "DOP",
  "DZD",
  "EGP",
  "ERN",
  "ETB",
  "EUR",
  "FJD",
  "FKP",
  "FOK",
  "GBP",
  "GEL",
  "GGP",
  "GHS",
  "GIP",
  "GMD",
  "GNF",
  "GTQ",
  "GYD",
  "HKD",
  "HNL",
  "HRK",
  "HTG",
  "HUF",
  "IDR",
  "ILS",
  "IMP",
  "INR",
  "IQD",
  "IRR",
  "ISK",
  "JEP",
  "JMD",
  "JOD",
  "JPY",
  "KES",
  "KGS",
  "KHR",
  "KID",
  "KMF",
  "KRW",
  "KWD",
  "KYD",
  "KZT",
  "LAK",
  "LBP",
  "LKR",
  "LRD",
  "LSL",
  "LYD",
  "MAD",
  "MDL",
  "MGA",
  "MKD",
  "MMK",
  "MNT",
  "MOP",
  "MRU",
  "MUR",
  "MVR",
  "MWK",
  "MXN",
  "MYR",
  "MZN",
  "NAD",
  "NGN",
  "NIO",
  "NOK",
  "NPR",
  "NZD",
  "OMR",
  "PAB",
  "PEN",
  "PGK",
  "PHP",
  "PKR",
  "PLN",
  "PYG",
  "QAR",
  "RON",
  "RSD",
  "RUB",
  "RWF",
  "SAR",
  "SBD",
  "SCR",
  "SDG",
  "SEK",
  "SGD",
  "SHP",
  "SLE",
  "SLL",
  "SOS",
  "SRD",
  "SSP",
  "STN",
  "SYP",
  "SZL",
  "THB",
  "TJS",
  "TMT",
  "TND",
  "TOP",
  "TRY",
  "TTD",
  "TVD",
  "TWD",
  "TZS",
  "UAH",
  "UGX",
  "UYU",
  "UZS",
  "VES",
  "VND",
  "VUV",
  "WST",
  "XAF",
  "XCD",
  "XCG",
  "XDR",
  "XOF",
  "XPF",
  "YER",
  "ZAR",
  "ZMW",
  "ZWL",
];

interface CurrencyResult {
  success: number;
  errors: number;
}

// Logger function type
type LogFunction = (taskName: string, message: string) => void;

// Lock to prevent concurrent runs
let isRunning = false;

// Email recipients
const NOTIFICATION_EMAILS = [
  "deepak@seedglobaleducation.com",
  "riyaz@seedglobaleducation.com",
];

// Send email notification
function sendNotification(
  success: boolean,
  totalSuccess: number,
  totalErrors: number,
  duration: number,
  error?: any
): void {
  const status = success ? "Success" : "Failed";
  const statusEmoji = success ? "✅" : "❌";
  const subject = `[Cron Job] Currency Exchange Update - ${statusEmoji} ${status}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { background: ${
      success ? "#4CAF50" : "#f44336"
    }; color: white; padding: 20px; border-radius: 5px; }
    .info { background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .stats { background: #fff; padding: 15px; margin: 20px 0; border: 1px solid #ddd; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="header">
    <h2>${statusEmoji} Currency Exchange Update - ${status}</h2>
  </div>
  <div class="info">
    <p><strong>Status:</strong> ${
      success ? "Completed Successfully" : "Failed"
    }</p>
    <p><strong>Duration:</strong> ${duration.toFixed(2)} seconds</p>
    <p><strong>Time:</strong> ${new Date().toISOString()}</p>
  </div>
  <div class="stats">
    <h3>Statistics</h3>
    <p><strong>✅ Successful Pairs:</strong> ${totalSuccess}</p>
    <p><strong>❌ Failed Pairs:</strong> ${totalErrors}</p>
    <p><strong>📊 Total Currencies:</strong> ${CURRENCIES.length}</p>
    ${
      error
        ? `<p style="color: #f44336;"><strong>Error:</strong> ${error.message}</p>`
        : ""
    }
  </div>
</body>
</html>`;

  for (const email of NOTIFICATION_EMAILS) {
    emailQueue.push({
      to: email,
      subject: subject,
      html: html,
      retry: 0,
    });
  }
}

// Process currency batch
const processCurrencyBatch = async (
  baseCurrency: string,
  logger?: LogFunction
) => {
  const logMsg = (msg: string) => {
    if (logger) logger("currency-update", msg);
  };

  try {
    const response: any = await axios.get(
      `${BASE_URL}/${API_KEY}/latest/${baseCurrency}`,
      { timeout: 10000 }
    );

    if (
      response.data?.result !== "success" ||
      !response.data?.conversion_rates
    ) {
      logMsg(`Invalid API response for ${baseCurrency}`);
      return { success: 0, errors: 1 };
    }

    const conversionRates = response.data.conversion_rates;
    let batchSuccess = 0;
    let batchErrors = 0;

    for (const targetCurrency of CURRENCIES) {
      if (baseCurrency === targetCurrency) continue;

      const forwardRate = Number(conversionRates[targetCurrency]);
      if (!forwardRate || forwardRate <= 0) {
        batchErrors++;
        continue;
      }

      const reverseRate = 1 / forwardRate;

      batchSuccess++;
    }

    logMsg(`${baseCurrency}: ${batchSuccess} pairs updated`);
    return { success: batchSuccess, errors: batchErrors };
  } catch (error: any) {
    logMsg(`API error for ${baseCurrency}: ${error.message}`);
    return { success: 0, errors: 1 };
  }
};

// Main update function - now accepts optional logger
export async function updateExchangeRates(logger?: LogFunction): Promise<void> {
  if (isRunning) {
    const msg = "Already running, skipping...";
    if (logger) logger("currency-update", msg);
    return;
  }

  const startTime = Date.now();
  isRunning = true;

  const logMsg = (msg: string) => {
    if (logger) logger("currency-update", msg);
  };

  logMsg(`[${new Date().toISOString()}] Starting currency update...`);

  let totalSuccess = 0;
  let totalErrors = 0;

  try {
    for (const currency of CURRENCIES) {
      const result = await processCurrencyBatch(currency, logger);
      totalSuccess += result.success;
      totalErrors += result.errors;

      // Small delay to avoid API rate limits
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const duration = (Date.now() - startTime) / 1000;
    logMsg(`[${new Date().toISOString()}] Update completed`);
    logMsg(`Success: ${totalSuccess} | Errors: ${totalErrors}`);

    // Send success notification
    sendNotification(true, totalSuccess, totalErrors, duration);
  } catch (error: any) {
    const duration = (Date.now() - startTime) / 1000;
    logMsg("Currency update failed: " + error.message);

    // Send failure notification
    sendNotification(false, totalSuccess, totalErrors, duration, error);
    throw error;
  } finally {
    isRunning = false;
  }
}

// Run if called directly
if (require.main === module) {
  updateExchangeRates()
    .then(() => {
      console.log("Currency update finished");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Currency update failed:", error);
      process.exit(1);
    });
}
