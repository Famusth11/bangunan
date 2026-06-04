import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import type { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError, pagination, parseSearchParams, requireAuth } from "@/lib/api";

type ExportField = {
  name: string;
  label: string;
  type?: "text" | "number" | "currency" | "date" | "boolean";
};

type ResourceConfig = {
  model: keyof typeof prisma;
  searchFields: string[];
  numericFields?: string[];
  dateFields?: string[];
  booleanFields?: string[];
  exportFields?: ExportField[];
  exportFileName?: string;
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
    if (copy[field]) {
      copy[field] = new Date(copy[field]);
    } else {
      delete copy[field];
    }
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

function toPlainValue(value: any) {
  if (value === null || value === undefined) return "";
  if (typeof value?.toNumber === "function") return value.toNumber();
  if (value instanceof Date) return value;
  return value;
}

function defaultExportFields(items: Record<string, any>[]): ExportField[] {
  const hiddenFields = new Set(["id", "createdAt", "updatedAt", "customerId", "supplierId"]);
  const first = items[0] || {};
  return Object.keys(first)
    .filter((key) => !hiddenFields.has(key))
    .map((key) => ({ name: key, label: key }));
}

function buildExcel(items: Record<string, any>[], config: ResourceConfig) {
  const fields = config.exportFields || defaultExportFields(items);
  const header = fields.map((field) => field.label);
  const rows = items.map((item) =>
    fields.map((field) => {
      const value = toPlainValue(item[field.name]);
      if (field.type === "boolean") return value ? "Ya" : "Tidak";
      if (field.type === "date" && value) return new Date(value);
      return value;
    })
  );

  const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows]);
  worksheet["!cols"] = fields.map((field, index) => {
    const maxLength = Math.max(
      field.label.length,
      ...rows.map((row) => String(row[index] ?? "").length)
    );
    return { wch: Math.min(Math.max(maxLength + 2, 12), 36) };
  });
  worksheet["!autofilter"] = {
    ref: XLSX.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: Math.max(rows.length, 1), c: Math.max(fields.length - 1, 0) }
    })
  };
  worksheet["!rows"] = [{ hpt: 22 }];

  fields.forEach((field, columnIndex) => {
    const headerCell = worksheet[XLSX.utils.encode_cell({ r: 0, c: columnIndex })];
    if (headerCell) headerCell.s = { font: { bold: true } };

    rows.forEach((_, rowIndex) => {
      const cell = worksheet[XLSX.utils.encode_cell({ r: rowIndex + 1, c: columnIndex })];
      if (!cell) return;
      if (field.type === "currency") cell.z = '"Rp" #,##0';
      if (field.type === "number") cell.z = "#,##0";
      if (field.type === "date") cell.z = "dd/mm/yyyy";
    });
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
  return XLSX.write(workbook, { bookType: "xlsx", type: "buffer", cellStyles: true });
}

function fileName(config: ResourceConfig) {
  return `${config.exportFileName || String(config.model)}-export.xlsx`;
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

      if (url.searchParams.get("export") === "xlsx") {
        const items = await model(config).findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: 5000
        });
        const buffer = buildExcel(items, config);
        return new NextResponse(buffer, {
          headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": `attachment; filename=${fileName(config)}`
          }
        });
      }

      const [items, total] = await Promise.all([
        model(config).findMany({
          where,
          orderBy: { createdAt: "desc" },
          ...pagination(page, limit)
        }),
        model(config).count({ where })
      ]);

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
