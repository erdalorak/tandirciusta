// Menü açıklamalarını güncellemek için bu scripti çalıştırın:
// node scripts/update-menu-descriptions.js

const https = require('https');

const SUPABASE_URL = 'https://rjpoowzfustacom.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqcG9vd3pmeXhxa2poY3V2dGpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDE0OTYyNiwiZXhwIjoyMDU5NzI1NjI2fQ.bOqnoOTub_iFbsrGTqe7vc2BbdvV0nSPyuAJlUoR6mM';

const updates = [
  {
    name: 'Kuzu Tandır',
    description: 'Meşe odununda tütsülenerek saatlerce yavaş pişirilen kuzu tandır; duman aroması, yumuşacık dokusu ve özgün tadıyla Kırşehir'in simge lezzeti. Katkısız, doğal yöntemle hazırlanır.'
  },
  {
    name: 'Kelle Paça',
    description: 'Odun ateşinde 12 saat boyunca yavaş pişirilen geleneksel kelle paça; doğal kolajen kaynağıdır, eklem ve bağışıklık sağlığını destekler. İsteğe göre kelle eti veya paça olarak ayrı ayrı servis edilir.'
  },
  {
    name: 'İşkembe',
    description: 'Çok aşamalı temizlik sürecinden geçirilerek hijyeni garanti altına alınan işkembe çorbamız; geleneksel tarifle terbiyeli olarak hazırlanır. Sindirim dostu, tok ve besleyici.'
  },
  {
    name: 'Tavuk Çorbası',
    description: 'Tiftilmiş bütün tavuktan, bol etli olarak hazırlanan ev usulü tavuk çorbası. Her kasede hissedilen gerçek tavuk yoğunluğu ve geleneksel Anadolu tarifi.'
  },
  {
    name: 'Mercimek',
    description: 'Kırmızı mercimeğin süzülerek hazırlandığı kadifemsi mercimek çorbası; doğal, katkısız ve günlük taze pişirim. Anadolu mutfağının klasik tarifi, ustalık farkıyla.'
  },
];

function patch(name, description) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ description });
    const path = `/rest/v1/menu_items?name=ilike.${encodeURIComponent('*' + name + '*')}`;
    const req = https.request({
      hostname: new URL(SUPABASE_URL).hostname,
      path,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Length': Buffer.byteLength(body),
        'Prefer': 'return=representation'
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        console.log(`${res.statusCode === 200 ? '✓' : '✗'} ${name} → ${res.statusCode}`);
        resolve();
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

(async () => {
  for (const u of updates) {
    await patch(u.name, u.description);
  }
  console.log('\nTamamlandı.');
})();
