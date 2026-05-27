import { describe, it, expect } from 'vitest';
import { CHURCH_DATA } from './helpers/loadData.js';

// ──────────────────────────────────────────────
// info
// ──────────────────────────────────────────────
describe('CHURCH_DATA.info', () => {
    it('has required text fields', () => {
        const { name, address, phone, email } = CHURCH_DATA.info;
        expect(name).toBeTruthy();
        expect(address).toBeTruthy();
        expect(phone).toBeTruthy();
        expect(email).toBeTruthy();
    });

    it('email contains @', () => {
        expect(CHURCH_DATA.info.email).toContain('@');
    });

    it('phone matches Korean landline/mobile format', () => {
        expect(CHURCH_DATA.info.phone).toMatch(/^\d{2,3}-\d{3,4}-\d{4}$/);
    });

    it('geo coordinates are within South Korea bounds', () => {
        const { latitude, longitude } = CHURCH_DATA.info.geo;
        // South Korea: lat 33–38.6, lon 124–132
        expect(latitude).toBeGreaterThanOrEqual(33);
        expect(latitude).toBeLessThanOrEqual(38.6);
        expect(longitude).toBeGreaterThanOrEqual(124);
        expect(longitude).toBeLessThanOrEqual(132);
    });

    it('postalCode is a 5-digit string', () => {
        expect(CHURCH_DATA.info.postalCode).toMatch(/^\d{5}$/);
    });
});

// ──────────────────────────────────────────────
// clergy
// ──────────────────────────────────────────────
describe('CHURCH_DATA.clergy', () => {
    it('has at least one clergy member', () => {
        expect(CHURCH_DATA.clergy.length).toBeGreaterThanOrEqual(1);
    });

    it('clergy[0] has name and title (required by FooterRenderer)', () => {
        const { name, title } = CHURCH_DATA.clergy[0];
        expect(name).toBeTruthy();
        expect(title).toBeTruthy();
    });

    it('every clergy member has name, title, and desc', () => {
        CHURCH_DATA.clergy.forEach((c, i) => {
            expect(c.name,  `clergy[${i}].name`).toBeTruthy();
            expect(c.title, `clergy[${i}].title`).toBeTruthy();
            expect(c.desc,  `clergy[${i}].desc`).toBeTruthy();
        });
    });

    it('email-style contact fields are valid', () => {
        CHURCH_DATA.clergy
            .filter(c => c.contact && c.contact.includes('@'))
            .forEach(c => {
                expect(c.contact).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
            });
    });

    it('bio.milestones with first:true have a year', () => {
        CHURCH_DATA.clergy
            .filter(c => c.bio?.milestones)
            .forEach(c => {
                c.bio.milestones
                    .filter(m => m.first)
                    .forEach(m => {
                        expect(m.year).toBeTruthy();
                        expect(m.text).toBeTruthy();
                    });
            });
    });
});

// ──────────────────────────────────────────────
// giving
// ──────────────────────────────────────────────
describe('CHURCH_DATA.giving', () => {
    it('has all required financial fields', () => {
        const { bankName, bank, holder } = CHURCH_DATA.giving;
        expect(bankName).toBeTruthy();
        expect(bank).toBeTruthy();
        expect(holder).toBeTruthy();
    });

    it('bank account number matches digits-digits-digits format', () => {
        expect(CHURCH_DATA.giving.bank).toMatch(/^\d+-\d+-\d+$/);
    });

    it('holder name includes the church name', () => {
        expect(CHURCH_DATA.giving.holder).toContain('광명교회');
    });
});

// ──────────────────────────────────────────────
// navigation
// ──────────────────────────────────────────────
describe('CHURCH_DATA.navigation', () => {
    it('has top-level nav items', () => {
        expect(CHURCH_DATA.navigation.length).toBeGreaterThan(0);
    });

    it('every top-level item has label and href', () => {
        CHURCH_DATA.navigation.forEach((item, i) => {
            expect(item.label, `nav[${i}].label`).toBeTruthy();
            expect(item.href,  `nav[${i}].href`).toBeTruthy();
        });
    });

    it('every dropdown item has label and href', () => {
        CHURCH_DATA.navigation.forEach(navItem => {
            (navItem.items || []).forEach(sub => {
                expect(sub.label, `sub-nav label under "${navItem.label}"`).toBeTruthy();
                expect(sub.href,  `sub-nav href under "${navItem.label}"`).toBeTruthy();
            });
        });
    });

    it('all hrefs reference a .html page', () => {
        CHURCH_DATA.navigation.forEach(item => {
            expect(item.href, `top href "${item.href}"`).toContain('.html');
            (item.items || []).forEach(sub => {
                expect(sub.href, `sub href "${sub.href}"`).toContain('.html');
            });
        });
    });
});

// ──────────────────────────────────────────────
// press
// ──────────────────────────────────────────────
describe('CHURCH_DATA.press', () => {
    it('has at least one press item', () => {
        expect(CHURCH_DATA.press.length).toBeGreaterThan(0);
    });

    it('every item has year, media, title, url', () => {
        CHURCH_DATA.press.forEach((item, i) => {
            expect(item.year,  `press[${i}].year`).toBeTruthy();
            expect(item.media, `press[${i}].media`).toBeTruthy();
            expect(item.title, `press[${i}].title`).toBeTruthy();
            expect(item.url,   `press[${i}].url`).toBeTruthy();
        });
    });

    it('press URLs start with http(s)', () => {
        CHURCH_DATA.press.forEach(item => {
            expect(item.url).toMatch(/^https?:\/\//);
        });
    });
});

// ──────────────────────────────────────────────
// sns
// ──────────────────────────────────────────────
describe('CHURCH_DATA.sns', () => {
    it('all SNS entries are non-empty https URLs', () => {
        Object.entries(CHURCH_DATA.sns).forEach(([key, url]) => {
            expect(url, `sns.${key}`).toMatch(/^https?:\/\//);
        });
    });
});

// ──────────────────────────────────────────────
// worship
// ──────────────────────────────────────────────
describe('CHURCH_DATA.worship', () => {
    it('liturgicalSeason is pre-computed and has required fields', () => {
        const s = CHURCH_DATA.worship.liturgicalSeason;
        expect(s.name).toBeTruthy();
        expect(s.color).toMatch(/^#[0-9a-f]{6}$/i);
        expect(s.colorLight).toMatch(/^#[0-9a-f]{6}$/i);
        expect(s.symbol).toBeTruthy();
        expect(s.year).toBeTypeOf('number');
    });

    it('main worship services have id, title, and time', () => {
        CHURCH_DATA.worship.main.forEach((s, i) => {
            expect(s.id,    `worship.main[${i}].id`).toBeTruthy();
            expect(s.title, `worship.main[${i}].title`).toBeTruthy();
            expect(s.time,  `worship.main[${i}].time`).toBeTruthy();
        });
    });
});

// ──────────────────────────────────────────────
// community
// ──────────────────────────────────────────────
describe('CHURCH_DATA.community', () => {
    it('has community groups', () => {
        expect(CHURCH_DATA.community.groups.length).toBeGreaterThan(0);
    });

    it('every group has id, title, and desc', () => {
        CHURCH_DATA.community.groups.forEach((g, i) => {
            expect(g.id,    `groups[${i}].id`).toBeTruthy();
            expect(g.title, `groups[${i}].title`).toBeTruthy();
            expect(g.desc,  `groups[${i}].desc`).toBeTruthy();
        });
    });
});
