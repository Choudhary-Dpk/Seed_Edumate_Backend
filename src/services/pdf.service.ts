// import puppeteer from "puppeteer";
// import { CalculationResult } from "../types/loan-schedule.types";
// import { config } from "../config/config";
// import { convertTenureInYears } from "../utils/helper";

// interface customerDetails {
//   name?: string;
//   customerId?: string;
//   agreementNumber?: string;
//   mobileNumber?: string;
//   email?: string;
//   address?: string;
// }

// export interface PDFGenerationOptions {
//   fromName?: string;
//   requestId?: string;
//   customerDetails?: customerDetails;
// }

// const edumateLogo = config?.edumate?.logo;

// const generateHTMLTemplate = (
//   calculationResult: CalculationResult,
//   fromName: string = "Edumate",
//   customerDetails?: customerDetails
// ): string => {
//   const { loanDetails, monthlySchedule } = calculationResult;
//   const { years, months } = convertTenureInYears(loanDetails?.tenureYears);

//   // Updated currency formatting with fallback
//   const formatCurrency = (amount: number): string => {
//     try {
//       return new Intl.NumberFormat("en-IN", {
//         style: "currency",
//         currency: "INR",
//         minimumFractionDigits: 2,
//       }).format(amount);
//     } catch (error) {
//       // Fallback formatting if Intl fails
//       return `₹ ${new Intl.NumberFormat("en-IN", {
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2,
//       }).format(amount)}`;
//     }
//   };

//   const formatNumber = (num: number): string =>
//     new Intl.NumberFormat("en-IN", {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     }).format(num);

//   const monthlyRows = monthlySchedule
//     .map(
//       (payment, index) => `
//     <tr>
//       <td class="text-center">${payment.month}</td>
//       <td class="text-right">${formatCurrency(payment.emi)}</td>
//       <td class="text-right">${formatCurrency(payment.principalPayment)}</td>
//       <td class="text-right">${formatCurrency(payment.interestPayment)}</td>
//       <td class="text-right">${formatCurrency(payment.remainingBalance)}</td>
//     </tr>
//   `
//     )
//     .join("");

//   return `
//   <!DOCTYPE html>
//   <html lang="en">
//   <head>
//     <meta charset="UTF-8" />
//     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//     <title>Loan Repayment Schedule - ${fromName}</title>
//     <style>
//       @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

//       * {
//         box-sizing: border-box;
//         margin: 0;
//         padding: 0;
//       }

//       body {
//         font-family: 'Inter', 'Arial', 'Helvetica', sans-serif;
//         font-size: 11px;
//         line-height: 1.3;
//         color: #333;
//         background: #fff;
//         -webkit-font-smoothing: antialiased;
//         -moz-osx-font-smoothing: grayscale;
//       }

//       .document {
//         max-width: 210mm;
//         margin: 0 auto;
//         background: white;
//         box-shadow: 0 0 10px rgba(0,0,0,0.1);
//       }

//       /* Header */
//       .header {
//         background: #1a365d;
//         color: white;
//         padding: 12px 25px;
//         display: flex;
//         justify-content: space-between;
//         align-items: center;
//         font-size: 10px;
//         font-weight: 600;
//         text-transform: uppercase;
//         letter-spacing: 0.5px;
//       }

//       /* Company Section */
//       .company-header {
//         background-color: linear-gradient(135deg, rgba(222, 156, 111, 0.12) 0%, rgba(102, 153, 220, 0.59) 100%);
//         padding: 25px;
//         border-bottom: 3px solid #1a365d;
//         display: flex;
//         justify-content: space-between;
//         align-items: center;
//       }

//       .company-info h1 {
//         font-size: 32px;
//         font-weight: 700;
//         color: #1a365d;
//         margin-bottom: 5px;
//         letter-spacing: -0.5px;
//       }

//       .company-tagline {
//         font-size: 11px;
//         color: #64748b;
//         font-weight: 500;
//         text-transform: uppercase;
//         letter-spacing: 1px;
//       }

//       .logo {
//         max-height: 70px;
//         max-width: 200px;
//       }

