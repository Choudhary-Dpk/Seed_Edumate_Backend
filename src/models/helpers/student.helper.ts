import prisma from "../../config/prisma";

export const createStudentUser = async (
  contactId: number,
  email: string,
  phone?: string,
  fullName?: string
) => {
  const existing = await prisma.contactUsers.findUnique({
    where: { phone },
  });

  if (existing) return existing;

  return await prisma.contactUsers.create({
    data: {
      email,
      phone,
      full_name: fullName,
      contact_id: contactId,
      source: "webportal",
      password_hash: null, // because signup without password (OTP login)
      favourite: [],
      interested: [],
    },
  });
};

export const findStudentByPhoneNumber = async (phone_number: string) => {
  const student = await prisma.contactUsers.findFirst({
    where: {
      phone: phone_number,
      is_active: true,
    },
    select: {
      id: true,
      contact_id: true,
      email: true,
      full_name: true,
      phone: true,
      is_active: true,
      favourite: true,
      interested: true,
      source: true,
      created_at: true,
      updated_at: true,
    },
  });

  // Check if student exists
  if (!student) {
    throw new Error("Student not found with this phone number");
  }

  // Check if contact_id exists
  if (!student.contact_id) {
    throw new Error("Contact information not linked to this student");
  }

  // Fetch contact with personal information
  const contactData = await prisma.hSEdumateContacts.findUnique({
    where: {
      id: student.contact_id,
      is_deleted: false,
    },
    select: {
      id: true,
      email: true,
      seed_contact: true,
      course_type: true,
      base_currency: true,
      study_destination_currency: true,
      user_selected_currency: true,
      hs_object_id: true,
      is_active: true,
      source: true,
      created_at: true,
      updated_at: true,
      personal_information: {
        select: {
          first_name: true,
          last_name: true,
          phone_number: true,
          date_of_birth: true,
          gender: true,
          nationality: true,
          current_address: true,
          city_current_address: true,
          state_current_address: true,
          country_current_address: true,
          pincode_current_address: true,
          permanent_address: true,
          city_permanent_address: true,
          state_permanent_address: true,
          country_permanent_address: true,
          pincode_permanent_address: true,
        },
      },
    },
  });

  // Check if contact exists
  if (!contactData) {
    throw new Error("Contact not found or has been deleted");
  }

  // Flatten personal information into contact object
  const { personal_information, ...contactBase } = contactData;

  const contact = {
    ...contactBase,
    ...personal_information,
  };

  return {
    student,
    contact,
  };
};

export const getStudentProfileById = async (student_id: number) => {
  // Find student by ID
  const student = await prisma.contactUsers.findUnique({
    where: {
      id: student_id,
      is_active: true,
    },
    select: {
      id: true,
      contact_id: true,
      email: true,
      full_name: true,
      phone: true,
      is_active: true,
      favourite: true,
      interested: true,
      source: true,
      created_at: true,
      updated_at: true,
    },
  });

  // Check if student exists
  if (!student) {
    throw new Error("Student not found with this ID");
  }

  // Check if student is active
  if (!student.is_active) {
    throw new Error("Student account is inactive");
  }

  // Check if contact_id exists
  if (!student.contact_id) {
    throw new Error("Contact information not linked to this student");
  }

  // Fetch contact with personal information
  const contactData = await prisma.hSEdumateContacts.findUnique({
    where: {
      id: student.contact_id,
      is_deleted: false,
    },
    select: {
      id: true,
      email: true,
      seed_contact: true,
      course_type: true,
      base_currency: true,
      study_destination_currency: true,
      user_selected_currency: true,
      hs_object_id: true,
      is_active: true,
      source: true,
      created_at: true,
      updated_at: true,
      personal_information: {
        select: {
          first_name: true,
          last_name: true,
          phone_number: true,
          date_of_birth: true,
          gender: true,
          nationality: true,
          current_address: true,
          city_current_address: true,
          state_current_address: true,
          country_current_address: true,
          pincode_current_address: true,
          permanent_address: true,
          city_permanent_address: true,
          state_permanent_address: true,
          country_permanent_address: true,
          pincode_permanent_address: true,
        },
      },
    },
  });

  // Check if contact exists
  if (!contactData) {
    throw new Error("Contact not found or has been deleted");
  }

  // Flatten personal information into contact object
  const { personal_information, ...contactBase } = contactData;

  const contact = {
    ...contactBase,
    ...personal_information,
  };

  return {
    student,
    contact,
  };
};

