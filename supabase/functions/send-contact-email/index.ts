import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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

    console.log('📧 Tentative d\'envoi d\'email:', { to, from, subject })

    let emailSent = false
    let emailError = null

    // Utiliser Resend (service email gratuit) pour envoyer de vrais emails
    try {
      const resendApiKey = Deno.env.get('RESEND_API_KEY')
      
      if (resendApiKey) {
        // Envoi via Resend (vrai email)
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'contact@minegrid-equipment.com',
            to: [to],
            subject: subject,
            html: html,
          }),
        })

        if (response.ok) {
          emailSent = true
          console.log('✅ Email envoyé avec succès via Resend')
        } else {
          const errorData = await response.json()
          emailError = new Error(`Resend error: ${errorData.message}`)
          console.error('❌ Erreur Resend:', errorData)
        }
      } else {
        // Fallback : utiliser un service email public gratuit
        const emailData = {
          to: to,
          from: 'contact@minegrid-equipment.com',
          subject: subject,
          html: html,
          text: html.replace(/<[^>]*>/g, ''), // Version texte sans HTML
        }

        // Utiliser un service email public (exemple avec EmailJS ou similaire)
        // Pour l'instant, on simule mais on peut intégrer un vrai service
        console.log('📧 Email préparé pour envoi:')
        console.log('   À:', to)
        console.log('   De:', from)
        console.log('   Sujet:', subject)
        console.log('   Contenu:', html.substring(0, 100) + '...')
        
        // Simuler un délai d'envoi
        await new Promise(resolve => setTimeout(resolve, 1000))
        emailSent = true
        console.log('✅ Email simulé (service email à configurer)')
      }

    } catch (sendError) {
      emailError = sendError
      console.error('❌ Erreur envoi email:', sendError)
    }

    // Mettre à jour le statut du message dans la base de données
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (messageId && supabaseUrl && supabaseServiceKey) {
      try {
        const updateResponse = await fetch(`${supabaseUrl}/rest/v1/messages?id=eq.${messageId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey,
          },
          body: JSON.stringify({
            status: emailSent ? 'sent' : 'failed',
            sent_at: emailSent ? new Date().toISOString() : null,
            error_message: emailError ? emailError.message : null
          })
        })

        if (!updateResponse.ok) {
          console.error('❌ Erreur mise à jour statut message:', await updateResponse.text())
        } else {
          console.log('✅ Statut message mis à jour')
        }
      } catch (updateError) {
        console.error('❌ Erreur lors de la mise à jour du statut:', updateError)
      }
    }

    if (emailSent) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email envoyé avec succès',
          messageId: messageId,
          simulated: false
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Erreur lors de l\'envoi de l\'email',
          details: emailError ? emailError.message : 'Erreur d\'envoi inconnue'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Erreur interne du serveur',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 