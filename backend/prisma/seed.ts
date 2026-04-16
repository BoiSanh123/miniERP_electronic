import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  const permissionCodes = [
    "catalog:read", "catalog:write",
    "inventory:read", "inventory:reserve", "inventory:deduct",
    "sales:read", "sales:write", "sales:approve",
    "finance:read", "finance:write",
    "auth:manage", "file:upload", "report:read"
  ];

  for (const code of permissionCodes) {
    await prisma.permission.upsert({
      where: { code },
      update: {},
      create: { code, description: code }
    });
  }

  const roleNames = ["ADMIN", "SALE_REP", "WAREHOUSE", "ACCOUNTANT", "MANAGER"];
  for (const name of roleNames) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name, description: name }
    });
  }

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash: await argon2.hash("Admin@123456"),
      isActive: true
    }
  });

  const adminRole = await prisma.role.findUnique({ where: { name: "ADMIN" } });
  if (adminRole) {
    await prisma.userRole.upsert({
      where: {
        user_id_role_id: {
          user_id: admin.id,
          role_id: adminRole.id,
        },
      },
      update: {},
      create: {
        user_id: admin.id,
        role_id: adminRole.id,
      }
    });
  }

  const retail = await prisma.businessPartner.upsert({
    where: { code: "CUST-DEMO" },
    update: {},
    create: { code: "CUST-DEMO", name: "Demo Customer", type: "CUSTOMER", tier: "A", creditLimit: "1000000000.00", currentDebt: "0" }
  });

  const supplier = await prisma.businessPartner.upsert({
    where: { code: "SUP-DEMO" },
    update: {},
    create: { code: "SUP-DEMO", name: "Demo Supplier", type: "SUPPLIER", tier: null, creditLimit: "0", currentDebt: "0" }
  });

  const warehouse = await prisma.warehouse.upsert({
    where: { code: "WH-01" },
    update: {},
    create: { code: "WH-01", name: "Main Warehouse", locationAddress: "Demo" }
  });

  const category = await prisma.category.createMany({
    data: [{ name: "Electrical", parentId: null }],
    skipDuplicates: true
  });

  const categories = await prisma.category.findMany({ where: { name: "Electrical" } });
  const categoryId = categories[0]?.id;

  await prisma.product.upsert({
    where: { sku: "CADIVI-2X2.5" },
    update: {},
    create: {
      sku: "CADIVI-2X2.5",
      name: "Cáp điện Cadivi 2x2.5",
      categoryId,
      baseUnit: "m",
      displayUnit: "cuộn",
      attributes: { section: "2x2.5", type: "cable", unit: "meter" },
      isActive: true,
      // standardCost: "12500.00",
      // listPrice: "18000.00"
    }
  });

  console.log("Seed complete", { admin: admin.username, retail: retail.code, supplier: supplier.code, warehouse: warehouse.code });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
