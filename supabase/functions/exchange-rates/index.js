// @deno-types="https://deno.land/std@0.168.0/http/server.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: corsHeaders
        });
    }
    try {
        // Retourner des taux de change par défaut
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
        return new Response(JSON.stringify(rates), {
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
            }
        });
    }
    catch (error) {
        console.error('Erreur dans exchange-rates:', error);
        const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
        return new Response(JSON.stringify({
            error: errorMessage,
            rates: {
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
            }
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
            }
        });
    }
});
