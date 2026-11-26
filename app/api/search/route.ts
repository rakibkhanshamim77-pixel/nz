import { NextRequest, NextResponse } from "next/server";

import dbConnect from "@/db/connect/dbConnect";
import Product from "@/db/models/Product";
import { publishedProductFilter } from "@/db/utils/productVisibility";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Get search query
    const q = req.nextUrl.searchParams.get("q")?.trim();

    // Validate query
    if (!q || q.length < 2) {
      return NextResponse.json({ products: [] }, { status: 200 });
    }

    // Connect to MongoDB
    await dbConnect();

    // Search active products
    const docs = await Product.find({
      ...publishedProductFilter(),
      name: {
        $regex: escapeRegex(q),
        $options: "i",
      },
    })
      .select("name slug images salePrice regularPrice discount")
      .limit(8)
      .lean()
      .exec();

    // Format products
    const products = docs.map((product) => {
      const image =
        Array.isArray(product.images) && product.images.length > 0
          ? product.images[0]
          : null;

      return {
        _id: String(product._id),
        name: product.name,
        slug: product.slug,
        image,
        salePrice: product.salePrice,
        regularPrice: product.regularPrice,
        discount: product.discount,
      };
    });

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/search]", error);

    return NextResponse.json(
      {
        products: [],
        error: "Failed to search products",
      },
      { status: 500 },
    );
  }
}

// Escape special regex characters
function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
