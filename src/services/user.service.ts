import axios from 'axios';
import prisma from '../config/prisma';

const BASE_URL = process.env.IP_API_BASE_URL;
const API_KEY = process.env.IP_API_KEY;

export const fetchIpDetails = async (ip: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/${ip}`, {
      params: {
        key: API_KEY,
        fields: 'status,message,continent,country,countryCode,region,regionName,city,zip,lat,lon,timezone,offset,currency,org,query',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error fetching IP info:', error.message);
    throw new Error('IP lookup failed');
  }
};

export const fetchCurrencyConversion = async (baseCurrency: string) => {
  // Fetch all active conversion rates for the base currency
  const conversionRates = await prisma.currency_conversion.findMany({
    where: {
      from_currency: baseCurrency,
      is_active: true,
    },
    select: {
      to_currency: true,
      exchange_rate: true,
      last_updated: true,
    },
    orderBy: {
      to_currency: "asc",
    },
  });

  // Check if any rates were found
  if (conversionRates.length === 0) {
    throw new Error(
      `No conversion rates found for currency: ${baseCurrency}`
    );
  }

  // Find the most recent update timestamp
  const lastUpdated = conversionRates.reduce((latest, rate) => {
    return rate.last_updated > latest ? rate.last_updated : latest;
  }, conversionRates[0].last_updated);

  // Build rates object
  const rates: Record<string, number> = {
    [baseCurrency]: 1, // Base currency always has rate of 1
  };

  conversionRates.forEach((rate) => {
    // Convert Decimal to number for JSON response
    rates[rate.to_currency] = parseFloat(rate.exchange_rate.toString());
  });

  // Format response
  const response = {
    base: baseCurrency,
    date: new Date().toISOString().split("T")[0], // YYYY-MM-DD format
    time_last_updated: Math.floor(lastUpdated.getTime() / 1000), // Unix timestamp
    rates,
  };

  return response;
};
