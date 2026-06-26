import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://wichtelomat.ch'
const FROM = 'Wichtelomat <noreply@wichtelomat.ch>'

serve(async (req) => {
    try {
        const { action_id } = await req.json()

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        )

        const { data: action } = await supabase
            .from('wichtel_aktionen')
            .select('name, handover_date')
            .eq('id', action_id)
            .single()

        const { data: assignments } = await supabase
            .from('assignments')
            .select('giver_membership_id, receiver_membership_id')
            .eq('action_id', action_id)

        const membershipIds = assignments.flatMap(a => [a.giver_membership_id, a.receiver_membership_id])

        const { data: memberships } = await supabase
            .from('memberships')
            .select('id, user_id, is_guest, guest_email')
            .in('id', membershipIds)

        const userIds = memberships.filter(m => m.user_id).map(m => m.user_id)

        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, display_name')
            .in('id', userIds)

        const receiverMembershipIds = assignments.map(a => a.receiver_membership_id)
        const { data: wishlists } = await supabase
            .from('wishlists')
            .select('membership_id, content')
            .in('membership_id', receiverMembershipIds)

        const { data: { users } } = await supabase.auth.admin.listUsers()

        const membershipMap = Object.fromEntries(memberships.map(m => [m.id, m]))
        const profileMap = Object.fromEntries(profiles.map(p => [p.id, p.display_name]))
        const wishlistMap = Object.fromEntries((wishlists || []).map(w => [w.membership_id, w.content]))
        const emailMap = Object.fromEntries(users.map(u => [u.id, u.email]))

        for (const a of assignments) {
            const giver = membershipMap[a.giver_membership_id]
            const receiver = membershipMap[a.receiver_membership_id]

            const giverEmail = giver.is_guest ? giver.guest_email : emailMap[giver.user_id]
            if (!giverEmail) continue

            const receiverName = receiver.is_guest
                ? receiver.guest_email
                : (profileMap[receiver.user_id] || emailMap[receiver.user_id] || '—')

            const wishlistContent = wishlistMap[a.receiver_membership_id]
            const wishlistHtml = wishlistContent
                ? `<p><strong>Wunschzettel:</strong></p><p style="white-space:pre-line;background:#f5f7fa;padding:12px;border-radius:4px">${wishlistContent}</p>`
                : '<p style="color:#888">Kein Wunschzettel vorhanden.</p>'

            try {
                const res = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${RESEND_API_KEY}`,
                    },
                    body: JSON.stringify({
                        from: FROM,
                        to: [giverEmail],
                        subject: `Deine Wichtel-Zuweisung: ${action.name}`,
                        html: `
                            <h2>Die Auslosung hat stattgefunden!</h2>
                            <p>Aktion: <strong>${action.name}</strong></p>
                            <p>Du wichtelst für: <strong>${receiverName}</strong></p>
                            ${wishlistHtml}
                            <p>Übergabedatum: <strong>${action.handover_date}</strong></p>
                            <p><a href="${SITE_URL}">Zur Aktion</a></p>
                        `,
                    }),
                })
                if (!res.ok) {
                    console.error(`E-Mail an ${giverEmail} fehlgeschlagen: ${res.status}`)
                }
            } catch (emailErr) {
                console.error(`E-Mail an ${giverEmail} konnte nicht gesendet werden:`, emailErr)
            }
        }

        return new Response(JSON.stringify({ ok: true }), {
            headers: { 'Content-Type': 'application/json' },
        })
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 })
    }
})
