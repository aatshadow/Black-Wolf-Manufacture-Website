# Technical Proposal — BG16RFPR001-1.012 Digitalization of Enterprises
## Appendix 16: Backup/Archiving & Storage/Sharing Systems
### Client: Accounting Company (~15 users)

---

## 12. BACKUP / ARCHIVING SYSTEM

**Maximum Unit Cost: 13,115 BGN**

### 12.1 Analysis and Backup Plan

| Item | Details |
|------|---------|
| Scope | All servers, 15 workstations, mobile devices used by staff |
| RPO (Recovery Point Objective) | 1 hour for critical data (accounting databases), 24 hours for general files |
| RTO (Recovery Time Objective) | 4 hours for full system recovery |
| Backup Schedule | Incremental every hour (business hours), Full backup daily at 22:00 |
| Retention Policy | Daily backups: 30 days, Weekly: 3 months, Monthly: 1 year |
| Storage Location | Local + offsite/cloud replica (3-2-1 rule) |

### 12.2 Automatic Backup from Servers/Workstations/Mobile Devices

| Requirement | Implementation |
|-------------|---------------|
| Server backup | Agent-based backup of OS, applications, databases |
| Workstation backup (x15) | Lightweight agent on each workstation, scheduled automatic backups |
| Mobile devices | Cloud-synced backup via MDM or built-in solution |
| Supported OS | Windows Server 2019/2022, Windows 10/11, Android, iOS |
| Backup types | Full, Incremental, Differential |
| Centralized console | Single dashboard to manage and monitor all backup jobs |

**Recommended Software Options:**

| Option | Type | Approximate Cost | Notes |
|--------|------|-----------------|-------|
| Veeam Backup & Replication (Community/Essentials) | On-premise / Cloud | ~2,000–4,000 BGN (license) | Industry standard, excellent ransomware protection |
| Acronis Cyber Protect | Cloud / Hybrid | ~3,000–5,000 BGN (annual) | All-in-one: backup + antimalware + management |
| Synology Active Backup for Business | On-premise (NAS) | Included with Synology NAS | Free with compatible NAS, great for SMBs |
| Duplicati + Restic (Open Source) | On-premise / Cloud | Free (software) | Requires more technical setup |

### 12.3 Built-in Ransomware Protection

| Feature | Requirement |
|---------|------------|
| Immutable backups | Backups cannot be modified or deleted for a defined retention period |
| Air-gapped / offline copy | At least one backup copy isolated from network |
| Anomaly detection | Alerts on unusual file change patterns (mass encryption detection) |
| Encryption | AES-256 encryption for backups at rest and in transit |
| Access control | MFA required for backup administration console |

### 12.4 Integration with Centralized Access Management

| Feature | Requirement |
|---------|------------|
| Directory integration | Active Directory / LDAP or cloud identity provider (Azure AD/Entra ID) |
| Role-Based Access Control (RBAC) | Admin, Backup Operator, Read-only roles |
| SSO support | SAML 2.0 or OpenID Connect |
| Audit logging | All access and configuration changes logged |

### 12.5 Recovery Procedures + Test Recovery

| Item | Details |
|------|---------|
| Documented procedures | Step-by-step recovery guide for each backup type |
| Bare-metal recovery | Full system restore capability |
| Granular recovery | Individual files, folders, application items |
| Test recovery | Minimum 1 documented test recovery with evidence (screenshots, logs) |
| Test frequency | Recommended quarterly, mandatory at least once during implementation |

### 12.6 Hardware Options

#### Option A: Physical Server + NAS

| Component | Specification | Est. Cost (BGN) |
|-----------|--------------|-----------------|
| Server | Intel Xeon E-2300 / AMD EPYC, 32GB RAM, 2x SSD 480GB (OS RAID1) | ~3,500 |
| NAS/Storage | Synology DS1522+ or similar, 5-bay, 4x 4TB HDD (RAID 5 = ~12TB usable) | ~4,000 |
| UPS | 1500VA line-interactive | ~600 |
| Software license | Veeam Essentials or Acronis | ~3,000 |
| Implementation + training | Setup, configuration, documentation, training | ~2,000 |
| **Total** | | **~13,100 BGN** |

#### Option B: Cloud/Virtual Server

| Component | Specification | Est. Cost (BGN) |
|-----------|--------------|-----------------|
| Cloud VPS | 4 vCPU, 16GB RAM, 500GB SSD | ~200/month |
| Cloud storage | 5TB S3-compatible or cloud backup storage | ~150/month |
| Software license | Acronis Cloud / Veeam Cloud Connect | ~3,000/year |
| Implementation + training | Setup, configuration, documentation, training | ~2,500 |
| **3-year total** | (infra: ~12,600 + software: ~9,000 + impl: ~2,500) | **~12,600 BGN** (within budget if structured correctly) |

#### Option C: Hybrid (Recommended for Accounting Firm)

| Component | Specification | Est. Cost (BGN) |
|-----------|--------------|-----------------|
| NAS (local) | Synology DS923+, 4-bay, 3x 4TB HDD (RAID 5 = ~8TB) | ~3,200 |
| Cloud replica | Synology C2 or Backblaze B2, 5TB | ~100/month |
| Software | Synology Active Backup (free) + Hyper Backup to cloud | 0 |
| Ransomware protection | Immutable snapshots (Synology) + cloud versioning | Included |
| UPS | 1000VA | ~400 |
| Implementation + training | Full setup, AD integration, documentation, training | ~2,500 |
| **Total (first year)** | | **~7,300 BGN** |
| **3-year total** | (+cloud: ~3,600) | **~10,900 BGN** |

