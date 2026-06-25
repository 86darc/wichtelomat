import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://wichtelomat.ch'
const FROM = 'Wichtelomat <noreply@wichtelomat.ch>'

serve(async (req) => {
    try {
        const { token, guestEmail, actionName } = await req.json()

        if (!token || !guestEmail || !actionName) {
            return new Response(JSON.stringify({ error: 'missing_params' }), { status: 400 })
        }

        const inviteUrl = `${SITE_URL}/invitation/${token}`

        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: FROM,
                to: [guestEmail],
                subject: `Du wurdest zu "${actionName}" eingeladen`,
                html: `
                    <p>Hallo!</p>
                    <p>Du wurdest eingeladen, an der Wichtelaktion <strong>${actionName}</strong> teilzunehmen.</p>
                    <p>
                        <a href="${inviteUrl}" style="display:inline-block;padding:10px 20px;background:#1E3A5F;color:#fff;border-radius:4px;text-decoration:none;">
                            Jetzt beitreten
                        </a>
                    </p>
                    <p style="color:#888;font-size:12px;">Oder kopiere diesen Link: ${inviteUrl}</p>
                    <p style="color:#888;font-size:12px;">Dieser Link ist 3 Monate gültig.</p>
                `,
            }),
        })

        if (!res.ok) {
            const body = await res.text()
            return new Response(JSON.stringify({ error: body }), { status: 500 })
        }

        return new Response(JSON.stringify({ ok: true }), {
            headers: { 'Content-Type': 'application/json' },
        })
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 })
    }
})
