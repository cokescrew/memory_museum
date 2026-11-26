require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const app = express();

// Nginx 프록시 환경 설정
app.set('trust proxy', 'loopback');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({
    extended: false,
    limit: '30kb'
}));

app.use(express.json({
    limit: '30kb'
}));

app.use(express.static(path.join(__dirname, 'public')));

// 세션 설정
app.use(session({
    secret: process.env.SESSION_SECRET || 'development-only-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.COOKIE_SECURE === 'true'
    }
}));

// 데이터베이스 연결
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'memory_museum',
    waitForConnections: true,
    connectionLimit: 8
});

// 비동기 오류 처리
const asyncRoute = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// 반복 요청 제한
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 35,
    standardHeaders: 'draft-7',
    legacyHeaders: false
});

// 이미지 업로드 폴더
fs.mkdirSync(
    path.join(__dirname, 'public/uploads'),
    { recursive: true }
);

// 이미지 업로드 설정
const upload = multer({
    storage: multer.diskStorage({
        destination: path.join(__dirname, 'public/uploads'),

        filename: (req, file, cb) => {
            const extensions = {
                'image/jpeg': '.jpg',
                'image/png': '.png',
                'image/webp': '.webp'
            };

            cb(
                null,
                crypto.randomUUID() +
                (extensions[file.mimetype] || '.bin')
            );
        }
    }),

    limits: {
        fileSize: 3 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {
        cb(null, [
            'image/jpeg',
            'image/png',
            'image/webp'
        ].includes(file.mimetype));
    }
});

// 시대별 전시관
const eras = [
    {
        id: 1960,
        label: '1960 ~ 1970',
        image: '/images/1960.jpg'
    },
    {
        id: 1970,
        label: '1970 ~ 1980',
        image: '/images/1970.jpg'
    },
    {
        id: 1980,
        label: '1980 ~ 1990',
        image: '/images/1980.jpg'
    },
    {
        id: 1990,
        label: '1990년대',
        image: '/images/1990.jpg'
    },
    {
        id: 2000,
        label: '2000 ~ 2010',
        image: '/images/2000.jpg'
    }
];

// 공통 화면 출력
function page(res, view, data = {}) {
    res.render(view, {
        eras,
        admin: Boolean(res.req.session?.admin),
        ...data
    });
}

// 입력값 정리
function clean(v, max = 1000) {
    return String(v || '').trim().slice(0, max);
}

// 비밀번호 유효성 확인
function validPass(v) {
    return typeof v === 'string'
        && v.length >= 4
        && Buffer.byteLength(v, 'utf8') <= 72;
}

// 신고자 식별값 생성
function fingerprint(req) {
    return crypto.createHash('sha256')
        .update([
            req.ip,
            req.headers['user-agent'] || '',
            process.env.SESSION_SECRET || 'local'
        ].join('|'))
        .digest('hex');
}

// 메시지와 함께 이동
function redirectMsg(res, url, msg) {
    res.redirect(
        url +
        (url.includes('?') ? '&' : '?') +
        'msg=' +
        encodeURIComponent(msg)
    );
}

// ========================================
// 메인 및 공식 전시관
// ========================================

app.get('/', (req, res) => {
    page(res, 'home');
});

app.get('/about', (req, res) => {
    page(res, 'about');
});

app.get('/archive', (req, res) => {
    page(res, 'archive');
});

app.get('/archive/:era', asyncRoute(async (req, res) => {

    const era = eras.find(
        e => e.id === Number(req.params.era)
    );

    if (!era) {
        return res.status(404).send('전시관이 없습니다.');
    }

    const [items] = await db.query(
        `SELECT * FROM items
         WHERE type = 'official'
         AND status = 'active'
         AND era_id = ?
         ORDER BY id DESC`,
        [era.id]
    );

    page(res, 'exhibition', {
        title: era.label,
        era,
        items: items.reverse()
    });
}));

// ========================================
// 모두의 추억 게시판
// ========================================

app.get('/citizen', asyncRoute(async (req, res) => {

    const era = Number(req.query.era) || 0;
    const q = clean(req.query.q, 80);

    let sql = `
        SELECT * FROM items
        WHERE type = 'citizen'
        AND status = 'active'
    `;

    const args = [];

    if (era && eras.some(e => e.id === era)) {
        sql += ' AND era_id = ?';
        args.push(era);
    }

    if (q) {
        sql += ' AND (title LIKE ? OR description LIKE ?)';
        args.push('%' + q + '%', '%' + q + '%');
    }

    sql += ' ORDER BY created_at DESC LIMIT 100';

    const [items] = await db.query(sql, args);

    page(res, 'listing', {
        title: '모두의 추억',
        items,
        section: 'citizen',
        intro: '누구나 남기고 함께 만드는 전시관',
        q,
        selectedEra: era,
        msg: req.query.msg
    });
}));

// 게시글 작성 화면
app.get('/citizen/new', (req, res) => {
    page(res, 'new');
});

// 게시글 등록
app.post(
    '/citizen/new',
    limiter,
    upload.single('image'),
    asyncRoute(async (req, res) => {

        const title = clean(req.body.title, 120);
        const description = clean(req.body.description, 3000);
        const era = Number(req.body.era);
        const password = req.body.password;

        if (
            !title ||
            !description ||
            !eras.some(e => e.id === era) ||
            !validPass(password)
        ) {
            if (req.file) {
                fs.unlink(req.file.path, () => {});
            }

            return res.status(400).send(
                '제목, 시대, 설명, 비밀번호(4자 이상)를 확인해주세요.'
            );
        }

        const hash = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            `INSERT INTO items
            (era_id, type, title, description, image_path, password_hash)
            VALUES (?, 'citizen', ?, ?, ?, ?)`,
            [
                era,
                title,
                description,
                req.file ? '/uploads/' + req.file.filename : null,
                hash
            ]
        );

        res.redirect('/items/' + result.insertId);
    })
);

