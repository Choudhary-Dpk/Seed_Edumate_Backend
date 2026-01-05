import dotenv from 'dotenv';
import axios from 'axios';
import { EXCHANGE_RATE_API_KEY, EXCHANGE_RATE_BASE_URL } from '../setup/secrets';

dotenv.config();

// Configuration
const API_KEY = EXCHANGE_RATE_API_KEY;
const BASE_URL = EXCHANGE_RATE_BASE_URL || "https://v6.exchangerate-api.com/v6";

const CURRENCIES = [
  "USD", "AED", "AFN", "ALL", "AMD", "ANG", "AOA", "ARS", "AUD", "AWG",
  "AZN", "BAM", "BBD", "BDT", "BGN", "BHD", "BIF", "BMD", "BND", "BOB",
  "BRL", "BSD", "BTN", "BWP", "BYN", "BZD", "CAD", "CDF", "CHF", "CLP",
  "CNY", "COP", "CRC", "CUP", "CVE", "CZK", "DJF", "DKK", "DOP", "DZD",
  "EGP", "ERN", "ETB", "EUR", "FJD", "FKP", "FOK", "GBP", "GEL", "GGP",
  "GHS", "GIP", "GMD", "GNF", "GTQ", "GYD", "HKD", "HNL", "HRK", "HTG",
  "HUF", "IDR", "ILS", "IMP", "INR", "IQD", "IRR", "ISK", "JEP", "JMD",
  "JOD", "JPY", "KES", "KGS", "KHR", "KID", "KMF", "KRW", "KWD", "KYD",
  "KZT", "LAK", "LBP", "LKR", "LRD", "LSL", "LYD", "MAD", "MDL", "MGA",
  "MKD", "MMK", "MNT", "MOP", "MRU", "MUR", "MVR", "MWK", "MXN", "MYR",
  "MZN", "NAD", "NGN", "NIO", "NOK", "NPR", "NZD", "OMR", "PAB", "PEN",
  "PGK", "PHP", "PKR", "PLN", "PYG", "QAR", "RON", "RSD", "RUB", "RWF",
  "SAR", "SBD", "SCR", "SDG", "SEK", "SGD", "SHP", "SLE", "SLL", "SOS",
  "SRD", "SSP", "STN", "SYP", "SZL", "THB", "TJS", "TMT", "TND", "TOP",
  "TRY", "TTD", "TVD", "TWD", "TZS", "UAH", "UGX", "UYU", "UZS", "VES",
  "VND", "VUV", "WST", "XAF", "XCD", "XCG", "XDR", "XOF", "XPF", "YER",
  "ZAR", "ZMW", "ZWL"
];

interface CurrencyResult {
  success: number;
  errors: number;
  
}

// Lock to prevent concurrent runs
let isRunning = false;

// Process currency batch
const processCurrencyBatch = async (baseCurrency: string) => {
  try {
    const response: any = await axios.get(
      `${BASE_URL}/${API_KEY}/latest/${baseCurrency}`,
      { timeout: 10000 }
    );

    if (response.data?.result !== "success" || !response.data?.conversion_rates) {
      console.error(`Invalid API response for ${baseCurrency}`);
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

      // TODO: Save to your database here
      // Example:
      // await upsertCurrencyConversion({
      //   baseCurrency,
      //   targetCurrency,
      //   forwardRate,
      //   reverseRate,
      // });

      batchSuccess++;
    }

    console.log(`${baseCurrency}: ${batchSuccess} pairs updated`);
    return { success: batchSuccess, errors: batchErrors };
  } catch (error: any) {
    console.error(`API error for ${baseCurrency}:`, error.message);
    return { success: 0, errors: 1 };
  }
}

// Main update function
export async function updateExchangeRates(): Promise<void> {
  if (isRunning) {
    console.log('Already running, skipping...');
    return;
  }

  isRunning = true;
  console.log(`[${new Date().toISOString()}] Starting currency update...`);

  let totalSuccess = 0;
  let totalErrors = 0;

  for (const currency of CURRENCIES) {
    const result = await processCurrencyBatch(currency);
    totalSuccess += result.success;
    totalErrors += result.errors;

    // Small delay to avoid API rate limits
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log(`[${new Date().toISOString()}] Update completed`);
  console.log(`Success: ${totalSuccess} | Errors: ${totalErrors}`);
  
  isRunning = false;
}

// Run if called directly
if (require.main === module) {
  updateExchangeRates()
    .then(() => {
      console.log('Currency update finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Currency update failed:', error);
      process.exit(1);
    });
}