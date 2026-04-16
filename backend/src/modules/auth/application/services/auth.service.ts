import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { randomUUID } from "crypto";
import { UserRepository } from "../../ports/repositories/user.repository";
import { Inject } from "@nestjs/common";

@Injectable()
export class AuthService {
  constructor(
    @Inject("UserRepository")
    private readonly userRepo: UserRepository,
    private readonly jwt: JwtService
  ) { }

  async login(dto: { username: string; password: string }) {
    console.log("DTO:", dto);

    const user = await this.userRepo.findByUsername(dto.username);
    console.log("USER:", user);

    if (!user) {
      console.log("Không tìm thấy user");
      throw new UnauthorizedException("Invalid credentials");
    }

    console.log("HASH TRONG DB:", user.passwordHash);

    const ok = await argon2.verify(user.passwordHash, dto.password);
    console.log("PASSWORD OK:", ok);

    if (!ok) {
      console.log("Sai mật khẩu");
      throw new UnauthorizedException("Invalid credentials");
    }

    // TẠM COMMENT ĐOẠN NÀY ĐỂ TRÁNH LỖI RELATION
    const permissions = [];

    const payload = {
      sub: user.id,
      username: user.username,
      permissions
    };

    const accessToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET ?? "change-me-access",
      expiresIn: (process.env.JWT_ACCESS_TTL ?? "15m") as any
    });

    const refreshToken = await this.jwt.signAsync(
      { sub: user.id, jti: randomUUID() },
      {
        secret: process.env.JWT_REFRESH_SECRET ?? "change-me-refresh",
        expiresIn: (process.env.JWT_REFRESH_TTL ?? "30d") as any
      }
    );

    await this.userRepo.saveRefreshToken(
      user.id,
      refreshToken,
      new Date(Date.now() + 30 * 24 * 3600 * 1000)
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        permissions
      }
    };
  }
}
/*   async login(dto: { username: string; password: string }) {
    const user = await this.userRepo.findByUsername(dto.username);

    if (!user) throw new UnauthorizedException("Invalid credentials");

    const ok = await argon2.verify(user.passwordHash, dto.password);
    if (!ok) throw new UnauthorizedException("Invalid credentials");

    const permissions = Array.from(new Set(
      user.user_roles.flatMap((ur) =>
        ur.roles.role_permissions.map((rp) => rp.permissions.code)
      )
    ));

    const payload = {
      sub: user.id,
      username: user.username,
      permissions
    };

    const accessToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET ?? "change-me-access",
      expiresIn: (process.env.JWT_ACCESS_TTL ?? "15m") as any
    });

    const refreshToken = await this.jwt.signAsync(
      { sub: user.id, jti: randomUUID() },
      {
        secret: process.env.JWT_REFRESH_SECRET ?? "change-me-refresh",
        expiresIn: (process.env.JWT_REFRESH_TTL ?? "30d") as any
      }
    );

    await this.userRepo.saveRefreshToken(
      user.id,
      refreshToken,
      new Date(Date.now() + 30 * 24 * 3600 * 1000)
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        permissions
      }
    };
  }
} */