// 게시글 상세 화면
app.get('/items/:id', asyncRoute(async (req, res) => {

    const [rows] = await db.query(
        `SELECT items.*, eras.label AS era_label
         FROM items
         JOIN eras ON eras.id = items.era_id
         WHERE items.id = ?
         AND items.status = 'active'`,
        [req.params.id]
    );

    if (!rows.length) {
        return res.status(404).send(
            '전시품을 찾을 수 없습니다.'
        );
    }

    const [comments] = await db.query(
        `SELECT id, body, created_at
         FROM comments
         WHERE item_id = ?
         AND status = 'active'
         ORDER BY created_at DESC`,
        [req.params.id]
    );

    page(res, 'item', {
        item: rows[0],
        comments,
        msg: req.query.msg
    });
}));

// 댓글 작성
app.post(
    '/items/:id/comments',
    limiter,
    asyncRoute(async (req, res) => {

        const body = clean(req.body.body, 1000);
        const pass = req.body.password;

        const [items] = await db.query(
            `SELECT id FROM items
             WHERE id = ?
             AND status = 'active'`,
            [req.params.id]
        );

        if (!items.length || !body || !validPass(pass)) {
            return res.status(400).send(
                '댓글과 비밀번호(4자 이상)를 입력해주세요.'
            );
        }

        await db.query(
            `INSERT INTO comments
            (item_id, body, password_hash)
            VALUES (?, ?, ?)`,
            [
                req.params.id,
                body,
                await bcrypt.hash(pass, 10)
            ]
        );

        res.redirect('/items/' + req.params.id);
    })
);

// 댓글 삭제
app.post(
    '/comments/:id/delete',
    limiter,
    asyncRoute(async (req, res) => {

        const [rows] = await db.query(
            'SELECT * FROM comments WHERE id = ?',
            [req.params.id]
        );

        if (
            !rows.length ||
            !(await bcrypt.compare(
                req.body.password || '',
                rows[0].password_hash
            ))
        ) {
            return res.status(403).send(
                '비밀번호가 다릅니다.'
            );
        }

        await db.query(
            "UPDATE comments SET status = 'deleted' WHERE id = ?",
            [req.params.id]
        );

        res.redirect('/items/' + rows[0].item_id);
    })
);

// 게시글 삭제
app.post(
    '/items/:id/delete',
    limiter,
    asyncRoute(async (req, res) => {

        const [rows] = await db.query(
            "SELECT * FROM items WHERE id = ? AND type = 'citizen'",
            [req.params.id]
        );

        if (
            !rows.length ||
            !(await bcrypt.compare(
                req.body.password || '',
                rows[0].password_hash || ''
            ))
        ) {
            return res.status(403).send(
                '비밀번호가 다릅니다.'
            );
        }

        await db.query(
            "UPDATE items SET status = 'deleted' WHERE id = ?",
            [req.params.id]
        );

        res.redirect('/citizen');
    })
);

