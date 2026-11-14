export declare const env: {
    NODE_ENV: "development" | "production" | "test";
    PORT: number;
    API_PREFIX: string;
    MONGODB_URI: string;
    MONGODB_DB: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    JWT_REFRESH_SECRET: string;
    JWT_REFRESH_EXPIRES_IN: string;
    FRONTEND_URL: string;
    UPLOAD_DIR: string;
    MAX_FILE_SIZE: number;
    MONGODB_TLS_CERT_FILE?: string | undefined;
    MONGODB_TLS_CA_FILE?: string | undefined;
    MONGODB_URI_DEV?: string | undefined;
};
export declare const isDevelopment: boolean;
export declare const isProduction: boolean;
export declare const isTest: boolean;
//# sourceMappingURL=env.d.ts.map