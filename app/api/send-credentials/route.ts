import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { Resend } from "resend"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const {
      orderId,
      orderNumber,
      customerEmail,
      customerName,
      items,
      credentials,
      notes,
    } = body as {
      orderId: string
      orderNumber: string
      customerEmail: string
      customerName: string
      items: { name: string; variant?: string }[]
      credentials: { label: string; value: string }[]
      notes?: string
    }

    if (!customerEmail || !orderNumber || !credentials?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Initialize Resend only when needed
    const resend = new Resend(process.env.RESEND_API_KEY)

    const itemsList = items
      .map(
        (item) =>
          `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;color:#333;">${item.name}${item.variant ? ` <span style="color:#888;font-size:12px;">(${item.variant})</span>` : ""}</td></tr>`
      )
      .join("")

    const credentialRows = credentials
      .map(
        (c) =>
          `<tr>
            <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#666;width:120px;vertical-align:top;">${c.label}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:14px;color:#111;font-weight:600;word-break:break-all;">${c.value}</td>
          </tr>`
      )
      .join("")

    const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f7f7f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f7;padding:30px 10px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06);">

        <!-- Header -->
        <tr>
          <td style="background:#111;padding:28px 30px;text-align:center;">
            <h1 style="margin:0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">Premium Subscriptions Store</h1>
            <p style="margin:6px 0 0;font-size:12px;color:#aaa;">Your Digital Marketplace in Nepal</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:30px;">
            <p style="margin:0 0 8px;font-size:15px;color:#333;">Hi ${customerName},</p>
            <p style="margin:0 0 20px;font-size:14px;color:#555;line-height:1.6;">
              Thank you for your purchase. Your order <strong style="color:#111;">#${orderNumber}</strong> has been processed and your account credentials are ready.
            </p>

            <!-- Items -->
            <p style="margin:0 0 8px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Order Items</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;border-radius:8px;border:1px solid #eee;margin-bottom:20px;">
              ${itemsList}
            </table>

            <!-- Credentials -->
            <p style="margin:0 0 8px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Your Credentials</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0f9f0;border-radius:8px;border:1px solid #d4edda;margin-bottom:20px;">
              ${credentialRows}
            </table>

            ${
              notes
                ? `<p style="margin:0 0 8px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Important Notes</p>
                   <div style="background:#fff8e1;border:1px solid #ffe082;border-radius:8px;padding:14px;margin-bottom:20px;">
                     <p style="margin:0;font-size:13px;color:#6d4c00;line-height:1.6;">${notes.replace(/\n/g, "<br>")}</p>
                   </div>`
                : ""
            }

            <p style="margin:20px 0 0;font-size:13px;color:#555;line-height:1.6;">
              Please save these credentials securely. If you have any issues, reply to this email or contact us at support@premiumsubscriptions.com.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#fafafa;padding:20px 30px;border-top:1px solid #eee;text-align:center;">
            <p style="margin:0;font-size:11px;color:#999;line-height:1.5;">
              Premium Subscriptions Store - Digital Products Marketplace, Nepal<br>
              This email was sent regarding order #${orderNumber}
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

    const { data, error } = await resend.emails.send({
      from: "Premium Subscriptions Store <support@premiumsubscriptions.com>",
      to: customerEmail,
      subject: `Your Order #${orderNumber} - Account Credentials`,
      html,
      headers: {
        "X-Entity-Ref-ID": orderId,
      },
    })

    if (error) {
      console.error("Resend error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update order status to completed if not already
    await supabase
      .from("orders")
      .update({ status: "completed", updated_at: new Date().toISOString() })
      .eq("id", orderId)

    return NextResponse.json({ success: true, emailId: data?.id })
  } catch (err: any) {
    console.error("Send credentials error:", err)
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 })
  }
}