// 게시글 수정 화면
app.get('/items/:id/edit', asyncRoute(async (req, res) => {

    const [rows] = await db.query(
        `SELECT * FROM items
         WHERE id = ?
         AND type = 'citizen'
         AND status = 'active'`,
        [req.params.id]
    );

    if (!rows.length) {
        return res.status(404).send(
            '수정할 수 없습니다.'
        );
    }

    page(res, 'edit', {
        item: rows[0]
    });
}));

// 게시글 수정 처리
app.post(
    '/items/:id/edit',
    limiter,
    asyncRoute(async (req, res) => {

        const [rows] = await db.query(
            `SELECT * FROM items
             WHERE id = ?
             AND type = 'citizen'
             AND status = 'active'`,
            [req.params.id]
        );

        if (
            !rows.length ||
            !(await bcrypt.compare(
                req.body.password || '',
                rows[0].password_hash || ''
            ))
        ) {
            return res.status(403).send(
                '비밀번호가 다릅니다.'
            );
        }

        const title = clean(req.body.title, 120);
        const description = clean(req.body.description, 3000);
        const era = Number(req.body.era);

        if (
            !title ||
            !description ||
            !eras.some(e => e.id === era)
        ) {
            return res.status(400).send(
                '입력값을 확인해주세요.'
            );
        }

        await db.query(
            `UPDATE items
             SET title = ?, description = ?, era_id = ?
             WHERE id = ?`,
            [title, description, era, req.params.id]
        );

        res.redirect('/items/' + req.params.id);
    })
);

// ========================================
// V1.1 신고 기능 개선
// ========================================

// 트랜잭션 처리
// 신고와 복구가 동시에 발생할 때 데이터 충돌 방지
async function transaction(fn) {

    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        const result = await fn(conn);

        await conn.commit();

        return result;

    } catch (e) {

        await conn.rollback();

        throw e;

    } finally {

        conn.release();
    }
}

// 신고 처리
app.post('/report', limiter, asyncRoute(async (req, res) => {

    const type = req.body.type;
    const id = Number(req.body.id);
    const reason = clean(req.body.reason, 60);

    const allowedReasons = [
        '광고',
        '욕설',
        '부적절한 내용',
        '허위 정보',
        '기타'
    ];

    // 신고 대상 및 사유 검증
    if (
        !['item', 'comment'].includes(type) ||
        !Number.isSafeInteger(id) ||
        id < 1 ||
        !allowedReasons.includes(reason)
    ) {
        return res.status(400).send(
            '잘못된 신고입니다.'
        );
    }

    const table = type === 'item'
        ? 'items'
        : 'comments';

    const result = await transaction(async conn => {

        // 신고 대상 잠금
        const [rows] = await conn.query(
            `SELECT * FROM ${table}
             WHERE id = ? FOR UPDATE`,
            [id]
        );

        const target = rows[0];

        // 삭제 또는 숨김 상태의 게시글 신고 방지
        // 공식 전시품 자체는 신고 대상에서 제외
        if (
            !target ||
            target.status !== 'active' ||
            (type === 'item' && target.type === 'official')
        ) {
            return null;
        }

        // 댓글이 속한 게시글이 정상 공개 중인지 확인
        if (type === 'comment') {

            const [parents] = await conn.query(
                `SELECT id FROM items
                 WHERE id = ?
                 AND status = 'active'`,
                [target.item_id]
            );

            if (!parents.length) {
                return null;
            }
        }

        const url = type === 'item'
            ? '/citizen'
            : '/items/' + target.item_id;

        // 신고 기록 저장
        try {

            await conn.query(
                `INSERT INTO reports
                 (target_type, target_id, reason, fingerprint)
                 VALUES (?, ?, ?, ?)`,
                [
                    type,
                    id,
                    reason,
                    fingerprint(req)
                ]
            );

        } catch (e) {

            // 동일 사용자 중복 신고 방지
            if (e.code === 'ER_DUP_ENTRY') {
                return {
                    url,
                    msg: '이미 신고했습니다.'
                };
            }

            throw e;
        }

        // 누적 신고 횟수 확인
        const [[{ n }]] = await conn.query(
            `SELECT COUNT(*) AS n
             FROM reports
             WHERE target_type = ?
             AND target_id = ?`,
            [type, id]
        );

        // 신고 5회 이상이면 자동 숨김
        if (n >= 5) {

            await conn.query(
                `UPDATE ${table}
                 SET status = 'hidden'
                 WHERE id = ?
                 AND status = 'active'`,
                [id]
            );
        }

        return {
            url,
            msg: '신고가 접수되었습니다.'
        };
    });

    if (!result) {
        return res.status(400).send(
            '신고할 수 없습니다.'
        );
    }

    redirectMsg(res, result.url, result.msg);
}));