//       /* Document Info */
//       .doc-info {
//         background: #f8fafc;
//         border-bottom: 1px solid #e2e8f0;
//         padding: 0;
//       }

//       .doc-info-table {
//         width: 100%;
//         border-collapse: collapse;
//       }

//       .doc-info-table td {
//         padding: 12px 25px;
//         font-size: 10px;
//         border-right: 1px solid #e2e8f0;
//         vertical-align: top;
//       }

//       .doc-info-table td:last-child {
//         border-right: none;
//       }

//       .doc-label {
//         font-weight: 700;
//         color: #64748b;
//         text-transform: uppercase;
//         letter-spacing: 0.3px;
//         margin-bottom: 3px;
//       }

//       .doc-value {
//         font-weight: 600;
//         color: #1e293b;
//         font-size: 11px;
//       }

//       /* Main Content */
//       .content {
//         padding: 25px;
//       }

//       /* Customer Details */
//       .section {
//         margin-bottom: 30px;
//       }

//       .section-header {
//         background: #1e293b;
//         color: white;
//         padding: 8px 15px;
//         font-size: 11px;
//         font-weight: 700;
//         text-transform: uppercase;
//         letter-spacing: 0.5px;
//         margin-bottom: 0;
//       }

//       .info-table {
//         width: 100%;
//         border-collapse: collapse;
//         border: 1px solid #e2e8f0;
//         font-size: 10px;
//       }

//       .info-table td {
//         padding: 10px 15px;
//         border-bottom: 1px solid #f1f5f9;
//         border-right: 1px solid #f1f5f9;
//       }

//       .info-table td:last-child {
//         border-right: none;
//       }

//       .info-table tr:last-child td {
//         border-bottom: none;
//       }

//       .info-table tr:nth-child(even) {
//         background: #f8fafc;
//       }

//       .info-label {
//         font-weight: 600;
//         color: #64748b;
//         width: 30%;
//         text-transform: uppercase;
//         font-size: 9px;
//         letter-spacing: 0.3px;
//       }

//       .info-value {
//         font-weight: 600;
//         color: #1e293b;
//         font-size: 11px;
//       }

//       /* Two Column Layout for Customer */
//       .two-column {
//         display: grid;
//         grid-template-columns: 1fr 1fr;
//         gap: 0;
//       }

//       .two-column .info-table {
//         border-right: none;
//       }

//       .two-column .info-table:first-child {
//         border-right: 1px solid #e2e8f0;
//       }

//       /* Loan Details - Special formatting */
//       .loan-details .info-table td {
//         padding: 12px 15px;
//       }

//       .loan-details .info-value {
//         text-align: right;
//         font-size: 12px;
//         font-weight: 700;
//       }

//       .amount-principal { color: #1e293b; }
//       .amount-rate { color: #3b82f6; }
//       .amount-emi { color: #0f766e; }
//       .amount-total { color: #059669; }
//       .amount-interest { color: #dc2626; }

//       /* Schedule Table */
//       .schedule-table {
//         width: 100%;
//         border-collapse: collapse;
//         font-size: 10px;
//         border: 1px solid #e2e8f0;
//       }

//       .schedule-table thead {
//         background: #1e293b;
//         color: white;
//       }

//       .schedule-table th {
//         padding: 12px 8px;
//         text-align: center;
//         font-weight: 700;
//         font-size: 9px;
//         text-transform: uppercase;
//         letter-spacing: 0.3px;
//         border-right: 1px solid rgba(255,255,255,0.1);
//       }

//       .schedule-table th:last-child {
//         border-right: none;
//       }

//       .schedule-table td {
//         padding: 8px;
//         border-bottom: 1px solid #f1f5f9;
//         border-right: 1px solid #f1f5f9;
//         font-weight: 500;
//       }

//       .schedule-table td:last-child {
//         border-right: none;
//       }

//       .schedule-table tbody tr:nth-child(even) {
//         background: #f8fafc;
//       }

//       .schedule-table tbody tr:hover {
//         background: #e0f2fe;
//       }

//       .text-center {
//         text-align: center;
//         font-weight: 600;
//         color: #1e293b;
//       }

