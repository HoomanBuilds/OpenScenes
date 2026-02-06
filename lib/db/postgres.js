"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.initDatabase = initDatabase;
exports.getJob = getJob;
exports.getProjectJobs = getProjectJobs;
exports.createJob = createJob;
exports.updateJobStatus = updateJobStatus;
var pg_1 = require("pg");
var connectionString = (process.env.DATABASE_URL || 'postgresql://clarity:clarity_pass@127.0.0.1:5432/clarity').replace('localhost', '127.0.0.1');
var pool = new pg_1.Pool({
    connectionString: connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});
exports.pool = pool;
pool.on('error', function (err) {
    console.error('[DB] Unexpected client error', err);
});
function initDatabase() {
    return __awaiter(this, void 0, void 0, function () {
        var client;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pool.connect()];
                case 1:
                    client = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, , 5, 6]);
                    return [4 /*yield*/, client.query("\n      CREATE TABLE IF NOT EXISTS render_jobs (\n        job_id VARCHAR(64) PRIMARY KEY,\n        project_id VARCHAR(64),\n        status VARCHAR(20) NOT NULL DEFAULT 'queued',\n        video_url TEXT,\n        error TEXT,\n        progress INTEGER DEFAULT 0,\n        template_name VARCHAR(255),\n        format VARCHAR(10),\n        quality VARCHAR(20),\n        fps INTEGER,\n        created_at TIMESTAMP DEFAULT NOW(),\n        updated_at TIMESTAMP DEFAULT NOW()\n      )\n    ")];
                case 3:
                    _a.sent();
                    // Ensure project_id column exists for existing tables
                    return [4 /*yield*/, client.query("\n      ALTER TABLE render_jobs ADD COLUMN IF NOT EXISTS project_id VARCHAR(64)\n    ")];
                case 4:
                    // Ensure project_id column exists for existing tables
                    _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    client.release();
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function getJob(jobId) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pool.query('SELECT * FROM render_jobs WHERE job_id = $1', [jobId])];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result.rows[0] || null];
            }
        });
    });
}
function getProjectJobs(projectId) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pool.query('SELECT * FROM render_jobs WHERE project_id = $1 ORDER BY created_at DESC', [projectId])];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result.rows];
            }
        });
    });
}
function createJob(data) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pool.query("INSERT INTO render_jobs (job_id, project_id, template_name, format, quality, fps, status) \n     VALUES ($1, $2, $3, $4, $5, $6, 'queued')", [data.jobId, data.projectId, data.templateName, data.format, data.quality, data.fps])];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function updateJobStatus(jobId, status, extra) {
    return __awaiter(this, void 0, void 0, function () {
        var sets, values, idx;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    sets = ['status = $2', 'updated_at = NOW()'];
                    values = [jobId, status];
                    idx = 3;
                    if ((extra === null || extra === void 0 ? void 0 : extra.videoUrl) !== undefined) {
                        sets.push("video_url = $".concat(idx++));
                        values.push(extra.videoUrl);
                    }
                    if ((extra === null || extra === void 0 ? void 0 : extra.error) !== undefined) {
                        sets.push("error = $".concat(idx++));
                        values.push(extra.error);
                    }
                    if ((extra === null || extra === void 0 ? void 0 : extra.progress) !== undefined) {
                        sets.push("progress = $".concat(idx++));
                        values.push(extra.progress);
                    }
                    return [4 /*yield*/, pool.query("UPDATE render_jobs SET ".concat(sets.join(', '), " WHERE job_id = $1"), values)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
