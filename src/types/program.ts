export interface TuitionFee {
  amount: number | null;
  currency: string | null;
  fee_period: string | null;
  is_range: boolean;
  amount_min: number | null;
  amount_max: number | null;
  fee_source_url: string | null;
  exact_quote: string | null;
  validated: boolean;
  match_method: string | null;
  match_score: number | null;
  confidence: string | null;
  currency_inferred: boolean;
  fee_type: string;
  per_credit_cost: number | null;
  total_estimated_cost: number | null;
  includes: string | null;
}

export interface Program {
  program_name: string;
  category: string | null;
  area_of_study: string | null;
  department: string | null;
  duration: string | null;
  credits_required: number | null;
  delivery_mode: string | null;
  url: string | null;
  tuition_fee: TuitionFee | null;
}

export interface PythonFetchResult {
  found: boolean;
  error?: boolean;
  university: string;
  degree_type: string;
  student_type: string;
  academic_year: string | null;
  country_code: string | null;
  default_currency: string | null;
  confidence: string | null;
  total_programs: number;
  source_urls: string[];
  notes: string | null;
  programs: Program[];
  reason?: string;
  error_message?: string;
  _meta?: {
    model?: string;
    time_seconds?: number;
    input_tokens?: number;
    output_tokens?: number;
    cache_read_tokens?: number;
    cache_write_tokens?: number;
    cost?: {
      input_cost?: number;
      output_cost?: number;
      cache_read_cost?: number;
      cache_write_cost?: number;
      total_usd?: number;
    };
    [key: string]: unknown;
  };
}

export interface FetchRequest {
  university: string;
  degree?: string;
  studentType?: string;
  forceRefresh?: boolean;
}

export interface FetchWarning {
  code: string;
  message: string;
  details?: string[];
}

export interface FetchResponse {
  success: boolean;
  cached: boolean;
  fetchedAt?: string;
  executionTimeMs?: number;
  data: PythonFetchResult | null;
  warnings: FetchWarning[];
}