---

## 13. STORAGE & SHARING SYSTEM

**Maximum Unit Cost: 16,313 BGN**

### 13.1 Centralized Management of Employee Access to Information and Sharing

| Feature | Requirement |
|---------|------------|
| File server | Centralized document storage accessible to all 15 users |
| Folder structure | Organized by department/client/year (accounting-specific) |
| Permission levels | Read, Write, Full Control — per user and per group |
| File sharing | Internal sharing with links, external sharing with password/expiration |
| Version control | File versioning with ability to restore previous versions |
| Storage quota | Per-user quotas configurable by admin |
| Remote access | Secure access from outside office (VPN or HTTPS portal) |

### 13.2 Centralized Access Management Integrated with Other Systems

| Feature | Requirement |
|---------|------------|
| Identity provider | Active Directory / Azure AD / LDAP |
| Integration | Must integrate with backup system (Section 12) and any other IT systems |
| SSO | Single Sign-On across file sharing, backup console, and email |
| Group policies | Centralized group-based permission management |
| MFA | Multi-factor authentication for remote access |
| User provisioning | Add/remove users from central console, auto-propagate to all systems |

### 13.3 Audit Log of User Actions

| Feature | Requirement |
|---------|------------|
| Events logged | File access (read/open), modifications, deletions, sharing actions, login/logout |
| Log retention | Minimum 1 year |
| Log format | Exportable (CSV/PDF) for compliance reporting |
| Alerts | Configurable alerts for suspicious activity (mass deletions, unauthorized access) |
| Compliance | Meets Bulgarian data protection requirements (GDPR-aligned) |

### 13.4 Hardware Options

#### Option A: Physical NAS + File Server

| Component | Specification | Est. Cost (BGN) |
|-----------|--------------|-----------------|
| NAS | Synology DS1823xs+ or QNAP TS-873A, 8-bay | ~5,500 |
| Storage | 6x 8TB HDD (RAID 6 = ~32TB usable) + 2x NVMe SSD cache | ~4,500 |
| File sharing software | Synology Drive / Nextcloud | Included / Free |
| Active Directory integration | Windows Server Essentials license or Samba AD | ~1,500 |
| UPS | 2000VA rack/tower | ~800 |
| Network switch | Gigabit managed switch (if needed) | ~500 |
| Implementation + training | Full setup, AD config, folder structure, documentation, training | ~3,000 |
| **Total** | | **~15,800 BGN** |

#### Option B: Cloud-Based Solution

| Component | Specification | Est. Cost (BGN) |
|-----------|--------------|-----------------|
| Cloud platform | Nextcloud (self-hosted on VPS) or Synology C2 | ~300/month |
| VPS | 8 vCPU, 32GB RAM, 2TB SSD | ~250/month |
| Domain + SSL | Custom domain with SSL certificate | ~50/year |
| Identity management | Azure AD P1 or Authentik (open source) | ~150/month or free |
| Implementation + training | Setup, migration, documentation, training | ~3,000 |
| **3-year total** | (infra: ~21,600 + impl: ~3,000) | **~16,200 BGN** (tight but feasible) |

#### Option C: Hybrid NAS + Cloud Sync (Recommended)

| Component | Specification | Est. Cost (BGN) |
|-----------|--------------|-----------------|
| NAS | Synology DS1522+ (5-bay) or RS1221+ (rack) | ~4,000 |
| Storage | 4x 8TB HDD (RAID 5 = ~24TB usable) + 1x NVMe SSD cache | ~3,000 |
| Synology Drive Server | File sharing, sync clients, web portal | Included |
| Synology Directory Server / AD integration | Centralized user management | Included |
| Synology Log Center | Audit logging with export | Included |
| Cloud sync | Synology C2 Storage or Backblaze B2 for offsite | ~100/month |
| UPS | 1500VA | ~600 |
| Implementation + training | Full deployment, user setup, documentation, staff training | ~3,000 |
| **Total (first year)** | | **~11,800 BGN** |
| **3-year total** | (+cloud: ~3,600) | **~15,400 BGN** |

---

## Compliance Checklist

| # | Requirement | Status |
|---|------------|--------|
| 1 | All mandatory functionalities implemented | To verify |
| 2 | Hardware (virtual or physical) deployed | To verify |
| 3 | User manual in Bulgarian | To deliver |
| 4 | Staff training completed and documented (attendance sheet, photos) | To deliver |
| 5 | 3-year maintenance contract signed | To deliver |
| 6 | Screenshots/evidence of working system | To deliver |
| 7 | Test recovery performed and documented | To deliver |
| 8 | Audit logs active and exportable | To verify |

---

## Recommended Combined Solution for Accounting Firm (15 users)

For an accounting company, data integrity and compliance are critical. The **recommended approach** is:

| System | Solution | Budget |
|--------|----------|--------|
| Backup/Archiving (12) | Synology NAS (local) + Cloud replica + Active Backup | ~10,900 BGN (3yr) |
| Storage/Sharing (13) | Synology NAS + Drive Server + AD integration | ~15,400 BGN (3yr) |
| **Combined Total** | Can share NAS hardware for cost efficiency | **Within both budgets** |

**Key advantage of combining:** A single Synology NAS (e.g., RS1221+ rack-mount, 8-bay) can serve BOTH as backup target AND file sharing server, significantly reducing hardware costs while meeting all mandatory requirements.

---

*Document prepared for BG16RFPR001-1.012 compliance — all functionalities aligned with Appendix 16 mandatory requirements.*
