import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const BLACKWOLF_CLIENT_ID = process.env.BLACKWOLF_CLIENT_ID!;
    const WEBSITE_PIPELINE_ID = process.env.BLACKWOLF_WEBSITE_PIPELINE_ID!;

    const body = await req.json();
    const { name, email, phone, companyName, companySize, revenue, message } = body;

    // Validation
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Build custom_fields JSON with form-specific data
    const customFields: Record<string, string> = {};
    if (companySize) customFields.company_size_range = companySize;
    if (revenue) customFields.annual_revenue_range = revenue;

    // Insert contact into CRM
    const { data: contact, error: contactError } = await supabase
      .from("crm_contacts")
      .insert({
        client_id: BLACKWOLF_CLIENT_ID,
        pipeline_id: WEBSITE_PIPELINE_ID,
        name,
        email,
        phone: phone || "",
        company: companyName || "",
        employee_count: companySize || "",
        estimated_revenue: revenue || "",
        source: "Website",
        status: "lead",
        notes: message || "",
        tags: JSON.stringify(["website", "inbound"]),
        custom_fields: JSON.stringify(customFields),
        deal_value: 0,
      })
      .select("id")
      .single();

    if (contactError) {
      console.error("Supabase contact insert error:", contactError);
      return NextResponse.json(
        { error: "Failed to save contact" },
        { status: 500 }
      );
    }

    // Log activity for the new contact
    await supabase.from("crm_activities").insert({
      client_id: BLACKWOLF_CLIENT_ID,
      contact_id: contact.id,
      type: "note",
      description: `New website form submission.\nCompany: ${companyName || "N/A"}\nSize: ${companySize || "N/A"}\nRevenue: ${revenue || "N/A"}\nMessage: ${message || "N/A"}`,
      performed_by: "Website Form",
      performed_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, contactId: contact.id });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