//       .text-right {
//         text-align: right;
//         font-weight: 600;
//       }

//       /* Footer */
//       .footer {
//         background: #f8fafc;
//         border-top: 1px solid #e2e8f0;
//         padding: 20px 25px;
//         margin-top: 30px;
//       }

//       .footer-grid {
//         display: grid;
//         grid-template-columns: 2fr 1fr;
//         gap: 30px;
//         align-items: start;
//       }

//       .disclaimer {
//         font-size: 9px;
//         color: #64748b;
//         line-height: 1.4;
//       }

//       .disclaimer strong {
//         color: #1e293b;
//       }

//       .footer-brand {
//         text-align: right;
//         font-size: 9px;
//         color: #1e293b;
//         font-weight: 600;
//         line-height: 1.4;
//       }

//       /* Print Styles */
//       @media print {
//         body { font-size: 10px; }
//         .document { box-shadow: none; }
//         .schedule-table tbody tr:hover { background: inherit; }
//       }

//       @page {
//         margin: 15mm;
//         size: A4;
//       }
//     </style>
//   </head>
//   <body>
//     <div class="document">
//       <!-- Company Header -->
//       <div class="company-header">
//         <div class="company-info">
//             ${
//               edumateLogo
//                 ? `<img src="${edumateLogo}" alt="${fromName}" style="height: 48px; width: auto; display: block; filter: brightness(1.1);" />`
//                 : `<h1>${fromName}</h1>`
//             }
//         </div>
//         <div>
//             <div style="font-size: 13px; color: #0f172a; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 600;">
//                 Education Loan Services
//             </div>
//             <div style="font-size: 11px; color: #0f172aae; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; margin-top: 2px;">
//                 Your pathway to educational excellence
//             </div>
//         </div>
//       </div>

//       <!-- Document Information -->
//       <div class="doc-info">
//         <table class="doc-info-table">
//           <tr>
//             <td>
//               <div class="doc-label">Document Type</div>
//               <div class="doc-value">Loan Repayment Schedule</div>
//             </td>
//             <td>
//               <div class="doc-label">Generated On</div>
//               <div class="doc-value">
//               ${new Date().toLocaleDateString("en-IN", {
//                 day: "2-digit",
//                 month: "short",
//                 year: "numeric",
//               })} - ${new Date().toLocaleTimeString("en-IN", {
//     hour: "2-digit",
//     minute: "2-digit",
//     second: "2-digit",
//   })}
//               </div>
//             </td>
//           </tr>
//         </table>
//       </div>

//       <div class="content">
//         ${
//           customerDetails
//             ? `
//         <!-- Customer Information -->
//         <div class="section">
//           <div class="section-header">Customer Information</div>
//           <div class="two-column">
//             <table class="info-table">
//               <tr>
//                 <td class="info-label">Customer Name</td>
//                 <td class="info-value">${customerDetails?.name || "-"}</td>
//               </tr>
//               <tr>
//                 <td class="info-label">Customer ID</td>
//                 <td class="info-value">${customerDetails.customerId || "-"}</td>
//               </tr>
//               <tr>
//                 <td class="info-label">Agreement Number</td>
//                 <td class="info-value">${
//                   customerDetails.agreementNumber || "-"
//                 }</td>
//               </tr>
//             </table>
//             <table class="info-table">
//               <tr>
//                 <td class="info-label">Mobile Number</td>
//                 <td class="info-value">${
//                   customerDetails.mobileNumber || "-"
//                 }</td>
//               </tr>
//               <tr>
//                 <td class="info-label">Email ID</td>
//                 <td class="info-value">${customerDetails.email || "-"}</td>
//               </tr>
//               <tr>
//                 <td class="info-label">Address</td>
//                 <td class="info-value">${customerDetails.address || "-"}</td>
//               </tr>
//             </table>
//           </div>
//         </div>
//         `
//             : ""
//         }

