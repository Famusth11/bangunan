import { resourceHandlers } from "@/lib/resource-route";

const handlers = resourceHandlers({
  model: "worker",
  searchFields: ["name", "specialty", "area", "quality", "whatsapp"],
  adminOnlyDelete: true
});

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
