import { Body, Controller, Get, Param, Post, Put, Query, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CreateProductUseCase } from "../application/use-cases/create-product.use-case";
import { UpdateProductUseCase } from "../application/use-cases/update-product.use-case";
import { GetProductsQuery } from "../application/queries/get-products.query";
import { CreateProductDto } from "./dto/create-product.dto";

@ApiTags("Catalog (Danh mục vật tư)")
@Controller("api/v1/catalog/products")
export class CatalogController {
  constructor(
    // Controller đóng vai trò trạm trung chuyển, gọi đúng UseCase/Query
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly getProductsQuery: GetProductsQuery
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Tạo mới vật tư (Thiết bị điện)" })
  create(@Body() dto: CreateProductDto) {
    return this.createProductUseCase.execute(dto);
  }

  @Put(":id")
  @ApiOperation({ summary: "Cập nhật thông tin vật tư" })
  update(@Param("id") id: string, @Body() body: any) { // Gợi ý: Tạo thêm UpdateProductDto
    return this.updateProductUseCase.execute(id, body);
  }

  @Get()
  @ApiOperation({ summary: "Tìm kiếm vật tư (Có Cache Redis)" })
  search(@Query() query: Record<string, any>) {
    // Đã tích hợp Redis tại tầng Query
    return this.getProductsQuery.execute(query);
  }
}