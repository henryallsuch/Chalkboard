// ── Interfaces & types ──────────────────────────────────────────────────────

interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
  createdAt: Date
}

type ApiResponse<T> = {
  data: T
  status: number
  message: string
  meta?: {
    page: number
    total: number
    perPage: number
  }
}

type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K]
}

// ── Enums ────────────────────────────────────────────────────────────────────

enum HttpStatus {
  OK = 200,
  Created = 201,
  BadRequest = 400,
  Unauthorized = 401,
  NotFound = 404,
  InternalServerError = 500,
}

// ── Generics ─────────────────────────────────────────────────────────────────

function paginate<T>(items: T[], page: number, perPage: number): ApiResponse<T[]> {
  const start = (page - 1) * perPage
  const data = items.slice(start, start + perPage)
  return {
    data,
    status: HttpStatus.OK,
    message: 'OK',
    meta: { page, total: items.length, perPage },
  }
}

// ── Class with decorators ────────────────────────────────────────────────────

function Injectable(target: Function) {
  Reflect.defineMetadata('injectable', true, target)
}

function Log(target: object, key: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value
  descriptor.value = function (...args: unknown[]) {
    console.log(`[${key}] called with`, args)
    return original.apply(this, args)
  }
  return descriptor
}

@Injectable
class UserService {
  private readonly users: Map<number, User> = new Map()

  constructor(private readonly db: Database) {}

  @Log
  async findById(id: number): Promise<User | undefined> {
    return this.db.query<User>(`SELECT * FROM users WHERE id = $1`, [id])
  }

  async create(input: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const user: User = { ...input, id: Date.now(), createdAt: new Date() }
    this.users.set(user.id, user)
    return user
  }
}

// ── Utility types & infer ────────────────────────────────────────────────────

type Awaited<T> = T extends Promise<infer U> ? U : T
type ReturnType<T extends (...args: unknown[]) => unknown> = T extends (...args: unknown[]) => infer R ? R : never

// ── Async / error handling ───────────────────────────────────────────────────

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms),
  )
  return Promise.race([promise, timeout])
}

// ── Type guards ──────────────────────────────────────────────────────────────

function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value
  )
}

export type { User, ApiResponse, DeepReadonly }
export { UserService, HttpStatus, paginate, withTimeout, isUser }
