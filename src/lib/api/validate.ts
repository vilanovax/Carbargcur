import { NextResponse } from "next/server";
import type { ZodError, ZodSchema } from "zod";

function formatIssues(error: ZodError) {
  return error.issues.map((i) => ({
    path: i.path.map(String).join("."),
    message: i.message,
  }));
}

export async function validateJson<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<T | NextResponse> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { error: "بدنه درخواست JSON نامعتبر است" },
      { status: 400 }
    );
  }
  const result = schema.safeParse(json);
  if (!result.success) {
    return NextResponse.json(
      { error: "داده‌های ورودی نامعتبر است", issues: formatIssues(result.error) },
      { status: 400 }
    );
  }
  return result.data;
}

export function validateQuery<T>(
  searchParams: URLSearchParams,
  schema: ZodSchema<T>
): T | NextResponse {
  const obj: Record<string, string> = {};
  searchParams.forEach((v, k) => {
    obj[k] = v;
  });
  const result = schema.safeParse(obj);
  if (!result.success) {
    return NextResponse.json(
      { error: "پارامترهای کوئری نامعتبر است", issues: formatIssues(result.error) },
      { status: 400 }
    );
  }
  return result.data;
}
