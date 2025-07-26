// @deno-types="https://deno.land/std@0.168.0/http/server.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

serve(async (req: Request) => {
  // Gérer les requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    const { to, subject, html, from = 'noreply@minegrid-equipment.com' }: EmailData = await req.json();

    // Validation des données
    if (!to || !subject || !html) {
      return new Response(JSON.stringify({ 
        error: 'Données manquantes: to, subject, html requis' 
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Configuration Supabase SMTP
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.log('⚠️ Configuration Supabase manquante, simulation de l\'envoi');
      
      // Simulation de l'envoi
      console.log('📧 Email simulé:');
      console.log('   À:', to);
      console.log('   De:', from);
      console.log('   Sujet:', subject);
      console.log('   Contenu:', html.substring(0, 100) + '...');
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Email simulé avec succès (configuration Supabase manquante)',
        id: 'simulated-' + Date.now()
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Envoi avec Supabase SMTP
    const emailData = {
      to: [to],
      from: from,
      subject: subject,
      html: html,
    };

    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/send_email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur Supabase SMTP:', errorText);
      
      return new Response(JSON.stringify({ 
        error: 'Erreur lors de l\'envoi de l\'email via Supabase SMTP',
        details: errorText
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    const result = await response.json();
    console.log('✅ Email envoyé avec succès via Supabase SMTP:', result);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Email envoyé avec succès via Supabase SMTP',
      id: result.id || 'supabase-' + Date.now()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error: unknown) {
    console.error('❌ Erreur dans send-email:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}); 