// ========================================
// 관리자 인증
// ========================================

// 관리자 로그인 화면
app.get('/admin', (req, res) => {

    if (req.session.admin) {
        return res.redirect('/admin/dashboard');
    }

    page(res, 'admin-login', {
        error: ''
    });
});

// 관리자 로그인 처리
app.post('/admin/login', limiter, (req, res) => {

    if (
        !process.env.ADMIN_PASSWORD ||
        req.body.password !== process.env.ADMIN_PASSWORD
    ) {
        return page(res, 'admin-login', {
            error: '관리자 비밀번호를 확인해주세요.'
        });
    }

    // 로그인 성공 시 세션 재생성
    req.session.regenerate(err => {

        if (err) {
            return res.status(500).send('세션 오류');
        }

        req.session.admin = true;

        res.redirect('/admin/dashboard');
    });
});

// 관리자 로그아웃
app.post('/admin/logout', (req, res) => {

    req.session.destroy(() => {
        res.redirect('/archive');
    });
});

// 관리자 권한 확인
function requireAdmin(req, res, next) {

    if (!req.session.admin) {
        return res.redirect('/admin');
    }

    next();
}

// ========================================
// V1.1 관리자 신고 관리
// ========================================

app.get(
    '/admin/dashboard',
    requireAdmin,
    asyncRoute(async (req, res) => {

        // 전체 전시품 및 게시글
        const [allItems] = await db.query(
            `SELECT * FROM items
             WHERE status <> 'deleted'
             ORDER BY id DESC`
        );

        // 추억 찾기 게시글
        const [wanted] = await db.query(
            `SELECT * FROM wanted_posts
             WHERE status = 'active'
             ORDER BY id DESC`
        );

        // 신고된 게시글 조회
        const [reportedItems] = await db.query(
            `SELECT
                i.id,
                i.title,
                i.description,
                i.status
             FROM items i
             WHERE i.status <> 'deleted'
             AND (
                i.status = 'hidden'
                OR EXISTS (
                    SELECT 1 FROM reports r
                    WHERE r.target_type = 'item'
                    AND r.target_id = i.id
                )
             )
             ORDER BY i.id DESC`
        );

        // 신고된 댓글 조회
        const [reportedComments] = await db.query(
            `SELECT
                c.id,
                c.body,
                c.status,
                i.title AS item_title
             FROM comments c
             JOIN items i ON i.id = c.item_id
             WHERE c.status <> 'deleted'
             AND i.status <> 'deleted'
             AND (
                c.status = 'hidden'
                OR EXISTS (
                    SELECT 1 FROM reports r
                    WHERE r.target_type = 'comment'
                    AND r.target_id = c.id
                )
             )
             ORDER BY c.id DESC`
        );

        // 신고 사유별 횟수 집계
        const [reasons] = await db.query(
            `SELECT
                target_type,
                target_id,
                reason,
                COUNT(*) AS n
             FROM reports
             GROUP BY target_type, target_id, reason`
        );

        // 신고 대상별 신고 횟수 및 사유 연결
        for (const [type, rows] of [
            ['item', reportedItems],
            ['comment', reportedComments]
        ]) {

            for (const row of rows) {

                row.reasons = reasons.filter(
                    r => r.target_type === type
                        && r.target_id === row.id
                );

                row.count = row.reasons.reduce(
                    (sum, r) => sum + Number(r.n),
                    0
                );
            }
        }

        page(res, 'admin', {
            allItems,
            wanted,
            reportedItems,
            reportedComments,
            admin: true
        });
    })
);

