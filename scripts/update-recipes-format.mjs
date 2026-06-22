// Tüm tarif kayıtlarını çullama (blog) formatına çevirir.
// Çalıştırma:  node --env-file=.env.local scripts/update-recipes-format.mjs
import { createClient } from '@supabase/supabase-js'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

// Slug → kısa hikâye/lore cümlesi (intro paragrafının ikinci yarısı)
const LORE = {
  'ustasindan-kirsehir-tandir-kebabi-tarifi': 'Kırşehir mutfağının tartışmasız simgesi olan tandır kebabı, kuzu etinin tandır taşında saatlerce kendi yağıyla yavaş yavaş pişirilmesiyle elde edilen, şehre kimlik kazandırmış bir yöresel et yemeğidir.',
  'ustasindan-kirsehir-yaglamasi-tarifi': 'Kırşehir yağlaması, ince yufkaların kıymalı harç ve yoğurtla katmanlanıp tereyağıyla taçlandırıldığı, bölge sofralarının baş tacı yöresel bir lezzettir.',
  'ustasindan-kete-kirsehir-usulu-tarifi': 'Kete, Kırşehir ve çevresinde kavrulmuş unun tereyağıyla buluştuğu, mayalı hamurla sarılarak fırınlanan, kahvaltı ve ikram sofralarının vazgeçilmez geleneksel hamur işidir.',
  'ustasindan-etli-ekmek-konya-tarifi': 'Etli ekmek, Konya ve İç Anadolu mutfağının uzun ince hamurlu, kıymalı harçla pişirilen tescilli klasik bir taş fırın lezzetidir.',
  'ustasindan-tirit-tarifi': 'Tirit, bayat yufkanın et suyu ve sarımsaklı yoğurtla buluştuğu, Anadolu’da yüzyıllardır pişirilen ekonomik ama görkemli bir köylü yemeğidir.',
  'ustasindan-bulgur-pilavi-tarifi': 'Bulgur pilavı, İç Anadolu’nun buğday kültürünün en sade ve doyurucu temsilcisi; et yemeklerinin yanına dane dane servis edilen vazgeçilmez bir yan lezzettir.',
  'ustasindan-kuru-fasulye-tarifi': 'Kuru fasulye, Türk mutfağının “milli yemek” mertebesindeki klasiği; etli pişirildiğinde pilav ve turşuyla tamamlanan bir sofra ritüelidir.',
  'ustasindan-manti-kayseri-usulu-tarifi': 'Kayseri mantısı, kaşıkta kırk tane sayılacak kadar minik el mantısının sarımsaklı yoğurt ve naneli tereyağı sosuyla taçlandığı İç Anadolu’nun zarif bir hamur işidir.',
  'ustasindan-mercimek-corbasi-tarifi': 'Mercimek çorbası, Anadolu’nun her sofrasında kendine yer bulan, kahvaltıdan akşam yemeğine kadar her öğüne yakışan kıvamlı bir klasiktir.',
  'ustasindan-tarhana-corbasi-tarifi': 'Tarhana çorbası, ev yapımı kurutulmuş tarhananın kış aylarında salça ve naneyle buluştuğu, Anadolu’nun en şifalı geleneksel çorbasıdır.',
  'ustasindan-yayla-corbasi-tarifi': 'Yayla çorbası, yoğurt, pirinç ve kuru naneyle hazırlanan, hafif ve doyurucu yapısıyla Türk sofralarının zarif bir terbiyeli çorbasıdır.',
  'ustasindan-dugun-corbasi-tarifi': 'Düğün çorbası, kuzu eti suyuyla yapılan terbiyeli bir Osmanlı klasiği; davet ve düğün sofralarının açılış lezzeti olarak ün kazanmıştır.',
  'ustasindan-iskembe-corbasi-tarifi': 'İşkembe çorbası, sarımsaklı sirke ve kızgın tereyağıyla servis edilen, sabaha karşı sofraların efsanevi terbiyeli klasiğidir.',
  'ustasindan-eriste-tarifi': 'Erişte, ev yapımı kurutulmuş hamurun tereyağı, ceviz ya da lor peyniriyle buluştuğu, Anadolu’nun kadim bir kış erzakıdır.',
  'ustasindan-hosmerim-tarifi': 'Höşmerim, taze tuzsuz lor peyniri, irmik ve şekerle hazırlanan, Anadolu’nun pratik ama görkemli bir peynir tatlısıdır.',
  'ustasindan-asure-tarifi': 'Aşure, on iki çeşit tahıl, kuru meyve ve baklagilin bir araya geldiği, Muharrem ayında ikram edilen kadim bir bereket tatlısıdır.',
  'ustasindan-un-helvasi-tarifi': 'Un helvası, kavrulmuş unun tereyağı ve sütle buluştuğu, ikram ve hayır sofralarının vazgeçilmez geleneksel tatlısıdır.',
  'ustasindan-sutlac-tarifi': 'Sütlaç, pirinç, süt ve şekerin sabırla pişirildiği, fırında pembeleştirilmiş yüzüyle Türk mutfağının en sevilen muhallebisidir.',
  'ustasindan-kadayif-tarifi': 'Tel kadayıf, ince tellerin tereyağı ve cevizle buluşup şerbetle taçlandığı, davet sofralarının çıtır çıtır klasik tatlısıdır.',
  'ustasindan-lahmacun-tarifi': 'Lahmacun, ince hamurun harçla pişip limon, maydanoz ve sumakla servis edildiği Güneydoğu kökenli, Anadolu sofralarının vazgeçilmez bir lezzetidir.',
  'ustasindan-kiymali-pide-tarifi': 'Kıymalı pide, mayalı hamurun kıyma harcıyla taş fırında pişirildiği, Karadeniz’den İç Anadolu’ya kadar her bölgenin sahip çıktığı bir klasiktir.',
  'ustasindan-cig-kofte-etsiz-tarifi': 'Çiğ köfte, ince bulgurun isot, salça ve baharatlarla uzun süre yoğrulduğu, marul ve limonla servis edilen Güneydoğu kökenli bir Anadolu klasiğidir.',
  'ustasindan-bazlama-tarifi': 'Bazlama, sacda pişirilen kabarık mayalı ekmeğin en bilinen hâli; Anadolu kahvaltılarının ve çay sofralarının en sıcak misafiridir.',
  'ustasindan-yufka-ekmegi-tarifi': 'Yufka, sacda ince ince pişirilen geleneksel ekmeğin atası; dürüm ve gözlemenin temelini oluşturan binlerce yıllık Anadolu mirasıdır.',
  'ustasindan-sac-kavurma-tarifi': 'Saç kavurma, kuzu etinin sebzelerle birlikte yüksek ateşte hızlıca kavrulduğu, davet sofralarının görsel ve lezzet şovu sayılan bir Anadolu klasiğidir.',
  'ustasindan-yaprak-sarma-etli-tarifi': 'Etli yaprak sarması, asma yapraklarının pirinçli kıyma harcıyla parmak inceliğinde sarıldığı, davet sofralarının sabır ve ustalık isteyen başyapıtıdır.',
  'ustasindan-kabak-dolmasi-tarifi': 'Kabak dolması, sakız kabağının pirinçli kıyma harcıyla doldurulup sarımsaklı yoğurtla servis edildiği bir yaz sofrası klasiğidir.',
  'ustasindan-biber-dolmasi-etli-tarifi': 'Etli biber dolması, dolmalık biberlerin pirinçli kıyma harcıyla doldurulup yavaş pişirildiği, Anadolu sofralarının vazgeçilmez bir et yemeğidir.',
  'ustasindan-karniyarik-tarifi': 'Karnıyarık, patlıcanın kıymalı harçla yarılıp fırınlandığı, pilavla servis edilen ve davet sofralarının görkemli bir ana yemeğidir.',
  'ustasindan-turlu-tarifi': 'Türlü, mevsim sebzelerinin etle birlikte tencerede uzun süre pişirildiği, Anadolu’nun bereketini bir kabartma gibi sunan tencere yemeğidir.',
  'ustasindan-kuru-kofte-tarifi': 'Kuru köfte, dana kıymanın baharatla yoğrulup ızgarada veya tavada pişirildiği, pilav ve közle servis edilen vazgeçilmez bir Türk klasiğidir.',
  'ustasindan-sulu-kofte-tarifi': 'Sulu köfte, küçük pirinçli köftelerin sebzelerle hafif salçalı suyunda pişirildiği, ev sofralarının doyurucu ve şefkatli bir yemeğidir.',
  'ustasindan-icli-kofte-tarifi': 'İçli köfte, ince bulgur kabuğunun cevizli kıyma içiyle buluştuğu, Güneydoğu kökenli, davet sofralarının ustalık isteyen bir başyapıtıdır.',
  'ustasindan-patlican-kebabi-tarifi': 'Patlıcan kebabı, kıyma köftelerle patlıcan dilimlerinin tepside dizilip fırında pişirildiği, geleneksel Anadolu sofralarının görsel zengini bir yemeğidir.',
  'ustasindan-hunkar-begendi-tarifi': 'Hünkar Beğendi, közlenmiş patlıcan püresi yatağında kuzu yahnisinin sunulduğu, adını Osmanlı sarayından alan görkemli bir saray klasiğidir.',
  'ustasindan-kelle-paca-tarifi': 'Kelle paça, kuzunun kelle ve paçalarının saatlerce haşlandığı, sarımsaklı sirkeyle servis edilen ve sabah saatlerinin kadim bir çorbası olan Anadolu klasiğidir.',
  'ustasindan-kuzu-pirzola-tarifi': 'Kuzu pirzola, kemikli pirzolaların kekikli zeytinyağında dinlendirilip mangalda pişirildiği, davet sofralarının nezih bir et lezzetidir.',
  'ustasindan-kiymali-bamya-tarifi': 'Kıymalı bamya, taze bamyanın kıyma ve domatesle pişirildiği, limon suyuyla canlandırılan ve pilavla servis edilen yaz tencere yemeğidir.',
  'ustasindan-etli-nohut-tarifi': 'Etli nohut, kuru nohutun kuşbaşı etle birlikte uzun süre pişirildiği, pilavla servis edilen ve İç Anadolu sofralarının doyurucu bir klasiğidir.',
  'ustasindan-etli-bezelye-tarifi': 'Etli bezelye, taze veya donmuş bezelyenin havuç ve etle birlikte hafif salçalı suyunda pişirildiği, mevsim geçişlerinin sevilen tencere yemeğidir.',
  'ustasindan-sehriyeli-pilav-tarifi': 'Şehriyeli pirinç pilavı, tereyağında pembeleştirilmiş şehriyenin pirinçle buluştuğu, et yemeklerinin yanına dane dane servis edilen Türk sofralarının olmazsa olmazıdır.',
  'ustasindan-ic-pilav-tarifi': 'İç pilav, çam fıstığı, kuş üzümü ve baharatlarla zenginleştirilen, hindi veya tavuk dolduruculuğunda da kullanılan Osmanlı saray mutfağının zarif bir pilavıdır.',
  'ustasindan-cevizli-sucuk-tarifi': 'Cevizli sucuk (orcik), iri cevizlerin üzüm şırasına batırılıp kurutulmasıyla elde edilen, Anadolu’nun kış erzaklarından doğal bir tatlıdır.',
  'ustasindan-pekmez-helvasi-tarifi': 'Pekmez helvası, kavrulmuş unun pekmezle buluştuğu, Anadolu’nun kış sofralarına hem enerji hem doğal tat veren bir geleneksel tatlıdır.',
  'ustasindan-bici-bici-tarifi': 'Bici bici, soğuk peltenin kar gibi rendelenmiş buz ve gül şurubuyla servis edildiği, Adana kökenli serinleten yaz tatlısıdır.',
  'ustasindan-pirasali-pide-tarifi': 'Pırasalı pide, ince mayalı hamurun pırasa ve lor peyniriyle taçlandırıldığı, kahvaltı ve akşamüstü sofralarının doyurucu bir hamur işidir.',
  'ustasindan-acili-ezme-tarifi': 'Acılı ezme, ince doğranmış sebzelerin isot, nar ekşisi ve sumakla harmanlandığı, et yemeklerinin yanına vazgeçilmez bir kebap mezesidir.',
  'ustasindan-coban-salata-tarifi': 'Çoban salata, mevsim sebzelerinin küp küp doğranıp limon, sumak ve zeytinyağıyla tatlandırıldığı, Türk sofralarının en doğal ve tazelik veren salatasıdır.',
  'ustasindan-mihlama-kuymak-tarzi-ic-anadolu-tarifi': 'Mihlama, mısır unu, taze peynir ve tereyağının buluştuğu, Karadeniz’den İç Anadolu’ya uyarlanmış sıcak servisli bir kahvaltı klasiğidir.',
  'ustasindan-pekmezli-tahin-tarifi': 'Pekmezli tahin, susam ezmesiyle üzüm pekmezinin birleştiği, Anadolu kahvaltılarının demir ve enerji kaynağı en bilinen ev karışımıdır.',
}

