export interface AuthPayload {
  id: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
}