import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    // Get inventory status data
    const { data: inventoryData, error: inventoryError } = await supabase
      .from("p_ee518a8e_inventory")
      .select("*")
      .order("created_at", { ascending: false });

    if (inventoryError) throw inventoryError;

    // Get checkout data for missing items analysis
    const { data: checkoutData, error: checkoutError } = await supabase
      .from("p_ee518a8e_checkouts")
      .select("*")
      .order("created_at", { ascending: false });

    if (checkoutError) throw checkoutError;

    // Get condition reports
    const { data: conditionData, error: conditionError } = await supabase
      .from("p_ee518a8e_condition_reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (conditionError) throw conditionError;

    const response = {
      inventory: inventoryData || [],
      checkouts: checkoutData || [],
      conditions: conditionData || []
    };

    return NextResponse.json(response, {
      headers: { "Access-Control-Allow-Origin": "*" }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch reports" },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, error } = await supabase
      .from("p_ee518a8e_condition_reports")
      .insert(body)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, {
      headers: { "Access-Control-Allow-Origin": "*" }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create condition report" },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const { data, error } = await supabase
      .from("p_ee518a8e_condition_reports")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, {
      headers: { "Access-Control-Allow-Origin": "*" }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update condition report" },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    const { error } = await supabase
      .from("p_ee518a8e_condition_reports")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json(
      { message: "Condition report deleted successfully" },
      { headers: { "Access-Control-Allow-Origin": "*" } }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete condition report" },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
}