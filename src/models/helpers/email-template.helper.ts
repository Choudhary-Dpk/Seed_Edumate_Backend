import prisma from "../../config/prisma";
import { EmailTemplateCategory } from "@prisma/client";

// ============================================================================
// UTILITY: Extract dynamic variables from template HTML
// ============================================================================

/**
 * Extracts all {%variableName%} placeholders from template content (html + subject).
 * Returns unique variable names, excluding system variables like currentYear.
 */
export const extractTemplateVariables = (
  html_content: string,
  subject?: string,
): string[] => {
  const systemVars = new Set(["currentYear"]);
  const varSet = new Set<string>();
  const regex = /\{%(\w[\w-]*)%\}/g;

  let match;
  while ((match = regex.exec(html_content)) !== null) {
    if (!systemVars.has(match[1])) {
      varSet.add(match[1]);
    }
  }

  if (subject) {
    while ((match = regex.exec(subject)) !== null) {
      if (!systemVars.has(match[1])) {
        varSet.add(match[1]);
      }
    }
  }

  return Array.from(varSet);
};

// ============================================================================
// TYPES
// ============================================================================

export interface CreateEmailTemplateInput {
  slug: string;
  name: string;
  subject: string;
  html_content: string;
  variables?: Record<string, string>[];
  category?: EmailTemplateCategory;
  created_by?: number;
}

export interface UpdateEmailTemplateInput {
  name?: string;
  subject?: string;
  html_content?: string;
  variables?: Record<string, string>[];
  category?: EmailTemplateCategory;
  is_active?: boolean;
  updated_by?: number;
}

export interface EmailTemplateFilters {
  search?: string;
  category?: EmailTemplateCategory;
  is_active?: boolean;
  page?: number;
  size?: number;
}

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

export const createEmailTemplate = async (data: CreateEmailTemplateInput) => {
  return prisma.emailTemplate.create({
    data: {
      slug: data.slug,
      name: data.name,
      subject: data.subject,
      html_content: data.html_content,
      variables: data.variables || [],
      category: data.category || "TRANSACTIONAL",
      created_by: data.created_by,
      updated_by: data.created_by,
    },
  });
};

export const getEmailTemplateById = async (id: number) => {
  return prisma.emailTemplate.findFirst({
    where: { id, is_deleted: false },
  });
};

export const getEmailTemplateBySlug = async (slug: string) => {
  return prisma.emailTemplate.findFirst({
    where: { slug, is_deleted: false, is_active: true },
  });
};

export const listEmailTemplates = async (filters: EmailTemplateFilters) => {
  const page = filters.page || 1;
  const size = filters.size || 20;
  const skip = (page - 1) * size;

  const where: any = { is_deleted: false };

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.is_active !== undefined) {
    where.is_active = filters.is_active;
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { slug: { contains: filters.search, mode: "insensitive" } },
      { subject: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [templates, total] = await Promise.all([
    prisma.emailTemplate.findMany({
      where,
      skip,
      take: size,
      orderBy: { updated_at: "desc" },
      select: {
        id: true,
        slug: true,
        name: true,
        subject: true,
        variables: true,
        category: true,
        is_active: true,
        created_by: true,
        updated_by: true,
        created_at: true,
        updated_at: true,
      },
    }),
    prisma.emailTemplate.count({ where }),
  ]);

  return {
    templates,
    pagination: {
      page,
      size,
      total,
      total_pages: Math.ceil(total / size),
    },
  };
};

export const updateEmailTemplate = async (
  id: number,
  data: UpdateEmailTemplateInput,
) => {
  return prisma.emailTemplate.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.subject !== undefined && { subject: data.subject }),
      ...(data.html_content !== undefined && { html_content: data.html_content }),
      ...(data.variables !== undefined && { variables: data.variables }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.is_active !== undefined && { is_active: data.is_active }),
      ...(data.updated_by !== undefined && { updated_by: data.updated_by }),
    },
  });
};

export const softDeleteEmailTemplate = async (
  id: number,
  updated_by?: number,
) => {
  return prisma.emailTemplate.update({
    where: { id },
    data: {
      is_deleted: true,
      is_active: false,
      updated_by,
    },
  });
};
