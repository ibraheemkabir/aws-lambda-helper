import { UnifyreExtensionKitClient,  } from 'unifyre-extension-sdk';
import { AppUserProfile } from 'unifyre-extension-sdk/dist/client/model/AppUserProfile';
import { ValidationUtils } from 'ferrum-plumbing';
import jwt from 'jsonwebtoken';

export class UnifyreBackendProxyService {
    constructor(
        private unifyreKitFactory: () => UnifyreExtensionKitClient,
        private jwtRandomKey: string,
    ) {
    }

    async signInToServer(token: string, expiresIn?: string): Promise<[AppUserProfile, string]> {
        const uniKit = this.unifyreKitFactory();
        await uniKit.signInWithToken(token);
        const userProfile = uniKit.getUserProfile();
        ValidationUtils.isTrue(!!userProfile, 'Error signing in to unifyre');
        const session = this.newSession(userProfile.userId, expiresIn);
        return [userProfile, session];
    }

    signInUsingToken(jsonToken: string): string {
        const res = jwt.verify(jsonToken, this.jwtRandomKey) as any;
        ValidationUtils.isTrue(!!res || !res.userId, 'Error authenticating using JWT token');
        return res!.userId as string;
    }

    private newSession(userId: string, expiresIn?: string): string {
        return jwt.sign({userId}, this.jwtRandomKey, { expiresIn: expiresIn || '1h' });
    }
}