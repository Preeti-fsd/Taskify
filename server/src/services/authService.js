import { AppError } from "../errors/AppError.js";
import { authRepository, adminRepository } from "../repositories/authRepository.js";
import { emailService } from "./emailService.js";
import {
  generateOtp,
  hashPassword,
  hashValue,
  signToken,
  verifyPassword,
} from "../utils/security.js";
import { env } from "../config/env.js";

const authTokenFor = (user, role) =>
  signToken(
    {
      sub: String(user.id),
      role,
      email: user.email,
      name: user.name || null,
    },
    1000 * 60 * 60 * 24 * 7,
  );

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  verified: Boolean(user.verified),
});

const isAdminEmail = (email) => env.adminEmails.includes(String(email || "").toLowerCase());

const resolveAdminSessionUser = async (admin) => {
  const existingUser = await authRepository.findUserByEmail(admin.email);

  if (existingUser) {
    return authRepository.upsertVerifiedUser({
      name: existingUser.name || "Administrator",
      email: existingUser.email,
      passwordHash: admin.password_hash,
    });
  }

  return authRepository.upsertVerifiedUser({
    name: "Administrator",
    email: admin.email,
    passwordHash: admin.password_hash,
  });
};

export const authService = {
  async signup({ name, email, password }) {
    if (!name?.trim() || !email?.trim() || !password) {
      throw new AppError("Name, email, and password are required.", 400);
    }

    if (!emailService.isEnabled()) {
      throw new AppError("Email service is not configured.", 503);
    }

    const existing = await authRepository.findUserByEmail(email.toLowerCase());
    if (existing) {
      throw new AppError("An account with this email already exists.", 409);
    }

    const otp = generateOtp();
    const otpHash = hashValue(otp);
    const passwordHash = hashPassword(password);
    const user = await authRepository.createUser({
      name: name.trim(),
      email: email.toLowerCase(),
      passwordHash,
      otpHash,
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await emailService.sendOtpEmail({
      to: user.email,
      name: user.name,
      otp,
    });

    return {
      user: publicUser(user),
      verificationRequired: true,
      message: "Verification code sent to your email.",
    };
  },

  async verifyOtp({ email, otp }) {
    if (!email?.trim() || !otp?.trim()) {
      throw new AppError("Email and OTP are required.", 400);
    }

    const user = await authRepository.findUserByEmail(email.toLowerCase());
    if (!user) {
      throw new AppError("User not found.", 404);
    }

    const matches = await authRepository.verifyOtp(user.email, hashValue(otp.trim()));
    if (!matches) {
      throw new AppError("Invalid or expired OTP.", 400);
    }

    await authRepository.markUserVerified(user.email);
    const nextUser = await authRepository.findUserByEmail(user.email);
    return {
      user: publicUser(nextUser),
      token: authTokenFor(nextUser, "user"),
      role: "user",
    };
  },

  async login({ email, password }) {
    if (!email?.trim() || !password) {
      throw new AppError("Email and password are required.", 400);
    }

    const user = await authRepository.findUserByEmail(email.toLowerCase());
    if (user && verifyPassword(password, user.password_hash)) {
      await authRepository.updateLastLogin(user.email);

      if (isAdminEmail(user.email)) {
        const adminUser = await resolveAdminSessionUser({
          email: user.email,
          password_hash: user.password_hash,
        });
        return {
          user: publicUser(adminUser),
          token: authTokenFor(adminUser, "admin"),
          role: "admin",
        };
      }

      if (!user.verified) {
        throw new AppError("Please verify your email before logging in.", 403);
      }

      return {
        user: publicUser(user),
        token: authTokenFor(user, "user"),
        role: "user",
      };
    }

    const admin = await adminRepository.findAdminByEmail(email.toLowerCase());
    if ((!admin || !verifyPassword(password, admin.password_hash)) && !isAdminEmail(email.toLowerCase())) {
      throw new AppError("Invalid email or password.", 401);
    }

    const adminUser = await resolveAdminSessionUser(
      admin || {
        email: email.toLowerCase(),
        password_hash: user?.password_hash || hashPassword(password),
      },
    );
    await authRepository.updateLastLogin(adminUser.email);
    return {
      user: publicUser(adminUser),
      token: authTokenFor(adminUser, "admin"),
      role: "admin",
    };
  },

  async forgotPassword({ email }) {
    if (!email?.trim()) {
      throw new AppError("Email is required.", 400);
    }

    if (!emailService.isEnabled()) {
      throw new AppError("Email service is not configured.", 503);
    }

    const user = await authRepository.findUserByEmail(email.toLowerCase());
    if (!user) {
      return { message: "If the email exists, a reset link has been sent." };
    }

    const resetToken = signToken(
      { sub: String(user.id), email: user.email, purpose: "password-reset" },
      1000 * 60 * 30,
    );

    await authRepository.storeResetToken(
      user.email,
      hashValue(resetToken),
      new Date(Date.now() + 30 * 60 * 1000),
    );

    const resetUrl = `${env.frontendUrl}/reset-password?token=${encodeURIComponent(resetToken)}&email=${encodeURIComponent(user.email)}`;

    await emailService.sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl,
    });

    return { message: "If the email exists, a reset link has been sent." };
  },

  async resetPassword({ token, password }) {
    if (!token?.trim() || !password) {
      throw new AppError("Reset token and new password are required.", 400);
    }

    const tokenHash = hashValue(token.trim());
    const user = await authRepository.verifyPasswordResetToken(tokenHash);
    if (!user) {
      throw new AppError("Invalid or expired reset token.", 400);
    }

    await authRepository.updateUserPassword(user.email, hashPassword(password));
    return { message: "Password updated successfully." };
  },

  async adminLogin({ email, password }) {
    return this.login({ email, password });
  },
};