//         <!-- Loan Details -->
//         <div class="section loan-details">
//           <div class="section-header">Loan Details</div>
//           <table class="info-table">
//             <tr>
//               <td class="info-label">Principal Amount</td>
//               <td class="info-value ">${formatCurrency(
//                 loanDetails.principal
//               )}</td>
//               <td class="info-label">Monthly EMI</td>
//               <td class="info-value ">${formatCurrency(
//                 loanDetails.monthlyEMI
//               )}</td>
//             </tr>
//             <tr>
//               <td class="info-label">Interest Rate (Annual)</td>
//               <td class="info-value ">${formatNumber(
//                 loanDetails.annualRate
//               )}%</td>
//               <td class="info-label">Total Amount Payable</td>
//               <td class="info-value ">${formatCurrency(
//                 loanDetails.totalAmount
//               )}</td>
//             </tr>
//             <tr>
//               <td class="info-label">Loan Tenure</td>
//               <td class="info-value">${years} Years ${months} Months</td>
//               <td class="info-label">Total Interest Payable</td>
//               <td class="info-value">${formatCurrency(
//                 loanDetails.totalInterest
//               )}</td>
//             </tr>
//           </table>
//         </div>

//         <!-- Repayment Schedule -->
//         <div class="section">
//           <div class="section-header">Monthly Repayment Schedule</div>
//           <table class="schedule-table">
//             <thead>
//               <tr>
//                 <th>Installment No.</th>
//                 <th>EMI Amount</th>
//                 <th>Principal Component</th>
//                 <th>Interest Component</th>
//                 <th>Outstanding Balance</th>
//               </tr>
//             </thead>
//             <tbody>
//               ${monthlyRows}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       <!-- Footer -->
//       <div class="footer">
//         <div class="footer-grid">
//           <div class="disclaimer">
//             <strong>Important Notice:</strong> This repayment schedule is based on the loan parameters provided and assumes consistent monthly payments.
//             Actual payments may vary based on your lender's specific terms and conditions, processing fees, and any prepayment options exercised.
//             Please refer to your loan agreement for official terms and conditions. This document is computer generated and does not require a signature.
//           </div>
//           <div class="footer-brand">
//             Generated by ${fromName}<br/>
//             ${new Date().toLocaleDateString("en-IN", {
//               year: "numeric",
//               month: "long",
//               day: "numeric",
//             })}<br/>
//             ${new Date().toLocaleTimeString("en-IN")}
//           </div>
//         </div>
//       </div>
//     </div>
//   </body>
//   </html>
// `;
// };

// export const generatePDF = async (
//   calculationResult: CalculationResult,
//   options: PDFGenerationOptions = {}
// ): Promise<{ buffer: Buffer; fileName: string }> => {
//   const { fromName = "Edumate", requestId, customerDetails } = options;

//   const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
//   const fileName = `repayment-schedule-${requestId || timestamp}.pdf`;

//   let browser;
//   let page;

//   try {
//     console.log("Launching Puppeteer browser...");

//     browser = await puppeteer.launch({
//       headless: true,
//       args: [
//         "--no-sandbox",
//         "--disable-setuid-sandbox",
//         "--disable-dev-shm-usage",
//         "--disable-accelerated-2d-canvas",
//         "--no-first-run",
//         "--no-zygote",
//         "--single-process",
//         "--disable-gpu",
//         "--font-render-hinting=none",
//         "--disable-font-subpixel-positioning",
//       ],
//       timeout: 60000, // ✅ Add browser launch timeout
//     });

//     console.log("Creating new page...");
//     page = await browser.newPage();

//     // ✅ Set page timeouts
//     await page.setDefaultNavigationTimeout(60000);
//     await page.setDefaultTimeout(60000);

//     // Set viewport and encoding
//     await page.setViewport({ width: 1920, height: 1080 });

//     console.log("Generating HTML content...");
//     const htmlContent = generateHTMLTemplate(
//       calculationResult,
//       fromName,
//       customerDetails
//     );

//     // Set content with proper encoding
//     console.log("Setting page content...");
//     await page.setContent(htmlContent, {
//       waitUntil: ["networkidle0", "domcontentloaded"], // ✅ Multiple wait conditions
//       timeout: 60000, // ✅ Increased timeout
//     });

//     // Wait for fonts to load
//     console.log("Waiting for fonts to load...");
//     await page.evaluateHandle("document.fonts.ready");