const buildContent = (post, lore) => {
  const r = post.recipe_data || {}
  const ingredients = (r.ingredients || []).filter(Boolean)
  const steps = (r.steps || []).filter(Boolean)
  const tips = r.tips || ''
  const name = post.title.replace(/^Ustasından\s+/, '').replace(/\s+Tarifi.*$/, '')

  const li = arr => arr.map(x => `<li>${x}</li>`).join('')

  const meta = `<p><strong>Hazırlık:</strong> ${r.prep_time || '-'} • <strong>Pişirme:</strong> ${r.cook_time || '-'} • <strong>Porsiyon:</strong> ${r.servings || '-'} • <strong>Zorluk:</strong> ${r.difficulty || '-'}</p>`

  return `<p><strong>${name}</strong>, ${lore}</p>
<p>Tandırcı Usta mutfağında bu tarifi geleneksel yöntemleriyle, sabırla ve özenle hazırlıyoruz. Aşağıdaki adımları takip ederek sofranıza aynı yöresel lezzeti taşıyabilirsiniz.</p>
${meta}
<h2>Malzemeler</h2>
<ul>${li(ingredients)}</ul>
<h2>Adım Adım Pişirme</h2>
<ol>${li(steps)}</ol>${tips ? `\n<h2>Püf Noktaları</h2>\n<p>${tips}</p>` : ''}`
}

