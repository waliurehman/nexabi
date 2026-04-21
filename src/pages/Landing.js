import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, MessageSquare, FileSpreadsheet, FileText,
  BarChart2, Link2, Users, Zap, ArrowRight, CheckCircle,
  Shield, Globe, ChevronRight, Star,
} from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.6, ease: 'easeOut' },
};

const stagger = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
};

const features = [
  {
    icon: MessageSquare,
    title: 'AI Query Engine',
    desc: 'Ask questions in plain English and get instant insights from your data with GPT-powered analysis.',
    color: '#6C63FF',
  },
  {
    icon: FileSpreadsheet,
    title: 'CSV & Excel Import',
    desc: 'Drag and drop your spreadsheets. We automatically parse, clean, and index your data.',
    color: '#3B82F6',
  },
  {
    icon: FileText,
    title: 'PDF Documents',
    desc: 'Upload unstructured documents — PDFs, Word, PowerPoint — and query them with AI.',
    color: '#06B6D4',
  },
  {
    icon: BarChart2,
    title: 'Power BI Integration',
    desc: 'Seamlessly connect your Power BI workspace to import dashboards and reports.',
    color: '#F59E0B',
  },
  {
    icon: Zap,
    title: 'Live Charts',
    desc: 'Beautiful, interactive charts generated in real-time from your queries and data.',
    color: '#10B981',
  },
  {
    icon: Users,
    title: 'Multi-tenant Ready',
    desc: 'Enterprise-grade security with team workspaces, role-based access, and SSO.',
    color: '#A855F7',
  },
];