//     // ✅ Add small delay to ensure everything is rendered
//     await new Promise((resolve) => setTimeout(resolve, 1500));

//     console.log("Generating PDF...");
//     const pdfBuffer = await page.pdf({
//       format: "A4",
//       margin: {
//         top: "15mm",
//         right: "15mm",
//         bottom: "20mm",
//         left: "15mm",
//       },
//       printBackground: true,
//       displayHeaderFooter: true,
//       footerTemplate: `
//         <div style="font-size: 9px; color: #6c757d; text-align: center; width: 100%; margin: 0 15mm; font-family: Inter, Arial, sans-serif;">
//           Page <span class="pageNumber"></span> of <span class="totalPages"></span>
//         </div>
//       `,
//       headerTemplate: "<div></div>",
//       preferCSSPageSize: true,
//       timeout: 60000, // ✅ PDF generation timeout
//     });

//     console.log("PDF generated successfully, size:", pdfBuffer.length, "bytes");

//     return {
//       buffer: Buffer.from(pdfBuffer),
//       fileName,
//     };
//   } catch (error) {
//     console.error("Error generating PDF:", error);

//     // ✅ More detailed error logging
//     if (error instanceof Error) {
//       console.error("Error name:", error.name);
//       console.error("Error message:", error.message);
//       console.error("Error stack:", error.stack);
//     }

//     throw new Error(
//       `Failed to generate PDF: ${
//         error instanceof Error ? error.message : "Unknown error"
//       }`
//     );
//   } finally {
//     // ✅ Proper cleanup with error handling
//     console.log("Cleaning up resources...");

//     if (page) {
//       try {
//         await page.close();
//         console.log("Page closed successfully");
//       } catch (closeError) {
//         console.error("Error closing page:", closeError);
//       }
//     }

//     if (browser) {
//       try {
//         await browser.close();
//         console.log("Browser closed successfully");
//       } catch (closeError) {
//         console.error("Error closing browser:", closeError);
//       }
//     }
//   }
// };

import puppeteer, { Browser, Page } from "puppeteer";
import { CalculationResult } from "../types/loan-schedule.types";
import { config } from "../config/config";
import { convertTenureInYears } from "../utils/helper";

interface customerDetails {
  name?: string;
  customerId?: string;
  agreementNumber?: string;
  mobileNumber?: string;
  email?: string;
  address?: string;
}

export interface PDFGenerationOptions {
  fromName?: string;
  requestId?: string;
  customerDetails?: customerDetails;
}

const edumateLogo = config?.edumate?.logo;

// ========== BROWSER POOL ==========
class BrowserManager {
  private static browser: Browser | null = null;
  private static isLaunching = false;
  private static lastUsed = Date.now();
  private static readonly IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

  static async getBrowser(): Promise<Browser> {
    // Close browser if idle too long
    if (
      this.browser &&
      this.browser.connected &&
      Date.now() - this.lastUsed > this.IDLE_TIMEOUT
    ) {
      console.log("Browser idle too long, closing...");
      await this.closeBrowser();
    }

    // Return existing browser if connected
    if (this.browser && this.browser.connected) {
      this.lastUsed = Date.now();
      console.log("Reusing existing browser instance");
      return this.browser;
    }

    // Wait if browser is being launched
    if (this.isLaunching) {
      console.log("Waiting for browser to launch...");
      await new Promise((resolve) => setTimeout(resolve, 500));
      return this.getBrowser();
    }

    // Launch new browser
    this.isLaunching = true;
    try {
      console.log("Launching new browser instance...");

      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--disable-gpu",
          "--disable-software-rasterizer",
          "--disable-extensions",
          "--disable-background-networking",
          "--disable-default-apps",
          "--disable-sync",
          "--disable-translate",
          "--hide-scrollbars",
          "--metrics-recording-only",
          "--mute-audio",
          "--no-default-browser-check",
          "--safebrowsing-disable-auto-update",
          "--disable-client-side-phishing-detection",
        ],
        timeout: 120000, // 2 minutes timeout
        protocolTimeout: 120000,
      });

      this.lastUsed = Date.now();
      console.log("Browser launched successfully");

      // Handle unexpected disconnections
      this.browser.on("disconnected", () => {
        console.warn("⚠️ Browser disconnected unexpectedly");
        this.browser = null;
      });

      return this.browser;
    } catch (error) {
      console.error("❌ Failed to launch browser:", error);
      this.browser = null;
      throw error;
    } finally {
      this.isLaunching = false;
    }
  }

  static async closeBrowser(): Promise<void> {
    if (this.browser) {
      try {
        await this.browser.close();
        console.log("Browser closed successfully");
      } catch (error) {
        console.error("Error closing browser:", error);
      } finally {
        this.browser = null;
      }
    }
  }
}

