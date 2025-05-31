import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const product = await prisma.product.findMany({});

  const jsonString = JSON.stringify({
    message: "success",
    product,
  });

  return new NextResponse(jsonString, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
