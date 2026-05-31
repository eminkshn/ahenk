'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import './landing.css'

const HOW_STEPS = [
  { emoji: '✉️', title: 'Hesap Oluştur', desc: 'E-posta adresinle saniyeler içinde ücretsiz hesap oluştur. Anında erişim.' },
  { emoji: '🏠', title: 'Sunucunu Kur', desc: 'Bir isim ve ikon seç — sunucun anında hazır. İstediğin kadar kanal ekle.' },
  { emoji: '🎉', title: 'Topluluğunu Davet Et', desc: 'Benzersiz davet kodunu paylaş. Ekibin katılsın, sohbet hemen başlasın.' },
]

export default function LandingPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    if (user) router.replace('/app')
  }, [user, router])

  const step = HOW_STEPS[activeStep]

  return (
    <div className="lp pat">
      {/* NAV */}
      <nav className="lp-nav">
        <button className="lp-nav-logo">🌸 AHENK</button>
        <div className="lp-nav-links">
          <a href="#features">Özellikler</a>
          <a href="#how">Nasıl Çalışır</a>
          <a href="#pricing">Planlar</a>
          <a href="#community">Topluluk</a>
        </div>
        <button className="lp-nav-cta" onClick={() => router.push('/register')}>Ücretsiz Başla</button>
      </nav>

      {/* HERO */}
      <section className="lp-hero">
        <div className="lp-hero-inner">
          <div className="lp-hero-badge">
            <span className="lp-hero-badge-dot" /> Şu an 1.200+ aktif topluluk
          </div>
          <h1 className="lp-h1">Topluluğunla<br /><em>Ahenk İçinde</em> Ol</h1>
          <p className="lp-hero-sub">Kendi sunucunu kur, kanallar oluştur, rollerle yönet. Sade, hızlı ve tamamen senin kontrolünde.</p>
          <div className="lp-hero-btns">
            <button className="lp-btn-primary" onClick={() => router.push('/register')}>Hemen Başla — Ücretsiz</button>
            <button className="lp-btn-ghost" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>Özellikleri Gör ↓</button>
          </div>

          {/* APP PREVIEW */}
          <div className="lp-preview">
            <div className="lp-preview-bar">
              <div className="lp-preview-dot" style={{ background: '#e85c6a' }} />
              <div className="lp-preview-dot" style={{ background: '#e8a83c', marginLeft: 4 }} />
              <div className="lp-preview-dot" style={{ background: '#43b581', marginLeft: 4 }} />
              <div className="lp-preview-title">Ahenk — Topluluk Chat</div>
            </div>
            <div className="lp-app-shell">
              <div className="lp-servers">
                <div className="lp-srv-icon active" style={{ background: 'linear-gradient(135deg,#8b3a52,#a84f68)' }}>🌸</div>
                <div className="lp-srv-div" />
                <div className="lp-srv-icon active">🎵</div>
                <div className="lp-srv-icon">🎸</div>
                <div className="lp-srv-icon">🌊</div>
                <div className="lp-srv-div" />
                <div className="lp-srv-icon" style={{ color: '#43b581', fontSize: 26, fontWeight: 700, background: 'rgba(67,181,129,.08)' }}>+</div>
              </div>
              <div className="lp-channels">
                <div className="lp-ch-header"><span style={{ fontSize: 13 }}>Ahenk HQ</span><span style={{ color: '#6a4858', fontSize: 14 }}>📋</span></div>
                <div className="lp-ch-section">Metin Kanalları</div>
                <div className="lp-ch-item active"><span style={{ color: '#6a4858', fontSize: 15 }}>#</span>genel</div>
                <div className="lp-ch-item"><span style={{ color: '#6a4858', fontSize: 15 }}>#</span>duyurular <span className="lp-ch-unread">3</span></div>
                <div className="lp-ch-item"><span style={{ color: '#6a4858', fontSize: 15 }}>#</span>proje-tartışma</div>
                <div className="lp-ch-item"><span style={{ color: '#6a4858', fontSize: 15 }}>#</span>tasarım</div>
                <div className="lp-ch-item"><span style={{ color: '#6a4858', fontSize: 15 }}>#</span>backend</div>
                <div className="lp-ch-user">
                  <div className="lp-ch-av">🌸<div className="lp-status-dot" style={{ background: '#43b581' }} /></div>
                  <div><div style={{ fontSize: 12, fontWeight: 700, color: '#f5e8ed' }}>selin_k</div><div style={{ fontSize: 10, color: '#6a4858' }}>çevrimiçi</div></div>
                </div>
              </div>
              <div className="lp-chat">
                <div className="lp-chat-header">
                  <span style={{ color: '#6a4858', fontSize: 16, fontWeight: 400 }}>#</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#f5e8ed' }}>genel</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: '#6a4858' }}>247 üye</span>
                </div>
                <div className="lp-chat-msgs">
                  {[
                    { av: '🌺', name: 'Ayşe', nameColor: '#e8a83c', badge: 'Moderatör', badgeBg: 'rgba(232,168,60,.12)', badgeColor: '#e8a83c', time: '10:42', text: 'Herkese günaydın! 🌸 Bugün proje toplantısı saat 15:00\'te.' },
                    { av: '🌙', name: 'Mehmet', nameColor: '#6db8e8', badge: 'Üye', badgeBg: 'rgba(109,184,232,.12)', badgeColor: '#6db8e8', time: '10:43', text: 'Günaydın! Backend kısmını tamamladım, review için hazır 🚀' },
                    { av: '⭐', name: 'Zeynep', nameColor: '#c96b82', badge: 'Admin', badgeBg: 'rgba(232,92,106,.12)', badgeColor: '#e85c6a', time: '10:45', text: 'Harika! Tasarım dosyalarını da #tasarım kanalına attım ✨' },
                  ].map((m) => (
                    <div key={m.name} className="lp-msg-group">
                      <div className="lp-msg-av">{m.av}</div>
                      <div className="lp-msg-body">
                        <div className="lp-msg-meta">
                          <span className="lp-msg-name" style={{ color: m.nameColor }}>{m.name}</span>
                          <span className="lp-msg-badge" style={{ background: m.badgeBg, color: m.badgeColor }}>{m.badge}</span>
                          <span className="lp-msg-time">{m.time}</span>
                        </div>
                        <div className="lp-msg-text">{m.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="lp-typing">
                  <div className="lp-typing-dots"><span /><span /><span /></div>
                  <span>Mehmet yazıyor...</span>
                </div>
                <div className="lp-chat-input-wrap">
                  <div className="lp-chat-input">
                    <span style={{ fontSize: 15, color: '#6a4858' }}>#</span>
                    <span style={{ flex: 1, color: '#6a4858', fontStyle: 'italic', fontFamily: 'inherit', fontSize: 13 }}>genel kanalına mesaj gönder...</span>
                    <button className="lp-chat-send">↑</button>
                  </div>
                </div>
              </div>
              <div className="lp-members">
                <div className="lp-mem-sec" style={{ color: '#e85c6a' }}>Admin — 1</div>
                <div className="lp-mem-item"><div className="lp-mem-av">⭐<div className="lp-status-dot" style={{ background: '#43b581' }} /></div><span className="lp-mem-name" style={{ color: '#f5e8ed' }}>Zeynep</span></div>
                <div className="lp-mem-sec" style={{ color: '#e8a83c', marginTop: 8 }}>Moderatör — 2</div>
                <div className="lp-mem-item"><div className="lp-mem-av">🌺<div className="lp-status-dot" style={{ background: '#43b581' }} /></div><span className="lp-mem-name">Ayşe</span></div>
                <div className="lp-mem-item"><div className="lp-mem-av">🎵<div className="lp-status-dot" style={{ background: '#e8a83c' }} /></div><span className="lp-mem-name">Kemal</span></div>
                <div className="lp-mem-sec" style={{ color: '#6db8e8', marginTop: 8 }}>Üye — 244</div>
                <div className="lp-mem-item"><div className="lp-mem-av">🌙<div className="lp-status-dot" style={{ background: '#43b581' }} /></div><span className="lp-mem-name">Mehmet</span></div>
                <div className="lp-mem-item"><div className="lp-mem-av">🌸<div className="lp-status-dot" style={{ background: '#43b581' }} /></div><span className="lp-mem-name">selin_k</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="lp-stats">
        {[['12K+', 'Aktif Kullanıcı'], ['1.2K+', 'Topluluk Sunucusu'], ['4M+', 'İletilen Mesaj'], ['99.9%', 'Çalışma Süresi']].map(([n, l]) => (
          <div key={l} className="lp-stat"><div className="lp-stat-num">{n}</div><div className="lp-stat-label">{l}</div></div>
        ))}
      </div>

      {/* FEATURES */}
      <section className="lp-section lp-features" id="features">
        <div className="lp-features-header">
          <div className="lp-section-badge">Özellikler</div>
          <div className="lp-section-title">Her Topluluğun <em>İhtiyacı Olan</em> Her Şey</div>
          <p className="lp-section-sub" style={{ marginInline: 'auto' }}>Sade ama eksiksiz. Karmaşıklığa yer yok — sadece iletişim.</p>
        </div>
        <div className="lp-feat-grid">
          {[
            { icon: '🏠', title: 'Sunucu & Kanal Yapısı', desc: 'Kendi sunucunu kur, metin kanallarıyla topluluğunu organize et.', tag: 'v1.0', tagClass: 'tag-green' },
            { icon: '⚡', title: 'Gerçek Zamanlı Mesajlaşma', desc: 'Socket.io ile anlık mesaj iletimi. Yazıyor göstergesi. Gecikme yok.', tag: 'v1.0', tagClass: 'tag-green' },
            { icon: '🛡️', title: 'Rol & Yetki Sistemi', desc: 'Admin, Moderatör, Üye rolleriyle tam kontrol. Kim neyi yapabilir sen karar ver.', tag: 'v1.0', tagClass: 'tag-green' },
            { icon: '💌', title: 'Direkt Mesajlaşma', desc: 'Özel sohbetler için DM özelliği. Sunucu dışında da iletişim kurabilirsin.', tag: 'v1.0', tagClass: 'tag-green' },
            { icon: '🔗', title: 'Davet Sistemi', desc: 'Benzersiz davet kodları ile topluluğunu büyüt.', tag: 'v1.0', tagClass: 'tag-green' },
            { icon: '👤', title: 'Profil Özelleştirme', desc: 'Avatar, görünen isim, durum mesajı. Kendini en iyi şekilde ifade et.', tag: 'v1.0', tagClass: 'tag-green' },
            { icon: '😄', title: 'Emoji Reaksiyonları', desc: 'Mesajlara hızlı emoji tepkileri ver. Uzun cevap yazmana gerek yok.', tag: 'v1.5', tagClass: 'tag-amber' },
            { icon: '🎙️', title: 'Ses & Görüntü Kanalları', desc: 'Toplantılar için WebRTC tabanlı ses/video. Yakında geliyor.', tag: 'v2.0', tagClass: 'tag-blue' },
            { icon: '🤖', title: 'Ahenk Bot & AI', desc: 'Moderasyon botu, anlamsal arama. Topluluğunu akıllıca yönet.', tag: 'v2.0', tagClass: 'tag-blue' },
          ].map((f) => (
            <div key={f.title} className="lp-feat-card">
              <div className="lp-feat-icon">{f.icon}</div>
              <div className="lp-feat-title">{f.title}</div>
              <div className="lp-feat-desc">{f.desc}</div>
              <span className={`lp-feat-tag ${f.tagClass}`}>{f.tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="lp-section lp-how" id="how">
        <div className="lp-how-inner">
          <div>
            <div className="lp-section-badge">Nasıl Çalışır</div>
            <div className="lp-section-title">3 Adımda <em>Topluluğunu</em> Kur</div>
            <div className="lp-divider" />
            <div className="lp-how-steps">
              {HOW_STEPS.map((s, i) => (
                <div key={i} className={`lp-how-step${activeStep === i ? ' active' : ''}`} onClick={() => setActiveStep(i)}>
                  <div className="lp-step-num">{i + 1}</div>
                  <div><div className="lp-step-title">{s.title}</div><div className="lp-step-desc">{s.desc}</div></div>
                </div>
              ))}
            </div>
          </div>
          <div className="lp-how-visual">
            <div className="lp-how-card">
              <div className="lp-how-emoji">{step.emoji}</div>
              <div className="lp-how-card-title">{step.title}</div>
              <div className="lp-how-card-desc">{step.desc}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section className="lp-section lp-roles">
        <div className="lp-section-badge">Rol Sistemi</div>
        <div className="lp-section-title">Herkesin <em>Yeri</em> Belli</div>
        <p className="lp-section-sub">Üç katmanlı rol yapısıyla topluluğunu düzenli ve güvenli tut.</p>
        <div className="lp-roles-inner">
          {[
            { icon: '👑', name: 'Admin', color: '#e85c6a', border: 'rgba(232,92,106,.3)', bg: 'rgba(232,92,106,.05)', perms: ['Tüm kanalları yönet', 'Kullanıcı at / yasakla', 'Roller ata ve düzenle', 'Sunucu ayarlarını değiştir', 'Tüm mesajları sil'] },
            { icon: '🛡️', name: 'Moderatör', color: '#e8a83c', border: 'rgba(232,168,60,.3)', bg: 'rgba(232,168,60,.05)', perms: ['Mesaj sil / düzenle', 'Kullanıcıyı geçici sustur', 'Kanal mesajlarını yönet', 'Yeni kanal oluştur'] },
            { icon: '👤', name: 'Üye', color: '#6db8e8', border: 'rgba(109,184,232,.3)', bg: 'rgba(109,184,232,.05)', perms: ['Kanallara mesaj gönder', 'Direkt mesaj gönder', 'Emoji reaksiyon ekle', 'Profil özelleştir'] },
          ].map((r) => (
            <div key={r.name} className="lp-role-card" style={{ borderColor: r.border, background: r.bg }}>
              <div className="lp-role-icon">{r.icon}</div>
              <div className="lp-role-name" style={{ color: r.color }}>{r.name}</div>
              <ul className="lp-role-perms" style={{ color: r.color }}>
                {r.perms.map((p) => <li key={p}>{p}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="lp-section lp-pricing" id="pricing">
        <div className="lp-pricing-header">
          <div className="lp-section-badge">Planlar</div>
          <div className="lp-section-title">Sana Uygun <em>Plan</em></div>
        </div>
        <div className="lp-pricing-grid">
          <div className="lp-price-card">
            <div className="lp-price-name">Ücretsiz</div>
            <div className="lp-price-amount" style={{ color: '#f5e8ed' }}>₺0<span style={{ fontSize: 16, color: '#6a4858', fontWeight: 400 }}>/ay</span></div>
            <div className="lp-price-desc">Kişisel projeler ve küçük topluluklar için</div>
            <ul className="lp-price-features">
              {['5 sunucuya üye ol', 'Sınırsız metin kanalı', '10.000 mesaj geçmişi', 'Temel profil'].map((f) => (
                <li key={f}><div className="lp-price-chk" style={{ background: 'rgba(67,181,129,.15)', color: '#43b581' }}>✓</div>{f}</li>
              ))}
            </ul>
            <button className="lp-price-btn" onClick={() => router.push('/register')} style={{ background: 'transparent', border: '1px solid rgba(139,58,82,0.35)', color: '#d4a8b8' }}>Hemen Başla</button>
          </div>
          <div className="lp-price-card featured">
            <div className="lp-price-badge">En Popüler</div>
            <div className="lp-price-name">Pro</div>
            <div className="lp-price-amount" style={{ background: 'linear-gradient(135deg,#8b3a52,#a84f68)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              ₺49<span style={{ fontSize: 16, WebkitTextFillColor: '#6a4858', fontWeight: 400 }}>/ay</span>
            </div>
            <div className="lp-price-desc">Aktif topluluklar ve ekipler için</div>
            <ul className="lp-price-features">
              {['Sınırsız sunucu', 'Sınırsız mesaj geçmişi', '100MB dosya paylaşımı', 'Özel profil rozetleri', 'Öncelikli destek'].map((f) => (
                <li key={f}><div className="lp-price-chk" style={{ background: 'rgba(139,58,82,.15)', color: '#c96b82' }}>✓</div>{f}</li>
              ))}
            </ul>
            <button className="lp-price-btn" onClick={() => router.push('/register')} style={{ background: 'linear-gradient(135deg,#8b3a52,#a84f68)', border: 'none', color: '#f5e8ed' }}>Pro&apos;ya Geç</button>
          </div>
          <div className="lp-price-card">
            <div className="lp-price-name">Kurumsal</div>
            <div className="lp-price-amount" style={{ color: '#f5e8ed', fontSize: 36 }}>Özel</div>
            <div className="lp-price-desc">Büyük organizasyonlar için özel çözüm</div>
            <ul className="lp-price-features">
              {['Kendi sunucunda barındır', 'SSO entegrasyonu', 'SLA garantisi', 'Özel moderasyon araçları', 'Dedicated destek ekibi'].map((f) => (
                <li key={f}><div className="lp-price-chk" style={{ background: 'rgba(109,184,232,.15)', color: '#6db8e8' }}>✓</div>{f}</li>
              ))}
            </ul>
            <button className="lp-price-btn" style={{ background: 'transparent', border: '1px solid rgba(139,58,82,0.35)', color: '#d4a8b8' }}>Bize Ulaş</button>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="lp-section lp-testi" id="community">
        <div className="lp-testi-header">
          <div className="lp-section-badge">Topluluk</div>
          <div className="lp-section-title">Onlar <em>Anlattı</em></div>
        </div>
        <div className="lp-testi-scroll">
          {[
            { stars: '★★★★★', quote: '"Discord\'dan Ahenk\'e geçtiğimizde ekibimizin iletişimi inanılmaz iyileşti."', av: '🌺', name: 'Ayşe Demir', role: 'Tasarım Stüdyosu Kurucusu' },
            { stars: '★★★★★', quote: '"Oyun topluluğum için mükemmel. Rol sistemi gerçekten güçlü."', av: '🎮', name: 'Kaan Yılmaz', role: 'Oyun Topluluğu Yöneticisi' },
            { stars: '★★★★★', quote: '"Üniversite kulübümüz için aradığımız şeydi. Gül kurusu tema muhteşem."', av: '🎓', name: 'Selin Arslan', role: 'Öğrenci Kulübü Başkanı' },
            { stars: '★★★★☆', quote: '"Startup ekibimizin tüm iletişimi artık Ahenk üzerinden. Yönetmesi çok kolay."', av: '🚀', name: 'Mert Kaya', role: 'Startup CTO\'su' },
            { stars: '★★★★★', quote: '"Ahenk\'in gizlilik politikasına güveniyorum. Verilerimizin nerede olduğunu bilmek önemli."', av: '🔐', name: 'Zeynep Öz', role: 'Siber Güvenlik Uzmanı' },
          ].map((t) => (
            <div key={t.name} className="lp-testi-card">
              <div className="lp-stars">{t.stars}</div>
              <div className="lp-testi-quote">{t.quote}</div>
              <div className="lp-testi-author">
                <div className="lp-testi-av">{t.av}</div>
                <div><div className="lp-testi-name">{t.name}</div><div className="lp-testi-role-label">{t.role}</div></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="lp-cta">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="lp-section-badge">Başlamaya Hazır mısın?</div>
          <h2>Topluluğunu<br /><em>Bugün</em> Kur</h2>
          <p>Dakikalar içinde sunucunu oluştur, ekibini davet et. Kredi kartı gerekmez.</p>
          <div className="lp-cta-btns">
            <button className="lp-btn-primary" onClick={() => router.push('/register')} style={{ fontSize: 16, padding: '16px 36px' }}>Ücretsiz Hesap Oluştur</button>
            <button className="lp-btn-ghost" onClick={() => router.push('/login')} style={{ fontSize: 16, padding: '16px 36px' }}>Giriş Yap</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-footer-top">
          <div>
            <div className="lp-footer-logo">🌸 AHENK</div>
            <div className="lp-footer-tagline">Topluluğunla ahenk içinde ol. Sade, hızlı ve tamamen senin kontrolünde.</div>
            <div className="lp-footer-social">
              {['𝕏', '⌥', '◎', 'in'].map((s) => <a key={s} className="lp-social-btn" href="#">{s}</a>)}
            </div>
          </div>
          <div className="lp-footer-col"><h4>Ürün</h4>{['Özellikler', 'Planlar', 'Yol Haritası', 'Değişiklik Günlüğü'].map((l) => <a key={l} href="#">{l}</a>)}</div>
          <div className="lp-footer-col"><h4>Şirket</h4>{['Hakkımızda', 'Blog', 'Kariyer', 'İletişim'].map((l) => <a key={l} href="#">{l}</a>)}</div>
          <div className="lp-footer-col"><h4>Destek</h4>{['Yardım Merkezi', 'API Belgeleri', 'Durum Sayfası', 'Güvenlik'].map((l) => <a key={l} href="#">{l}</a>)}</div>
        </div>
        <div className="lp-footer-bottom">
          <div className="lp-footer-copy">© 2025 Ahenk. Tüm hakları saklıdır. 🌸 Türkiye&apos;den sevgiyle yapıldı.</div>
          <div className="lp-footer-links"><a href="#">Gizlilik</a><a href="#">Kullanım Koşulları</a><a href="#">Çerezler</a></div>
        </div>
      </footer>
    </div>
  )
}
