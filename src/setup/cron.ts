import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { EXCHANGE_RATE_API_KEY } from "./secrets";
import { upsertCurrencyConversion } from "../models/helpers/cron.helper";
const prisma = new PrismaClient();

// Configuration
const API_KEY = EXCHANGE_RATE_API_KEY;
const BASE_URL = "https://v6.exchangerate-api.com/v6";

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

// Lock to prevent concurrent executions
let isJobRunning = false;

const processCurrencyBatch = async (baseCurrency: string) => {
  // try {
  //   const response = await axios.get(
  //     `${BASE_URL}/${API_KEY}/latest/${baseCurrency}`,
  //     {
  //       timeout: 10000,
  //     }
  //   );

  //   if (
  //     response.data?.result !== "success" ||
  //     !response.data?.conversion_rates
  //   ) {
  //     console.error(`Invalid API response for ${baseCurrency}`);
  //     return { success: 0, errors: 1 };
  //   }

  //   const conversionRates = response.data.conversion_rates;
  //   let batchSuccess = 0;
  //   let batchErrors = 0;

  //   for (const targetCurrency of CURRENCIES) {
  //     if (baseCurrency === targetCurrency) continue;

  //     const forwardRate = Number(conversionRates[targetCurrency]);
  //     if (!forwardRate || forwardRate <= 0) {
  //       batchErrors++;
  //       continue;
  //     }

  //     const reverseRate = 1 / forwardRate;

  //     // Use helper to upsert DB
  //     const result = await upsertCurrencyConversion({
  //       baseCurrency,
  //       targetCurrency,
  //       forwardRate,
  //       reverseRate,
  //     });

  //     batchSuccess += result.success;
  //     batchErrors += result.errors;
  //   }

  //   console.log(`${baseCurrency}: ${batchSuccess} pairs updated`);
  //   return { success: batchSuccess, errors: batchErrors };
  // } catch (apiError) {
  //   console.error(
  //     `API error for ${baseCurrency}:`,
  //     axios.isAxiosError(apiError) ? apiError.message : "Unknown error"
  //   );
  //   return { success: 0, errors: 1 };
  // }

  console.log("hellof from cron")
};

// Main update function
const updateExchangeRates = async () => {
  console.log(`[${new Date().toISOString()}] Starting currency update...`);

  let totalSuccess = 0;
  let totalErrors = 0;

  for (const currency of CURRENCIES) {
    const result = await processCurrencyBatch(currency);
    // totalSuccess += result.success;
    // totalErrors += result.errors;

    // optional small delay to avoid API rate limits
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log(`[${new Date().toISOString()}] Update completed`);
  console.log(`Success: ${totalSuccess} | Errors: ${totalErrors}`);
};

// Cron job: runs at midnight (00:00 UTC) daily
const currencyUpdateJob = cron.schedule(
  "0 0 * * *",
  async () => {
    // Prevent overlapping executions
    if (isJobRunning) {
      console.log(
        `[${new Date().toISOString()}] Skipping - previous update still running`
      );
      return;
    }

    isJobRunning = true;
    console.log(`\n[${new Date().toISOString()}] Cron job triggered`);

    try {
      await updateExchangeRates();
      console.log(
        `[${new Date().toISOString()}] Cron job completed successfully\n`
      );
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] Cron job failed:`,
        error instanceof Error ? error.message : "Unknown error"
      );
    } finally {
      // Always release lock
      isJobRunning = false;
    }
  },
  {
    timezone: "UTC",
  }
);

console.log("Currency Update Cron Initialized");
console.log("Schedule: Daily at 00:00 UTC (midnight)");
console.log(`Tracking: ${CURRENCIES.length} currencies`);
console.log(
  `Target: ${CURRENCIES.length * (CURRENCIES.length - 1)} bidirectional pairs\n`
);

// Export for manual triggers if needed
export { updateExchangeRates, currencyUpdateJob };
export default currencyUpdateJob;
