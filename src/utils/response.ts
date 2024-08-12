export class ApiResponse<T> {
  statusCode: number
  message: string
  data: T | null

  constructor(statusCode: number, data: T | null, message: string) {
    this.statusCode = statusCode
    this.message = message
    this.data = data
  }
}