// Slugları LORE'dan al; ek olarak farklı slugla yayında olabilen Kete'yi de yakala
const slugs = Object.keys(LORE)
const { data: posts, error } = await sb.from('blog_posts').select('*').in('slug', slugs)
if (error) { console.error(error); process.exit(1) }
console.log(`${posts.length} kayıt bulundu, güncelleniyor...`)

let ok = 0, fail = 0
for (const p of posts) {
  const lore = LORE[p.slug]
  if (!lore) { console.warn(`! lore yok: ${p.slug}`); continue }
  const content = buildContent(p, lore)
  const { error: e } = await sb.from('blog_posts')
    .update({ content, post_type: 'blog' })
    .eq('id', p.id)
  if (e) { console.error(`✗ ${p.slug}: ${e.message}`); fail++; continue }
  console.log(`✓ ${p.slug}${p.published ? ' [YAYINDA]' : ''}`)
  ok++
}

// Yayındaki Kete farklı slugla olabilir mi diye kontrol
const { data: ketes } = await sb.from('blog_posts').select('id,title,slug,published').ilike('slug', '%kete%')
console.log(`\nKete kayıtları: ${ketes.map(k => `${k.slug}(pub:${k.published})`).join(', ')}`)

console.log(`\nBitti: ${ok} güncellendi, ${fail} hata.`)
