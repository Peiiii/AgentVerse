/**
 * 共享类型定义
 * @module core/repositories/shared.types
 */

/** Unix 毫秒时间戳 */
export type Timestamp = number;

/** JSON Schema 类型（简化版） */
export interface JsonSchema {
    type?: string;
    properties?: Record<string, JsonSchema>;
    required?: string[];
    items?: JsonSchema;
    enum?: unknown[];
    description?: string;
    [key: string]: unknown;
}

/**
 * Repository 层统一错误
 * 用于数据存取操作
 */
export class RepositoryError extends Error {
    constructor(
        message: string,
        public readonly code:
            | 'NOT_FOUND'
            | 'CONFLICT'
            | 'VALIDATION'
            | 'NETWORK'
            | 'UNKNOWN',
        public readonly cause?: unknown
    ) {
        super(message);
        this.name = 'RepositoryError';
    }
}

/**
 * Client 层统一错误
 * 用于外部调用（如 LLM API）
 */
export class ClientError extends Error {
    constructor(
        message: string,
        public readonly code:
            | 'AUTH'
            | 'RATE_LIMIT'
            | 'INVALID_REQUEST'
            | 'NETWORK'
            | 'UNKNOWN',
        public readonly status?: number,
        public readonly cause?: unknown
    ) {
        super(message);
        this.name = 'ClientError';
    }
}
