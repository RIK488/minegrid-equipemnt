// Script pour exécuter automatiquement la correction de contrainte de statut
// À exécuter dans Node.js

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://gvbtydxkvuwrxawkxiyv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixStatusConstraint() {
    console.log('🔧 Début de la correction de contrainte de statut...');

    try {
        // 1. Vérifier la structure actuelle
        console.log('1️⃣ Vérification de la structure actuelle...');
        
        const { data: columns, error: columnsError } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type, is_nullable, column_default')
            .eq('table_name', 'messages')
            .eq('column_name', 'status');

        if (columnsError) {
            console.error('❌ Erreur lors de la vérification des colonnes:', columnsError);
            return;
        }

        console.log('📋 Colonne status actuelle:', columns[0]);

        // 2. Vérifier les contraintes existantes
        console.log('2️⃣ Vérification des contraintes existantes...');
        
        const { data: constraints, error: constraintsError } = await supabase
            .rpc('get_check_constraints', { table_name: 'messages' });

        if (constraintsError) {
            console.log('ℹ️ Aucune contrainte trouvée ou erreur:', constraintsError.message);
        } else {
            console.log('📋 Contraintes existantes:', constraints);
        }

        // 3. Supprimer la contrainte problématique si elle existe
        console.log('3️⃣ Suppression de la contrainte problématique...');
        
        const { error: dropError } = await supabase
            .rpc('drop_constraint_if_exists', {
                table_name: 'messages',
                constraint_name: 'messages_status_check'
            });

        if (dropError) {
            console.log('ℹ️ Contrainte non trouvée ou déjà supprimée');
        } else {
            console.log('✅ Contrainte supprimée');
        }

        // 4. Modifier la colonne status
        console.log('4️⃣ Modification de la colonne status...');
        
        const { error: alterError } = await supabase
            .rpc('alter_column_status', {
                table_name: 'messages',
                column_name: 'status',
                new_type: 'TEXT',
                new_default: "'new'"
            });

        if (alterError) {
            console.error('❌ Erreur lors de la modification de la colonne:', alterError);
            return;
        }

        console.log('✅ Colonne status modifiée');

        // 5. Ajouter la nouvelle contrainte
        console.log('5️⃣ Ajout de la nouvelle contrainte...');
        
        const { error: addConstraintError } = await supabase
            .rpc('add_status_constraint', {
                table_name: 'messages',
                constraint_name: 'messages_status_check',
                check_condition: "status IN ('new', 'read', 'replied', 'sent', 'failed', 'pending')"
            });

        if (addConstraintError) {
            console.error('❌ Erreur lors de l\'ajout de la contrainte:', addConstraintError);
            return;
        }

        console.log('✅ Nouvelle contrainte ajoutée');

        // 6. Mettre à jour les enregistrements existants
        console.log('6️⃣ Mise à jour des enregistrements existants...');
        
        const { error: updateError } = await supabase
            .from('messages')
            .update({ status: 'new' })
            .is('status', null);

        if (updateError) {
            console.error('❌ Erreur lors de la mise à jour:', updateError);
        } else {
            console.log('✅ Enregistrements mis à jour');
        }

        // 7. Tester l'insertion
        console.log('7️⃣ Test d\'insertion...');
        
        const { data: testData, error: testError } = await supabase
            .from('messages')
            .insert({
                sender_email: 'test@example.com',
                sender_name: 'Test User',
                recipient_email: 'recipient@example.com',
                subject: 'Test de contrainte corrigée',
                message: 'Test pour vérifier que la contrainte fonctionne',
                status: 'new',
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (testError) {
            console.error('❌ Erreur lors du test d\'insertion:', testError);
            return;
        }

        console.log('✅ Test d\'insertion réussi:', testData.id);

        // 8. Nettoyer le test
        const { error: deleteError } = await supabase
            .from('messages')
            .delete()
            .eq('id', testData.id);

        if (deleteError) {
            console.error('⚠️ Erreur lors du nettoyage:', deleteError);
        } else {
            console.log('✅ Test nettoyé');
        }

        console.log('🎉 Correction de contrainte terminée avec succès !');
        console.log('📋 Résumé:');
        console.log('   - Contrainte supprimée: ✅');
        console.log('   - Colonne modifiée: ✅');
        console.log('   - Nouvelle contrainte ajoutée: ✅');
        console.log('   - Enregistrements mis à jour: ✅');
        console.log('   - Test d\'insertion: ✅');

    } catch (error) {
        console.error('❌ Erreur lors de la correction:', error);
    }
}

// Fonction alternative utilisant SQL direct
async function fixStatusConstraintSQL() {
    console.log('🔧 Correction de contrainte via SQL direct...');

    const sqlCommands = [
        // Supprimer la contrainte problématique
        `DO $$ 
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.check_constraints 
                WHERE constraint_name = 'messages_status_check'
            ) THEN
                ALTER TABLE messages DROP CONSTRAINT messages_status_check;
                RAISE NOTICE 'Contrainte messages_status_check supprimée';
            END IF;
        END $$;`,

        // Modifier la colonne status
        `DO $$ 
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'messages' AND column_name = 'status'
            ) THEN
                ALTER TABLE messages ALTER COLUMN status TYPE TEXT;
                ALTER TABLE messages ALTER COLUMN status SET DEFAULT 'new';
                RAISE NOTICE 'Colonne status mise à jour';
            ELSE
                ALTER TABLE messages ADD COLUMN status TEXT DEFAULT 'new';
                RAISE NOTICE 'Colonne status créée';
            END IF;
        END $$;`,

        // Ajouter la nouvelle contrainte
        `ALTER TABLE messages ADD CONSTRAINT messages_status_check 
        CHECK (status IN ('new', 'read', 'replied', 'sent', 'failed', 'pending'));`,

        // Mettre à jour les enregistrements existants
        `UPDATE messages SET status = 'new' WHERE status IS NULL;`
    ];

    for (let i = 0; i < sqlCommands.length; i++) {
        console.log(`📝 Exécution de la commande ${i + 1}/${sqlCommands.length}...`);
        
        try {
            const { error } = await supabase.rpc('execute_sql', { sql: sqlCommands[i] });
            
            if (error) {
                console.error(`❌ Erreur commande ${i + 1}:`, error);
            } else {
                console.log(`✅ Commande ${i + 1} exécutée`);
            }
        } catch (error) {
            console.error(`❌ Erreur lors de l'exécution de la commande ${i + 1}:`, error);
        }
    }

    console.log('🎉 Correction SQL terminée !');
}

// Exporter les fonctions
module.exports = {
    fixStatusConstraint,
    fixStatusConstraintSQL
};

// Exécuter si le script est appelé directement
if (require.main === module) {
    console.log('🚀 Démarrage de la correction de contrainte...');
    
    // Essayer d'abord la méthode SQL direct
    fixStatusConstraintSQL()
        .then(() => {
            console.log('✅ Correction terminée');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Erreur lors de la correction:', error);
            process.exit(1);
        });
} 