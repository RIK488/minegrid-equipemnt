import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Configuration Supabase
const supabaseUrl = 'https://gvbtydxkvuwrxawkxiyv.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixDatabaseStructure() {
    console.log('🔧 Correction de la structure de la base de données...');
    
    try {
        // 1. Corriger la table messages
        console.log('1️⃣ Correction de la table messages...');
        const messagesSQL = fs.readFileSync('fix-messages-table.sql', 'utf8');
        
        const { error: messagesError } = await supabase.rpc('exec_sql', { 
            sql: messagesSQL 
        });
        
        if (messagesError) {
            console.error('❌ Erreur correction table messages:', messagesError);
        } else {
            console.log('✅ Table messages corrigée');
        }
        
        // 2. Corriger la table offers
        console.log('2️⃣ Correction de la table offers...');
        const offersSQL = fs.readFileSync('fix-offers-table.sql', 'utf8');
        
        const { error: offersError } = await supabase.rpc('exec_sql', { 
            sql: offersSQL 
        });
        
        if (offersError) {
            console.error('❌ Erreur correction table offers:', offersError);
        } else {
            console.log('✅ Table offers corrigée');
        }
        
        // 3. Créer la table notifications
        console.log('3️⃣ Création de la table notifications...');
        const notificationsSQL = fs.readFileSync('create-notifications-table.sql', 'utf8');
        
        const { error: notificationsError } = await supabase.rpc('exec_sql', { 
            sql: notificationsSQL 
        });
        
        if (notificationsError) {
            console.error('❌ Erreur création table notifications:', notificationsError);
        } else {
            console.log('✅ Table notifications créée');
        }
        
        // 4. Vérifier la structure finale
        console.log('4️⃣ Vérification de la structure finale...');
        
        const { data: messagesStructure, error: messagesStructError } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type, is_nullable')
            .eq('table_name', 'messages')
            .order('ordinal_position');
            
        if (!messagesStructError) {
            console.log('📋 Structure table messages:');
            messagesStructure.forEach(col => {
                console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable})`);
            });
        }
        
        const { data: offersStructure, error: offersStructError } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type, is_nullable')
            .eq('table_name', 'offers')
            .order('ordinal_position');
            
        if (!offersStructError) {
            console.log('📋 Structure table offers:');
            offersStructure.forEach(col => {
                console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable})`);
            });
        }
        
        console.log('🎉 Correction de la structure terminée !');
        console.log('📋 Prochaines étapes :');
        console.log('   1. Redémarrer l\'application');
        console.log('   2. Tester l\'affichage des messages');
        console.log('   3. Vérifier que les erreurs ont disparu');
        
    } catch (error) {
        console.error('❌ Erreur générale:', error);
    }
}

// Alternative : exécuter directement les requêtes SQL
async function fixDatabaseStructureDirect() {
    console.log('🔧 Correction directe de la structure de la base de données...');
    
    try {
        // 1. Corriger messages
        console.log('1️⃣ Correction table messages...');
        
        const messagesQueries = [
            'ALTER TABLE messages DROP COLUMN IF EXISTS sender_id;',
            'ALTER TABLE messages DROP COLUMN IF EXISTS receiver_id;',
            'ALTER TABLE messages DROP COLUMN IF EXISTS seller_id;',
            'ALTER TABLE messages ADD COLUMN IF NOT EXISTS recipient_email TEXT;',
            'ALTER TABLE messages ADD COLUMN IF NOT EXISTS parent_message_id UUID;',
            'ALTER TABLE messages ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE;',
            'ALTER TABLE messages ADD COLUMN IF NOT EXISTS error_message TEXT;',
            'ALTER TABLE messages ADD COLUMN IF NOT EXISTS subject TEXT;',
            'ALTER TABLE messages ALTER COLUMN status SET DEFAULT \'new\';'
        ];
        
        for (const query of messagesQueries) {
            const { error } = await supabase.rpc('exec_sql', { sql: query });
            if (error) console.error('❌ Erreur query messages:', error);
        }
        
        console.log('✅ Table messages corrigée');
        
        // 2. Corriger offers
        console.log('2️⃣ Correction table offers...');
        
        const offersQueries = [
            'ALTER TABLE offers DROP COLUMN IF EXISTS buyer_id;',
            'ALTER TABLE offers DROP COLUMN IF EXISTS seller_id;',
            'ALTER TABLE offers ADD COLUMN IF NOT EXISTS buyer_email TEXT;',
            'ALTER TABLE offers ADD COLUMN IF NOT EXISTS buyer_name TEXT;',
            'ALTER TABLE offers ADD COLUMN IF NOT EXISTS seller_email TEXT;',
            'ALTER TABLE offers ADD COLUMN IF NOT EXISTS seller_name TEXT;',
            'ALTER TABLE offers ADD COLUMN IF NOT EXISTS subject TEXT;',
            'ALTER TABLE offers ADD COLUMN IF NOT EXISTS message TEXT;',
            'ALTER TABLE offers ADD COLUMN IF NOT EXISTS amount DECIMAL(10,2);',
            'ALTER TABLE offers ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT \'EUR\';',
            'ALTER TABLE offers ALTER COLUMN status SET DEFAULT \'pending\';'
        ];
        
        for (const query of offersQueries) {
            const { error } = await supabase.rpc('exec_sql', { sql: query });
            if (error) console.error('❌ Erreur query offers:', error);
        }
        
        console.log('✅ Table offers corrigée');
        
        // 3. Créer notifications
        console.log('3️⃣ Création table notifications...');
        
        const notificationsQuery = `
            CREATE TABLE IF NOT EXISTS notifications (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                user_email TEXT NOT NULL,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                type TEXT NOT NULL DEFAULT 'info',
                data JSONB DEFAULT '{}',
                read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `;
        
        const { error: notificationsError } = await supabase.rpc('exec_sql', { 
            sql: notificationsQuery 
        });
        
        if (notificationsError) {
            console.error('❌ Erreur création notifications:', notificationsError);
        } else {
            console.log('✅ Table notifications créée');
        }
        
        console.log('🎉 Structure de base de données corrigée !');
        
    } catch (error) {
        console.error('❌ Erreur générale:', error);
    }
}

// Exécuter
fixDatabaseStructureDirect(); 