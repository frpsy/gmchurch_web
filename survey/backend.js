import { FIREBASE_CONFIG } from './firebase-config.js';

export const isDemo = !FIREBASE_CONFIG || !FIREBASE_CONFIG.apiKey;

const SDK = 'https://www.gstatic.com/firebasejs/10.14.1/';

export async function createBackend() {
    return isDemo ? demoBackend() : firebaseBackend();
}

/* ---------- Firebase (Firestore + Auth) ---------- */
async function firebaseBackend() {
    const [{ initializeApp }, A, F] = await Promise.all([
        import(SDK + 'firebase-app.js'),
        import(SDK + 'firebase-auth.js'),
        import(SDK + 'firebase-firestore.js')
    ]);
    const app = initializeApp(FIREBASE_CONFIG);
    const auth = A.getAuth(app);
    const db = F.getFirestore(app);

    await auth.authStateReady();
    if (!auth.currentUser) await A.signInAnonymously(auth);

    const surveys = () => F.collection(db, 'surveys');
    const sub = (id, name) => F.collection(db, 'surveys', id, name);
    const toMs = (v) => (v && v.toMillis ? v.toMillis() : null);
    const normalize = (snap) => {
        const d = snap.data();
        return { ...d, id: snap.id, createdAt: toMs(d.createdAt) || 0, closesAt: toMs(d.closesAt) };
    };
    const payload = (s) => ({
        title: s.title,
        description: s.description || '',
        questions: s.questions,
        status: s.status || 'open',
        showResults: !!s.showResults,
        allowComment: !!s.allowComment,
        closesAt: s.closesAt ? F.Timestamp.fromMillis(s.closesAt) : null
    });

    return {
        user() {
            const u = auth.currentUser;
            return { uid: u.uid, isAdmin: !u.isAnonymous, email: u.email || '' };
        },
        async login() {
            await A.signInWithPopup(auth, new A.GoogleAuthProvider());
        },
        async logout() {
            await A.signOut(auth);
            await A.signInAnonymously(auth);
        },
        async listSurveys() {
            const q = F.query(surveys(), F.where('ownerUid', '==', auth.currentUser.uid));
            const snap = await F.getDocs(q);
            return snap.docs.map(normalize).sort((a, b) => b.createdAt - a.createdAt);
        },
        async getSurvey(id) {
            const snap = await F.getDoc(F.doc(db, 'surveys', id));
            return snap.exists() ? normalize(snap) : null;
        },
        async createSurvey(s) {
            const ref = await F.addDoc(surveys(), {
                ...payload(s), ownerUid: auth.currentUser.uid, createdAt: F.serverTimestamp()
            });
            return ref.id;
        },
        async updateSurvey(id, s) {
            await F.updateDoc(F.doc(db, 'surveys', id), payload(s));
        },
        async setStatus(id, status) {
            await F.updateDoc(F.doc(db, 'surveys', id), { status });
        },
        async deleteSurvey(id) {
            for (const name of ['responses', 'comments']) {
                const snap = await F.getDocs(sub(id, name));
                await Promise.all(snap.docs.map((d) => F.deleteDoc(d.ref)));
            }
            await F.deleteDoc(F.doc(db, 'surveys', id));
        },
        async getMyAnswers(id) {
            const snap = await F.getDoc(F.doc(db, 'surveys', id, 'responses', auth.currentUser.uid));
            return snap.exists() ? snap.data().answers : null;
        },
        async saveAnswers(id, answers) {
            await F.setDoc(F.doc(db, 'surveys', id, 'responses', auth.currentUser.uid),
                { answers, updatedAt: F.serverTimestamp() });
        },
        async listAnswers(id) {
            const snap = await F.getDocs(sub(id, 'responses'));
            return snap.docs.map((d) => d.data().answers || {});
        },
        async getMyComment(id) {
            const snap = await F.getDoc(F.doc(db, 'surveys', id, 'comments', auth.currentUser.uid));
            return snap.exists() ? snap.data().text : '';
        },
        async saveComment(id, text) {
            await F.setDoc(F.doc(db, 'surveys', id, 'comments', auth.currentUser.uid),
                { text, updatedAt: F.serverTimestamp() });
        },
        async listComments(id) {
            const snap = await F.getDocs(sub(id, 'comments'));
            return snap.docs.map((d) => d.data().text).filter(Boolean);
        }
    };
}

/* ---------- 체험(데모) 모드: 이 브라우저의 localStorage에만 저장 ---------- */
function demoBackend() {
    const KEY = 'gm-survey-demo';
    const load = () => {
        try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
    };
    const data = Object.assign({ surveys: {}, responses: {}, comments: {}, uid: null, admin: false }, load());
    if (!data.uid) data.uid = 'demo-' + Math.random().toString(36).slice(2, 10);
    const save = () => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* 저장 불가 환경 */ } };
    const newId = () => Math.random().toString(36).slice(2, 12);
    const wrap = (s, id) => ({ ...s, id });
    save();

    return {
        user: () => ({ uid: data.uid, isAdmin: data.admin, email: data.admin ? '데모 관리자' : '' }),
        async login() { data.admin = true; save(); },
        async logout() { data.admin = false; save(); },
        async listSurveys() {
            return Object.entries(data.surveys).map(([id, s]) => wrap(s, id)).sort((a, b) => b.createdAt - a.createdAt);
        },
        async getSurvey(id) { return data.surveys[id] ? wrap(data.surveys[id], id) : null; },
        async createSurvey(s) {
            const id = newId();
            data.surveys[id] = { ...s, status: s.status || 'open', ownerUid: data.uid, createdAt: Date.now() };
            save();
            return id;
        },
        async updateSurvey(id, s) { Object.assign(data.surveys[id], s); save(); },
        async setStatus(id, status) { data.surveys[id].status = status; save(); },
        async deleteSurvey(id) {
            delete data.surveys[id]; delete data.responses[id]; delete data.comments[id]; save();
        },
        async getMyAnswers(id) { return (data.responses[id] || {})[data.uid] || null; },
        async saveAnswers(id, answers) {
            (data.responses[id] = data.responses[id] || {})[data.uid] = answers; save();
        },
        async listAnswers(id) { return Object.values(data.responses[id] || {}); },
        async getMyComment(id) { return (data.comments[id] || {})[data.uid] || ''; },
        async saveComment(id, text) {
            (data.comments[id] = data.comments[id] || {})[data.uid] = text; save();
        },
        async listComments(id) { return Object.values(data.comments[id] || {}).filter(Boolean); }
    };
}
