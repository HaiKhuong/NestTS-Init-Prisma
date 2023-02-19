import { Prisma } from '@prisma/client';

export const usersSelect: Prisma.UserSelect = {
  id: true,
  username: true,
  status: true,
  profile: {
    select: {
      id: true,
      address: true,
      code: true,
      dateOfBirth: true,
      email: true,
      fullName: true,
      idCardNumber: true,
      gender: true,
      issueDate: true,
      nationality: true,
      phone: true,
      status: true,
      avatar: {
        select: {
          url: true,
          name: true,
        },
      },
    },
  },
};
