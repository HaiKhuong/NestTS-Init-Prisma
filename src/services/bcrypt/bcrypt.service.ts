import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';

@Injectable()
export class BcryptService {
  private readonly salt: string;
  private readonly rounds: number;

  constructor(configService: ConfigService) {
    this.salt = configService.get('PASSWORD_SALT', '');
    this.rounds = 10;
  }

  async hash(data: string | Buffer) {
    const preHash = createHash('SHA256').update(data).update(this.salt).digest();
    const hash = await bcrypt.hash(preHash, this.rounds);
    return hash;
  }

  async compare(data: string | Buffer, encrypted: string) {
    const preHash = createHash('SHA256').update(data).update(this.salt).digest();
    const result = await bcrypt.compare(preHash, encrypted);
    return result;
  }
}
