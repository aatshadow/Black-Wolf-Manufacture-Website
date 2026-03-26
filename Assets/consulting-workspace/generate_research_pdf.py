#!/usr/bin/env python3
"""Generate comprehensive market research PDF for Black Wolf."""

from fpdf import FPDF
import json
import os

class ResearchPDF(FPDF):
    def __init__(self):
        super().__init__()
        self.set_auto_page_break(auto=True, margin=20)

    def header(self):
        if self.page_no() > 1:
            self.set_font('Helvetica', 'I', 8)
            self.set_text_color(120, 120, 120)
            self.cell(0, 8, 'Black Wolf - European Manufacturing SME Market Research 2026', align='L')
            self.cell(0, 8, f'Page {self.page_no()}', align='R', new_x="LMARGIN", new_y="NEXT")
            self.line(10, 16, 200, 16)
            self.ln(4)

    def footer(self):
        pass

    def cover_page(self):
        self.add_page()
        self.ln(60)
        self.set_font('Helvetica', 'B', 32)
        self.set_text_color(20, 20, 20)
        self.cell(0, 15, 'Market Research Report', align='C', new_x="LMARGIN", new_y="NEXT")
        self.ln(5)
        self.set_font('Helvetica', '', 18)
        self.set_text_color(60, 60, 60)
        self.cell(0, 12, 'European Manufacturing SME', align='C', new_x="LMARGIN", new_y="NEXT")
        self.cell(0, 12, 'Digital Transformation Landscape', align='C', new_x="LMARGIN", new_y="NEXT")
        self.ln(15)
        self.set_font('Helvetica', '', 14)
        self.set_text_color(100, 100, 100)
        self.cell(0, 10, '2025 - 2030 Outlook', align='C', new_x="LMARGIN", new_y="NEXT")
        self.ln(30)
        self.set_draw_color(40, 40, 40)
        self.line(60, self.get_y(), 150, self.get_y())
        self.ln(10)
        self.set_font('Helvetica', 'B', 14)
        self.set_text_color(40, 40, 40)
        self.cell(0, 10, 'BLACK WOLF', align='C', new_x="LMARGIN", new_y="NEXT")
        self.set_font('Helvetica', '', 11)
        self.set_text_color(80, 80, 80)
        self.cell(0, 8, 'Prepared: March 2026', align='C', new_x="LMARGIN", new_y="NEXT")
        self.cell(0, 8, 'Confidential - Internal Use Only', align='C', new_x="LMARGIN", new_y="NEXT")

    def section_title(self, title):
        self.set_font('Helvetica', 'B', 16)
        self.set_text_color(20, 20, 20)
        self.ln(4)
        self.cell(0, 12, title, new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(40, 40, 40)
        self.line(10, self.get_y(), 100, self.get_y())
        self.ln(6)

    def subsection_title(self, title):
        self.set_font('Helvetica', 'B', 13)
        self.set_text_color(40, 40, 40)
        self.ln(3)
        self.cell(0, 10, title, new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

    def body_text(self, text):
        self.set_font('Helvetica', '', 10)
        self.set_text_color(50, 50, 50)
        self.multi_cell(0, 5.5, text)
        self.ln(2)

    def bold_text(self, text):
        self.set_font('Helvetica', 'B', 10)
        self.set_text_color(50, 50, 50)
        self.multi_cell(0, 5.5, text)
        self.ln(1)

    def bullet(self, text):
        self.set_font('Helvetica', '', 10)
        self.set_text_color(50, 50, 50)
        x = self.get_x()
        self.cell(8, 5.5, '-')
        self.multi_cell(0, 5.5, text)
        self.ln(1)

    def key_stat(self, stat, description):
        self.set_font('Helvetica', 'B', 11)
        self.set_text_color(30, 30, 30)
        self.cell(45, 6, stat)
        self.set_font('Helvetica', '', 10)
        self.set_text_color(60, 60, 60)
        self.multi_cell(0, 6, description)
        self.ln(1)

    def table_header(self, cols, widths):
        self.set_font('Helvetica', 'B', 9)
        self.set_fill_color(240, 240, 240)
        self.set_text_color(30, 30, 30)
        for i, col in enumerate(cols):
            self.cell(widths[i], 7, col, border=1, fill=True, align='C')
        self.ln()

    def table_row(self, cols, widths):
        self.set_font('Helvetica', '', 9)
        self.set_text_color(50, 50, 50)
        for i, col in enumerate(cols):
            self.cell(widths[i], 6, col, border=1, align='C')
        self.ln()


def build_pdf():
    pdf = ResearchPDF()

    # Cover
    pdf.cover_page()

    # TABLE OF CONTENTS
    pdf.add_page()
    pdf.section_title('Table of Contents')
    toc = [
        '1. Executive Summary',
        '2. European Manufacturing SME Market Overview',
        '3. Manufacturing SMEs by Country',
        '4. GDP Contribution & Growth Rates',
        '5. Key Market Trends 2025-2030',
        '6. EU Digitalization Funding Programs',
        '7. Digital Transformation Adoption & Barriers',
        '8. ROI of Digital Transformation',
        '9. Digital Transformation Market Size & Projections',
        '10. Competitive Landscape',
        '11. ERP Market & Pricing',
        '12. CRM Adoption in Manufacturing',
        '13. AI Adoption in Manufacturing',
        '14. AI Market Projections & Use Cases',
        '15. Manufacturing Sub-Sector Growth',
        '16. Future of Manufacturing in Europe',
        '17. Bulgaria Manufacturing Sector',
        '18. Spain Manufacturing Sector',
        '19. Cybersecurity in Manufacturing',
        '20. Investment & VC Landscape',
        '21. Opportunity Assessment for Black Wolf',
        '22. Sources',
    ]
    for item in toc:
        pdf.body_text(item)

    # 1. EXECUTIVE SUMMARY
    pdf.add_page()
    pdf.section_title('1. Executive Summary')
    pdf.body_text(
        'This report provides a comprehensive analysis of the European manufacturing SME market, '
        'focusing on digital transformation opportunities for companies with EUR 3-30M revenue and '
        '20-200 employees. The research covers market size, growth projections, competitive landscape, '
        'pricing benchmarks, AI adoption, and regulatory environment across key European markets.'
    )
    pdf.ln(3)
    pdf.subsection_title('Key Findings')
    pdf.bullet('2.2 million manufacturing enterprises in the EU, generating EUR 2,470 billion in value added')
    pdf.bullet('54% of manufacturing SMEs still use pen & paper or spreadsheets as primary execution method')
    pdf.bullet('Digital transformation in manufacturing market: $440B in 2025, projected $847B by 2030 (19.4% CAGR)')
    pdf.bullet('55-75% of ERP implementations fail to meet objectives, creating demand for better solutions')
    pdf.bullet('Only 8.6% of Bulgarian enterprises and 19.95% of EU enterprises use AI technologies')
    pdf.bullet('EU investing EUR 8.1B+ in digitalization through Digital Europe Programme alone')
    pdf.bullet('74% of European companies plan to reshore/nearshore, boosting demand for local digital solutions')
    pdf.bullet('Average 35% ROI across audited manufacturing digital transformation case studies')
    pdf.bullet('Manufacturing has 86% CRM adoption rate, but most implementations are basic')
    pdf.bullet('EU targets raising manufacturing from 14% to 20% of GDP by 2035 (Industrial Accelerator Act)')

    # 2. MARKET OVERVIEW
    pdf.add_page()
    pdf.section_title('2. European Manufacturing SME Market Overview')
    pdf.body_text(
        'The European manufacturing sector comprises 2.2 million enterprises generating approximately '
        'EUR 2,470 billion in value added in 2023, employing 30.3 million people. Of these, 15.4 million '
        'work specifically in manufacturing SMEs.'
    )
    pdf.ln(2)
    pdf.bold_text('Key Market Metrics:')
    pdf.bullet('Total EU manufacturing enterprises: 2.2 million')
    pdf.bullet('Value of sold production: EUR 5,860 billion (2024)')
    pdf.bullet('Manufacturing employment: 30.3 million people')
    pdf.bullet('SME-specific employment: 15.4 million')
    pdf.bullet('Manufacturing share of GDP: 14.02% (2024)')
    pdf.bullet('EU target: 20% of GDP by 2035')
    pdf.ln(2)
    pdf.body_text(
        'The EU Annual SME Report 2024/2025 estimated total SME value added at EUR 5.04 trillion '
        'across all sectors. Manufacturing SMEs represent a disproportionately large share given their '
        'capital intensity. Small enterprises (10-49 employees) and medium enterprises (50-249 employees) '
        'together make up the bulk of manufacturing SMEs.'
    )

    # 3. BY COUNTRY
    pdf.add_page()
    pdf.section_title('3. Manufacturing SMEs by Country')

    widths = [30, 35, 45, 80]
    pdf.table_header(['Country', 'Total SMEs', 'Mfg Enterprises', 'Notes'], widths)
    rows = [
        ['Italy', '3.90M', '~374,000', '65% of value added from SMEs'],
        ['Germany', '3.87M', '~200-250K', 'Strong Mittelstand industrial base'],
        ['France', '~4.2M', '~200,000+', '41% new mfg in rural areas'],
        ['Spain', '~2.9M', '~170-200K', 'Strong food/auto manufacturing'],
        ['Poland', '2.21M', '~240,350', '10.3% of SMEs in industrial sector'],
        ['Bulgaria', '~419,000', '~28,730', '17.9% employment in manufacturing'],
    ]
    for row in rows:
        pdf.table_row(row, widths)

    pdf.ln(5)
    pdf.body_text(
        'Italy and Germany have the densest networks of manufacturing SMEs. Bulgaria has approximately '
        '28,730 manufacturing enterprises, with manufacturing accounting for 17.9% of total employment. '
        'The relatively smaller market in Bulgaria presents both a manageable entry point and significant '
        'growth potential, especially given that Bulgaria is the least digitalized EU member state.'
    )

    # 4. GDP & GROWTH
    pdf.add_page()
    pdf.section_title('4. GDP Contribution & Growth Rates')
    pdf.body_text(
        'Manufacturing value added as a share of EU GDP stands at 14.02% in 2024. The European Commission '
        'has set an ambitious target to raise this to 20% by 2035 under the new "Made in Europe" Industrial '
        'Accelerator Act (March 2026).'
    )
    pdf.ln(3)
    pdf.bold_text('Recent Growth Performance:')

    widths2 = [50, 80, 60]
    pdf.table_header(['Period', 'Metric', 'Change'], widths2)
    growth_rows = [
        ['2023 vs 2022', 'EU manufactured goods production', '-1.4%'],
        ['2024 vs 2023', 'EU manufactured goods production', '-2.0%'],
        ['2024', 'SME real value added', '-0.2%'],
        ['2024', 'SME employment', '+1.1%'],
        ['2025 (proj.)', 'SME real value added', '+1.6%'],
        ['2025 (proj.)', 'SME employment', '+0.9%'],
        ['2023-2028', 'Manufacturing output CAGR', '+1.9%'],
    ]
    for row in growth_rows:
        pdf.table_row(row, widths2)

    pdf.ln(4)
    pdf.body_text(
        'European manufacturing has been in a two-year production decline but is projected to recover '
        'modestly in 2025-2026. The sector has been impacted by energy costs, supply chain disruptions, '
        'and trade uncertainty. This creates urgency for efficiency-boosting digital solutions.'
    )

    # 5. KEY TRENDS
    pdf.add_page()
    pdf.section_title('5. Key Market Trends 2025-2030')

    trends = [
        ('AI & Automation', '80% of manufacturing executives plan to invest 20%+ of improvement budgets in smart manufacturing. Agentic AI is emerging as a key enabler for production optimization.'),
        ('Digital Twins', 'Allowing companies to simulate manufacturing processes digitally before physical implementation. Market projected to grow from $21B to $150B by 2030 (47.9% CAGR).'),
        ('Workforce Crisis', 'Aging workforce, skills shortages, and competition for digitally skilled employees. 74% of manufacturing leaders say needed skills are changing rapidly.'),
        ('Supply Chain Resilience', 'Post-COVID disruptions continue. 74% of companies plan reshoring/nearshoring. 56% investing in nearshoring (up from 42% in 2024).'),
        ('Green Transition', 'EU Clean Industrial Deal requires decarbonization. CBAM enters full operation in 2026. Significant compliance costs but also incentives for adopters.'),
        ('Cybersecurity', 'Cyber Resilience Act creates new compliance obligations. Manufacturing is the #1 targeted sector for cyberattacks. Average breach cost rising sharply.'),
        ('Cloud ERP Migration', 'Cloud-based ERP has become the preferred choice for manufacturing SMEs. 57% transitioned to cloud ERP between 2021-2023.'),
        ('Trade Turmoil', 'New tariff uncertainties are delaying recovery and forcing strategic pivots, particularly affecting export-dependent manufacturers.'),
    ]
    for title, desc in trends:
        pdf.bold_text(title)
        pdf.body_text(desc)

    # 6. EU FUNDING
    pdf.add_page()
    pdf.section_title('6. EU Digitalization Funding Programs')

    pdf.subsection_title('EU-Level Programs')
    programs = [
        ('Digital Europe Programme', 'EUR 8.1 billion (2021-2027) for AI, cybersecurity, digital skills, Digital Innovation Hubs'),
        ('European Digital Innovation Hubs', 'EUR 2.67-4.0M per project for test-before-invest, training, finance access for SMEs'),
        ('EIC Accelerator', 'EUR 634 million (2026) for innovation scale-up for SMEs'),
        ('Recovery & Resilience Facility', 'EUR 723 billion total for national digitalization plans'),
        ('Industrial Accelerator Act', 'New 2026 legislation targeting manufacturing share of GDP from 14.3% to 20% by 2035'),
    ]
    for name, desc in programs:
        pdf.bold_text(name)
        pdf.body_text(desc)

    pdf.subsection_title('Bulgaria')
    pdf.bullet('NRRP: EUR 6.17 billion total; EUR 690 million for Economic Transformation Programme')
    pdf.bullet('EUR 15.7 million specifically for business digitalization')
    pdf.bullet('EUR 15 million for ICT solutions and cybersecurity in SMEs')
    pdf.bullet('All measures must be completed by August 2026')
    pdf.bullet('53% of RRF funds absorbed, 60.4% of milestones completed')

    pdf.subsection_title('Spain (Kit Digital)')
    pdf.bullet('EUR 3.067 billion budget (NextGenerationEU-funded)')
    pdf.bullet('460,000+ SMEs already received over EUR 1.9 billion in grants')
    pdf.bullet('Vouchers: EUR 12,000 (10-49 empl.), EUR 6,000 (3-9), EUR 2,000 (1-2)')
    pdf.bullet('Activa Industria 4.0 specifically targets industrial SME digitalization')

    pdf.subsection_title('Germany')
    pdf.bullet('"Digital Now" investment program: EUR 3.2 billion (2021-2024)')
    pdf.bullet('Over 35,000 ERP implementations subsidized')
    pdf.bullet('8,500+ SMEs supported with grants for robotics and IoT')

    pdf.subsection_title('Other Countries')
    pdf.bullet('Poland: EIB Group signed EUR 8B in new financing in 2025')
    pdf.bullet('Italy: Transition 4.0/5.0 tax credits for Industry 4.0 investments')
    pdf.bullet('France: France 2030 investment plan includes manufacturing digitalization')

    # 7. DT ADOPTION & BARRIERS
    pdf.add_page()
    pdf.section_title('7. Digital Transformation Adoption & Barriers')

    pdf.subsection_title('Current Adoption Status')
    pdf.bullet('54% of manufacturing SMEs still use pen & paper or spreadsheets as primary execution method')
    pdf.bullet('Only 46% use commercial MES, lightweight ERP extension, or homegrown digital system')
    pdf.bullet('66% of EU manufacturing firms report adopting at least one digital technology (vs 78% in US)')
    pdf.bullet('92% of manufacturers say digital transformation is a "top priority" but implementation lags')
    pdf.bullet('Over 40% of SMEs report needing more support with budget limitations')

    pdf.ln(2)
    pdf.subsection_title('ERP/CRM Adoption Rates (Eurostat 2023)')
    widths3 = [60, 40, 40, 50]
    pdf.table_header(['Category', 'ERP Rate', 'CRM Rate', 'Note'], widths3)
    pdf.table_row(['All EU enterprises', '43.3%', '25.8%', ''], widths3)
    pdf.table_row(['Small (10-49 empl.)', '37.9%', '22.2%', 'Target segment'], widths3)
    pdf.table_row(['Medium (50-249)', '~60-70%', '~40%', ''], widths3)

    pdf.ln(3)
    pdf.body_text(
        'Critical insight: While ERP "adoption" numbers appear high (37-80% depending on source), '
        'half of companies with ERP systems still rely on Excel and paper for production planning. '
        'For smaller manufacturers (20-50 employees, EUR 3-10M revenue), true comprehensive ERP usage '
        'is likely only 30-40%. This represents a massive addressable market.'
    )

    pdf.ln(2)
    pdf.subsection_title('Key Barriers to Adoption')
    barriers = [
        'Financial constraints - over 40% of European SMEs cite as #1 barrier',
        'Skills/knowledge gaps - shortage of technical IT skills and digital literacy',
        'Legacy systems - 76% report incompatible legacy equipment',
        'Resistance to change - employees accustomed to traditional methods',
        'Integration complexity - data security concerns and system compatibility',
        'Lack of clear ROI visibility - SMEs struggle to quantify benefits beforehand',
        'Short-term operational focus - prioritize daily operations over strategic investment',
    ]
    for b in barriers:
        pdf.bullet(b)

    # 8. ROI
    pdf.add_page()
    pdf.section_title('8. ROI of Digital Transformation')

    pdf.subsection_title('Cost Reduction')
    pdf.bullet('10-25% cost reductions from well-executed transformations')
    pdf.bullet('10% reduction in labor costs (McKinsey)')
    pdf.bullet('20% reduction in unexpected downtime')
    pdf.bullet('45% downtime reduction in leading factory implementations')

    pdf.subsection_title('Revenue & Throughput')
    pdf.bullet('5-15% revenue increases (industry average)')
    pdf.bullet('30-35% throughput gains in leading implementations')
    pdf.bullet('20% improvement in consumer promise fulfillment')

    pdf.subsection_title('Efficiency & Productivity')
    pdf.bullet('30% productivity gains among early adopters')
    pdf.bullet('42% labor productivity improvement within 90 days (case study)')
    pdf.bullet('50% reduction in development times (digital twin technology)')
    pdf.bullet('50% quality improvement through connected operations')

    pdf.subsection_title('Overall ROI Metrics')
    pdf.bullet('35% average ROI across 25 audited manufacturing case studies')
    pdf.bullet('300% Year 2 returns through MES + cloud implementations')
    pdf.bullet('4-8 month payback period for targeted implementations')

    pdf.ln(3)
    pdf.body_text(
        'These ROI metrics are critical for Black Wolf\'s sales narrative. A manufacturer paying '
        'EUR 4,500-8,000/month for the Black Wolf platform can expect to recover that investment '
        'within the first quarter through efficiency gains alone, with compound returns thereafter.'
    )

    # 9. DT MARKET SIZE
    pdf.add_page()
    pdf.section_title('9. Digital Transformation Market Size & Projections')

    widths4 = [60, 35, 35, 30]
    pdf.table_header(['Market Segment', '2025 Value', '2030 Value', 'CAGR'], widths4)
    markets = [
        ['Global DT Overall', '$1.07T', '$4.62T', '28.5%'],
        ['DT in Manufacturing', '$440B', '$847B', '19.4%'],
        ['Europe DT Market', '$404B', '$662B', '28.4%'],
        ['Europe Industry 4.0', '$47B', '~$136B', '14.2%'],
        ['Global MES Market', '$15.95B', '$25.78B', '10.1%'],
        ['Digital Twin Market', '$21.14B', '$149.81B', '47.9%'],
        ['AI in Manufacturing', '$34B', '$155B', '35.3%'],
        ['Agentic AI in Mfg', '$5.5B', '$16.79B', '25.0%'],
    ]
    for row in markets:
        pdf.table_row(row, widths4)

    pdf.ln(4)
    pdf.body_text(
        'Every major segment shows double-digit growth. The digital transformation services market '
        'for manufacturing alone grows from $440B to $847B by 2030. Even the most conservative '
        'estimates project 10%+ CAGR. This validates the massive market opportunity for Black Wolf.'
    )

    # 10. COMPETITIVE LANDSCAPE
    pdf.add_page()
    pdf.section_title('10. Competitive Landscape')

    pdf.subsection_title('Tier 1 - Enterprise Players')
    widths5 = [35, 50, 50, 55]
    pdf.table_header(['Company', 'Key Product', 'Pricing', 'SME Fit'], widths5)
    tier1 = [
        ['Siemens', 'Opcenter MES', '$100K+ impl.', 'Poor - too complex'],
        ['SAP', 'S/4HANA, Bus.One', '$85/user/mo', 'Moderate - expensive'],
        ['Microsoft', 'Dynamics 365', '$70-210/user/mo', 'Moderate - generic'],
        ['Rockwell', 'Plex (cloud MES)', 'Mid-market', 'Moderate'],
    ]
    for row in tier1:
        pdf.table_row(row, widths5)

    pdf.ln(4)
    pdf.subsection_title('Tier 2 - Mid-Market / SME Focused')
    pdf.table_header(['Company', 'Key Product', 'Pricing', 'SME Fit'], widths5)
    tier2 = [
        ['MRPeasy', 'Cloud mfg ERP', '$49/user/mo', 'Good - limited scope'],
        ['Odoo', 'Open-source ERP', '$20-40/user/mo', 'Good - needs config'],
        ['Katana', 'Cloud mfg platform', '$99/mo', 'Good - limited'],
        ['Epicor', 'Manufacturing ERP', '$150-250/user/mo', 'Moderate'],
    ]
    for row in tier2:
        pdf.table_row(row, widths5)

    pdf.ln(4)
    pdf.body_text(
        'Key competitive insight: Top 5 players hold only 25-35% market share - the market is '
        'highly fragmented. Cloud-based solutions hold 55%+ market share. 300+ MES vendors globally, '
        'many small firms with vertical focus. No single player dominates the manufacturing SME '
        'all-in-one space (ERP + CRM + BI + Cybersecurity + AI), which is Black Wolf\'s blue ocean.'
    )

    # 11. ERP MARKET & PRICING
    pdf.add_page()
    pdf.section_title('11. ERP Market & Pricing')

    pdf.subsection_title('Market Size')
    pdf.bullet('Global ERP market: $77.08 billion in 2025')
    pdf.bullet('Cloud ERP: $65.89B in 2025, projected $207.59B by 2034 (13.4% CAGR)')
    pdf.bullet('Over 50% of the global ERP market comes from SMEs')
    pdf.bullet('78% of SMEs are adopting or implementing ERP systems in 2026')

    pdf.ln(2)
    pdf.subsection_title('Pricing Benchmarks')
    widths6 = [40, 35, 35, 80]
    pdf.table_header(['Solution', 'Start Price', 'Mid-Range', 'Notes'], widths6)
    pricing = [
        ['Odoo', '$0-20/user', '$20-40/user', 'Free community; modular'],
        ['Dynamics 365', '$70/user', '$70-100/user', 'Essentials $70, Premium $100'],
        ['SAP Bus. One', '$85/user', '$85-150/user', 'S/4HANA starts at $150'],
        ['Generic SME', '$10-50/user', 'Varies', 'Basic ERP functionality'],
    ]
    for row in pricing:
        pdf.table_row(row, widths6)

    pdf.ln(3)
    pdf.subsection_title('Implementation Failure Rates')
    pdf.bullet('55-75% of ERP implementations fail to meet objectives')
    pdf.bullet('73% of discrete manufacturing ERP projects fail to meet objectives')
    pdf.bullet('Average cost overruns reach 215% in manufacturing')
    pdf.bullet('Organizations engaging consultants report 85% success rate')
    pdf.ln(2)
    pdf.body_text(
        'Black Wolf advantage: By offering a managed, all-in-one platform at EUR 4,500-8,000/month '
        '(flat, not per-user), Black Wolf eliminates the complexity and failure risk of traditional '
        'ERP implementations. For a 30-user company, this compares favorably to $70/user/mo x 30 = '
        '$2,100/mo for Dynamics alone, without BI, CRM, cybersecurity, or AI capabilities.'
    )

    # 12. CRM
    pdf.add_page()
    pdf.section_title('12. CRM Adoption in Manufacturing')
    pdf.bullet('Manufacturing has an 86% CRM adoption rate - one of the highest across industries')
    pdf.bullet('71% of small businesses rely on a CRM system')
    pdf.bullet('Global CRM market: $90.1B in 2025, projected $304B by 2035 (12.93% CAGR)')
    pdf.bullet('87% of CRM systems are now cloud-based')
    pdf.bullet('Manufacturers using CRM report 21-30% boost in sales')
    pdf.bullet('65% of companies adopt CRM within first 5 years of operations')
    pdf.ln(2)
    pdf.body_text(
        'While CRM adoption is high in manufacturing, most implementations are basic contact '
        'management. The opportunity lies in integrated CRM that connects sales data to production '
        'planning, BI dashboards, and AI-driven insights - exactly what Black Wolf offers.'
    )

    # 13. AI ADOPTION
    pdf.add_page()
    pdf.section_title('13. AI Adoption in Manufacturing')

    pdf.subsection_title('Global Adoption')
    pdf.bullet('77% of manufacturers now utilize AI solutions (up from 70% in 2024)')
    pdf.bullet('Predictive maintenance leads at 78% adoption among AI users')
    pdf.bullet('AI-driven production scheduling: 64% adoption')
    pdf.bullet('Supply chain AI: 61% adoption')
    pdf.bullet('Quality control via ML: 55% adoption')
    pdf.bullet('23% average reduction in downtime from AI-powered automation')

    pdf.subsection_title('European Adoption')
    pdf.bullet('19.95% of EU enterprises used AI in 2025 (up from 13.5% in 2024)')
    pdf.bullet('55% of large enterprises vs only 17% of small enterprises use AI')
    pdf.bullet('Top: Denmark (42%), Finland (37.8%), Sweden (35%)')
    pdf.bullet('Bottom: Romania (5.2%), Poland (8.4%), Bulgaria (8.6%)')
    pdf.bullet('Only 11.9% of firms with 10-49 employees use AI')

    pdf.ln(2)
    pdf.body_text(
        'The AI gap between large and small enterprises is enormous. This is Black Wolf\'s key '
        'differentiator: bringing enterprise-grade AI capabilities to SMEs that could never build '
        'these systems themselves. With Bulgaria at only 8.6% AI adoption, the greenfield opportunity '
        'is massive.'
    )

    # 14. AI MARKET
    pdf.add_page()
    pdf.section_title('14. AI Market Projections & Use Cases')

    pdf.subsection_title('Market Size Projections')
    widths7 = [50, 35, 35, 30]
    pdf.table_header(['Source', '2025 Value', '2030 Value', 'CAGR'], widths7)
    ai_markets = [
        ['Markets & Markets', '$34.18B', '$155.04B', '35.3%'],
        ['BCC Research', '$7B', '$35.8B', '38.7%'],
        ['Grand View Research', '$7.6B', '$62.3B*', '35.1%'],
        ['Agentic AI in Mfg', '$5.5B', '$16.79B', '25.0%'],
    ]
    for row in ai_markets:
        pdf.table_row(row, widths7)
    pdf.body_text('* Grand View Research projection extends to 2032')

    pdf.ln(2)
    pdf.subsection_title('Top AI Use Cases in Manufacturing SMEs')
    pdf.bullet('Predictive maintenance (78%) - sensor data + ML to detect failures before they occur')
    pdf.bullet('Production scheduling (64%) - AI-optimized planning and resource allocation')
    pdf.bullet('Supply chain optimization (61%) - demand forecasting, inventory management')
    pdf.bullet('Quality control / visual inspection (55%) - ML-powered defect detection')
    pdf.bullet('Real-time decision-making (49%) - dashboards, anomaly detection')
    pdf.bullet('Generative AI (emerging) - maintenance docs, process documentation, reporting')

    # 15. SUB-SECTORS
    pdf.add_page()
    pdf.section_title('15. Manufacturing Sub-Sector Growth')

    pdf.subsection_title('Growing Sub-Sectors (as of early 2026)')
    pdf.bullet('Fabricated Metal Products - EU market CAGR exceeding 4% (2025-2033)')
    pdf.bullet('Automotive/Transportation - 21.4% market share, 17% production value increase over decade')
    pdf.bullet('Apparel & Technical Textiles - growth in aerospace, defense, medical applications')
    pdf.bullet('Chemical Products - steady growth driven by specialty chemicals')
    pdf.bullet('Food, Beverage & Tobacco - growth, though modest')
    pdf.bullet('Computer & Electronic Products - growth driven by AI/semiconductor demand')
    pdf.bullet('Machinery - growth reported across EU')

    pdf.subsection_title('Contracting Sub-Sectors')
    pdf.bullet('Textile Mills (raw textiles, not finished apparel)')
    pdf.bullet('Wood Products')
    pdf.bullet('Plastics & Rubber Products')
    pdf.bullet('Furniture & Related Products')
    pdf.bullet('Electrical Equipment, Appliances & Components')

    pdf.ln(2)
    pdf.body_text(
        'For Black Wolf: The strongest opportunities lie in fabricated metals, food & beverage, '
        'and automotive parts manufacturing. These sub-sectors are growing AND have high digitalization '
        'needs. Furniture manufacturing (current client) is contracting, suggesting diversification '
        'into growing sub-sectors is prudent.'
    )

    # 16. FUTURE OF MFG
    pdf.add_page()
    pdf.section_title('16. Future of Manufacturing in Europe')

    pdf.subsection_title('Reshoring & Nearshoring')
    pdf.bullet('74% of European companies plan to re- or nearshore')
    pdf.bullet('Share investing in nearshoring: 42% (2024) to 56% (2025)')
    pdf.bullet('47% of EU buyers increased nearshoring in last 12 months')
    pdf.bullet('57% of companies surveyed already source from Eastern Europe')
    pdf.bullet('32% plan to relocate activities to Eastern Europe')

    pdf.subsection_title('Automation')
    pdf.bullet('65% of future-fit manufacturers expected to have highly automated processes by 2030')
    pdf.bullet('84% of manufacturing executives expect DT to accelerate through 2030')
    pdf.bullet('Manufacturers expected to more than double automation of key processes by 2030')

    pdf.subsection_title('Regulatory Environment')
    pdf.bullet('CBAM: full operation from 2026, pricing embedded emissions on key imports')
    pdf.bullet('CSRD: Wave 2 companies report in 2028, Wave 3 in 2029')
    pdf.bullet('Omnibus Simplification Package reduces CSRD scope by ~80% of companies')
    pdf.bullet('Manufacturers delaying decarbonization face sharply rising costs by 2030')

    # 17. BULGARIA
    pdf.add_page()
    pdf.section_title('17. Bulgaria Manufacturing Sector')

    pdf.bullet('Manufacturing value added: ~14.4% of GDP')
    pdf.bullet('Manufacturing market projected to reach US$10.3B by 2029 (0.93% growth)')
    pdf.bullet('GDP growth: 3.0% projected for 2025, 2.7% for 2026')
    pdf.bullet('Key industries: electrical machinery, electronics, copper products, vehicles, pharma')
    pdf.bullet('28,730 manufacturing enterprises (2024)')
    pdf.bullet('Bulgaria is LAST in EU for AI adoption (8.6%)')
    pdf.bullet('Least digitalized EU state: 29.3% vs 54.6% EU average on Digital Intensity Index')
    pdf.bullet('EUR 690 million allocated for Economic Transformation Programme')
    pdf.bullet('EUR 15.7 million specifically for business digitalization')
    pdf.bullet('Deadline: all digitalization measures must complete by August 2026')

    pdf.ln(3)
    pdf.body_text(
        'Bulgaria represents a unique opportunity: the least digitalized EU member state with '
        'active government funding for exactly the services Black Wolf provides. The 1,474 leads '
        'from Bulgaria\'s digitalization grant program are high-value prospects with pre-approved '
        'funding for digital transformation.'
    )

    # 18. SPAIN
    pdf.add_page()
    pdf.section_title('18. Spain Manufacturing Sector')

    pdf.bullet('Manufacturing accounts for approximately 11-12% of GDP')
    pdf.bullet('Strong sub-sectors: automotive, food & beverage, chemicals, metals')
    pdf.bullet('Kit Digital: EUR 3.067 billion budget, 460,000+ SMEs already receiving grants')
    pdf.bullet('Activa Industria 4.0 specifically for industrial digitalization')
    pdf.bullet('Significant manufacturing presence in Catalonia, Basque Country, Valencia')
    pdf.bullet('Growing interest in Industry 4.0 but adoption still below EU average')

    pdf.ln(2)
    pdf.body_text(
        'Spain is a natural expansion market for Black Wolf given the team\'s Spanish language '
        'capabilities and the Kit Digital program subsidizing exactly the digital services offered. '
        'The EUR 12,000 voucher for SMEs with 10-49 employees can partially offset the client\'s '
        'first months of Black Wolf subscription.'
    )

    # 19. CYBERSECURITY
    pdf.add_page()
    pdf.section_title('19. Cybersecurity in Manufacturing')

    pdf.bullet('Manufacturing is the #1 targeted industry for cyberattacks globally')
    pdf.bullet('Ransomware accounts for 71% of manufacturing cyber incidents')
    pdf.bullet('Average cost of a data breach in manufacturing: $4.47 million (IBM 2024)')
    pdf.bullet('47% of attacks on manufacturing exploit known vulnerabilities')
    pdf.bullet('Only 23% of manufacturing SMEs have a dedicated cybersecurity budget')
    pdf.bullet('EU Cyber Resilience Act creates new compliance obligations for manufacturers')
    pdf.bullet('NIS2 Directive (in force 2024) extends cybersecurity requirements to manufacturing SMEs')

    pdf.ln(2)
    pdf.body_text(
        'Black Wolf\'s inclusion of cybersecurity in the platform is a major differentiator. Most '
        'digital transformation vendors ignore security. With manufacturing as the #1 cyberattack '
        'target and new EU regulations (NIS2, Cyber Resilience Act) requiring compliance, the '
        'cybersecurity component adds significant value and urgency to the proposition.'
    )

    # 20. VC LANDSCAPE
    pdf.add_page()
    pdf.section_title('20. Investment & VC Landscape')

    pdf.bullet('Manufacturing tech / Industry 4.0 VC investment: $2.8B globally in 2024')
    pdf.bullet('AI in manufacturing attracting significant Series A-C rounds')
    pdf.bullet('Industrial IoT platforms lead VC interest with 34.76% of Industry 4.0 market share')
    pdf.bullet('Cloud-based manufacturing SaaS models increasingly favored by investors')
    pdf.bullet('European industrial tech gaining attention as reshoring drives demand')
    pdf.bullet('Focus areas: predictive analytics, digital twins, edge computing, agentic AI')

    pdf.ln(2)
    pdf.body_text(
        'The VC landscape validates the market opportunity. Investors are actively funding '
        'companies that bring Industry 4.0 capabilities to SMEs through SaaS models. Black Wolf\'s '
        'all-in-one approach targeting the underserved manufacturing SME segment positions well '
        'for future investment rounds if desired.'
    )

    # 21. OPPORTUNITY ASSESSMENT
    pdf.add_page()
    pdf.section_title('21. Opportunity Assessment for Black Wolf')

    pdf.subsection_title('Market Opportunity')
    pdf.body_text(
        'The addressable market is massive: 2.2 million manufacturing enterprises in the EU, '
        'over half still operating with pen, paper, and spreadsheets. The digital transformation '
        'services market for manufacturing grows at 19.4% CAGR to $847B by 2030. Even capturing '
        'a tiny fraction of this market (0.001%) represents significant revenue.'
    )

    pdf.subsection_title('Competitive Advantage')
    pdf.bullet('All-in-one platform (ERP + CRM + BI + Cybersecurity + AI) - no competitor offers this combination')
    pdf.bullet('5-week delivery vs 6-18 month traditional ERP implementations')
    pdf.bullet('Flat monthly pricing vs complex per-user/per-module licensing')
    pdf.bullet('55-75% ERP failure rate creates demand for managed, turnkey solutions')
    pdf.bullet('AI-powered from day one, targeting the 88% of small enterprises NOT using AI')

    pdf.subsection_title('Ideal Entry Markets')
    pdf.bold_text('1. Bulgaria (Immediate)')
    pdf.body_text(
        'Least digitalized EU state (29.3% vs 54.6% average). Active government funding with '
        'August 2026 deadline. 1,474 qualified leads already in hand. Low competition.'
    )
    pdf.bold_text('2. Spain (Short-term)')
    pdf.body_text(
        'Kit Digital program with EUR 3B+ budget. Team speaks Spanish. Large manufacturing base '
        'with below-average digitalization.'
    )
    pdf.bold_text('3. Germany, Italy, Poland (Medium-term)')
    pdf.body_text(
        'Largest manufacturing SME markets in Europe. Higher competition but massive volume. '
        'EU-funded digitalization programs in all three countries.'
    )

    pdf.subsection_title('Revenue Potential')
    pdf.body_text(
        'At EUR 4,500-8,000/month per client:\n'
        '- 10 clients = EUR 45,000-80,000 MRR\n'
        '- 25 clients = EUR 112,500-200,000 MRR\n'
        '- 50 clients = EUR 225,000-400,000 MRR\n'
        '- 100 clients = EUR 450,000-800,000 MRR\n\n'
        'The EUR 1M/month MRR target requires approximately 125-220 clients depending on tier mix. '
        'With 2.2M manufacturing enterprises in the EU, this represents a 0.01% market penetration.'
    )

    pdf.subsection_title('Risk Factors')
    pdf.bullet('Small team (3 people) limits capacity to ~10-20 simultaneous clients initially')
    pdf.bullet('Manufacturing downturn may slow decision-making cycles')
    pdf.bullet('Competition from well-funded ERP vendors moving downmarket')
    pdf.bullet('Client retention depends on delivering measurable ROI within first quarter')
    pdf.bullet('Dependency on EU grant programs that have defined end dates')

    # 22. SOURCES
    pdf.add_page()
    pdf.section_title('22. Sources')
    pdf.set_font('Helvetica', '', 8)
    pdf.set_text_color(60, 60, 60)
    sources = [
        'Eurostat - Businesses in the Manufacturing Sector (2024)',
        'EU Annual Report on European SMEs 2024/2025 (JRC)',
        'Trading Economics - EU Manufacturing Value Added % of GDP',
        'Eurostat - Industrial Production Statistics',
        'ING - EU Manufacturing Outlook 2026',
        'Digital Europe Programme - European Commission',
        'Bulgaria Recovery and Resilience Plan - European Commission',
        'Spain Kit Digital Program - acelerapyme.gob.es',
        'Eurostat - E-business Integration (ERP/CRM adoption)',
        'Qlector - 50% Still Depend on Excel and Paper',
        'Deloitte 2026 Manufacturing Industry Outlook',
        'European Commission - Made in Europe / Industrial Accelerator Act',
        'IoT Analytics - MES Market Report 2025-2031',
        'Whatfix - Digital Transformation & Tech Adoption by Sector (2026)',
        'Mordor Intelligence - Digital Transformation in Manufacturing Market',
        'Precedence Research - Digital Transformation Market',
        'Straits Research - Europe Industry 4.0 Market 2025-2033',
        'Grand View Research - Europe Industry 4.0 Market 2023-2030',
        'FacileTechnoLab - Digital Transformation Manufacturing 2026 ROI',
        'IndustrialSage - 12 Digital Twin Statistics',
        'OpenText - Manufacturing Cost Reduction 2025',
        'IoT Analytics - MES Market Report (300+ Vendors)',
        'Markets and Markets - AI in Manufacturing',
        'Mordor Intelligence - Agentic AI in Manufacturing',
        'Grand View Research - AI in Manufacturing Market',
        'OECD - AI Adoption by SMEs (2025)',
        'Eurostat - AI in Enterprises (2025)',
        'Glorium Tech - Odoo & ERP Statistics 2026',
        'Grand View Research - ERP Software Market',
        'Godlan - ERP Implementation Failure Statistics 2025',
        'Salesmate - CRM Statistics 2026',
        'Precedence Research - CRM Market Size',
        'PwC - Global Industrial Manufacturing Outlook 2026',
        'StartUs Insights - Future of Manufacturing 2025-2030',
        'QIMA - Nearshoring & Reshoring Trends',
        'Deloitte - EU 2025 Sustainability Regulation Outlook',
        'Capgemini - Nearshoring Survey 2025',
        'IBM - Cost of a Data Breach Report 2024',
        'Statista - SMEs in Europe by Country',
        'ESCATEC - Bulgaria Manufacturing Sector',
        'KfW SME Panel 2025',
        'ISTAT - Structural Business Statistics 2023',
    ]
    for s in sources:
        pdf.cell(0, 4.5, f'  -  {s}', new_x="LMARGIN", new_y="NEXT")

    # Save
    output_path = '/Users/alex/Blackwolf/consulting-workspace/Black_Wolf_Market_Research_2026.pdf'
    pdf.output(output_path)
    print(f'PDF saved to: {output_path}')
    print(f'Pages: {pdf.page_no()}')

if __name__ == '__main__':
    build_pdf()
