import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Redirect,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('register')
  async register(@Body() body: { email: string; password: string }) {
    return this.authService.register(body.email, body.password);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  // Google OAuth endpoints
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Initiates Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @Redirect()
  async googleAuthCallback(@Request() req: any) {
    // Called by Google after authentication
    const result = await this.authService.googleLogin(req.user);

    // Redirect to frontend callback page with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/auth/callback?access_token=${result.access_token}`;

    return { url: redirectUrl };
  }

  // Get current user info
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Request() req: any) {
    return this.authService.validateUser(req.user.id);
  }

  // Refresh JWT token
  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  async refreshToken(@Request() req: any) {
    return this.authService.refreshToken(req.user.id);
  }
}
