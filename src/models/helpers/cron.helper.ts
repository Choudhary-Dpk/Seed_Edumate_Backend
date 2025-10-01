import prisma from "../../config/prisma";

export interface CurrencyConversionPayload {
  baseCurrency: string;
  targetCurrency: string;
  forwardRate: number;
  reverseRate: number;
}

/**
 * Upserts forward and reverse currency conversion rates in the database.
 */
export const upsertCurrencyConversion = async ({
  baseCurrency,
  targetCurrency,
  forwardRate,
  reverseRate,
}: CurrencyConversionPayload): Promise<{ success: number; errors: number }> => {
  let batchSuccess = 0;
  let batchErrors = 0;

  try {
    // Forward pair: baseCurrency -> targetCurrency
    await prisma.currency_conversion.upsert({
      where: {
        from_currency_to_currency: {
          from_currency: baseCurrency,
          to_currency: targetCurrency,
        },
      },
      update: {
        exchange_rate: forwardRate,
        last_updated: new Date(),
        is_active: true,
      },
      create: {
        from_currency: baseCurrency,
        to_currency: targetCurrency,
        exchange_rate: forwardRate,
        is_active: true,
      },
    });

    // Reverse pair: targetCurrency -> baseCurrency
    await prisma.currency_conversion.upsert({
      where: {
        from_currency_to_currency: {
          from_currency: targetCurrency,
          to_currency: baseCurrency,
        },
      },
      update: {
        exchange_rate: reverseRate,
        last_updated: new Date(),
        is_active: true,
      },
      create: {
        from_currency: targetCurrency,
        to_currency: baseCurrency,
        exchange_rate: reverseRate,
        is_active: true,
      },
    });

    batchSuccess += 2;
  } catch (dbError) {
    batchErrors += 2;
    console.error(
      `DB error for ${baseCurrency}<->${targetCurrency}:`,
      dbError instanceof Error ? dbError.message : "Unknown error"
    );
  }

  return { success: batchSuccess, errors: batchErrors };
};