const steps = [
  {
    num: '01',
    title: 'Connect Your Data',
    desc: 'Upload CSVs, connect databases, or link Power BI — we support them all.',
  },
  {
    num: '02',
    title: 'Ask Questions',
    desc: 'Type natural language queries. Our AI understands context, filters, and relationships.',
  },
  {
    num: '03',
    title: 'Get Insights',
    desc: 'Receive instant charts, tables, and summaries with actionable business intelligence.',
  },
];

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    desc: 'Perfect for trying out NexaBI',
    features: ['100 AI Queries/month', '1 GB Storage', '2 Data Sources', 'Community Support'],
    cta: 'Start Free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/month',
    desc: 'For teams and growing businesses',
    features: ['Unlimited Queries', '50 GB Storage', 'Power BI Integration', 'Priority Support', 'Team Sharing (5)', 'API Access'],
    cta: 'Start Pro Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For large-scale deployments',
    features: ['Everything in Pro', 'Unlimited Storage', 'SSO & SAML', 'Dedicated Support', 'Custom Integrations', 'SLA Guarantee'],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      {/* ===== NAVBAR ===== */}
      <motion.nav
        style={styles.navbar}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={styles.navInner}>
          <div style={styles.navLogo}>
            <div style={styles.logoIcon}>
              <Sparkles size={20} color="#fff" />
            </div>
            <span style={styles.logoText}>Nexa</span>
            <span style={styles.logoBold}>BI</span>
          </div>
          <div style={styles.navLinks}>
            <a href="#features" style={styles.navLink}>Features</a>
            <a href="#how-it-works" style={styles.navLink}>How it Works</a>
            <a href="#pricing" style={styles.navLink}>Pricing</a>
          </div>
          <div style={styles.navActions}>
            <button style={styles.loginBtn} onClick={() => navigate('/dashboard')}>Log In</button>
            <motion.button
              style={styles.signupBtn}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/dashboard')}
            >
              Start Free
              <ArrowRight size={16} />
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* ===== HERO ===== */}
      <section style={styles.hero}>
        <div style={styles.heroBg} />
        <div style={styles.heroContent}>
          <motion.div
            style={styles.heroBadge}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <Zap size={14} color="#6C63FF" />
            Powered by GPT-4 & Advanced Analytics
          </motion.div>
          <motion.h1
            style={styles.heroTitle}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Transform Data Into{' '}
            <span style={styles.heroGradient}>Intelligence</span>
          </motion.h1>
          <motion.p
            style={styles.heroDesc}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Connect your databases, upload documents, and ask questions in plain English.
            NexaBI turns complex data into clear, actionable insights — instantly.
          </motion.p>
          <motion.div
            style={styles.heroActions}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <motion.button
              style={styles.heroPrimaryBtn}
              whileHover={{ scale: 1.04, boxShadow: '0 8px 30px rgba(108,99,255,0.4)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/dashboard')}
            >
              Start Free
              <ArrowRight size={18} />
            </motion.button>
            <motion.button
              style={styles.heroSecondaryBtn}
              whileHover={{ scale: 1.04, borderColor: '#6C63FF' }}
              whileTap={{ scale: 0.97 }}
            >
              Watch Demo
              <ChevronRight size={16} />
            </motion.button>
          </motion.div>
          <motion.div
            style={styles.heroStats}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            {[
              { value: '10K+', label: 'Active Users' },
              { value: '50M+', label: 'Queries Processed' },
              { value: '99.9%', label: 'Uptime' },
            ].map((s) => (
              <div key={s.label} style={styles.heroStat}>
                <span style={styles.heroStatValue}>{s.value}</span>
                <span style={styles.heroStatLabel}>{s.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" style={styles.section}>
        <motion.div style={styles.sectionHeader} {...fadeUp}>
          <span style={styles.sectionBadge}>Features</span>
          <h2 style={styles.sectionTitle}>Everything you need to make data talk</h2>
          <p style={styles.sectionDesc}>
            From CSV imports to AI-powered queries, NexaBI gives you a complete toolkit for business intelligence.
          </p>
        </motion.div>
        <div style={styles.featuresGrid}>
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                style={styles.featureCard}
                {...stagger}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ y: -6, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}
              >
                <div style={{ ...styles.featureIcon, background: `${f.color}12` }}>
                  <Icon size={24} color={f.color} />
                </div>
                <h3 style={styles.featureTitle}>{f.title}</h3>
                <p style={styles.featureDesc}>{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" style={{ ...styles.section, background: '#F8F9FC' }}>
        <motion.div style={styles.sectionHeader} {...fadeUp}>
          <span style={styles.sectionBadge}>How It Works</span>
          <h2 style={styles.sectionTitle}>Three steps to smart insights</h2>
          <p style={styles.sectionDesc}>
            Go from raw data to actionable intelligence in minutes — no coding required.
          </p>
        </motion.div>
        <div style={styles.stepsGrid}>
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              style={styles.stepCard}
              {...stagger}
              transition={{ delay: i * 0.15, duration: 0.5 }}
            >
              <div style={styles.stepNum}>{step.num}</div>
              <h3 style={styles.stepTitle}>{step.title}</h3>
              <p style={styles.stepDesc}>{step.desc}</p>
              {i < steps.length - 1 && <div style={styles.stepConnector} />}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" style={styles.section}>
        <motion.div style={styles.sectionHeader} {...fadeUp}>
          <span style={styles.sectionBadge}>Pricing</span>
          <h2 style={styles.sectionTitle}>Simple, transparent pricing</h2>
          <p style={styles.sectionDesc}>
            Start free, upgrade when you need more. No hidden fees, cancel anytime.
          </p>
        </motion.div>
        <div style={styles.pricingGrid}>
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              style={{
                ...styles.pricingCard,
                ...(plan.highlighted ? styles.pricingCardHighlighted : {}),
              }}
              {...stagger}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -4 }}
            >
              {plan.highlighted && <div style={styles.popularBadge}>Most Popular</div>}
              <h3 style={{ ...styles.planName, color: plan.highlighted ? '#fff' : 'var(--text-primary)' }}>
                {plan.name}
              </h3>
              <div style={styles.priceRow}>
                <span style={{ ...styles.planPrice, color: plan.highlighted ? '#fff' : 'var(--text-primary)' }}>
                  {plan.price}
                </span>
                <span style={{ ...styles.planPeriod, color: plan.highlighted ? 'rgba(255,255,255,0.6)' : 'var(--text-tertiary)' }}>
                  {plan.period}
                </span>
              </div>
              <p style={{ ...styles.planDesc, color: plan.highlighted ? 'rgba(255,255,255,0.7)' : 'var(--text-tertiary)' }}>
                {plan.desc}
              </p>
              <div style={styles.planFeatures}>
                {plan.features.map((f) => (
                  <div key={f} style={styles.planFeature}>
                    <CheckCircle size={16} color={plan.highlighted ? '#4ade80' : '#10B981'} />
                    <span style={{ color: plan.highlighted ? 'rgba(255,255,255,0.9)' : 'var(--text-secondary)' }}>
                      {f}
                    </span>
                  </div>
                ))}
              </div>
              <motion.button
                style={{
                  ...styles.planBtn,
                  ...(plan.highlighted ? styles.planBtnHighlighted : {}),
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/dashboard')}
              >
                {plan.cta}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <motion.section style={styles.ctaSection} {...fadeUp}>
        <div style={styles.ctaInner}>
          <h2 style={styles.ctaTitle}>Ready to transform your data?</h2>
          <p style={styles.ctaDesc}>
            Join thousands of teams using NexaBI to make smarter decisions, faster.
          </p>
          <motion.button
            style={styles.ctaBtn}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/dashboard')}
          >
            Get Started Free
            <ArrowRight size={18} />
          </motion.button>
        </div>
      </motion.section>

      {/* ===== FOOTER ===== */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={styles.footerBrand}>
            <div style={styles.footerLogo}>
              <div style={styles.logoIcon}>
                <Sparkles size={18} color="#fff" />
              </div>
              <span style={{ ...styles.logoText, fontSize: '18px' }}>Nexa</span>
              <span style={{ ...styles.logoBold, fontSize: '18px' }}>BI</span>
            </div>
            <p style={styles.footerTagline}>
              Transform your data into intelligence with AI-powered analytics.
            </p>
          </div>
          <div style={styles.footerLinks}>
            <div style={styles.footerCol}>
              <h4 style={styles.footerColTitle}>Product</h4>
              <a href="#features" style={styles.footerLink}>Features</a>
              <a href="#pricing" style={styles.footerLink}>Pricing</a>
              <a href="#" style={styles.footerLink}>Changelog</a>
              <a href="#" style={styles.footerLink}>Docs</a>
            </div>
            <div style={styles.footerCol}>
              <h4 style={styles.footerColTitle}>Company</h4>
              <a href="#" style={styles.footerLink}>About</a>
              <a href="#" style={styles.footerLink}>Careers</a>
              <a href="#" style={styles.footerLink}>Blog</a>
              <a href="#" style={styles.footerLink}>Contact</a>
            </div>
            <div style={styles.footerCol}>
              <h4 style={styles.footerColTitle}>Legal</h4>
              <a href="#" style={styles.footerLink}>Privacy</a>
              <a href="#" style={styles.footerLink}>Terms</a>
              <a href="#" style={styles.footerLink}>Security</a>
            </div>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p style={styles.footerCopy}>© 2026 NexaBI. All rights reserved.</p>
          <div style={styles.footerSocials}>
            <Globe size={18} color="var(--text-tertiary)" style={{ cursor: 'pointer' }} />
            <Shield size={18} color="var(--text-tertiary)" style={{ cursor: 'pointer' }} />
            <Star size={18} color="var(--text-tertiary)" style={{ cursor: 'pointer' }} />
          </div>
        </div>
      </footer>
    </div>
  );
};

const styles = {
  page: {
    background: '#fff',
    minHeight: '100vh',
    overflowX: 'hidden',
  },

  /* Navbar */
  navbar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    background: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(0,0,0,0.04)',
  },
  navInner: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 32px',
    height: '72px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #6C63FF 0%, #3B82F6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(108,99,255,0.3)',
  },
  logoText: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#1E1E2E',
    letterSpacing: '-0.03em',
  },
  logoBold: {
    fontSize: '20px',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #6C63FF, #3B82F6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  navLinks: {
    display: 'flex',
    gap: '32px',
  },
  navLink: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#6B7280',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
  },
  navActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  loginBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: '14px',
    fontWeight: 600,
    color: '#1E1E2E',
    cursor: 'pointer',
    padding: '8px 16px',
  },
  signupBtn: {
    background: 'linear-gradient(135deg, #6C63FF 0%, #3B82F6 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '10px 22px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    boxShadow: '0 4px 16px rgba(108,99,255,0.3)',
  },

  /* Hero */
  hero: {
    position: 'relative',
    paddingTop: '160px',
    paddingBottom: '80px',
    overflow: 'hidden',
  },
  heroBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(ellipse at 50% 0%, rgba(108,99,255,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(59,130,246,0.06) 0%, transparent 50%)',
    pointerEvents: 'none',
  },
  heroContent: {
    maxWidth: '800px',
    margin: '0 auto',
    textAlign: 'center',
    padding: '0 32px',
    position: 'relative',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(108,99,255,0.08)',
    border: '1px solid rgba(108,99,255,0.15)',
    borderRadius: '999px',
    padding: '8px 18px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#6C63FF',
    marginBottom: '28px',
  },
  heroTitle: {
    fontSize: '56px',
    fontWeight: 800,
    color: '#1E1E2E',
    letterSpacing: '-0.04em',
    lineHeight: 1.1,
    marginBottom: '20px',
  },
  heroGradient: {
    background: 'linear-gradient(135deg, #6C63FF 0%, #3B82F6 50%, #06B6D4 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroDesc: {
    fontSize: '18px',
    color: '#6B7280',
    lineHeight: 1.7,
    marginBottom: '36px',
    maxWidth: '600px',
    margin: '0 auto 36px',
  },
  heroActions: {
    display: 'flex',
    gap: '14px',
    justifyContent: 'center',
    marginBottom: '60px',
  },
  heroPrimaryBtn: {
    background: 'linear-gradient(135deg, #6C63FF 0%, #3B82F6 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '16px 32px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 6px 24px rgba(108,99,255,0.35)',
  },
  heroSecondaryBtn: {
    background: '#fff',
    color: '#1E1E2E',
    border: '2px solid #E5E7EB',
    borderRadius: '12px',
    padding: '14px 28px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'border-color 0.2s ease',
  },
  heroStats: {
    display: 'flex',
    justifyContent: 'center',
    gap: '48px',
  },
  heroStat: {
    textAlign: 'center',
  },
  heroStatValue: {
    display: 'block',
    fontSize: '28px',
    fontWeight: 800,
    color: '#1E1E2E',
    letterSpacing: '-0.02em',
  },
  heroStatLabel: {
    fontSize: '13px',
    color: '#9CA3AF',
    fontWeight: 500,
    marginTop: '4px',
    display: 'block',
  },

  /* Sections */
  section: {
    padding: '100px 32px',
  },
  sectionHeader: {
    textAlign: 'center',
    maxWidth: '600px',
    margin: '0 auto 60px',
  },
  sectionBadge: {
    display: 'inline-block',
    background: 'rgba(108,99,255,0.08)',
    color: '#6C63FF',
    padding: '6px 16px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    marginBottom: '16px',
  },
  sectionTitle: {
    fontSize: '36px',
    fontWeight: 800,
    color: '#1E1E2E',
    letterSpacing: '-0.03em',
    lineHeight: 1.2,
    marginBottom: '14px',
  },
  sectionDesc: {
    fontSize: '16px',
    color: '#6B7280',
    lineHeight: 1.6,
  },

  /* Features */
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
    maxWidth: '1100px',
    margin: '0 auto',
  },
  featureCard: {
    background: '#fff',
    borderRadius: '20px',
    padding: '32px',
    border: '1px solid #F3F4F6',
    boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  featureIcon: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  featureTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#1E1E2E',
    marginBottom: '10px',
    letterSpacing: '-0.01em',
  },
  featureDesc: {
    fontSize: '14px',
    color: '#6B7280',
    lineHeight: 1.6,
  },

  /* Steps */
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '32px',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  stepCard: {
    textAlign: 'center',
    padding: '24px',
    position: 'relative',
  },
  stepNum: {
    fontSize: '48px',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #6C63FF 0%, #3B82F6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '16px',
    lineHeight: 1,
  },
  stepTitle: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#1E1E2E',
    marginBottom: '10px',
  },
  stepDesc: {
    fontSize: '14px',
    color: '#6B7280',
    lineHeight: 1.6,
  },
  stepConnector: {
    display: 'none',
  },

  /* Pricing */
  pricingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
    maxWidth: '1000px',
    margin: '0 auto',
    alignItems: 'start',
  },
  pricingCard: {
    background: '#fff',
    borderRadius: '20px',
    padding: '36px 32px',
    border: '1px solid #F3F4F6',
    boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
    transition: 'all 0.3s ease',
    position: 'relative',
  },
  pricingCardHighlighted: {
    background: 'linear-gradient(135deg, #6C63FF 0%, #3B82F6 100%)',
    border: '1px solid transparent',
    boxShadow: '0 12px 40px rgba(108,99,255,0.3)',
    transform: 'scale(1.03)',
  },
  popularBadge: {
    position: 'absolute',
    top: '-12px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#F59E0B',
    color: '#fff',
    fontSize: '11px',
    fontWeight: 700,
    padding: '5px 16px',
    borderRadius: '999px',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  planName: {
    fontSize: '18px',
    fontWeight: 700,
    marginBottom: '8px',
  },
  priceRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
    marginBottom: '8px',
  },
  planPrice: {
    fontSize: '40px',
    fontWeight: 800,
    letterSpacing: '-0.03em',
  },
  planPeriod: {
    fontSize: '14px',
    fontWeight: 500,
  },
  planDesc: {
    fontSize: '13px',
    marginBottom: '24px',
    lineHeight: 1.5,
  },
  planFeatures: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '28px',
  },
  planFeature: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    fontWeight: 500,
  },
  planBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    border: '2px solid #E5E7EB',
    background: '#fff',
    fontSize: '15px',
    fontWeight: 600,
    color: '#1E1E2E',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  planBtnHighlighted: {
    background: 'rgba(255,255,255,0.15)',
    border: '2px solid rgba(255,255,255,0.3)',
    color: '#fff',
    backdropFilter: 'blur(4px)',
  },

  /* CTA */
  ctaSection: {
    padding: '80px 32px',
  },
  ctaInner: {
    maxWidth: '700px',
    margin: '0 auto',
    textAlign: 'center',
    padding: '60px 40px',
    borderRadius: '24px',
    background: 'linear-gradient(135deg, rgba(108,99,255,0.06) 0%, rgba(59,130,246,0.06) 100%)',
    border: '1px solid rgba(108,99,255,0.1)',
  },
  ctaTitle: {
    fontSize: '32px',
    fontWeight: 800,
    color: '#1E1E2E',
    letterSpacing: '-0.03em',
    marginBottom: '12px',
  },
  ctaDesc: {
    fontSize: '16px',
    color: '#6B7280',
    marginBottom: '28px',
    lineHeight: 1.6,
  },
  ctaBtn: {
    background: 'linear-gradient(135deg, #6C63FF 0%, #3B82F6 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '16px 36px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 6px 24px rgba(108,99,255,0.3)',
  },

  /* Footer */
  footer: {
    borderTop: '1px solid #F3F4F6',
    padding: '60px 32px 32px',
    background: '#FAFAFC',
  },
  footerInner: {
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '60px',
    marginBottom: '40px',
  },
  footerBrand: {
    maxWidth: '300px',
  },
  footerLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '14px',
  },
  footerTagline: {
    fontSize: '14px',
    color: '#6B7280',
    lineHeight: 1.6,
  },
  footerLinks: {
    display: 'flex',
    gap: '60px',
  },
  footerCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  footerColTitle: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#1E1E2E',
    marginBottom: '4px',
  },
  footerLink: {
    fontSize: '13px',
    color: '#6B7280',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
  },
  footerBottom: {
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #F3F4F6',
    paddingTop: '24px',
  },
  footerCopy: {
    fontSize: '13px',
    color: '#9CA3AF',
  },
  footerSocials: {
    display: 'flex',
    gap: '16px',
  },
};

export default Landing;
