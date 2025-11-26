import { HttpStatus } from '@nestjs/common';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationResponse<T> {
  data: T[];
  meta: PaginationMeta;
  statusCode: number;
  message: string;
}

export interface ResourceResponse<T> {
  data: T;
  statusCode: number;
  message: string;
}

export class ResponseGenerator {
  static generateResourceFormat<T>(
    data: T,
    statusCode: number = HttpStatus.OK,
    message: string = 'Success',
  ): ResourceResponse<T> {
    return {
      data,
      statusCode,
      message,
    };
  }

  static generateResourceArrayFormat<T>(
    data: T[],
    statusCode: number = HttpStatus.OK,
    message: string = 'Success',
  ): ResourceResponse<T[]> {
    return {
      data,
      statusCode,
      message,
    };
  }

  static generatePaginationFormat<T>(
    data: T[],
    count: number,
    pageOptions: { page: number; limit: number },
    statusCode: number = HttpStatus.OK,
    message: string = 'Success',
  ): PaginationResponse<T> {
    const totalPages = Math.ceil(count / pageOptions.limit);

    return {
      data,
      meta: {
        page: pageOptions.page,
        limit: pageOptions.limit,
        total: count,
        totalPages,
      },
      statusCode,
      message,
    };
  }
}