// 관리자 공식 전시품 등록
app.post(
    '/admin/items',
    requireAdmin,
    upload.single('image'),
    asyncRoute(async (req, res) => {

        const era = Number(req.body.era);
        const title = clean(req.body.title, 120);
        const description = clean(req.body.description, 3000);

        if (
            !eras.some(e => e.id === era) ||
            !title ||
            !description
        ) {
            if (req.file) {
                fs.unlink(req.file.path, () => {});
            }

            return res.status(400).send('입력값 오류');
        }

        await db.query(
            `INSERT INTO items
             (era_id, type, title, description, image_path)
             VALUES (?, 'official', ?, ?, ?)`,
            [
                era,
                title,
                description,
                req.file ? '/uploads/' + req.file.filename : null
            ]
        );

        res.redirect('/admin/dashboard');
    })
);

// 관리자 신고 해제 및 복구
app.post(
    '/admin/restore/:kind/:id',
    requireAdmin,
    asyncRoute(async (req, res) => {

        const type = req.params.kind;
        const id = Number(req.params.id);

        if (
            !['item', 'comment'].includes(type) ||
            !Number.isSafeInteger(id) ||
            id < 1
        ) {
            return res.sendStatus(400);
        }

        const table = type === 'item'
            ? 'items'
            : 'comments';

        await transaction(async conn => {

            const [rows] = await conn.query(
                `SELECT status FROM ${table}
                 WHERE id = ? FOR UPDATE`,
                [id]
            );

            // 이미 삭제된 게시글은 복구하지 않음
            if (
                !rows.length ||
                rows[0].status === 'deleted'
            ) {
                return;
            }

            // 게시글 또는 댓글 다시 공개
            await conn.query(
                `UPDATE ${table}
                 SET status = 'active'
                 WHERE id = ?`,
                [id]
            );

            // 기존 신고 기록 초기화
            await conn.query(
                `DELETE FROM reports
                 WHERE target_type = ?
                 AND target_id = ?`,
                [type, id]
            );
        });

        res.redirect('/admin/dashboard');
    })
);

// ========================================
// 추억 찾기 게시판
// ========================================

// 게시글 목록
app.get('/find', asyncRoute(async (req, res) => {

    const [posts] = await db.query(
        `SELECT * FROM wanted_posts
         WHERE status = 'active'
         ORDER BY id DESC`
    );

    page(res, 'find-list', {
        posts
    });
}));

// 게시글 작성 화면
app.get('/find/new', (req, res) => {
    page(res, 'find-new');
});

// 게시글 작성
app.post(
    '/find/new',
    limiter,
    asyncRoute(async (req, res) => {

        const title = clean(req.body.title, 120);
        const description = clean(req.body.description, 3000);
        const pass = req.body.password;

        if (!title || !description || !validPass(pass)) {
            return res.status(400).send(
                '입력값을 확인해주세요.'
            );
        }

        const [r] = await db.query(
            `INSERT INTO wanted_posts
             (title, description, password_hash)
             VALUES (?, ?, ?)`,
            [
                title,
                description,
                await bcrypt.hash(pass, 10)
            ]
        );

        res.redirect('/find/' + r.insertId);
    })
);

// 게시글 상세 화면
app.get('/find/:id', asyncRoute(async (req, res) => {

    const [rows] = await db.query(
        `SELECT * FROM wanted_posts
         WHERE id = ?
         AND status = 'active'`,
        [req.params.id]
    );

    if (!rows.length) {
        return res.status(404).send(
            '게시글이 없습니다.'
        );
    }

    const [comments] = await db.query(
        `SELECT * FROM wanted_comments
         WHERE post_id = ?
         AND status = 'active'
         ORDER BY id DESC`,
        [req.params.id]
    );

    page(res, 'find-detail', {
        post: rows[0],
        comments
    });
}));

// 추억 찾기 댓글 작성
app.post(
    '/find/:id/comments',
    limiter,
    asyncRoute(async (req, res) => {

        const body = clean(req.body.body, 1000);
        const pass = req.body.password;

        const [rows] = await db.query(
            `SELECT id FROM wanted_posts
             WHERE id = ?
             AND status = 'active'`,
            [req.params.id]
        );

        if (!rows.length || !body || !validPass(pass)) {
            return res.status(400).send(
                '입력값을 확인해주세요.'
            );
        }

        await db.query(
            `INSERT INTO wanted_comments
             (post_id, body, password_hash)
             VALUES (?, ?, ?)`,
            [
                req.params.id,
                body,
                await bcrypt.hash(pass, 10)
            ]
        );

        res.redirect('/find/' + req.params.id);
    })
);

