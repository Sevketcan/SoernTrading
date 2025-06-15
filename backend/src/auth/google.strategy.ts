import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptions } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        private configService: ConfigService,
        private authService: AuthService,
    ) {
        const config: StrategyOptions = {
            clientID: configService.get<string>('GOOGLE_CLIENT_ID')!,
            clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET')!,
            callbackURL: configService.get<string>('GOOGLE_REDIRECT_URI')!,
            scope: [
                'email',
                'profile',
                'https://www.googleapis.com/auth/gmail.readonly',
                'https://www.googleapis.com/auth/gmail.send',
                'https://www.googleapis.com/auth/gmail.modify',
            ],
        };

        super(config);
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
    ): Promise<any> {
        try {
            const { id, name, emails, photos } = profile;

            const user = {
                googleId: id,
                email: emails[0].value,
                name: name ? `${name.givenName} ${name.familyName}` : 'Unknown User',
                avatar: photos && photos.length > 0 ? photos[0].value : undefined,
                accessToken,
                refreshToken,
            };

            // Find or create user
            const validatedUser = await this.authService.validateGoogleUser(user);
            return validatedUser;
        } catch (error) {
            console.error('Google OAuth validation error:', error);
            return null;
        }
    }
} 