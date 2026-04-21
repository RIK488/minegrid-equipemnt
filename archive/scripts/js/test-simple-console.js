// Test simple pour console navigateur
console.log('🔧 Test MachineDetail vs Réponse...');

// Test 1: MachineDetail
console.log('📋 Test 1: MachineDetail Email');
supabase.functions.invoke('send-contact-email', {
  body: {
    to: 'test@example.com',
    from: 'contact@minegrid-equipment.com',
    subject: 'Test MachineDetail',
    html: '<h1>Test MachineDetail</h1>',
    machineId: 'test-machine',
    messageId: 'test-' + Date.now()
  }
}).then(r => console.log('✅ MachineDetail:', r)).catch(e => console.error('❌ MachineDetail:', e));

// Test 2: Réponse
console.log('📋 Test 2: Réponse Email');
supabase.functions.invoke('send-contact-email', {
  body: {
    to: 'test@example.com',
    from: 'contact@minegrid-equipment.com',
    subject: 'Réponse - Test',
    html: '<h1>Test Réponse</h1>',
    machineId: 'reply',
    messageId: 'test-' + Date.now()
  }
}).then(r => console.log('✅ Réponse:', r)).catch(e => console.error('❌ Réponse:', e));

// Test 3: Messages répondu
console.log('📋 Test 3: Messages répondu');
supabase.from('messages').select('*').eq('status', 'replied').limit(3).then(r => console.log('✅ Messages répondu:', r.data?.length || 0)).catch(e => console.error('❌ Messages:', e)); 