import { Prisma } from '@prisma/client';

export const userDownloadSelect: Prisma.UserSelect = {
  username: true,
  status: true,
  profile: {
    select: {
      fullName: true,
      code: true,
      email: true,
      phone: true,
    },
  },
};
