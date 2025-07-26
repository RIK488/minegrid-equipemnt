import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, from, subject, html, machineId, messageId } = await req.json()

    // Validation des données
    if (!to || !from || !subject || !html) {
      return new Response(
        JSON.stringify({ error: 'Données manquantes' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Configuration SMTP (utiliser les variables d'environnement Supabase)
    const client = new SmtpClient()

    // Configuration pour Gmail ou autre service SMTP
    await client.connectTLS({
      hostname: Deno.env.get('SMTP_HOST') || 'smtp.gmail.com',
      port: parseInt(Deno.env.get('SMTP_PORT') || '587'),
      username: Deno.env.get('SMTP_USERNAME') || 'contact@minegrid-equipment.com',
      password: Deno.env.get('SMTP_PASSWORD') || '',
    })

    // Envoyer l'email
    await client.send({
      from: Deno.env.get('SMTP_FROM') || 'contact@minegrid-equipment.com',
      to: to,
      subject: subject,
      content: html,
      html: html,
    })

    await client.close()

    // Mettre à jour le statut du message dans la base de données
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    if (messageId) {
      const updateResponse = await fetch(`${supabaseUrl}/rest/v1/messages?id=eq.${messageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
        },
        body: JSON.stringify({
          status: 'sent',
          sent_at: new Date().toISOString()
        })
      })

      if (!updateResponse.ok) {
        console.error('Erreur mise à jour statut message:', await updateResponse.text())
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email envoyé avec succès',
        messageId: messageId 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Erreur envoi email:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Erreur lors de l\'envoi de l\'email',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 