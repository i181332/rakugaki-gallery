// src/lib/errors.ts
/**
 * Rakugaki Gallery - 統一エラーハンドリング
 *
 * アプリケーション全体で一貫したエラー処理を提供
 * - 型安全なエラーコード
 * - ユーザーフレンドリーなメッセージ
 * - デバッグ情報の保持
 */

// ============================================================
// エラーコード定義
// ============================================================

/**
 * API関連エラーコード
 */
export type ApiErrorCode =
    | 'RATE_LIMIT'
    | 'API_ERROR'
    | 'PARSE_ERROR'
    | 'VALIDATION_ERROR'
    | 'NOT_FOUND';

/**
 * パース関連エラーコード
 */
export type ParseErrorCode =
    | 'INVALID_JSON_STRUCTURE'
    | 'JSON_PARSE_ERROR'
    | 'VALIDATION_ERROR';

/**
 * すべてのエラーコード
 */
export type AppErrorCode = ApiErrorCode | ParseErrorCode;

// ============================================================
// ベースエラークラス
// ============================================================

/**
 * アプリケーション共通のベースエラークラス
 */
export abstract class AppError extends Error {
    abstract readonly code: AppErrorCode;
    abstract readonly statusCode: number;

    constructor(
        message: string,
        public readonly cause?: unknown
    ) {
        super(message);
        this.name = this.constructor.name;

        // スタックトレースを正しく保持
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    /**
     * ユーザー向けメッセージを取得
     */
    abstract getUserMessage(): string;

    /**
     * JSON形式でエラー情報を取得
     */
    toJSON() {
        return {
            name: this.name,
            code: this.code,
            message: this.message,
            statusCode: this.statusCode,
        };
    }
}

// ============================================================
// 具体的なエラークラス
// ============================================================

/**
 * Gemini API関連エラー
 */
export class GeminiError extends AppError {
    readonly statusCode: number;

    constructor(
        public readonly code: 'RATE_LIMIT' | 'API_ERROR' | 'PARSE_ERROR',
        message: string,
        cause?: unknown
    ) {
        super(message, cause);
        this.statusCode = code === 'RATE_LIMIT' ? 429 : 500;
    }

    getUserMessage(): string {
        switch (this.code) {
            case 'RATE_LIMIT':
                return 'APIのレート制限に達しました。しばらくお待ちください。';
            case 'PARSE_ERROR':
                return '評論の生成に失敗しました。もう一度お試しください。';
            case 'API_ERROR':
            default:
                return '評論の生成中にエラーが発生しました。もう一度お試しください。';
        }
    }
}

/**
 * パース関連エラー
 */
export class ParseError extends AppError {
    readonly statusCode = 400;

    constructor(
        public readonly code: ParseErrorCode,
        message: string,
        cause?: unknown
    ) {
        super(message, cause);
    }

    getUserMessage(): string {
        switch (this.code) {
            case 'INVALID_JSON_STRUCTURE':
                return 'AIからの応答が不正な形式でした。もう一度お試しください。';
            case 'JSON_PARSE_ERROR':
                return 'AIからの応答を解析できませんでした。もう一度お試しください。';
            case 'VALIDATION_ERROR':
                return 'AIからの応答が期待された形式ではありませんでした。もう一度お試しください。';
            default:
                return 'データの処理中にエラーが発生しました。';
        }
    }
}

/**
 * バリデーションエラー
 */
export class ValidationError extends AppError {
    readonly code = 'VALIDATION_ERROR' as const;
    readonly statusCode = 400;

    constructor(
        message: string,
        public readonly field?: string,
        cause?: unknown
    ) {
        super(message, cause);
    }

    getUserMessage(): string {
        return this.field
            ? `入力値が不正です: ${this.field}`
            : '入力値が不正です。';
    }
}

/**
 * レート制限エラー
 */
export class RateLimitError extends AppError {
    readonly code = 'RATE_LIMIT' as const;
    readonly statusCode = 429;

    constructor(
        message: string = 'レート制限に達しました',
        public readonly retryAfterMs?: number
    ) {
        super(message);
    }

    getUserMessage(): string {
        return '評論家が休憩中です。1分後にもう一度お試しください。';
    }
}

/**
 * リソースが見つからないエラー
 */
export class NotFoundError extends AppError {
    readonly code = 'NOT_FOUND' as const;
    readonly statusCode = 404;

    constructor(
        resource: string,
        id?: string
    ) {
        super(id ? `${resource} not found: ${id}` : `${resource} not found`);
    }

    getUserMessage(): string {
        return '指定されたリソースが見つかりませんでした。';
    }
}

// ============================================================
// ユーティリティ関数
// ============================================================

/**
 * 未知のエラーをAppErrorに変換
 */
export function normalizeError(error: unknown): AppError {
    if (error instanceof AppError) {
        return error;
    }

    if (error instanceof Error) {
        // レート制限エラーの検出
        if (error.message.includes('429')) {
            return new GeminiError('RATE_LIMIT', error.message, error);
        }

        return new GeminiError('API_ERROR', error.message, error);
    }

    return new GeminiError('API_ERROR', String(error));
}

/**
 * エラーがAppErrorかどうかを判定
 */
export function isAppError(error: unknown): error is AppError {
    return error instanceof AppError;
}

/**
 * エラーコードからHTTPステータスコードを取得
 */
export function getStatusCode(error: unknown): number {
    if (error instanceof AppError) {
        return error.statusCode;
    }
    return 500;
}
