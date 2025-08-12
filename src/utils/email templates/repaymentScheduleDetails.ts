import { config } from "../../config/config";


const edumateLogo = config?.edumate?.logo;

/**
 * Main function to generate clean EMI repayment schedule email HTML
 */
export const generateEMIRepaymentScheduleEmail = (name: string): string => {
  const companyName = "Edumate";
  const currentYear = new Date().getFullYear();

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your EMI Repayment Schedule - ${companyName}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        body { 
          margin: 0; 
          padding: 0; 
          font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; 
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); 
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        .email-container { 
          max-width: 700px; 
          margin: 0 auto; 
          background: #ffffff; 
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #e0f2fe;
        }
        
        @media only screen and (max-width: 640px) {
          .email-container { 
            width: 100% !important; 
            margin: 0 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            border: none !important;
          }
          
          .mobile-padding { 
            padding: 20px !important; 
          }
          
          .mobile-text { 
            font-size: 16px !important; 
          }
        }
      </style>
    </head>
    <body>
      <div style="padding: 32px 16px; min-height: 100vh;">
        <div class="email-container">
          <!-- Header with Logo -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="background: linear-gradient(135deg, rgba(222, 156, 111, 0.12) 0%, rgba(102, 153, 220, 0.59) 100%); padding: 32px 40px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="vertical-align: middle;">
                      <!-- Logo Image -->
                      <img src="${edumateLogo}" alt="${companyName}" style="height: 48px; width: auto; display: block; filter: brightness(1.1);" />
                    </td>
                    <td style="text-align: right; vertical-align: middle;">
                      <div style="font-size: 13px; color: #0f172a; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 600;">
                        Education Loan Services
                      </div>
                      <div style="font-size: 11px; color: #0f172aae; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; margin-top: 2px;">
                        Your pathway to educational excellence
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Main Content -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td class="mobile-padding" style="padding: 40px; background: #f0f9ff;">
                <!-- Greeting -->
                <div style="margin-bottom: 32px;">
                  <h2 style="margin: 0 0 12px 0; font-size: 22px; color: #0f172a; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 700;">
                    Dear ${name || 'Customer'},
                  </h2>
                  <p class="mobile-text" style="margin: 0; font-size: 16px; color: #64748b; line-height: 1.6; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 400;">
                    Your EMI calculation is complete. Please find your detailed repayment schedule attached as a PDF document.
                  </p>
                </div>

                <!-- Closing Message -->
                <div style="background: #ffffff; border: 1px solid #e0f2fe; border-radius: 12px; padding: 32px; text-align: center; box-shadow: 0 4px 16px rgba(0,0,0,0.08);">
                  <p style="margin: 0 0 16px 0; font-size: 16px; color: #0f172a; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 600; line-height: 1.5;">
                    The attached PDF contains your complete payment breakdown with monthly EMI details, interest calculations, and outstanding balances.
                  </p>
                  <p style="margin: 0; font-size: 15px; color: #64748b; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; font-weight: 500;">
                    If you have any questions about your calculation, please don't hesitate to contact our support team.
                  </p>
                </div>
              </td>
            </tr>
          </table>

          <!-- Footer -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="background: linear-gradient(135deg, rgba(222, 156, 111, 0.12) 0%, rgba(102, 153, 220, 0.59) 100%); padding: 32px 40px;">
                <p style="margin: 0 0 16px 0; font-size: 13px; color: #0f172a; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 500;">
                  © ${currentYear} ${companyName}. All rights reserved.
                </p>
                <p style="margin: 0 0 20px 0; font-size: 12px; color: #0f172aae; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.5;">
                  This email contains your EMI calculation results. The attached PDF is for informational purposes only and does not constitute a loan offer.
                </p>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </body>
    </html>
  `;
};