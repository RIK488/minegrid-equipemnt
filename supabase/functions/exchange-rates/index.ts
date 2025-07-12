// @deno-types="https://deno.land/std@0.168.0/http/server.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Gérer les requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    // Taux de change par défaut (simulés)
    const rates = {
      EUR: 1,
      USD: 1.1,
      MAD: 11,
      XOF: 655,
      XAF: 655,
      NGN: 1650,
      ZAR: 20,
      EGP: 33,
      KES: 150,
      GHS: 15
    };
    
    console.log('Exchange rates function called successfully');
    
    return new Response(JSON.stringify(rates), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error: unknown) {
    console.error('Erreur dans exchange-rates:', error);
    
    // Retourner des taux par défaut même en cas d'erreur
    const fallbackRates = {
      EUR: 1,
      USD: 1.1,
      MAD: 11,
      XOF: 655,
      XAF: 655,
      NGN: 1650,
      ZAR: 20,
      EGP: 33,
      KES: 150,
      GHS: 15
    };
    
    return new Response(JSON.stringify(fallbackRates), {
      status: 200, // Retourner 200 au lieu de 500 pour éviter les erreurs
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
});
