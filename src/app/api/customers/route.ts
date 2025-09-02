import { NextRequest, NextResponse } from "next/server";

const SQUARE_API_URL = "https://connect.squareupsandbox.com/v2/customers";
const SQUARE_VERSION = "2025-07-16";
const SQUARE_ACCESS_TOKEN =
  process.env.SQUARE_ACCESS_TOKEN ||
  "EAAAl4W2NSeUXRHo4AhPsep9jdnOfxSeQ95sAoejuSzwbdxUFyU2Ye2npf8Pv7Cy";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "100";
    const cursor = searchParams.get("cursor");

    // Build query parameters
    const queryParams = new URLSearchParams({
      limit,
    });

    if (cursor) {
      queryParams.append("cursor", cursor);
    }

    const response = await fetch(`${SQUARE_API_URL}?${queryParams}`, {
      method: "GET",
      headers: {
        "Square-Version": SQUARE_VERSION,
        Authorization: `Bearer ${SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Square API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // Process the customer data
    const processedData = processCustomerData(data.customers || []);

    return NextResponse.json({
      success: true,
      data: processedData,
      cursor: data.cursor,
      raw: data,
    });
  } catch (error) {
    console.error("Error fetching Square customer data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch customer data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const customerData = {
      given_name: body.given_name,
      family_name: body.family_name,
      email_address: body.email_address,
      phone_number: body.phone_number,
      address: body.address,
      note: body.note,
    };

    const response = await fetch(SQUARE_API_URL, {
      method: "POST",
      headers: {
        "Square-Version": SQUARE_VERSION,
        Authorization: `Bearer ${SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(customerData),
    });

    if (!response.ok) {
      throw new Error(
        `Square API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: data.customer,
      raw: data,
    });
  } catch (error) {
    console.error("Error creating Square customer:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create customer",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

function processCustomerData(customers: any[]) {
  const processedCustomers = customers.map((customer) => ({
    id: customer.id,
    name: `${customer.given_name || ""} ${customer.family_name || ""}`.trim() || "Unknown",
    given_name: customer.given_name,
    family_name: customer.family_name,
    email: customer.email_address || "No email",
    phone: customer.phone_number || "No phone",
    address: formatAddress(customer.address),
    country: customer.address?.country || "Unknown",
    created_at: customer.created_at,
    updated_at: customer.updated_at,
    preferences: customer.preferences,
    segment_ids: customer.segment_ids || [],
    creation_source: customer.creation_source,
    version: customer.version,
    // Additional computed fields
    joinDate: new Date(customer.created_at).toLocaleDateString(),
    status: customer.preferences?.email_unsubscribed ? "Unsubscribed" : "Active",
  }));

  // Calculate customer metrics
  const metrics = {
    totalCustomers: processedCustomers.length,
    activeCustomers: processedCustomers.filter(c => c.status === "Active").length,
    unsubscribedCustomers: processedCustomers.filter(c => c.status === "Unsubscribed").length,
    recentCustomers: processedCustomers.filter(c => {
      const createdDate = new Date(c.created_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return createdDate > thirtyDaysAgo;
    }).length,
  };

  // Group by country for segments
  const countrySegments = processedCustomers.reduce((acc, customer) => {
    const country = customer.country;
    if (!acc[country]) {
      acc[country] = 0;
    }
    acc[country]++;
    return acc;
  }, {} as Record<string, number>);

  // Group by creation source
  const sourceSegments = processedCustomers.reduce((acc, customer) => {
    const source = customer.creation_source || "Unknown";
    if (!acc[source]) {
      acc[source] = 0;
    }
    acc[source]++;
    return acc;
  }, {} as Record<string, number>);

  return {
    customers: processedCustomers,
    metrics,
    segments: {
      byCountry: Object.entries(countrySegments).map(([country, count]) => ({
        name: country,
        count,
        percentage: Math.round((count / processedCustomers.length) * 100),
      })),
      bySource: Object.entries(sourceSegments).map(([source, count]) => ({
        name: source,
        count,
        percentage: Math.round((count / processedCustomers.length) * 100),
      })),
    },
  };
}

function formatAddress(address: any): string {
  if (!address) return "No address";
  
  const parts = [
    address.address_line_1,
    address.address_line_2,
    address.locality,
    address.administrative_district_level_1,
    address.postal_code,
    address.country,
  ].filter(Boolean);
  
  return parts.length > 0 ? parts.join(", ") : "No address";
}