// Validate loan product IDs
export const validateLoanProductIds = async (
  productIds: number[]
): Promise<{ valid: number[]; invalid: number[] }> => {
  if (!productIds || productIds.length === 0) {
    return { valid: [], invalid: [] };
  }

  // Fetch all valid loan products
  const validProducts = await prisma.hSLoanProducts.findMany({
    where: {
      id: { in: productIds },
      is_deleted: false,
      is_active: true,
    },
    select: {
      id: true,
    },
  });

  const validIds = validProducts.map((product) => product.id);
  const invalidIds = productIds.filter((id) => !validIds.includes(id));

  return {
    valid: validIds,
    invalid: invalidIds,
  };
};

// Get student with contact_id - Returns contact_id as number (not null)
export const getStudentForUpdate = async (student_id: number) => {
  const student = await prisma.contactUsers.findUnique({
    where: {
      id: student_id,
      is_active: true,
    },
    select: {
      id: true,
      contact_id: true,
      favourite: true,
      interested: true,
      is_active: true,
    },
  });

  if (!student) {
    throw new Error("Student not found with this ID");
  }

  if (!student.is_active) {
    throw new Error("Student account is inactive");
  }

  if (!student.contact_id) {
    throw new Error("Contact information not linked to this student");
  }

  // Return with contact_id as number (TypeScript knows it's not null here)
  return {
    id: student.id,
    contact_id: student.contact_id as number, // Type assertion since we checked above
    favourite: student.favourite,
    interested: student.interested,
    is_active: student.is_active,
  };
};

// Update student favourite and interested
export const updateStudentFavouriteInterested = async (
  student_id: number,
  favourite?: number[],
  interested?: number[]
) => {
  const updateData: any = {};

  if (favourite !== undefined) {
    updateData.favourite = favourite;
  }

  if (interested !== undefined) {
    updateData.interested = interested;
  }

  if (Object.keys(updateData).length === 0) {
    return null;
  }

  const updatedStudent = await prisma.contactUsers.update({
    where: { id: student_id },
    data: updateData,
    select: {
      id: true,
      contact_id: true,
      email: true,
      full_name: true,
      phone: true,
      is_active: true,
      favourite: true,
      interested: true,
      source: true,
      created_at: true,
      updated_at: true,
    },
  });

  return updatedStudent;
};

// Fetch updated student and contact data
export const getUpdatedStudentProfile = async (
  student_id: number,
  contact_id: number
) => {
  // Fetch student
  const student = await prisma.contactUsers.findUnique({
    where: { id: student_id },
    select: {
      id: true,
      contact_id: true,
      email: true,
      full_name: true,
      phone: true,
      is_active: true,
      favourite: true,
      interested: true,
      source: true,
      created_at: true,
      updated_at: true,
    },
  });

  // Fetch contact with personal information
  const contactData = await prisma.hSEdumateContacts.findUnique({
    where: {
      id: contact_id,
      is_deleted: false,
    },
    select: {
      id: true,
      email: true,
      seed_contact: true,
      course_type: true,
      base_currency: true,
      study_destination_currency: true,
      user_selected_currency: true,
      hs_object_id: true,
      is_active: true,
      source: true,
      created_at: true,
      updated_at: true,
      personal_information: {
        select: {
          first_name: true,
          last_name: true,
          phone_number: true,
          date_of_birth: true,
          gender: true,
          nationality: true,
          current_address: true,
          city_current_address: true,
          state_current_address: true,
          country_current_address: true,
          pincode_current_address: true,
          permanent_address: true,
          city_permanent_address: true,
          state_permanent_address: true,
          country_permanent_address: true,
          pincode_permanent_address: true,
        },
      },
    },
  });

  // Flatten personal information
  const { personal_information, ...contactBase } = contactData || {};

  const contact = {
    ...contactBase,
    ...personal_information,
  };

  return {
    student,
    contact,
  };
};

// Update ContactUsers fields (email, full_name, phone, favourite, interested)
export const updateContactUser = async (
  student_id: number,
  updateData: {
    email?: string;
    full_name?: string;
    phone?: string;
    favourite?: number[];
    interested?: number[];
  }
) => {
  const data: any = {};

  if (updateData.email !== undefined) {
    data.email = updateData.email;
  }

  if (updateData.full_name !== undefined) {
    data.full_name = updateData.full_name;
  }

  if (updateData.phone !== undefined) {
    data.phone = updateData.phone;
  }

  if (updateData.favourite !== undefined) {
    data.favourite = updateData.favourite;
  }

  if (updateData.interested !== undefined) {
    data.interested = updateData.interested;
  }

  if (Object.keys(data).length === 0) {
    return null;
  }

  const updatedStudent = await prisma.contactUsers.update({
    where: { id: student_id },
    data: data,
    select: {
      id: true,
      contact_id: true,
      email: true,
      full_name: true,
      phone: true,
      is_active: true,
      favourite: true,
      interested: true,
      source: true,
      created_at: true,
      updated_at: true,
    },
  });

  return updatedStudent;
};