// 추억 찾기 게시글 수정
app.post(
    '/find/:id/edit',
    limiter,
    asyncRoute(async (req, res) => {

        const [rows] = await db.query(
            `SELECT * FROM wanted_posts
             WHERE id = ?
             AND status = 'active'`,
            [req.params.id]
        );

        if (
            !rows.length ||
            !(await bcrypt.compare(
                req.body.password || '',
                rows[0].password_hash
            ))
        ) {
            return res.status(403).send(
                '비밀번호가 다릅니다.'
            );
        }

        const title = clean(req.body.title, 120);
        const description = clean(req.body.description, 3000);

        if (!title || !description) {
            return res.status(400).send('입력값 오류');
        }

        await db.query(
            `UPDATE wanted_posts
             SET title = ?, description = ?
             WHERE id = ?`,
            [title, description, req.params.id]
        );

        res.redirect('/find/' + req.params.id);
    })
);

// 추억 찾기 게시글 삭제
app.post(
    '/find/:id/delete',
    limiter,
    asyncRoute(async (req, res) => {

        const [rows] = await db.query(
            'SELECT * FROM wanted_posts WHERE id = ?',
            [req.params.id]
        );

        if (
            !rows.length ||
            !(await bcrypt.compare(
                req.body.password || '',
                rows[0].password_hash
            ))
        ) {
            return res.status(403).send(
                '비밀번호가 다릅니다.'
            );
        }

        await db.query(
            `UPDATE wanted_posts
             SET status = 'deleted'
             WHERE id = ?`,
            [req.params.id]
        );

        res.redirect('/find');
    })
);

// 추억 찾기 댓글 삭제
app.post(
    '/find/comments/:id/delete',
    limiter,
    asyncRoute(async (req, res) => {

        const [rows] = await db.query(
            'SELECT * FROM wanted_comments WHERE id = ?',
            [req.params.id]
        );

        if (
            !rows.length ||
            !(await bcrypt.compare(
                req.body.password || '',
                rows[0].password_hash
            ))
        ) {
            return res.status(403).send(
                '비밀번호가 다릅니다.'
            );
        }

        await db.query(
            `UPDATE wanted_comments
             SET status = 'deleted'
             WHERE id = ?`,
            [req.params.id]
        );

        res.redirect('/find/' + rows[0].post_id);
    })
);

// ========================================
// 관리자 콘텐츠 삭제
// ========================================

app.post(
    '/admin/delete/:kind/:id',
    requireAdmin,
    asyncRoute(async (req, res) => {

        const tables = {
            item: 'items',
            wanted: 'wanted_posts',
            comment: 'comments',
            wantedComment: 'wanted_comments'
        };

        const kind = req.params.kind;
        const id = Number(req.params.id);

        if (
            !['item', 'wanted', 'comment', 'wantedComment'].includes(kind) ||
            !Number.isSafeInteger(id) ||
            id < 1
        ) {
            return res.sendStatus(400);
        }

        const table = tables[kind];

        await db.query(
            `UPDATE ${table}
             SET status = 'deleted'
             WHERE id = ?`,
            [id]
        );

        res.redirect('/admin/dashboard');
    })
);

// ========================================
// 서버 오류 처리
// ========================================
// ======================================
// V1.3 게시글 및 댓글 수정 기능
// ======================================


// 수정 대상별 테이블 및 조회 조건

const editTargets = {

    item: {
        table: 'items',
        condition: "type='citizen' AND status='active'",
        fields: 'title, description, era_id'
    },

    wanted: {
        table: 'wanted_posts',
        condition: "status='active'",
        fields: 'title, description'
    },

    comment: {
        table: 'comments',
        condition: "status='active'",
        fields: 'body'
    },

    wantedComment: {
        table: 'wanted_comments',
        condition: "status='active'",
        fields: 'body'
    }

};


// 수정 전 비밀번호 인증

