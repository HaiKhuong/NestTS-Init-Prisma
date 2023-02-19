-- CreateTable
CREATE TABLE `Register_Code` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `code` VARCHAR(20) NOT NULL,
    `isUsed` BOOLEAN NOT NULL DEFAULT false,
    `expiredAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Register_Code_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Reset_Password_Token` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `token` VARCHAR(32) NOT NULL,
    `isUsed` BOOLEAN NOT NULL DEFAULT false,
    `expiredAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Reset_Password_Token_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(32) NOT NULL,
    `username` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `token` VARCHAR(255) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(32) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedBy` VARCHAR(32) NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedBy` VARCHAR(32) NULL,
    `profileId` VARCHAR(32) NULL,

    UNIQUE INDEX `User_profileId_key`(`profileId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Profile` (
    `id` VARCHAR(32) NOT NULL,
    `code` VARCHAR(32) NOT NULL,
    `email` VARCHAR(255) NULL,
    `phone` VARCHAR(20) NULL,
    `fullName` VARCHAR(255) NOT NULL,
    `idCardNumber` VARCHAR(255) NULL,
    `gender` ENUM('MALE', 'FEMALE', 'OTHER') NULL,
    `dateOfBirth` DATETIME(3) NULL,
    `nationality` VARCHAR(255) NULL,
    `address` TEXT NULL,
    `issueDate` DATETIME(3) NULL,
    `placeOfIssue` VARCHAR(255) NULL,
    `permanentResidence` VARCHAR(255) NULL,
    `socialLink` VARCHAR(255) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `language` ENUM('VI', 'EN') NOT NULL DEFAULT 'VI',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(32) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedBy` VARCHAR(32) NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedBy` VARCHAR(32) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Image` (
    `id` VARCHAR(32) NOT NULL,
    `name` TEXT NULL,
    `url` TEXT NOT NULL,
    `profileId` VARCHAR(32) NULL,

    UNIQUE INDEX `Image_profileId_key`(`profileId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `File` (
    `id` VARCHAR(32) NOT NULL,
    `name` TEXT NULL,
    `url` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `Profile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Image` ADD CONSTRAINT `Image_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `Profile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
