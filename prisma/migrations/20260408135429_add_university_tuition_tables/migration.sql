-- CreateTable: d_universities
CREATE TABLE IF NOT EXISTS d_universities (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    country_code CHAR(2),
    default_currency CHAR(3),
    website VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_d_universities_slug ON d_universities(slug);

-- CreateTable: f_program_fetch_runs
CREATE TABLE IF NOT EXISTS f_program_fetch_runs (
    id BIGSERIAL PRIMARY KEY,
    university_id BIGINT REFERENCES d_universities(id),
    university_name VARCHAR(500),
    degree_type VARCHAR(100),
    student_type VARCHAR(200),
    status VARCHAR(20) NOT NULL,
    programs_found INT DEFAULT 0,
    fees_validated INT DEFAULT 0,
    confidence VARCHAR(20),
    source_urls JSONB,
    notes TEXT,
    execution_time_ms INT,
    cost_usd DECIMAL(10, 4),
    error_message TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_f_fetch_runs_university ON f_program_fetch_runs(university_id, started_at DESC);

-- CreateTable: d_university_programs
CREATE TABLE IF NOT EXISTS d_university_programs (
    id BIGSERIAL PRIMARY KEY,
    university_id BIGINT NOT NULL REFERENCES d_universities(id) ON DELETE CASCADE,
    name VARCHAR(500) NOT NULL,
    slug VARCHAR(500) NOT NULL,
    degree_type VARCHAR(100) NOT NULL,
    student_type VARCHAR(50) NOT NULL,
    academic_year VARCHAR(100),
    category VARCHAR(100),
    area_of_study VARCHAR(100),
    department VARCHAR(500),
    duration VARCHAR(100),
    credits_required INT,
    delivery_mode VARCHAR(200),
    program_url TEXT,
    fee_amount BIGINT,
    fee_amount_min BIGINT,
    fee_amount_max BIGINT,
    fee_is_range BOOLEAN DEFAULT FALSE,
    fee_currency CHAR(3),
    fee_currency_inferred BOOLEAN DEFAULT FALSE,
    fee_period VARCHAR(200),
    fee_per_credit_cost BIGINT,
    fee_total_estimated_cost BIGINT,
    fee_includes VARCHAR(100),
    fee_source_url TEXT,
    fee_exact_quote TEXT,
    fee_type VARCHAR(200) DEFAULT 'tuition',
    fee_validated BOOLEAN DEFAULT FALSE,
    fee_match_method VARCHAR(200),
    fee_match_score INT,
    fee_confidence VARCHAR(100),
    manual_override BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    fetch_run_id BIGINT,
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (university_id, slug, degree_type, student_type)
);
CREATE INDEX IF NOT EXISTS idx_d_programs_lookup ON d_university_programs(university_id, degree_type, student_type) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_d_programs_expires ON d_university_programs(expires_at) WHERE is_active = TRUE;

-- AddForeignKey: d_university_programs -> f_program_fetch_runs
ALTER TABLE d_university_programs
    ADD CONSTRAINT fk_programs_fetch_run
    FOREIGN KEY (fetch_run_id) REFERENCES f_program_fetch_runs(id);
