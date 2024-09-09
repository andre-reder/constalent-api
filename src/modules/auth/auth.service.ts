import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import admin from 'firebase-admin';
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updatePassword,
} from 'firebase/auth';
import { UsersRepository } from 'src/shared/database/repositories/users.repository';
import { RegisterFirebaseDto } from './dto/register-firebase.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SigninDto } from './dto/signin.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersRepo: UsersRepository,
  ) {}

  private generateAccessToken(userId: string, role: string) {
    return this.jwtService.signAsync({ sub: userId, role });
  }

  private async checkIfEmailAlreadyExists(email: string) {
    const emailsList = (await this.usersRepo.findMany({})).map(
      (usr) => usr.email,
    );

    if (emailsList.includes(email)) {
      throw new ConflictException('This email is already in use');
    }
  }

  async signin(signinDto: SigninDto) {
    const { email, password } = signinDto;
    const auth = getAuth();

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      if (!userCredential.user.uid) {
        throw new UnauthorizedException('Invalid credentials.');
      }

      const user = await this.usersRepo.findUnique({
        where: {
          authId: userCredential.user.uid,
        },
        select: { id: true, role: true, name: true, companyId: true },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const customUserObject = {
        ...user,
      };

      const accessToken = await this.generateAccessToken(
        user.id,
        user.role as string,
      );

      return { token: accessToken, user: customUserObject, success: true };
    } catch (error) {
      error.success = false;
      throw error;
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const auth = getAuth();
    const { email } = resetPasswordDto;

    try {
      const doesEmailExists = await this.usersRepo.findUnique({
        where: { email },
      });

      if (!doesEmailExists) {
        return { message: "This email doesn't exist", success: false };
      }
      await sendPasswordResetEmail(auth, email);
      return { message: 'Email sent successfully', success: true };
    } catch (error) {
      error.success = false;
      throw error;
    }
  }

  async updatePassword(updatePasswordDto: UpdatePasswordDto) {
    const auth = getAuth();
    const { email, currentPassword, newPassword } = updatePasswordDto;

    try {
      const activeUser = await signInWithEmailAndPassword(
        auth,
        email,
        currentPassword,
      );
      const { user } = activeUser;

      await updatePassword(user, newPassword);

      return { success: true };
    } catch (error) {
      error.success = false;
      throw error;
    }
  }

  async verifyIfEmailIsInUse(email: string) {
    try {
      await this.checkIfEmailAlreadyExists(email);

      const auth = admin.auth();
      const user = await auth.getUserByEmail(email);

      if (user) {
        throw new ConflictException('This e-mail is already in use');
      }

      return { success: true };
    } catch (error) {
      if (error.codePrefix === 'auth') {
        return { success: true };
      }
      error.success = false;
      throw error;
    }
  }

  async registerUserAtFirebase(registerFirebaseDto: RegisterFirebaseDto) {
    try {
      const { email, password } = registerFirebaseDto;

      await this.checkIfEmailAlreadyExists(email);

      const auth = getAuth();
      const user = await createUserWithEmailAndPassword(auth, email, password);

      return { success: true, auth_id: user.user.uid };
    } catch (error) {
      error.success = false;
      throw error;
    }
  }
}
