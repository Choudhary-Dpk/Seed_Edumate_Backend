import Papa from "papaparse";
import { Response } from "express";

/**
 * Export key metrics to CSV using PapaParse
 */
export const exportKeyMetricsToCSV = (data: any, res: Response) => {
  const csvData = [
    {
      Period: `${data.period.start_month}/${data.period.start_year} - ${data.period.end_month}/${data.period.end_year}`,
      "Total Partners": data.total_partners,
      "Active Partners": data.active_partners_in_period,
      Leads: data.leads,
      Applications: data.applications,
      Approvals: data.approvals,
      Disbursements: data.disbursements,
      "Requested Amount": data.requested_amount,
      "Approved Amount": data.approved_amount,
      "Disbursed Amount": data.disbursed_amount,
      "Conversion Rate (%)": data.conversion_rate,
    },
  ];

  // Add comparison row if exists
  if (data.comparison) {
    csvData.push({
      Period: `${data.comparison.period.start_month}/${data.comparison.period.start_year} - ${data.comparison.period.end_month}/${data.comparison.period.end_year} (Comparison)`,
      "Total Partners": "",
      "Active Partners": "",
      Leads: data.comparison.metrics.leads,
      Applications: data.comparison.metrics.applications,
      Approvals: data.comparison.metrics.approvals,
      Disbursements: data.comparison.metrics.disbursements,
      "Requested Amount": "",
      "Approved Amount": "",
      "Disbursed Amount": "",
      "Conversion Rate (%)": data.comparison.metrics.conversion_rate,
    });

    csvData.push({
      Period: "Growth (%)",
      "Total Partners": "",
      "Active Partners": "",
      Leads: data.comparison.growth.leads,
      Applications: data.comparison.growth.applications,
      Approvals: data.comparison.growth.approvals,
      Disbursements: data.comparison.growth.disbursements,
      "Requested Amount": data.comparison.growth.requested_amount,
      "Approved Amount": data.comparison.growth.approved_amount,
      "Disbursed Amount": data.comparison.growth.disbursed_amount,
      "Conversion Rate (%)": data.comparison.growth.conversion_rate,
    });
  }

  const csv = Papa.unparse(csvData);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=key-metrics-${Date.now()}.csv`
  );
  res.send(csv);
};

/**
 * Export top partners to CSV
 */
export const exportTopPartnersToCSV = (data: any, res: Response) => {
  const csvData = data.partners.map((partner: any) => ({
    "Partner ID": partner.partner_id,
    "Partner Name": partner.partner_name,
    Leads: partner.total_leads,
    "Applications Initiated": partner.applications_initiated,
    "Applications Approved": partner.applications_approved,
    Disbursements: partner.disbursements_initiated,
    "Requested Amount": partner.total_requested_amount,
    "Approved Amount": partner.total_approved_amount,
    "Disbursed Amount": partner.total_disbursement_amount,
    "Conversion Rate (%)": partner.conversion_rate,
  }));

  const csv = Papa.unparse(csvData);

  const periodLabel = `${data.period.start_month}-${data.period.start_year}_${data.period.end_month}-${data.period.end_year}`;

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=top-partners-${periodLabel}.csv`
  );
  res.send(csv);
};

/**
 * Export monthly trends to CSV
 */
export const exportMonthlyTrendsToCSV = (data: any[], res: Response) => {
  const csvData = data.map((trend) => ({
    Month: trend.month_name,
    Year: trend.year,
    Leads: trend.leads,
    Applications: trend.applications,
    Approvals: trend.approvals,
    Disbursements: trend.disbursements,
    "Requested Amount": trend.requested_amount,
    "Approved Amount": trend.approved_amount,
    "Disbursed Amount": trend.disbursed_amount,
    "Conversion Rate (%)": trend.conversion_rate,
    "Partners Count": trend.partners_count,
  }));

  const csv = Papa.unparse(csvData);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=monthly-trends-${Date.now()}.csv`
  );
  res.send(csv);
};

/**
 * Export pipeline status to CSV
 */
export const exportPipelineStatusToCSV = (data: any, res: Response) => {
  const csvData = data.pipeline.map((status: any) => ({
    Status: status.label,
    Count: status.count,
    "Percentage (%)": status.percentage,
  }));

  const csv = Papa.unparse(csvData);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=pipeline-status-${Date.now()}.csv`
  );
  res.send(csv);
};