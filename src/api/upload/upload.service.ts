import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Language } from '@prisma/client';
import { PrismaService } from '@services';
import { IMAGE_REGEX, t } from '@utils';
import { S3 } from 'aws-sdk';
import * as fs from 'fs';
import * as PATH from 'path';

const bucket_region: string | undefined = process.env.AWS_S3_BUCKET_REGION;
const bucket_name: string = process.env.AWS_S3_BUCKET_NAME || '';
const folder_name: string = process.env.AWS_S3_FOLDER_NAME || '';

const s3 = new S3({
  apiVersion: '2006-03-01',
  region: bucket_region,
});

@Injectable()
export class UploadService {
  constructor(private readonly prismaService: PrismaService) {}

  async uploadImage(file, language?: Language) {
    if (!file) throw new BadRequestException(t('DATA_NOT_FOUND', language));
    if (!file.mimetype.match(IMAGE_REGEX)) {
      throw new BadRequestException(t('IMAGE_NOT_FORMAT', language));
    }
    if (file.size > process.env.MAX_SIZE) {
      throw new BadRequestException(t('MAX_SIZE_WARNING', language));
    }

    const fileName = `${new Date().getTime()}_${file.originalname}`;
    const params: S3.PutObjectRequest = {
      Bucket: bucket_name,
      Key: `${folder_name}/${fileName}`,
      Body: file.buffer,
      ACL: 'public-read',
      ContentType: file.mimetype,
    };

    try {
      const res = await s3.upload(params).promise();
      return await this.prismaService.image.create({
        data: {
          name: fileName,
          url: res.Location,
        },
        select: {
          id: true,
          name: true,
          url: true,
        },
      });
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async uploadFileWithPath(path: string) {
    try {
      const fileName = `${new Date().getTime()}_${PATH.basename(path)}`;
      const file = fs.readFileSync(path);
      const params: S3.PutObjectRequest = {
        Bucket: bucket_name,
        Key: `${folder_name}/${fileName}`,
        Body: file,
        ACL: 'public-read',
      };

      const res = await s3.upload(params).promise();
      if (res.Location) {
        // remove file
        fs.unlinkSync(path);
      }
      return await this.prismaService.image.create({
        data: {
          name: fileName,
          url: res.Location,
        },
        select: {
          id: true,
          name: true,
          url: true,
        },
      });
    } catch (error) {
      return null;
    }
  }

  async uploadFileWithBuffer(file: Buffer, fileName: string) {
    try {
      const params: S3.PutObjectRequest = {
        Bucket: bucket_name,
        Key: `${folder_name}/${fileName}`,
        Body: file,
        ACL: 'public-read',
      };

      const res = await s3.upload(params).promise();
      return await this.prismaService.image.create({
        data: {
          name: fileName,
          url: res.Location,
        },
        select: {
          id: true,
          name: true,
          url: true,
        },
      });
    } catch (error) {
      return null;
    }
  }

  async uploadFile(file, language?: Language) {
    if (!file) throw new BadRequestException(t('DATA_NOT_FOUND', language));
    if (file.size > process.env.MAX_SIZE) {
      throw new BadRequestException(t('MAX_SIZE_WARNING', language));
    }

    const fileName = `${new Date().getTime()}_${file.originalname}`;
    const params: S3.PutObjectRequest = {
      Bucket: bucket_name,
      Key: `${folder_name}/${fileName}`,
      Body: file.buffer,
      ACL: 'public-read',
      ContentType: file.mimetype,
    };

    try {
      const res = await s3.upload(params).promise();
      return await this.prismaService.file.create({
        data: {
          name: fileName,
          url: res.Location,
        },
        select: {
          id: true,
          name: true,
          url: true,
        },
      });
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async delete(id: string, language?: Language) {
    const imageId = await this.prismaService.image.findFirst({ where: { id } });
    if (!imageId) throw new NotFoundException(t('IMAGE_NOT_FOUND', language));

    try {
      await s3
        .deleteObject({
          Bucket: bucket_name,
          Key: `${folder_name}/${imageId.name}`,
        })
        .promise();
      await this.prismaService.image.delete({ where: { id } });
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