function verifyEditPassword(kind) {

    return asyncRoute(async (req, res) => {

        const target = editTargets[kind];

        const id = Number(req.params.id);
        const password = req.body.password;

        if (
            !Number.isSafeInteger(id) ||
            id < 1 ||
            !validPass(password)
        ) {

            return res.status(400).json({
                message: '비밀번호를 확인해주세요.'
            });

        }

        const [rows] = await db.query(

            `SELECT ${target.fields}, password_hash
             FROM ${target.table}
             WHERE id=? AND ${target.condition}`,

            [id]

        );

        if (!rows.length) {

            return res.status(404).json({
                message: '수정할 수 없는 게시글입니다.'
            });

        }

        const row = rows[0];

        const matched = await bcrypt.compare(
            password,
            row.password_hash || ''
        );

        if (!matched) {

            return res.status(403).json({
                message: '비밀번호가 일치하지 않습니다.'
            });

        }

        // 비밀번호 해시는 브라우저에 전달하지 않음

        const { password_hash, ...result } = row;

        return res.json(result);

    });

}


// 시민 전시품 수정 전 인증

app.post(
    '/items/:id/edit/verify',
    limiter,
    verifyEditPassword('item')
);


// 추억 찾기 게시글 수정 전 인증

app.post(
    '/find/:id/edit/verify',
    limiter,
    verifyEditPassword('wanted')
);


// 일반 전시품 댓글 수정 전 인증

app.post(
    '/comments/:id/edit/verify',
    limiter,
    verifyEditPassword('comment')
);


// 추억 찾기 댓글 수정 전 인증

app.post(
    '/find/comments/:id/edit/verify',
    limiter,
    verifyEditPassword('wantedComment')
);


// 공식 및 시민 전시품 댓글 수정

app.post(
    '/comments/:id/edit',
    limiter,
    asyncRoute(async (req, res) => {

        const id = Number(req.params.id);
        const password = req.body.password;
        const body = clean(req.body.body, 1000);

        if (
            !Number.isSafeInteger(id) ||
            id < 1 ||
            !body ||
            !validPass(password)
        ) {

            return res.status(400).send(
                '입력 내용을 확인해주세요.'
            );

        }

        const [rows] = await db.query(

            `SELECT c.id, c.item_id, c.password_hash
             FROM comments c
             JOIN items i ON i.id = c.item_id
             WHERE c.id=?
             AND c.status='active'
             AND i.status='active'`,

            [id]

        );

        if (!rows.length) {

            return res.status(404).send(
                '댓글을 찾을 수 없습니다.'
            );

        }

        const comment = rows[0];

        if (!await bcrypt.compare(
            password,
            comment.password_hash
        )) {

            return res.status(403).send(
                '비밀번호가 다릅니다.'
            );

        }

        await db.query(

            `UPDATE comments
             SET body=?
             WHERE id=? AND status='active'`,

            [body, id]

        );

        res.redirect('/items/' + comment.item_id);

    })
);


// 추억 찾기 댓글 수정

app.post(
    '/find/comments/:id/edit',
    limiter,
    asyncRoute(async (req, res) => {

        const id = Number(req.params.id);
        const password = req.body.password;
        const body = clean(req.body.body, 1000);

        if (
            !Number.isSafeInteger(id) ||
            id < 1 ||
            !body ||
            !validPass(password)
        ) {

            return res.status(400).send(
                '입력 내용을 확인해주세요.'
            );

        }

        const [rows] = await db.query(

            `SELECT c.id, c.post_id, c.password_hash
             FROM wanted_comments c
             JOIN wanted_posts p ON p.id = c.post_id
             WHERE c.id=?
             AND c.status='active'
             AND p.status='active'`,

            [id]

        );

        if (!rows.length) {

            return res.status(404).send(
                '댓글을 찾을 수 없습니다.'
            );

        }

        const comment = rows[0];

        if (!await bcrypt.compare(
            password,
            comment.password_hash
        )) {

            return res.status(403).send(
                '비밀번호가 다릅니다.'
            );

        }

        await db.query(

            `UPDATE wanted_comments
             SET body=?
             WHERE id=? AND status='active'`,

            [body, id]

        );

        res.redirect('/find/' + comment.post_id);

    })
);
app.use((err, req, res, next) => {

    console.error(err);

    res.status(500).send(
        err.code === 'LIMIT_FILE_SIZE'
            ? '이미지는 3MB 이하만 가능합니다.'
            : '서버 오류가 발생했습니다. 데이터베이스 설정을 확인해주세요.'
    );
});

// ========================================
// 서버 실행
// ========================================

app.listen(
    Number(process.env.PORT || 3000),
    () => {
        console.log(
            'Museum running: http://localhost:' +
            (process.env.PORT || 3000)
        );
    }
);