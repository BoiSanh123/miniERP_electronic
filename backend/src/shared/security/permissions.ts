export const Permissions = {
  CatalogRead: "catalog:read",
  CatalogWrite: "catalog:write",
  InventoryRead: "inventory:read",
  InventoryReserve: "inventory:reserve",
  InventoryDeduct: "inventory:deduct",
  SalesRead: "sales:read",
  SalesWrite: "sales:write",
  SalesApprove: "sales:approve",
  FinanceRead: "finance:read",
  FinanceWrite: "finance:write",
  AuthManage: "auth:manage",
  FileUpload: "file:upload",
  ReportRead: "report:read"
} as const;
