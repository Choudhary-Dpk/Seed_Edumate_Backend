import prisma from "../../config/prisma";

export const createTestimonial = async (data: any) => {
  const result = await prisma.testimonials.create({
    data: {
      name: data.name || null,
      university: data.university || null,
      country: data.country || null,
      course: data.course || null,
      loan_amount: data.loanAmount,
      rating: data.rating || 5,
      quote: data.quote || null,
      image: data.image || null,
    },
  });

  return result;
};

export const getTestimonials = async (limit: number, offset: number) => {
  const where = { is_deleted: false };

  const [rows, count] = await Promise.all([
    prisma.testimonials.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { created_at: "desc" },
    }),
    prisma.testimonials.count({ where }),
  ]);

  return {
    rows,
    count,
  };
};

// Get by ID
export const getTestimonialById = async (id: number) => {
  const record = await prisma.testimonials.findFirst({
    where: { id, is_deleted: false },
  });

  return record;
};

// Update
export const updateTestimonial = async (id: number, data: any) => {
  const result = await prisma.testimonials.update({
    where: { id },
    data: {
      name: data.name,
      university: data.university,
      country: data.country,
      course: data.course,
      loan_amount: data.loanAmount,
      rating: data.rating,
      quote: data.quote,
      image: data.image,
      is_active: data.is_active,
    },
  });

  return result;
};

// Delete (soft)
export const deleteTestimonial = async (id: number) => {
  return prisma.testimonials.update({
    where: { id },
    data: { is_deleted: true },
  });
};
