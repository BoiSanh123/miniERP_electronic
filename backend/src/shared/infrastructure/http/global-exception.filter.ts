import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  // Gắn Logger để tracking tại Server-side
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    
    // Thu thập Correlation ID từ Middleware (Dùng cho tracing qua Kibana/Datadog)
    const correlationId = req.headers?.["x-correlation-id"] || "N/A";

    // Mặc định là lỗi 500 (Internal Server Error)
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Hệ thống đang bận hoặc gặp sự cố, vui lòng thử lại sau."; // Error Masking
    let errorCode = "INTERNAL_SERVER_ERROR";

    // Phân loại lỗi
    if (exception instanceof HttpException) {
      // 1. Lỗi nghiệp vụ có kiểm soát (400, 401, 403, 404)
      status = exception.getStatus();
      const resp = exception.getResponse() as any;
      message = typeof resp === "string" ? resp : (resp.message || exception.message);
      
      // Hỗ trợ mảng message từ class-validator
      if (Array.isArray(message)) {
        message = message.join(", "); 
      }
      errorCode = resp.errorCode ?? `HTTP_${status}_ERROR`;
      
    } else if (exception?.name === "PrismaClientKnownRequestError") {
      // 2. Lỗi cấp Database (Vi phạm Unique Constraint, Foreign Key, v.v...)
      status = HttpStatus.BAD_REQUEST;
      message = "Yêu cầu không hợp lệ do xung đột dữ liệu.";
      errorCode = "DATABASE_CONSTRAINT_ERROR";
      // Không ghi đè error message để tránh lọt câu query SQL ra ngoài Frontend
    }

    // Luôn ghi log chi tiết phía Server kèm Correlation ID để Dev điều tra
    this.logger.error(
      `[${req.method}] ${req.url} | Code: ${errorCode} | Msg: ${exception.message || "Unknown error"}`,
      exception.stack,
      `CorrelationID: ${correlationId}`
    );

    // 3. Chuẩn hóa JSON Response duy nhất trả về Frontend
    return res.status(status).json({
      success: false,
      errorCode,
      message,
      data: null, // Đảm bảo format không bị khuyết field
      correlationId
    });
  }
}