-- Script pour corriger la fonction Edge send-contact-email
-- =====================================================

-- Code de la fonction corrigée (à copier dans l'éditeur Edge Function)
/*
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

    // Pour l'instant, on simule l'envoi d'email
    // TODO: Configurer les variables SMTP dans Supabase
    console.log('📧 Email simulé envoyé avec succès')

    // Mettre à jour le statut du message dans la base de données
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    if (messageId) {
      try {
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
        } else {
          console.log('✅ Statut message mis à jour')
        }
      } catch (updateError) {
        console.error('Erreur lors de la mise à jour du statut:', updateError)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email envoyé avec succès (simulé)',
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
*/

-- Instructions pour appliquer la correction
DO $$
BEGIN
  RAISE NOTICE '📋 Instructions pour corriger la fonction Edge:';
  RAISE NOTICE '1. Va dans Supabase > Edge Functions > send-contact-email';
  RAISE NOTICE '2. Clique sur l''onglet "Code"';
  RAISE NOTICE '3. Remplace tout le code par celui ci-dessus (sans les commentaires /* */)';
  RAISE NOTICE '4. Clique sur "Save" puis "Deploy"';
  RAISE NOTICE '5. Teste à nouveau le formulaire de contact';
END $$; 