// Cleanup on process exit
process.on("SIGINT", async () => {
  await BrowserManager.closeBrowser();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await BrowserManager.closeBrowser();
  process.exit(0);
});

process.on("exit", () => {
  console.log("Process exiting, cleaning up browser...");
});

// ========== HTML TEMPLATE GENERATOR ==========
const generateHTMLTemplate = (
  calculationResult: CalculationResult,
  fromName: string = "Edumate",
  customerDetails?: customerDetails
): string => {
  const { loanDetails, monthlySchedule } = calculationResult;
  const { years, months } = convertTenureInYears(loanDetails?.tenureYears);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number): string =>
    new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);

  const monthlyRows = monthlySchedule
    .map(
      (payment) => `
    <tr>
      <td class="text-center">${payment.month}</td>
      <td class="text-right">${formatCurrency(payment.emi)}</td>
      <td class="text-right">${formatCurrency(payment.principalPayment)}</td>
      <td class="text-right">${formatCurrency(payment.interestPayment)}</td>
      <td class="text-right">${formatCurrency(payment.remainingBalance)}</td>
    </tr>
  `
    )
    .join("");

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Loan Repayment Schedule - ${fromName}</title>
    <style>
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      
      body {
        font-family: Arial, Helvetica, sans-serif;
        font-size: 11px;
        line-height: 1.3;
        color: #333;
        background: #fff;
      }
      
      .document {
        max-width: 210mm;
        margin: 0 auto;
        background: white;
      }
      
      .company-header {
        background-color: #f0f4f8;
        padding: 25px;
        border-bottom: 3px solid #1a365d;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .company-info h1 {
        font-size: 32px;
        font-weight: 700;
        color: #1a365d;
        margin-bottom: 5px;
      }
      
      .logo {
        max-height: 70px;
        max-width: 200px;
      }
      
      .doc-info {
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
        padding: 0;
      }
      
      .doc-info-table {
        width: 100%;
        border-collapse: collapse;
      }
      
      .doc-info-table td {
        padding: 12px 25px;
        font-size: 10px;
        border-right: 1px solid #e2e8f0;
        vertical-align: top;
      }
      
      .doc-info-table td:last-child {
        border-right: none;
      }
      
      .doc-label {
        font-weight: 700;
        color: #64748b;
        text-transform: uppercase;
        margin-bottom: 3px;
      }
      
      .doc-value {
        font-weight: 600;
        color: #1e293b;
        font-size: 11px;
      }
      
      .content {
        padding: 25px;
      }
      
      .section {
        margin-bottom: 30px;
      }
      
      .section-header {
        background: #1e293b;
        color: white;
        padding: 8px 15px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        margin-bottom: 0;
      }
      
      .info-table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid #e2e8f0;
        font-size: 10px;
      }
      
      .info-table td {
        padding: 10px 15px;
        border-bottom: 1px solid #f1f5f9;
        border-right: 1px solid #f1f5f9;
      }
      
      .info-table td:last-child {
        border-right: none;
      }
      
      .info-table tr:last-child td {
        border-bottom: none;
      }
      
      .info-table tr:nth-child(even) {
        background: #f8fafc;
      }
      
      .info-label {
        font-weight: 600;
        color: #64748b;
        width: 30%;
        text-transform: uppercase;
        font-size: 9px;
      }
      
      .info-value {
        font-weight: 600;
        color: #1e293b;
        font-size: 11px;
      }
      
      .two-column {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0;
      }
      
      .two-column .info-table {
        border-right: none;
      }
      
      .two-column .info-table:first-child {
        border-right: 1px solid #e2e8f0;
      }
      
      .loan-details .info-table td {
        padding: 12px 15px;
      }
      
      .loan-details .info-value {
        text-align: right;
        font-size: 12px;
        font-weight: 700;
      }
      
      .schedule-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 10px;
        border: 1px solid #e2e8f0;
      }
      
      .schedule-table thead {
        background: #1e293b;
        color: white;
      }
      
      .schedule-table th {
        padding: 12px 8px;
        text-align: center;
        font-weight: 700;
        font-size: 9px;
        text-transform: uppercase;
        border-right: 1px solid rgba(255,255,255,0.1);
      }
      
      .schedule-table th:last-child {
        border-right: none;
      }
      
      .schedule-table td {
        padding: 8px;
        border-bottom: 1px solid #f1f5f9;
        border-right: 1px solid #f1f5f9;
        font-weight: 500;
      }
      
      .schedule-table td:last-child {
        border-right: none;
      }
      
      .schedule-table tbody tr:nth-child(even) {
        background: #f8fafc;
      }
      
      .text-center {
        text-align: center;
        font-weight: 600;
        color: #1e293b;
      }
      
      .text-right {
        text-align: right;
        font-weight: 600;
      }
      
      .footer {
        background: #f8fafc;
        border-top: 1px solid #e2e8f0;
        padding: 20px 25px;
        margin-top: 30px;
      }
      
      .footer-grid {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 30px;
        align-items: start;
      }
      
      .disclaimer {
        font-size: 9px;
        color: #64748b;
        line-height: 1.4;
      }
      
      .disclaimer strong {
        color: #1e293b;
      }
      
      .footer-brand {
        text-align: right;
        font-size: 9px;
        color: #1e293b;
        font-weight: 600;
        line-height: 1.4;
      }
      
      @page {
        margin: 15mm;
        size: A4;
      }
    </style>
  </head>
  <body>
    <div class="document">
      <div class="company-header">
        <div class="company-info">
            ${
              edumateLogo
                ? `<img src="${edumateLogo}" alt="${fromName}" class="logo" />`
                : `<h1>${fromName}</h1>`
            }
        </div>
        <div>
            <div style="font-size: 13px; color: #0f172a; font-weight: 600;">
                Education Loan Services
            </div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
                Your pathway to educational excellence
            </div>
        </div>
      </div>

      <div class="doc-info">
        <table class="doc-info-table">
          <tr>
            <td>
              <div class="doc-label">Document Type</div>
              <div class="doc-value">Loan Repayment Schedule</div>
            </td>
            <td>
              <div class="doc-label">Generated On</div>
              <div class="doc-value">
              ${new Date().toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })} - ${new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  })}
              </div>
            </td>
          </tr>
        </table>
      </div>

      <div class="content">
        ${
          customerDetails
            ? `
        <div class="section">
          <div class="section-header">Customer Information</div>
          <div class="two-column">
            <table class="info-table">
              <tr>
                <td class="info-label">Customer Name</td>
                <td class="info-value">${customerDetails?.name || "-"}</td>
              </tr>
              <tr>
                <td class="info-label">Customer ID</td>
                <td class="info-value">${customerDetails.customerId || "-"}</td>
              </tr>
              <tr>
                <td class="info-label">Agreement Number</td>
                <td class="info-value">${
                  customerDetails.agreementNumber || "-"
                }</td>
              </tr>
            </table>
            <table class="info-table">
              <tr>
                <td class="info-label">Mobile Number</td>
                <td class="info-value">${
                  customerDetails.mobileNumber || "-"
                }</td>
              </tr>
              <tr>
                <td class="info-label">Email ID</td>
                <td class="info-value">${customerDetails.email || "-"}</td>
              </tr>
              <tr>
                <td class="info-label">Address</td>
                <td class="info-value">${customerDetails.address || "-"}</td>
              </tr>
            </table>
          </div>
        </div>
        `
            : ""
        }

        <div class="section loan-details">
          <div class="section-header">Loan Details</div>
          <table class="info-table">
            <tr>
              <td class="info-label">Principal Amount</td>
              <td class="info-value">${formatCurrency(
                loanDetails.principal
              )}</td>
              <td class="info-label">Monthly EMI</td>
              <td class="info-value">${formatCurrency(
                loanDetails.monthlyEMI
              )}</td>
            </tr>
            <tr>
              <td class="info-label">Interest Rate (Annual)</td>
              <td class="info-value">${formatNumber(
                loanDetails.annualRate
              )}%</td>
              <td class="info-label">Total Amount Payable</td>
              <td class="info-value">${formatCurrency(
                loanDetails.totalAmount
              )}</td>
            </tr>
            <tr>
              <td class="info-label">Loan Tenure</td>
              <td class="info-value">${years} Years ${months} Months</td>
              <td class="info-label">Total Interest Payable</td>
              <td class="info-value">${formatCurrency(
                loanDetails.totalInterest
              )}</td>
            </tr>
          </table>
        </div>

        <div class="section">
          <div class="section-header">Monthly Repayment Schedule</div>
          <table class="schedule-table">
            <thead>
              <tr>
                <th>Installment No.</th>
                <th>EMI Amount</th>
                <th>Principal Component</th>
                <th>Interest Component</th>
                <th>Outstanding Balance</th>
              </tr>
            </thead>
            <tbody>
              ${monthlyRows}
            </tbody>
          </table>
        </div>
      </div>

      <div class="footer">
        <div class="footer-grid">
          <div class="disclaimer">
            <strong>Important Notice:</strong> This repayment schedule is based on the loan parameters provided and assumes consistent monthly payments. 
            Actual payments may vary based on your lender's specific terms and conditions, processing fees, and any prepayment options exercised. 
            Please refer to your loan agreement for official terms and conditions.
          </div>
          <div class="footer-brand">
            Generated by ${fromName}<br/>
            ${new Date().toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>
    </div>
  </body>
  </html>
`;
};

// ========== PDF GENERATOR ==========
export const generatePDF = async (
  calculationResult: CalculationResult,
  options: PDFGenerationOptions = {}
): Promise<{ buffer: Buffer; fileName: string }> => {
  const { fromName = "Edumate", requestId, customerDetails } = options;

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `repayment-schedule-${requestId || timestamp}.pdf`;

  let page: Page | null = null;

  try {
    console.log("Getting browser instance...");
    const browser = await BrowserManager.getBrowser();

    console.log("Creating new page...");
    page = await browser.newPage();

    // Set timeouts
    page.setDefaultNavigationTimeout(120000);
    page.setDefaultTimeout(120000);

    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });

    console.log("Generating HTML content...");
    const htmlContent = generateHTMLTemplate(
      calculationResult,
      fromName,
      customerDetails
    );

    console.log("Setting page content...");
    await page.setContent(htmlContent, {
      waitUntil: "networkidle0",
      timeout: 120000,
    });

    // Small delay for rendering
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("Generating PDF...");
    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: {
        top: "15mm",
        right: "15mm",
        bottom: "20mm",
        left: "15mm",
      },
      printBackground: true,
      displayHeaderFooter: true,
      footerTemplate: `
        <div style="font-size: 9px; color: #6c757d; text-align: center; width: 100%; margin: 0 15mm; font-family: Arial, sans-serif;">
          Page <span class="pageNumber"></span> of <span class="totalPages"></span>
        </div>
      `,
      headerTemplate: "<div></div>",
      preferCSSPageSize: true,
      timeout: 120000,
    });

    console.log("PDF generated successfully, size:", pdfBuffer.length, "bytes");

    return {
      buffer: Buffer.from(pdfBuffer),
      fileName,
    };
  } catch (error) {
    console.error("Error generating PDF:", error);

    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    throw new Error(
      `Failed to generate PDF: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  } finally {
    // Clean up page (but keep browser alive for reuse)
    if (page) {
      try {
        await page.close();
        console.log("Page closed successfully");
      } catch (closeError) {
        console.error("⚠️  Error closing page:", closeError);
      }
    }
  }
};

// Export browser manager for manual cleanup if needed
export { BrowserManager };
