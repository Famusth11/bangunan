import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import type { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError, pagination, parseSearchParams, requireAuth } from "@/lib/api";

type ResourceConfig = {
  model: keyof typeof prisma;
  searchFields: string[];
  numericFields?: string[];
  dateFields?: string[];
  booleanFields?: string[];
  adminOnlyDelete?: boolean;
  defaults?: (data: Record<string, any>) => Record<string, any>;
  afterCreate?: (item: any) => Promise<void>;
  schema?: z.ZodTypeAny;
};

function normalize(data: Record<string, any>, config: ResourceConfig) {
  const copy = { ...data };
  delete copy.id;
  delete copy.createdAt;
  delete copy.updatedAt;

  for (const field of config.numericFields || []) {
    if (copy[field] !== undefined && copy[field] !== "") copy[field] = Number(copy[field]);
  }
  for (const field of config.dateFields || []) {
    if (copy[field]) copy[field] = new Date(copy[field]);
  }
  for (const field of config.booleanFields || []) {
    if (copy[field] !== undefined) copy[field] = Boolean(copy[field]);
  }
  return config.defaults ? config.defaults(copy) : copy;
}

function model(config: ResourceConfig) {
  return (prisma as any)[config.model];
}

function validate(data: Record<string, any>, config: ResourceConfig) {
  if (!config.schema) return { ok: true as const, data };
  const result = config.schema.safeParse(data);
  if (result.success) return { ok: true as const, data: result.data };
  return {
    ok: false as const,
    message: result.error.errors[0]?.message || "Data tidak valid"
  };
}

export function resourceHandlers(config: ResourceConfig) {
  return {
    async GET(request: Request) {
      const auth = await requireAuth();
      if (auth.error) return auth.error;

      const url = new URL(request.url);
      const { q, page, limit } = parseSearchParams(request);
      const where = q
        ? {
            OR: config.searchFields.map((field) => ({
              [field]: { contains: q, mode: "insensitive" }
            }))
          }
        : {};

      const [items, total] = await Promise.all([
        model(config).findMany({
          where,
          orderBy: { createdAt: "desc" },
          ...pagination(page, limit)
        }),
        model(config).count({ where })
      ]);

      if (url.searchParams.get("export") === "xlsx") {
        const worksheet = XLSX.utils.json_to_sheet(items);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
        const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
        return new NextResponse(buffer, {
          headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": "attachment; filename=data-export.xlsx"
          }
        });
      }

      return NextResponse.json({ items, total, page, limit });
    },

    async POST(request: Request) {
      const auth = await requireAuth();
      if (auth.error) return auth.error;
      const data = normalize(await request.json(), config);
      const validation = validate(data, config);
      if (!validation.ok) return jsonError(validation.message);
      const item = await model(config).create({ data: validation.data });
      if (config.afterCreate) {
        config.afterCreate(item).catch((error) => console.error("afterCreate hook failed", error));
      }
      return NextResponse.json(item, { status: 201 });
    },

    async PATCH(request: Request) {
      const auth = await requireAuth();
      if (auth.error) return auth.error;
      const body = await request.json();
      if (!body.id) return jsonError("ID wajib diisi");
      const data = normalize(body, config);
      const validation = validate(data, config);
      if (!validation.ok) return jsonError(validation.message);
      const item = await model(config).update({ where: { id: body.id }, data: validation.data });
      return NextResponse.json(item);
    },

    async DELETE(request: Request) {
      const auth = await requireAuth(Boolean(config.adminOnlyDelete));
      if (auth.error) return auth.error;
      const { id } = parseSearchParams(request);
      if (!id) return jsonError("ID wajib diisi");
      await model(config).delete({ where: { id } });
      return NextResponse.json({ ok: true });
    }
  };
}
